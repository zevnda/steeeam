import { getRelativeTimeImprecise, resolveVanityUrl, getAverage, minutesToHoursPrecise, minutesToHoursCompact, pricePerHour } from '@/utils/utils';
import SteamAPI from 'steamapi';
import * as sidr from 'steamid-resolver';
import moment from 'moment';
import axios from 'axios';

const cache = new Map();
const gameDataCache = new Map();
const avatarCache = new Map();

// Cache TTL in milliseconds
const CACHE_TTL = 60 * 60 * 1000; // 1 hour
const AVATAR_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function isCacheValid(timestamp) {
    return Date.now() - timestamp < CACHE_TTL;
}

function isAvatarCacheValid(timestamp) {
    return Date.now() - timestamp < AVATAR_CACHE_TTL;
}

async function getUserData(uid) {
    // Check cache first
    const cacheKey = `user_${uid}`;
    const cached = cache.get(cacheKey);
    if (cached && isCacheValid(cached.timestamp)) {
        return cached.data;
    }

    try {
        let steamId = cache.get(uid);
        if (!steamId) {
            steamId = await resolveVanityUrl(uid);
            cache.set(uid, steamId);
        }

        const sapi = new SteamAPI(process.env.STEAM_API_KEY);

        const [userSummary, sidrSummary] = await Promise.all([
            sapi.getUserSummary(steamId),
            sidr.steamID64ToFullInfo(steamId)
        ]);

        const userData = {
            steamId: steamId,
            personaName: userSummary.nickname,
            visible: userSummary.visible,
            avatar: userSummary.avatar.large,
            lastLogOff: userSummary.lastLogOffTimestamp,
            createdAt: userSummary.createdTimestamp,
            countryCode: userSummary.countryCode,
            stateCode: userSummary.stateCode,
            onlineState: sidrSummary.onlineState ? sidrSummary.onlineState[0] : null,
            location: sidrSummary.location ? sidrSummary.location[0] : 'Unknown',
        };

        // Cache the result
        cache.set(cacheKey, { data: userData, timestamp: Date.now() });
        return userData;
    } catch (e) {
        console.error(e);
        return { error: 'no user' };
    }
}

async function getGameData(uid, countryCode) {
    // Check cache first
    const cacheKey = `games_${uid}_${countryCode}`;
    const cached = gameDataCache.get(cacheKey);
    if (cached && isCacheValid(cached.timestamp)) {
        return cached.data;
    }

    try {
        let steamId = cache.get(uid);
        if (!steamId) {
            steamId = await resolveVanityUrl(uid);
            cache.set(uid, steamId);
        }

        const sapi = new SteamAPI(process.env.STEAM_API_KEY);

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

        // Optimize price fetching with concurrent requests and smaller chunks
        const maxGameIdsPerCall = 200; // Reduced chunk size for faster responses
        const gameIdChunks = [];
        for (let i = 0; i < gameIds.length; i += maxGameIdsPerCall) {
            gameIdChunks.push(gameIds.slice(i, i + maxGameIdsPerCall));
        }

        // Limit concurrent requests to avoid rate limiting
        let prices = [];
        let totalInitial = 0;
        let totalFinal = 0;
        
        const chunkPromises = gameIdChunks.map(async (chunk) => {
            try {
                const chunkString = chunk.join(',');
                const gamePrices = await axios.get(`https://store.steampowered.com/api/appdetails?appids=${chunkString}&filters=price_overview&cc=${countryCode}`, {
                    timeout: 10000 // 10 second timeout
                });

                let chunkPrices = [];
                let chunkInitial = 0;
                let chunkFinal = 0;

                // eslint-disable-next-line no-unused-vars
                for (const [_, gameData] of Object.entries(gamePrices.data)) {
                    if (gameData.data && gameData.data.price_overview) {
                        const finalPrice = gameData.data.price_overview.final || 0;
                        const initialPrice = gameData.data.price_overview.initial || 0;

                        chunkPrices.push(initialPrice);
                        chunkInitial += initialPrice;
                        chunkFinal += finalPrice;
                    }
                }

                return { prices: chunkPrices, initial: chunkInitial, final: chunkFinal };
            } catch (error) {
                console.error('Error fetching price chunk:', error);
                return { prices: [], initial: 0, final: 0 };
            }
        });

        // Process chunks with limited concurrency
        const results = await Promise.all(chunkPromises);
        
        results.forEach(result => {
            prices.push(...result.prices);
            totalInitial += result.initial;
            totalFinal += result.final;
        });

        // Format totals
        const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
        const totalInitialFormatted = formatter.format(totalInitial / 100);
        const totalFinalFormatted = formatter.format(totalFinal / 100);
        const averageGamePrice = formatter.format(getAverage(prices) / 100);
        const totalPlaytimeHours = minutesToHoursCompact(totalPlaytime);
        const averagePlaytime = minutesToHoursPrecise(getAverage(playtime));
        const totalGames = userGames.length;

        const gameData = {
            totals: { totalInitialFormatted, totalFinalFormatted, averageGamePrice, totalPlaytimeHours, averagePlaytime, totalGames },
            playCount: { playedCount, unplayedCount, totalPlaytime }
        };

        // Cache the result
        gameDataCache.set(cacheKey, { data: gameData, timestamp: Date.now() });
        return gameData;
    } catch (e) {
        console.error(e);
        return { error: 'private games' };
    }
}

