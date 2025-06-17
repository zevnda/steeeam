import axios from 'axios';
import SteamAPI from 'steamapi';
import SteamID from 'steamid';
import SteamLevel from 'steam-level';
import * as sidr from 'steamid-resolver';
import { resolveVanityUrl, sidToShortURL, getAverage, minutesToHoursCompact, minutesToHoursPrecise } from '@/utils/utils';

const sapi = new SteamAPI(process.env.STEAM_API_KEY);

// Set timeouts for external API calls
const API_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 2;

// Cache management
const cache = new Map();
const userCache = new Map();
const gameDataCache = new Map();
const gameDetailsCache = new Map();

// Cache TTL in milliseconds
const CACHE_TTL = 60 * 60 * 1000; // 1 hour
const LONG_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours for static data

function isCacheValid(timestamp, ttl = CACHE_TTL) {
    return Date.now() - timestamp < ttl;
}

export default async function handler(req, res) {
    try {
        // Enhanced caching headers
        res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400');
        res.setHeader('CDN-Cache-Control', 'max-age=3600');
        res.setHeader('Vercel-CDN-Cache-Control', 'max-age=3600');

        // Host validation
        const host = req.headers.host || '';
        const allowedHosts = [process.env.NEXT_PUBLIC_SITE_URL, 'localhost:3000'];
        const isAllowed = allowedHosts.some(allowedHost => host.includes(allowedHost));

        if (!isAllowed) {
            console.warn(`Forbidden access attempt from host: ${host}`);
            return res.status(403).json({ error: 'Forbidden', message: 'Access denied' });
        }

        if (req.method !== 'GET') {
            return res.status(405).json({ error: 'Method not allowed', message: 'Only GET requests are supported' });
        }

        // Input validation
        const { uid, cc = 'US', abbr = 'USD' } = req.query;
        
        if (!uid) {
            return res.status(400).json({ error: 'Bad Request', message: 'Steam ID or vanity URL is required' });
        }

        // Validate country code and currency
        if (!/^[A-Z]{2}$/.test(cc)) {
            return res.status(400).json({ error: 'Bad Request', message: 'Invalid country code format' });
        }

        if (!/^[A-Z]{3}$/.test(abbr)) {
            return res.status(400).json({ error: 'Bad Request', message: 'Invalid currency code format' });
        }

        // Check for cached complete response
        const responseCacheKey = `complete_${uid}_${cc}_${abbr}`;
        const cachedResponse = cache.get(responseCacheKey);
        if (cachedResponse && isCacheValid(cachedResponse.timestamp)) {
            res.setHeader('X-Cache', 'HIT');
            return res.status(200).json(cachedResponse.data);
        }

        console.log(`Processing request for UID: ${uid}, CC: ${cc}, Currency: ${abbr}`);

        // Resolve Steam ID with caching
        let steamId;
        const steamIdCacheKey = `steamid_${uid}`;
        const cachedSteamId = cache.get(steamIdCacheKey);
        
        if (cachedSteamId && isCacheValid(cachedSteamId.timestamp, LONG_CACHE_TTL)) {
            steamId = cachedSteamId.data;
        } else {
            try {
                steamId = await Promise.race([
                    resolveVanityUrl(uid),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), API_TIMEOUT))
                ]);
                // Cache resolved Steam ID for 24 hours
                cache.set(steamIdCacheKey, { data: steamId, timestamp: Date.now() });
            } catch (error) {
                console.error(`Failed to resolve Steam ID for ${uid}:`, error.message);
                return res.status(400).json({ error: 'Invalid Steam ID', message: 'Could not resolve Steam ID or vanity URL' });
            }
        }

        if (!steamId) {
            return res.status(404).json({ error: 'User not found', message: 'Steam user not found' });
        }

        // Fetch all data with caching and proper error handling
        const [
            userSummary,
            gamesList,
            gameData,
            userConnections,
            userExp,
            userBans
        ] = await Promise.allSettled([
            getUserSummaryWithCache(steamId),
            getGamesListWithCache(steamId),
            getGameDataWithCache(steamId, cc, abbr),
            getUserConnectionsWithCache(steamId),
            getUserExpWithCache(steamId),
            getUserBansWithCache(steamId)
        ]);

        // Process results and handle individual failures
        const responseData = {
            userSummary: userSummary.status === 'fulfilled' ? userSummary.value : null,
            gamesList: gamesList.status === 'fulfilled' ? gamesList.value : null,
            gameData: gameData.status === 'fulfilled' ? gameData.value : null,
            userConnections: userConnections.status === 'fulfilled' ? userConnections.value : null,
            userExp: userExp.status === 'fulfilled' ? userExp.value : null,
            userBans: userBans.status === 'fulfilled' ? userBans.value : null,
            gameDetails: null
        };

        // Only fetch game details if games list was successful
        if (responseData.gamesList) {
            try {
                responseData.gameDetails = await getGameDetailsWithCache(responseData.gamesList, cc);
            } catch (error) {
                console.error('Failed to fetch game details:', error.message);
            }
        }

        // Cache the complete response
        cache.set(responseCacheKey, { data: responseData, timestamp: Date.now() });

        // Log any failed requests for monitoring
        const failedRequests = [userSummary, gamesList, gameData, userConnections, userExp, userBans]
            .filter(result => result.status === 'rejected')
            .map(result => result.reason?.message || 'Unknown error');

        if (failedRequests.length > 0) {
            console.warn(`Some requests failed for ${steamId}:`, failedRequests);
        }

        res.setHeader('X-Cache', 'MISS');
        return res.status(200).json(responseData);

    } catch (error) {
        console.error('Unhandled error in user-data API:', error);
        return res.status(500).json({ 
            error: 'Internal Server Error', 
            message: 'An unexpected error occurred while processing your request'
        });
    }
}

