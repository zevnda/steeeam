import path from 'path'
import type { UserGameData } from '@/types/user-game-data'
import type { UserSummary } from '@/types/user-summary'

import { getRelativeTimeImprecise, pricePerHour } from '@/utils/utils'
import { createCanvas, GlobalFonts, loadImage, SKRSContext2D } from '@napi-rs/canvas'
import moment from 'moment'
import { NextResponse } from 'next/server'
import { createClient } from 'redis'

const redis = createClient({
  url: process.env.REDIS_URL!,
})
await redis.connect()
const CACHE_TTL = 24 * 60 * 60 // 24 hours

// Pre-load fonts once
let fontsLoaded = false
function ensureFontsLoaded() {
  if (!fontsLoaded) {
    GlobalFonts.registerFromPath(path.join(process.cwd(), 'src', 'fonts', 'GeistVF.woff2'), 'Geist')
    GlobalFonts.registerFromPath(path.join(process.cwd(), 'src', 'fonts', 'Elgraine-Black-Italic.ttf'), 'Elgraine')
    fontsLoaded = true
  }
}

async function getUserData(id: string, currency?: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/steaminfo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, currency }),
    cache: 'no-store',
  })

  const data = await res.json()

  return data.userSummary
}

async function getGameData(id: string, currency?: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/gamedata`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, currency }),
    cache: 'no-store',
  })

  const data = await res.json()

  return data.userGameData
}

async function createFullCanvas(
  userData: UserSummary,
  gameData: UserGameData,
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
  theme?: string,
) {
  // Themes
  // Dark
  if (theme === 'dark') bg_color = '0b0b0b'
  if (theme === 'dark') title_color = 'fff'
  if (theme === 'dark') sub_title_color = 'adadad'
  if (theme === 'dark') text_color = 'fff'
  if (theme === 'dark') username_color = 'fff'
  if (theme === 'dark') id_color = 'adadad'
  if (theme === 'dark') div_color = 'ffffff30'
  if (theme === 'dark') border_color = 'ffffff30'
  if (theme === 'dark') progbar_bg = 'ffffff30'
  if (theme === 'dark') progbar_color = '006fee'
  // Light
  if (theme === 'light') bg_color = 'fff'
  if (theme === 'light') title_color = '000'
  if (theme === 'light') sub_title_color = '000'
  if (theme === 'light') text_color = '000'
  if (theme === 'light') username_color = '000'
  if (theme === 'light') id_color = 'adadad'
  if (theme === 'light') div_color = '00000030'
  if (theme === 'light') border_color = '00000030'
  if (theme === 'light') progbar_bg = '00000050'
  if (theme === 'light') progbar_color = '60a5fa'

  // Canvas
  const width = 705
  const height = 385
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  // Background
  ctx.fillStyle = `#${bg_color}`
  ctx.fillRect(0, 0, width, height)

  // Watermark
  ctx.globalAlpha = 0.4
  ctx.fillStyle = '#737373'
  ctx.font = '16px Geist'
  ctx.fillText('steeeam.vercel.app', canvas.width - 155, canvas.height - 17)
  const watermarkImage = await loadImage(path.join(process.cwd(), 'public', 'canvas', 'steeeam-canvas.png'))
  ctx.drawImage(watermarkImage, canvas.width - 180, canvas.height - 32)
  ctx.globalAlpha = 1

  // Username (truncated if too long)
  ctx.fillStyle = `#${username_color}`
  ctx.font = '700 20px Geist'
  const username = userData.nickname
  const usernameWidth = ctx.measureText(username).width
  if (usernameWidth > 180) {
    let truncatedLength = 0
    for (let i = 0; i < username.length; i++) {
      const truncatedText = username.slice(0, i) + '...'
      const textWidth = ctx.measureText(truncatedText).width
      if (textWidth > 180) {
        break
      }
      truncatedLength = i
    }
    const truncatedUsername = username.slice(0, truncatedLength) + '...'
    ctx.fillText(truncatedUsername, 20, 180)
  } else {
    ctx.fillText(username, 20, 180)
  }

  // SteamID
  ctx.fillStyle = `#${id_color}`
  ctx.font = '10px Geist'
  const steamId = userData.steamID64.toString()
  ctx.fillText(steamId, 20, 195)

  // Location
  const locIcon = await loadImage(path.join(process.cwd(), 'public', 'canvas', 'loc-icon.png'))
  ctx.drawImage(locIcon, 20, 220)
  ctx.fillStyle = `#${text_color}`
  ctx.font = '12px Geist'
  let location = userData.location && userData.location.length > 0 ? userData.location[0] : 'Unknown'
  if (location.length > 22) location = location.slice(0, 22) + '...'
  ctx.fillText(location, 43, 232)

  // Last seen
  const seenIcon = await loadImage(path.join(process.cwd(), 'public', 'canvas', 'seen-icon.png'))
  ctx.drawImage(seenIcon, 20, 245)
  ctx.fillStyle = `#${text_color}`
  ctx.font = '12px Geist'
  const lastSeen = `Last seen ${userData.lastLogOffTimestamp ? moment.unix(userData.lastLogOffTimestamp).fromNow() : 'never'}`
  ctx.fillText(lastSeen, 43, 257)

  // Created at
  const joinIcon = await loadImage(path.join(process.cwd(), 'public', 'canvas', 'join-icon.png'))
  ctx.drawImage(joinIcon, 20, 270)
  ctx.fillStyle = `#${text_color}`
  ctx.font = '12px Geist'
  const createdAt = `${userData.createdTimestamp ? `Joined ${getRelativeTimeImprecise(userData.createdTimestamp)} ago` : 'Unknown'}`
  ctx.fillText(createdAt, 43, 283)

  // Vertical divider
  ctx.lineWidth = 1
  ctx.strokeStyle = `#${div_color}`
  ctx.beginPath()
  ctx.moveTo(200, 15)
  ctx.lineTo(200, canvas.height - 15)
  ctx.stroke()

  // Account stats header
  const gameStatsIcon = await loadImage(path.join(process.cwd(), 'public', 'canvas', 'game-stats-icon.png'))
  ctx.drawImage(gameStatsIcon, 215, 20)
  ctx.fillStyle = `#${title_color}`
  ctx.font = '600 16px Geist'
  const gameStatsHeader = 'Account Statistics'
  ctx.fillText(gameStatsHeader, 245, 37)

  // Horizontal divider
  ctx.lineWidth = 1
  ctx.strokeStyle = `#${div_color}`
  ctx.beginPath()
  ctx.moveTo(215, 50)
  ctx.lineTo(canvas.width - 15, 50)
  ctx.stroke()

  if (gameData) {
    // Account value
    // Current
    ctx.fillStyle = `#${sub_title_color}`
    ctx.font = '16px Geist'
    ctx.fillText('Current Price', 215, 80)
    ctx.fillStyle = `#${cp_color}`
    ctx.font = '600 26px Geist'
    ctx.fillText(`${gameData.totals?.totalFinalFormatted || '$0'}`, 215, 110)
    //Initial
    ctx.fillStyle = `#${sub_title_color}`
    ctx.font = '16px Geist'
    ctx.fillText('Initial Price', 370, 80)
    ctx.fillStyle = `#${ip_color}`
    ctx.font = '600 26px Geist'
    ctx.fillText(`${gameData.totals?.totalInitialFormatted || '$0'}`, 370, 110)

    // Game stats
    // Total games
    ctx.fillStyle = `#${sub_title_color}`
    ctx.font = '16px Geist'
    ctx.fillText('Total Games', 215, 160)
    ctx.fillStyle = `#${text_color}`
    ctx.font = '600 26px Geist'
    ctx.fillText(`${gameData.totals?.totalGames || '0'}`, 215, 190)
    // Average price
    ctx.fillStyle = `#${sub_title_color}`
    ctx.font = '16px Geist'
    ctx.fillText('Avg. Price', 370, 160)
    ctx.fillStyle = `#${text_color}`
    ctx.font = '600 26px Geist'
    ctx.fillText(`${gameData.totals?.averageGamePrice || '$0'}`, 370, 190)
    // Price per hour
    ctx.fillStyle = `#${sub_title_color}`
    ctx.font = '16px Geist'
    ctx.fillText('Price Per Hour', 510, 160)
    ctx.fillStyle = `#${text_color}`
    ctx.font = '600 26px Geist'
    ctx.fillText(
      `${pricePerHour(gameData.totals?.totalFinalFormatted, gameData.totals?.totalPlaytimeHours) || '0'}`,
      510,
      190,
    )
    // Average playtime
    ctx.fillStyle = `#${sub_title_color}`
    ctx.font = '16px Geist'
    ctx.fillText('Avg. Playtime', 215, 240)
    ctx.fillStyle = `#${text_color}`
    ctx.font = '600 26px Geist'
    ctx.fillText(`${gameData.totals?.averagePlaytime || '0'}h`, 215, 270)
    // Total playtime
    ctx.fillStyle = `#${sub_title_color}`
    ctx.font = '16px Geist'
    ctx.fillText('Total Playtime', 370, 240)
    ctx.fillStyle = `#${text_color}`
    ctx.font = '600 26px Geist'
    ctx.fillText(`${gameData.totals?.totalPlaytimeHours || '0'}h`, 370, 270)

    // Game progress bar
    const playedCount = gameData.playCount?.playedCount.toString() || '0'
    const gameCount = gameData.totals?.totalGames.toString() || '0'
    const progressPercent = ((parseInt(playedCount) / parseInt(gameCount)) * 100).toFixed(0)
    if (!isNaN(Number(progressPercent))) {
      ctx.fillStyle = `#${progbar_color}`
      ctx.font = '700 14px Geist'
      ctx.fillText(playedCount, 215, 324)
      ctx.fillStyle = `#${text_color}`
      ctx.font = '14px Geist'
      ctx.fillText('/', ctx.measureText(playedCount).width + 215 + 5, 324)
      ctx.fillStyle = `#${progbar_color}`
      ctx.font = '700 14px Geist'
      ctx.fillText(gameCount, ctx.measureText(playedCount).width + 215 + 15, 324)
      ctx.fillStyle = `#${text_color}`
      ctx.font = '14px Geist'
      ctx.fillText(
        'games played',
        ctx.measureText(playedCount).width + ctx.measureText(gameCount).width + 215 + 20,
        324,
      )
      ctx.font = '700 14px Geist'
      ctx.fillText(`${progressPercent}%`, 405, 324)
    }

    async function createRoundedProgressBar(
      barwidth: number,
      barheight: number,
      progress: number,
      barColor: string,
      backgroundColor: string,
      borderRadius: number,
    ) {
      if (isNaN(progress)) return
      ctx.fillStyle = backgroundColor
      roundRect(ctx, 215, 330, barwidth, barheight, borderRadius, true, false)
      const barWidth = Math.floor(barwidth * (progress / 100))
      ctx.fillStyle = barColor
      roundRect(ctx, 215, 330, barWidth, barheight, borderRadius, true, true)
    }

    async function roundRect(
      ctx: SKRSContext2D,
      x: number,
      y: number,
      width: number,
      height: number,
      radius: number,
      fill: boolean,
      stroke: boolean,
    ) {
      if (typeof stroke === 'undefined') {
        stroke = true
      }
      if (typeof radius === 'undefined') {
        radius = 5
      }
      ctx.beginPath()
      ctx.moveTo(x + radius, y)
      ctx.lineTo(x + width - radius, y)
      ctx.arcTo(x + width, y, x + width, y + radius, radius)
      ctx.lineTo(x + width, y + height - radius)
      ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius)
      ctx.lineTo(x + radius, y + height)
      ctx.arcTo(x, y + height, x, y + height - radius, radius)
      ctx.lineTo(x, y + radius)
      ctx.arcTo(x, y, x + radius, y, radius)
      ctx.closePath()
      if (stroke) {
        ctx.stroke()
      }
      if (fill) {
        ctx.fill()
      }
    }
    const barwidth = 220
    const barheight = 12
    const progress = (parseInt(playedCount) / parseInt(gameCount)) * 100
    const barColor = `#${progbar_color}`
    const backgroundColor = `#${progbar_bg}`
    const borderRadius = 6
    await createRoundedProgressBar(barwidth, barheight, progress, barColor, backgroundColor, borderRadius)
  } else {
    ctx.fillStyle = `#${sub_title_color}`
    ctx.font = '16px Geist'
    ctx.fillText('Private Games List', 390, 200)
  }

  // Avatar
  async function drawCenteredRoundedImage() {
    try {
      const avatar = await loadImage(userData.avatar.large)
      const desiredWidth = 130
      const desiredHeight = 130
      const scaleFactor = Math.min(desiredWidth / avatar.width, desiredHeight / avatar.height)
      const newWidth = avatar.width * scaleFactor
      const newHeight = avatar.height * scaleFactor
      ctx.save()
      ctx.beginPath()
      const cornerRadius = newWidth / 2
      const x = 35
      const y = 20
      ctx.moveTo(x + cornerRadius, y)
      ctx.arcTo(x + newWidth, y, x + newWidth, y + newHeight, cornerRadius)
      ctx.arcTo(x + newWidth, y + newHeight, x, y + newHeight, cornerRadius)
      ctx.arcTo(x, y + newHeight, x, y, cornerRadius)
      ctx.arcTo(x, y, x + newWidth, y, cornerRadius)
      ctx.closePath()
      ctx.clip()
      ctx.drawImage(avatar, x, y, newWidth, newHeight)
      ctx.restore()
    } catch (err) {
      console.warn('Failed to load avatar, using fallback', err)
    }
  }

  if (userData.avatar && !userData.error) {
    await drawCenteredRoundedImage()
  }

  // Draw border
  if (!hide_border) {
    ctx.strokeStyle = `#${border_color}`
    ctx.lineWidth = border_width >= 10 ? 10 : border_width
    ctx.strokeRect(0, 0, canvas.width, canvas.height)
  }

  const buffer = canvas.toBuffer('image/png')
  return buffer
}

