import SteamAPI from 'steamapi';
import { resolveVanityUrl } from '@/utils/utils';

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

    const userSummary = await getUserSummary(steamId);

    const responseData = { userSummary };

    return res.status(200).json(responseData);
}

async function getUserSummary(steamId) {
    try {
        const userSummary = await sapi.getUserSummary(steamId);

        return {
            steamId: steamId,
            personaName: userSummary.nickname,
            avatar: userSummary.avatar.large,
            customURL: userSummary.url,
        };
    } catch (error) {
        console.error('Error getting user summary');
        return null;
    }
}