// Cached wrapper functions
async function getUserSummaryWithCache(steamId) {
    const cacheKey = `user_summary_${steamId}`;
    const cached = userCache.get(cacheKey);
    if (cached && isCacheValid(cached.timestamp)) {
        return cached.data;
    }

    const data = await getUserSummary(steamId);
    userCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
}

async function getGamesListWithCache(steamId) {
    const cacheKey = `games_list_${steamId}`;
    const cached = gameDataCache.get(cacheKey);
    if (cached && isCacheValid(cached.timestamp)) {
        return cached.data;
    }

    const data = await getGamesList(steamId);
    gameDataCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
}

async function getGameDataWithCache(steamId, countryCode, countryAbbr) {
    const cacheKey = `game_data_${steamId}_${countryCode}_${countryAbbr}`;
    const cached = gameDataCache.get(cacheKey);
    if (cached && isCacheValid(cached.timestamp)) {
        return cached.data;
    }

    const data = await getGameData(steamId, countryCode, countryAbbr);
    gameDataCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
}

async function getUserConnectionsWithCache(steamId) {
    const cacheKey = `user_connections_${steamId}`;
    const cached = userCache.get(cacheKey);
    if (cached && isCacheValid(cached.timestamp)) {
        return cached.data;
    }

    const data = await getUserConnections(steamId);
    userCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
}

async function getUserExpWithCache(steamId) {
    const cacheKey = `user_exp_${steamId}`;
    const cached = userCache.get(cacheKey);
    if (cached && isCacheValid(cached.timestamp)) {
        return cached.data;
    }

    const data = await getUserExp(steamId);
    userCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
}

async function getUserBansWithCache(steamId) {
    const cacheKey = `user_bans_${steamId}`;
    const cached = userCache.get(cacheKey);
    if (cached && isCacheValid(cached.timestamp)) {
        return cached.data;
    }

    const data = await getUserBans(steamId);
    userCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
}

async function getGameDetailsWithCache(games, countryCode) {
    const gameIds = games.map(game => game.game?.id).filter(Boolean);
    const cacheKey = `game_details_${gameIds.join(',')}_${countryCode}`;
    const cached = gameDetailsCache.get(cacheKey);
    if (cached && isCacheValid(cached.timestamp)) {
        return cached.data;
    }

    const data = await getGameDetails(games, countryCode);
    gameDetailsCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
}

