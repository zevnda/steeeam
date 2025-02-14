import axios from 'axios';
import SteamAPI from 'steamapi';
import SteamID from 'steamid';
import SteamLevel from 'steam-level';
import * as sidr from 'steamid-resolver';
import { resolveVanityUrl, sidToShortURL, getAverage, minutesToHoursCompact, minutesToHoursPrecise } from '@/utils/utils';

const sapi = new SteamAPI(process.env.STEAM_API_KEY);

export default async function handler(req, res) {
    const host = req.headers.host || '';

    const allowedHosts = [process.env.NEXT_PUBLIC_SITE_URL, 'localhost:3000'];
    const isAllowed = allowedHosts.some(allowedHost => host.includes(allowedHost));

    if (!isAllowed) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const steamId = await resolveVanityUrl(req.query.uid);

    const [
        userSummary,
        gamesList,
        gameData,
        userConnections,
        userExp,
        userBans
    ] = await Promise.all([
        getUserSummary(steamId),
        getGamesList(steamId),
        getGameData(steamId, req.query.cc, req.query.abbr),
        getUserConnections(steamId),
        getUserExp(steamId),
        getUserBans(steamId)
    ]);

    const gameDetails = await getGameDetails(gamesList, req.query.cc);

    const responseData = { userSummary, gamesList, gameData, userConnections, userExp, userBans, gameDetails };

    return res.status(200).json(responseData);
}

async function getUserSummary(steamId) {
    try {
        const sid = new SteamID(steamId);

        const userSummaryPromise = sapi.getUserSummary(steamId);
        const sidrSummaryPromise = sidr.steamID64ToFullInfo(steamId);

        const [userSummary, sidrSummary] = await Promise.all([
            userSummaryPromise.catch(e => { console.error('Error getting SAPI summary', e); return null; }),
            sidrSummaryPromise.catch(e => { console.error('Error getting SIDR summary', e); return null; }),
        ]);

        const steam2 = sid.getSteam2RenderedID(true);
        const steam3 = sid.getSteam3RenderedID();
        const shorturl = sidToShortURL(sid);

        return {
            steamId: steamId,
            personaName: userSummary.nickname,
            visible: userSummary.visible,
            avatar: userSummary.avatar.large,
            customURL: userSummary.url,
            lastLogOff: userSummary.lastLogOffTimestamp,
            createdAt: userSummary.createdTimestamp,
            countryCode: userSummary.countryCode,
            stateCode: userSummary.stateCode,
            onlineState: sidrSummary.onlineState ? sidrSummary.onlineState[0] : null,
            location: sidrSummary.location ? sidrSummary.location[0] : 'Unknown',
            accountId: sid.accountid,
            steam2: steam2,
            steam3: steam3,
            shortURL: shorturl
        };
    } catch (error) {
        console.error('Error getting user summary');
        return null;
    }
}

async function getGamesList(steamId) {
    try {
        const userGames = await sapi.getUserOwnedGames(steamId, {
            includeExtendedAppInfo: true,
            includeFreeGames: true,
            includeFreeSubGames: true,
            includeUnvettedApps: true
        });
        const sortedGames = userGames?.slice().sort((a, b) => b.minutes - a.minutes).slice(0, 5) || [];
        return sortedGames;
    } catch (error) {
        console.error('Error getting user games list');
        return null;
    }
}

async function getGameData(steamId, countryCode, countryAbbr) {
    try {
        const userGames = await sapi.getUserOwnedGames(steamId, {
            includeExtendedAppInfo: true,
            includeFreeGames: true,
            includeFreeSubGames: true,
            includeUnvettedApps: true
        });

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

        // Chunk gameIds into batches of 500
        const maxGameIdsPerCall = 500;
        const gameIdChunks = [];
        for (let i = 0; i < gameIds.length; i += maxGameIdsPerCall) {
            gameIdChunks.push(gameIds.slice(i, i + maxGameIdsPerCall));
        }

        // Make multiple HTTP calls for each chunk
        let responseData = [];
        let prices = [];
        let totalInitial = 0;
        let totalFinal = 0;
        await Promise.all(gameIdChunks.map(async (chunk) => {
            const chunkString = chunk.join(',');
            const gamePrices = await axios.get(`https://store.steampowered.com/api/appdetails?appids=${chunkString}&filters=price_overview&cc=${countryCode}`);

            // Process response data for each chunk
            for (const [gameData] of Object.entries(gamePrices.data)) {
                if (gameData.data && gameData.data.price_overview) {
                    const finalPrice = gameData.data.price_overview.final || null;
                    const initialPrice = gameData.data.price_overview.initial || null;

                    prices.push(initialPrice);

                    totalInitial += initialPrice;
                    totalFinal += finalPrice;
                }
            }
        }));

        // Format totals
        const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: countryAbbr ? countryAbbr : 'USD' });
        const totalInitialFormatted = formatter.format(totalInitial / 100);
        const totalFinalFormatted = formatter.format(totalFinal / 100);
        const averageGamePrice = formatter.format(getAverage(prices) / 100);
        const totalPlaytimeHours = minutesToHoursCompact(totalPlaytime);
        const averagePlaytime = minutesToHoursPrecise(getAverage(playtime));
        const totalGames = userGames.length;

        responseData.push({ totals: { totalInitialFormatted, totalFinalFormatted, averageGamePrice, totalPlaytimeHours, averagePlaytime, totalGames } });
        responseData.push({ playCount: { playedCount, unplayedCount, totalPlaytime } });

        return responseData;
    } catch (error) {
        console.error('Error getting game data');
        return null;
    }
}

async function getUserConnections(steamId) {
    try {
        const userFriendsPromise = sapi.getUserFriends(steamId);
        const userGroupsPromise = sapi.getUserGroups(steamId);

        const [userFriends, userGroups] = await Promise.all([
            userFriendsPromise.catch(() => { console.error('Error getting user friends'); return null; }),
            userGroupsPromise.catch(() => { console.error('Error getting user groups'); return null; }),
        ]);

        return {
            friendCount: userFriends?.length || 0,
            groupCount: userGroups?.length || 0
        };
    } catch (error) {
        console.error('Error getting user connections');
        return null;
    }
}

async function getUserExp(steamId) {
    try {
        const userBadges = await sapi.getUserBadges(steamId);
        const requiredXP = SteamLevel.getRequiredXpFromLevel(userBadges?.level || 0);

        return {
            xpRemaining: userBadges?.xpRemaining || 0,
            requiredXP: requiredXP,
            level: userBadges?.level || 0
        };
    } catch (error) {
        console.error('Error getting user exp');
        return null;
    }
}

async function getUserBans(steamId) {
    try {
        const userBans = await sapi.getUserBans(steamId);
        return userBans;
    } catch (error) {
        console.error('Error getting user bans');
        return null;
    }
}

async function getGameDetails(games, countryCode) {
    try {
        const gameIds = games.map(game => game.game.id);
        const gameDetails = await sapi.getGameDetails(gameIds, { currency: countryCode });
        return gameDetails;
    } catch (error) {
        console.error('Error getting game details');
        return null;
    }
}