export async function GET(req: Request) {
  const url = new URL(req.url)

  const cacheKey = `canvas:${url.pathname}:${url.searchParams.toString()}`
  const cached = await redis.get(cacheKey)

  if (cached) {
    const buffer = Buffer.from(cached as string, 'base64')
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400',
      },
    })
  }

  const currency = url.searchParams.get('c') || undefined
  const bg_color = url.searchParams.get('bg_color') || undefined
  const title_color = url.searchParams.get('title_color') || undefined
  const sub_title_color = url.searchParams.get('sub_title_color') || undefined
  const text_color = url.searchParams.get('text_color') || undefined
  const username_color = url.searchParams.get('username_color') || undefined
  const id_color = url.searchParams.get('id_color') || undefined
  const cp_color = url.searchParams.get('cp_color') || undefined
  const ip_color = url.searchParams.get('ip_color') || undefined
  const div_color = url.searchParams.get('div_color') || undefined
  const border_color = url.searchParams.get('border_color') || undefined
  const border_width = parseInt(url.searchParams.get('border_width') || '1')
  const progbar_bg = url.searchParams.get('progbar_bg') || undefined
  const progbar_color = url.searchParams.get('progbar_color') || undefined
  const hide_border = url.searchParams.get('hide_border') || 'false'
  const theme = url.searchParams.get('theme') || undefined

  const pathnameParts = url.pathname.split('/')
  const id = pathnameParts[pathnameParts.length - 1]

  const userSummary = await getUserData(id, currency)
  const userGameData = await getGameData(id, currency)

  ensureFontsLoaded()

  const buffer = await createFullCanvas(
    userSummary,
    userGameData,
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
    hide_border === 'true',
    theme,
  )

  const uint8Array = new Uint8Array(buffer)

  await redis.set(cacheKey, Buffer.from(buffer).toString('base64'), { EX: CACHE_TTL })

  return new NextResponse(uint8Array, {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400',
    },
  })
}