async function getUserSummary(steamId) {
    try {
        if (!steamId) throw new Error('Steam ID is required');

        const sid = new SteamID(steamId);
        if (!sid.isValid()) throw new Error('Invalid Steam ID format');

        const userSummaryPromise = withTimeout(sapi.getUserSummary(steamId), API_TIMEOUT, 'User summary timeout');
        const sidrSummaryPromise = withTimeout(sidr.steamID64ToFullInfo(steamId), API_TIMEOUT, 'SIDR summary timeout');

        const [userSummary, sidrSummary] = await Promise.allSettled([
            userSummaryPromise,
            sidrSummaryPromise
        ]);

        const userSummaryData = userSummary.status === 'fulfilled' ? userSummary.value : null;
        const sidrSummaryData = sidrSummary.status === 'fulfilled' ? sidrSummary.value : null;

        if (!userSummaryData) {
            throw new Error('Failed to fetch user summary from Steam API');
        }

        const steam2 = sid.getSteam2RenderedID(true);
        const steam3 = sid.getSteam3RenderedID();
        const shorturl = sidToShortURL(sid);

        return {
            steamId: steamId,
            personaName: userSummaryData.nickname || 'Unknown',
            visible: userSummaryData.visible || false,
            avatar: userSummaryData.avatar?.large || null,
            customURL: userSummaryData.url || null,
            lastLogOff: userSummaryData.lastLogOffTimestamp || null,
            createdAt: userSummaryData.createdTimestamp || null,
            countryCode: userSummaryData.countryCode || null,
            stateCode: userSummaryData.stateCode || null,
            onlineState: sidrSummaryData?.onlineState?.[0] || null,
            location: sidrSummaryData?.location?.[0] || 'Unknown',
            accountId: sid.accountid,
            steam2: steam2,
            steam3: steam3,
            shortURL: shorturl
        };
    } catch (error) {
        console.error('Error getting user summary:', error.message);
        throw new Error(`Failed to get user summary: ${error.message}`);
    }
}

async function getGamesList(steamId) {
    try {
        if (!steamId) throw new Error('Steam ID is required');

        const userGames = await withTimeout(
            sapi.getUserOwnedGames(steamId, {
                includeExtendedAppInfo: true,
                includeFreeGames: true,
                includeFreeSubGames: true,
                includeUnvettedApps: true
            }),
            API_TIMEOUT,
            'Games list timeout'
        );

        if (!userGames || !Array.isArray(userGames)) {
            throw new Error('Invalid games data received');
        }

        const sortedGames = userGames.slice().sort((a, b) => b.minutes - a.minutes).slice(0, 5);
        return sortedGames;
    } catch (error) {
        console.error('Error getting user games list:', error.message);
        throw new Error(`Failed to get games list: ${error.message}`);
    }
}

async function getGameData(steamId, countryCode, countryAbbr) {
    try {
        if (!steamId) throw new Error('Steam ID is required');

        const userGames = await withTimeout(
            sapi.getUserOwnedGames(steamId, {
                includeExtendedAppInfo: true,
                includeFreeGames: true,
                includeFreeSubGames: true,
                includeUnvettedApps: true
            }),
            API_TIMEOUT,
            'User games timeout'
        );

        if (!userGames || !Array.isArray(userGames)) {
            throw new Error('Invalid games data received');
        }

        // Get appIds and played/unplayed game counts
        let gameIds = [];
        let playtime = [];
        let playedCount = 0;
        let unplayedCount = 0;
        let totalPlaytime = 0;
        for (const item of userGames) {
            gameIds.push(item.game.id);
            if (item.minutes > 0) {
                playedCount++;
                playtime.push(item.minutes);
                totalPlaytime += item.minutes;
            }
            if (item.minutes === 0) unplayedCount++;
        }

        // Optimize price fetching with smaller chunks and better concurrency
        const maxGameIdsPerCall = 200; // Reduced for faster responses
        const gameIdChunks = [];
        for (let i = 0; i < gameIds.length; i += maxGameIdsPerCall) {
            gameIdChunks.push(gameIds.slice(i, i + maxGameIdsPerCall));
        }

        // Make multiple HTTP calls for each chunk with retry logic
        let responseData = [];
        let prices = [];
        let totalInitial = 0;
        let totalFinal = 0;

        const chunkPromises = gameIdChunks.map(async (chunk) => {
            const chunkString = chunk.join(',');
            try {
                const gamePrices = await withRetry(
                    () => axios.get(`https://store.steampowered.com/api/appdetails?appids=${chunkString}&filters=price_overview&cc=${countryCode}`, {
                        timeout: API_TIMEOUT,
                        headers: { 'User-Agent': 'Steam Data Fetcher' }
                    }),
                    MAX_RETRIES
                );

                // Process response data for each chunk
                /* eslint-disable-next-line no-unused-vars */
                for (const [_, gameData] of Object.entries(gamePrices.data)) {
                    if (gameData.data && gameData.data.price_overview) {
                        const finalPrice = gameData.data.price_overview.final || null;
                        const initialPrice = gameData.data.price_overview.initial || null;

                        prices.push(initialPrice);

                        totalInitial += initialPrice;
                        totalFinal += finalPrice;
                    }
                }
            } catch (error) {
                console.error(`Failed to fetch prices for chunk: ${error.message}`);
                // Continue with other chunks even if one fails
            }
        });

        await Promise.allSettled(chunkPromises);

        // Format totals with error handling
        try {
            const formatter = new Intl.NumberFormat('en-US', { 
                style: 'currency', 
                currency: countryAbbr || 'USD' 
            });
            
            const totalInitialFormatted = formatter.format(totalInitial / 100);
            const totalFinalFormatted = formatter.format(totalFinal / 100);
            const averageGamePrice = formatter.format(getAverage(prices) / 100);
            const totalPlaytimeHours = minutesToHoursCompact(totalPlaytime);
            const averagePlaytime = minutesToHoursPrecise(getAverage(playtime));
            const totalGames = userGames.length;

            responseData.push({ totals: { totalInitialFormatted, totalFinalFormatted, averageGamePrice, totalPlaytimeHours, averagePlaytime, totalGames } });
            responseData.push({ playCount: { playedCount, unplayedCount, totalPlaytime } });
        } catch (error) {
            console.error('Error formatting game data:', error.message);
            throw new Error('Failed to format game data');
        }

        return responseData;
    } catch (error) {
        console.error('Error getting game data:', error.message);
        throw new Error(`Failed to get game data: ${error.message}`);
    }
}

