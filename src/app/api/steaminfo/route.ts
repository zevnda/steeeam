import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'
import SteamAPI from 'steamapi'
import SteamID from 'steamid'
import * as sidr from 'steamid-resolver'

import { resolveVanityUrl, sidToShortURL } from '@/utils/utils'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})
const CACHE_TTL = 24 * 60 * 60 // 24 hours

const apiKey = process.env.STEAM_API_KEY ?? ''
if (!apiKey) {
  throw new Error('STEAM_API_KEY environment variable is not set')
}

const sapi = new SteamAPI(apiKey)

export async function POST(req: Request) {
  try {
    const { id } = await req.json()

    if (!id) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 })
    }

    const cacheKey = `steaminfo:${id}`
    const cached = await redis.get(cacheKey)
    if (cached) {
      return NextResponse.json({ success: true, userSummary: cached }, { status: 200 })
    }

    const steamId = await resolveVanityUrl(id)

    if (!steamId) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    const userSummary = await getUserSummary(steamId)

    await redis.set(cacheKey, userSummary, { ex: CACHE_TTL })

    return NextResponse.json({ success: true, userSummary: userSummary }, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Failed to fetch user data' }, { status: 400 })
  }
}

async function getUserSummary(id: string) {
  const sid = new SteamID(id)

  if (!sid.isValid()) {
    throw new Error('Invalid Steam ID')
  }

  const sapiUserSummary = await sapi.getUserSummary(id)
  const sidrUserSummary = await sidr.steamID64ToFullInfo(id)
  const shorturl = sidToShortURL(id)
  const accountid = sid.accountid
  const steamID2 = sid.getSteam2RenderedID(true)
  const steamID3 = sid.getSteam3RenderedID()

  let friends = null,
    groups = null,
    bans = null

  try {
    friends = await sapi.getUserFriends(id)
  } catch (err) {
    const msg = getErrorMessage(err)
    if (msg === 'Unauthorized' || msg === 'Forbidden') friends = 'private'
    else throw err
  }
  try {
    groups = await sapi.getUserGroups(id)
  } catch (err) {
    const msg = getErrorMessage(err)
    if (msg === 'Unauthorized' || msg === 'Forbidden') groups = 'private'
    else throw err
  }
  try {
    bans = await sapi.getUserBans(id)
  } catch (err) {
    const msg = getErrorMessage(err)
    if (msg === 'Unauthorized' || msg === 'Forbidden') bans = 'private'
    else throw err
  }

  if (!sapiUserSummary || !sidrUserSummary) {
    throw new Error('Failed to fetch user summary data')
  }

  return {
    ...sapiUserSummary,
    ...sidrUserSummary,
    shorturl,
    accountid,
    steamID2,
    steamID3,
    friends,
    groups,
    bans,
  }
}

function getErrorMessage(e: unknown): string {
  if (typeof e === 'object' && e !== null && 'message' in e) {
    const msg = (e as { message?: string }).message
    return typeof msg === 'string' ? msg : ''
  }
  return ''
}
