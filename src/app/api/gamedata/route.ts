import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'
import SteamLevel from 'steam-level'
import SteamAPI, { Game, GameDetails, GameInfo, GameInfoExtended, UserPlaytime } from 'steamapi'

import { resolveVanityUrl } from '@/utils/utils'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})
const CACHE_TTL = 24 * 60 * 60 // 24 hours

interface UserGame {
  game: {
    id: number
    name: string
  }
  minutes: number
  data: {
    price_overview?: {
      initial: number
      final: number
    }
  }
}

const apiKey = process.env.STEAM_API_KEY ?? ''
if (!apiKey) {
  throw new Error('STEAM_API_KEY environment variable is not set')
}

const sapi = new SteamAPI(apiKey)

export async function POST(req: Request) {
  try {
    const { id, currency = 'us' } = await req.json()

    const cacheKey = `gamedata:${id}:${currency}`
    const cached = await redis.get(cacheKey)
    if (cached) {
      return NextResponse.json({ success: true, userGameData: cached }, { status: 200 })
    }

    let countryCode = 'USD'
    if (currency === 'au') countryCode = 'AUD'
    if (currency === 'uk') countryCode = 'GBP'
    if (currency === 'ca') countryCode = 'CAD'
    if (currency === 'eu') countryCode = 'EUR'
    if (currency === 'nz') countryCode = 'NZD'
    if (currency === 'us') countryCode = 'USD'

    if (!id) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 })
    }

    const steamId = await resolveVanityUrl(id)

    if (!steamId) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    const userGameData = await getGameData(steamId, countryCode, currency)

    if (userGameData.error) {
      return NextResponse.json({ success: false, error: userGameData.error }, { status: 403 })
    }

    await redis.set(cacheKey, userGameData, { ex: CACHE_TTL })

    return NextResponse.json({ success: true, userGameData: userGameData }, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: "Failed to fetch user's game data" }, { status: 400 })
  }
}

async function getGameData(id: string, countryCode: string = 'us', currency: string = 'usd') {
  let userGames: UserPlaytime<Game | GameInfo | GameInfoExtended>[]

  try {
    userGames = await sapi.getUserOwnedGames(id, {
      includeExtendedAppInfo: true,
      includeFreeGames: true,
      includeFreeSubGames: true,
      includeUnvettedApps: true,
    })
  } catch (err) {
    console.error('Error fetching user games. Likely private game details:', err)
    return {
      error: 'Games list is private',
      topFiveGames: [],
      totals: {
        totalInitialFormatted: null,
        totalFinalFormatted: null,
        averageGamePrice: null,
        totalPlaytimeHours: null,
        averagePlaytime: null,
        totalGames: null,
      },
      playCount: {
        playedCount: null,
        unplayedCount: null,
        totalPlaytime: null,
      },
      userXP: null,
    }
  }

  // Get top 5 games by playtime
  const topFiveGames = userGames
    .slice()
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 5)

  const topFiveGameIds = topFiveGames.map(g => g.game.id)
  let validGameDetails: GameDetails[] = []

  if (topFiveGameIds.length > 0) {
    const gameDetailsPromises = topFiveGameIds.map(async appId => {
      try {
        const gameInfo = await sapi.getGameDetails(appId)
        return gameInfo
      } catch (err) {
        console.error(`Error fetching details for game ID ${appId}:`, err)
        return null
      }
    })

    const gameDetails = await Promise.all(gameDetailsPromises)
    validGameDetails = gameDetails.filter(info => info !== null)
  }

  // Collect game IDs and playtime stats
  const gameIds = userGames ? userGames.map((g: UserPlaytime<Game | GameInfo | GameInfoExtended>) => g.game.id) : []
  const playtimes = userGames
    ? userGames.map((g: UserPlaytime<Game | GameInfo | GameInfoExtended>) => g.minutes).filter((m: number) => m > 0)
    : []
  const playedCount = playtimes.length
  const unplayedCount = userGames ? userGames.length - playedCount : 0
  const totalPlaytime = playtimes.reduce((a: number, b: number) => a + b, 0)

  // Chunk game IDs for price API calls
  const chunkSize = 200
  const gameIdChunks = []
  for (let i = 0; i < gameIds.length; i += chunkSize) {
    gameIdChunks.push(gameIds.slice(i, i + chunkSize))
  }

  let totalInitial = 0
  let totalFinal = 0
  const prices: number[] = []

  // Fetch prices for each chunk
  for (const chunk of gameIdChunks) {
    const ids = chunk.join(',')
    try {
      const res = await fetch(
        `https://store.steampowered.com/api/appdetails?appids=${ids}&filters=price_overview&cc=${currency}`,
        { headers: { 'User-Agent': 'Steeeam' } },
      )
      const data = await res.json()
      for (const gameData of Object.values(data)) {
        if (gameData && (gameData as UserGame).data?.price_overview) {
          const price = (gameData as UserGame).data.price_overview
          if (price) {
            prices.push(price.initial)
            totalInitial += price.initial
            totalFinal += price.final
          }
        }
      }
    } catch (err) {
      console.error('Error fetching game prices, continuing to the next chunk:', err)
      continue
    }
  }

  // Format totals
  const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: countryCode })
  const totalInitialFormatted = formatter.format(totalInitial / 100)
  const totalFinalFormatted = formatter.format(totalFinal / 100)
  const averageGamePrice = formatter.format((prices.reduce((a, b) => a + b, 0) / prices.length || 0) / 100)
  const totalPlaytimeHours = Math.round(totalPlaytime / 60)
  const averagePlaytime = (playtimes.reduce((a, b) => a + b, 0) / (playtimes.length || 1) / 60).toFixed(1)

  const userXP = await getUserXP(id)

  return {
    topFiveGames: topFiveGames,
    topFiveGameDetails: validGameDetails,
    totals: {
      totalInitialFormatted,
      totalFinalFormatted,
      averageGamePrice,
      totalPlaytimeHours,
      averagePlaytime,
      totalGames: userGames?.length ?? 0,
    },
    playCount: {
      playedCount,
      unplayedCount,
      totalPlaytime,
    },
    userXP,
  }
}

async function getUserXP(id: string) {
  const userBadges = await sapi.getUserBadges(id)

  const level = userBadges?.level || 0
  const requiredXP = SteamLevel.getRequiredXpFromLevel(level)

  return {
    xpRemaining: userBadges?.xpRemaining || 0,
    requiredXP: requiredXP,
    level: level,
  }
}