async function getUserConnections(steamId) {
    try {
        if (!steamId) throw new Error('Steam ID is required');

        const [userFriends, userGroups] = await Promise.allSettled([
            withTimeout(sapi.getUserFriends(steamId), API_TIMEOUT, 'Friends timeout'),
            withTimeout(sapi.getUserGroups(steamId), API_TIMEOUT, 'Groups timeout')
        ]);

        return {
            friendCount: userFriends.status === 'fulfilled' ? (userFriends.value?.length || 0) : 0,
            groupCount: userGroups.status === 'fulfilled' ? (userGroups.value?.length || 0) : 0
        };
    } catch (error) {
        console.error('Error getting user connections:', error.message);
        throw new Error(`Failed to get user connections: ${error.message}`);
    }
}

async function getUserExp(steamId) {
    try {
        if (!steamId) throw new Error('Steam ID is required');

        const userBadges = await withTimeout(
            sapi.getUserBadges(steamId),
            API_TIMEOUT,
            'User badges timeout'
        );

        const level = userBadges?.level || 0;
        const requiredXP = SteamLevel.getRequiredXpFromLevel(level);

        return {
            xpRemaining: userBadges?.xpRemaining || 0,
            requiredXP: requiredXP,
            level: level
        };
    } catch (error) {
        console.error('Error getting user exp:', error.message);
        throw new Error(`Failed to get user experience: ${error.message}`);
    }
}

async function getUserBans(steamId) {
    try {
        if (!steamId) throw new Error('Steam ID is required');

        const userBans = await withTimeout(
            sapi.getUserBans(steamId),
            API_TIMEOUT,
            'User bans timeout'
        );

        return userBans;
    } catch (error) {
        console.error('Error getting user bans:', error.message);
        throw new Error(`Failed to get user bans: ${error.message}`);
    }
}

async function getGameDetails(games, countryCode) {
    try {
        if (!games || !Array.isArray(games) || games.length === 0) {
            return [];
        }

        const gameIds = games.map(game => game.game?.id).filter(Boolean);
        if (gameIds.length === 0) {
            return [];
        }

        const gameDetails = await withTimeout(
            sapi.getGameDetails(gameIds, { currency: countryCode }),
            API_TIMEOUT,
            'Game details timeout'
        );

        return gameDetails;
    } catch (error) {
        console.error('Error getting game details:', error.message);
        throw new Error(`Failed to get game details: ${error.message}`);
    }
}

// Utility functions
async function withTimeout(promise, timeoutMs, errorMessage = 'Operation timed out') {
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
}

async function withRetry(fn, maxRetries = MAX_RETRIES) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            
            if (attempt <= maxRetries) {
                const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff
                console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms:`, error.message);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    
    throw lastError;
}