export default async function handler(req, res) {
    // Enhanced caching headers
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400');
    res.setHeader('CDN-Cache-Control', 'max-age=3600');
    res.setHeader('Vercel-CDN-Cache-Control', 'max-age=3600');

    const {
        uid,
        country_code,
        bg_color,
        title_color,
        sub_title_color,
        text_color,
        username_color,
        id_color,
        cp_color,
        ip_color,
        div_color,
        border_color,
        border_width,
        progbar_bg,
        progbar_color,
        hide_border,
        theme
    } = req.query;

    // Check if we can return early with cached SVG
    const cacheKey = `svg_${uid}_${JSON.stringify(req.query)}`;
    const cachedSvg = cache.get(cacheKey);
    if (cachedSvg && isCacheValid(cachedSvg.timestamp)) {
        res.setHeader('Content-Type', 'image/svg+xml');
        res.setHeader('X-Cache', 'HIT');
        return res.status(200).send(cachedSvg.data);
    }

    const [userData, gameData] = await Promise.all([getUserData(uid), getGameData(uid, country_code)]);

    const svgContent = await createFullSvg(
        userData,
        gameData,
        bg_color,
        title_color,
        sub_title_color,
        text_color,
        username_color,
        id_color,
        cp_color,
        ip_color,
        div_color,
        border_color,
        border_width,
        progbar_bg,
        progbar_color,
        hide_border,
        theme
    );

    // Cache the final SVG
    cache.set(cacheKey, { data: svgContent, timestamp: Date.now() });

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('X-Cache', 'MISS');
    res.status(200).send(svgContent);
}

