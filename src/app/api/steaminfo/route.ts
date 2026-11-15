import { cacheGet, cacheSet } from '@/utils/cache'
import { isSteamApiKeyError, resolveVanityUrl, sidToShortURL } from '@/utils/utils'
import { NextResponse } from 'next/server'
import SteamAPI, { UserFriend } from 'steamapi'
import SteamID from 'steamid'
import * as sidr from 'steamid-resolver'

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
    const cached = await cacheGet(cacheKey)
    if (cached) {
      return NextResponse.json({ success: true, userSummary: JSON.parse(cached) }, { status: 200 })
    }

    const steamId = await resolveVanityUrl(id)

    if (!steamId) {
      return NextResponse.json(
        {
          success: false,
          error: `No Steam user found for "${id}".\nCheck the Steam username, custom URL or SteamID64 and try again.`,
        },
        { status: 404 },
      )
    }

    const userSummary = await getUserSummary(steamId)

    await cacheSet(cacheKey, JSON.stringify(userSummary))

    return NextResponse.json({ success: true, userSummary: userSummary }, { status: 200 })
  } catch (err) {
    console.error(err)
    if (isSteamApiKeyError(err)) {
      console.error(
        'Steam Web API rejected STEAM_API_KEY. Generate a new key at https://steamcommunity.com/dev/apikey and update the environment variable.',
      )
      return NextResponse.json(
        {
          success: false,
          error:
            'Steeeam is currently unable to connect to the Steam Web API.\nThis is a problem on our end, not with your profile. Please try again later.',
        },
        { status: 503 },
      )
    }
    return NextResponse.json(
      {
        success: false,
        error:
          'An error occurred while fetching the user summary.\n This may be due to an invalid Steam Username/ID or a problem with the Steam API.\n\n If you believe this is a mistake, please report the issue on GitHub.',
      },
      { status: 400 },
    )
  }
}

async function getUserSummary(id: string) {
  if (typeof id !== 'string' || !/^\d{17}$/.test(id)) {
    throw new Error('Invalid Steam ID format')
  }

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

  let friends: UserFriend[] | null = null,
    groups: string[] | null = null,
    bans = null

  try {
    friends = await sapi.getUserFriends(id)
  } catch (err) {
    const msg = getErrorMessage(err)
    if (msg === 'Unauthorized' || msg === 'Forbidden') friends = []
    else throw err
  }
  try {
    groups = await sapi.getUserGroups(id)
  } catch (err) {
    const msg = getErrorMessage(err)
    if (msg === 'Unauthorized' || msg === 'Forbidden') groups = []
    else throw err
  }
  try {
    bans = await sapi.getUserBans(id)
  } catch (err) {
    const msg = getErrorMessage(err)
    if (msg === 'Unauthorized' || msg === 'Forbidden') bans = []
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
