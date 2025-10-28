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

export function minutesToHoursCompact(number: number): string {
  const durationInMinutes = number
  const duration = moment.duration(durationInMinutes, 'minutes')
  const hours = Math.floor(duration.asHours())
  return hours.toLocaleString()
}

export function getRelativeTimeImprecise(timestamp: number): string {
  const now = moment()
  const then = moment.unix(timestamp)
  const deltaYears = now.diff(then, 'years', true)

  if (deltaYears > 1) {
    return `${deltaYears.toFixed(0)} years`
  } else if (deltaYears > 0) {
    return `${deltaYears.toFixed(0)} year`
  } else {
    return moment(then).fromNow()
  }
}