async function createFullSvg(
    userData,
    gameData,
    bg_color = '0b0b0b',
    title_color = 'fff',
    sub_title_color = 'adadad',
    text_color = 'fff',
    username_color = 'fff',
    id_color = 'adadad',
    cp_color = 'f87171',
    ip_color = '4ade80',
    div_color = 'ffffff30',
    border_color = 'ffffff30',
    border_width = 1,
    progbar_bg = '313131',
    progbar_color = '006fee',
    hide_border = false,
    theme
) {
    // Themes
    // Dark
    if (theme === 'dark') bg_color = '0b0b0b';
    if (theme === 'dark') title_color = 'fff';
    if (theme === 'dark') sub_title_color = 'adadad';
    if (theme === 'dark') text_color = 'fff';
    if (theme === 'dark') username_color = 'fff';
    if (theme === 'dark') id_color = 'adadad';
    if (theme === 'dark') div_color = 'ffffff30';
    if (theme === 'dark') border_color = 'ffffff30';
    if (theme === 'dark') progbar_bg = 'ffffff30';
    if (theme === 'dark') progbar_color = '006fee';
    // Light
    if (theme === 'light') bg_color = 'fff';
    if (theme === 'light') title_color = '000';
    if (theme === 'light') sub_title_color = '000';
    if (theme === 'light') text_color = '000';
    if (theme === 'light') username_color = '000';
    if (theme === 'light') id_color = 'adadad';
    if (theme === 'light') div_color = '00000030';
    if (theme === 'light') border_color = '00000030';
    if (theme === 'light') progbar_bg = '00000050';
    if (theme === 'light') progbar_color = '60a5fa';

    const width = 705;
    const height = 385;

    // Helper function to convert image to base64
    async function imageToBase64(imageUrl) {
        if (!imageUrl) return '';
        
        const cacheKey = `avatar_${imageUrl}`;
        const cached = avatarCache.get(cacheKey);
        if (cached && isAvatarCacheValid(cached.timestamp)) {
            return cached.data;
        }

        try {
            const response = await axios.get(imageUrl, { 
                responseType: 'arraybuffer',
                timeout: 5000 // 5 second timeout for avatars
            });
            const base64 = Buffer.from(response.data).toString('base64');
            const dataUri = `data:image/png;base64,${base64}`;
            
            // Cache the result
            avatarCache.set(cacheKey, { data: dataUri, timestamp: Date.now() });
            return dataUri;
        } catch (error) {
            console.error('Error loading avatar:', error);
            return '';
        }
    }

    // Get avatar as base64 (this will be cached)
    const avatarBase64 = await imageToBase64(userData.avatar);

    // Calculate progress for games
    const playedCount = gameData.playCount?.playedCount || 0;
    const gameCount = gameData.totals?.totalGames || 0;
    const progressPercent = gameCount > 0 ? ((playedCount / gameCount) * 100).toFixed(0) : 0;
    const progressWidth = gameCount > 0 ? (220 * (playedCount / gameCount)) : 0;

    // Truncate username if too long (approximate)
    let displayUsername = userData.personaName;
    if (displayUsername && displayUsername.length > 20) {
        displayUsername = displayUsername.slice(0, 17) + '...';
    }

    // Truncate location if too long
    let location = userData.location || 'Unknown';
    if (location.length > 22) location = location.slice(0, 22) + '...';

    const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <style>
                .geist { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
                .username { font-weight: 700; font-size: 20px; }
                .steamid { font-size: 10px; }
                .info-text { font-size: 12px; }
                .title { font-weight: 600; font-size: 16px; }
                .subtitle { font-size: 16px; }
                .stat-value { font-weight: 600; font-size: 26px; }
                .progress-text { font-weight: 700; font-size: 14px; }
                .progress-normal { font-size: 14px; }
                .watermark { font-size: 16px; opacity: 0.4; }
            </style>
            <clipPath id="avatarClip">
                <circle cx="100" cy="85" r="65"/>
            </clipPath>
        </defs>
        
        <!-- Background -->
        <rect width="${width}" height="${height}" fill="#${bg_color}"/>
        
        <!-- Avatar -->
        ${avatarBase64 ? `<image href="${avatarBase64}" x="35" y="20" width="130" height="130" clip-path="url(#avatarClip)"/>` : ''}
        
        <!-- Username -->
        <text x="20" y="180" class="geist username" fill="#${username_color}">${displayUsername}</text>
        
        <!-- SteamID -->
        <text x="20" y="195" class="geist steamid" fill="#${id_color}">${userData.steamId}</text>
        
        <!-- Location -->
        <text x="43" y="232" class="geist info-text" fill="#${text_color}">${location}</text>
        
        <!-- Last seen -->
        <text x="43" y="257" class="geist info-text" fill="#${text_color}">Last seen ${userData.lastLogOff ? moment.unix(userData.lastLogOff).fromNow() : 'never'}</text>
        
        <!-- Created at -->
        <text x="43" y="283" class="geist info-text" fill="#${text_color}">${userData.createdAt ? `Joined ${getRelativeTimeImprecise(userData.createdAt)} ago` : 'Unknown'}</text>
        
        <!-- Vertical divider -->
        <line x1="200" y1="15" x2="200" y2="${height - 15}" stroke="#${div_color}" stroke-width="1"/>
        
        <!-- Account Statistics Header -->
        <text x="245" y="37" class="geist title" fill="#${title_color}">Account Statistics</text>
        
        <!-- Horizontal divider -->
        <line x1="215" y1="50" x2="${width - 15}" y2="50" stroke="#${div_color}" stroke-width="1"/>
        
        ${!gameData.error ? `
        <!-- Current Price -->
        <text x="215" y="80" class="geist subtitle" fill="#${sub_title_color}">Current Price</text>
        <text x="215" y="110" class="geist stat-value" fill="#${cp_color}">${gameData.totals?.totalFinalFormatted || '$0'}</text>
        
        <!-- Initial Price -->
        <text x="370" y="80" class="geist subtitle" fill="#${sub_title_color}">Initial Price</text>
        <text x="370" y="110" class="geist stat-value" fill="#${ip_color}">${gameData.totals?.totalInitialFormatted || '$0'}</text>
        
        <!-- Total Games -->
        <text x="215" y="160" class="geist subtitle" fill="#${sub_title_color}">Total Games</text>
        <text x="215" y="190" class="geist stat-value" fill="#${text_color}">${gameData.totals?.totalGames || '0'}</text>
        
        <!-- Average Price -->
        <text x="370" y="160" class="geist subtitle" fill="#${sub_title_color}">Avg. Price</text>
        <text x="370" y="190" class="geist stat-value" fill="#${text_color}">${gameData.totals?.averageGamePrice || '$0'}</text>
        
        <!-- Price Per Hour -->
        <text x="510" y="160" class="geist subtitle" fill="#${sub_title_color}">Price Per Hour</text>
        <text x="510" y="190" class="geist stat-value" fill="#${text_color}">${pricePerHour(gameData.totals?.totalFinalFormatted, gameData.totals?.totalPlaytimeHours) || '0'}</text>
        
        <!-- Average Playtime -->
        <text x="215" y="240" class="geist subtitle" fill="#${sub_title_color}">Avg. Playtime</text>
        <text x="215" y="270" class="geist stat-value" fill="#${text_color}">${gameData.totals?.averagePlaytime || '0'}h</text>
        
        <!-- Total Playtime -->
        <text x="370" y="240" class="geist subtitle" fill="#${sub_title_color}">Total Playtime</text>
        <text x="370" y="270" class="geist stat-value" fill="#${text_color}">${gameData.totals?.totalPlaytimeHours || '0'}h</text>
        
        <!-- Progress Text -->
        <text x="215" y="324" class="geist progress-text" fill="#${progbar_color}">${playedCount}</text>
        <text x="${215 + (playedCount.toString().length * 9)}" y="324" class="geist progress-normal" fill="#${text_color}">/</text>
        <text x="${215 + (playedCount.toString().length * 9) + 10}" y="324" class="geist progress-text" fill="#${progbar_color}">${gameCount}</text>
        <text x="${215 + (playedCount.toString().length * 9) + (gameCount.toString().length * 9) + 20}" y="324" class="geist progress-normal" fill="#${text_color}">games played</text>
        <text x="405" y="324" class="geist progress-text" fill="#${text_color}">${progressPercent}%</text>
        
        <!-- Progress Bar Background -->
        <rect x="215" y="330" width="220" height="12" rx="6" fill="#${progbar_bg}"/>
        
        <!-- Progress Bar Fill -->
        <rect x="215" y="330" width="${progressWidth}" height="12" rx="6" fill="#${progbar_color}"/>
        ` : `
        <!-- Private Games Message -->
        <text x="390" y="200" class="geist subtitle" fill="#${sub_title_color}">Private Games List</text>
        `}
        
        <!-- Watermark -->
        <text x="${width - 155}" y="${height - 17}" class="geist watermark" fill="#737373">steeeam.vercel.app</text>
        
        <!-- Border -->
        ${hide_border !== 'true' ? `<rect x="0" y="0" width="${width}" height="${height}" fill="none" stroke="#${border_color}" stroke-width="${Math.min(parseInt(border_width) || 1, 10)}"/>` : ''}
    </svg>`;

    return svg;
}