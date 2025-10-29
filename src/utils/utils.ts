import moment from 'moment'
import SteamID from 'steamid'

const STEAM_API = 'https://api.steampowered.com'

export async function resolveVanityUrl(id: string): Promise<string> {
  try {
    const res = await fetch(
      `${STEAM_API}/ISteamUser/ResolveVanityURL/v1/?key=${process.env.STEAM_API_KEY}&vanityurl=${id}`,
    )
    const data = await res.json()
    if (data?.response?.steamid) {
      return data.response.steamid
    }
    return id
  } catch (err) {
    console.error('Error resolving vanity URL:', err)
    return id
  }
}

export function sidToShortURL(id: string): string {
  const sid = new SteamID(id)

  const replacements = 'bcdfghjkmnpqrtvw'
  const hex = sid.accountid.toString(16)
  let output = ''
  for (let i = 0; i < hex.length; i++) {
    output += replacements[parseInt(hex[i], 16)]
  }
  const splitAt = Math.floor(output.length / 2)
  output = output.substring(0, splitAt) + '-' + output.substring(splitAt)
  return 'https://s.team/p/' + output
}

export function pricePerHour(totalCost: string, totalPlaytime: string, currency?: string): string {
  let countryCode = 'USD'
  if (currency === 'au') countryCode = 'AUD'
  if (currency === 'uk') countryCode = 'GBP'
  if (currency === 'ca') countryCode = 'CAD'
  if (currency === 'eu') countryCode = 'EUR'
  if (currency === 'nz') countryCode = 'NZD'
  if (currency === 'us') countryCode = 'USD'

  const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: countryCode })
  if (!totalPlaytime || totalPlaytime === '0') return formatter.format(0)
  const totalCostFloat = parseInt(totalCost.replace(/[^\d.-]/g, ''), 10) * 100
  const totalCostFormatted = (totalCostFloat / 100).toFixed()
  const pricePerHour = parseInt(totalCostFormatted) / parseInt(totalPlaytime)
  const formattedPrice = formatter.format(pricePerHour)
  return formattedPrice
}

export function minutesToHoursCompact(minutes: number): string {
  if (minutes < 1) return 'Never played'
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'}`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    const formatted = new Intl.NumberFormat('en-US').format(hours)
    return `${formatted} ${hours === 1 ? 'hour' : 'hours'}`
  }
  const days = Math.floor(hours / 24)
  const formattedDays = new Intl.NumberFormat('en-US').format(days)
  const formattedHours = new Intl.NumberFormat('en-US').format(hours)
  return `${formattedDays} ${days === 1 ? 'day' : 'days'} (${formattedHours} hours)`
}

export function recentMinutesToHoursCompact(minutes: number | undefined): string {
  if (!minutes || minutes < 1) return '0 minutes'
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'}`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    const formatted = new Intl.NumberFormat('en-US').format(hours)
    return `${formatted} ${hours === 1 ? 'hour' : 'hours'}`
  }
  const days = Math.floor(hours / 24)
  const formattedDays = new Intl.NumberFormat('en-US').format(days)
  const formattedHours = new Intl.NumberFormat('en-US').format(hours)
  return `${formattedDays} ${days === 1 ? 'day' : 'days'} (${formattedHours} hours)`
}

export function getRelativeTimeImprecise(timestamp: number): string {
  const now = moment()
  const then = moment.unix(timestamp)
  const deltaYears = now.diff(then, 'years', true)
  const deltaMonths = now.diff(then, 'months', true)
  const deltaDays = now.diff(then, 'days', true)
  const deltaHours = now.diff(then, 'hours', true)
  const deltaMinutes = now.diff(then, 'minutes', true)

  if (deltaYears >= 1) {
    return `${Math.floor(deltaYears)} year${Math.floor(deltaYears) === 1 ? '' : 's'}`
  } else if (deltaMonths >= 1) {
    return `${Math.floor(deltaMonths)} month${Math.floor(deltaMonths) === 1 ? '' : 's'}`
  } else if (deltaDays >= 1) {
    return `${Math.floor(deltaDays)} day${Math.floor(deltaDays) === 1 ? '' : 's'}`
  } else if (deltaHours >= 1) {
    return `${Math.floor(deltaHours)} hour${Math.floor(deltaHours) === 1 ? '' : 's'}`
  } else {
    return `${Math.floor(deltaMinutes)} minute${Math.floor(deltaMinutes) === 1 ? '' : 's'}`
  }
}
