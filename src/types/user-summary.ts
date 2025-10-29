export interface UserAvatar {
  small: string
  medium: string
  large: string
  hash: string
}

export interface Friend {
  steamID: string
  friendedTimestamp: number
  relationship: string
}

export type PersonaState = 0 | 1 | 2 | 3 | 4 | 5 | 6 // 0: offline, 1: online, etc.
export type PersonaStateFlags = number

export interface UserSummary {
  steamID: string[]
  avatar: UserAvatar
  url: string
  visible: boolean
  personaState: PersonaState
  personaStateFlags: PersonaStateFlags
  allowsComments: boolean
  nickname: string
  lastLogOffTimestamp: number
  createdTimestamp: number
  primaryGroupID: string
  countryCode: string
  stateCode: string
  steamID64: string[]
  onlineState: string[]
  stateMessage: string[]
  privacyState: string[]
  visibilityState: string[]
  avatarIcon: string[]
  avatarMedium: string[]
  avatarFull: string[]
  vacBanned: string[]
  tradeBanState: string[]
  isLimitedAccount: string[]
  customURL: string[]
  memberSince: string[]
  steamRating: string[]
  hoursPlayed2Wk: string[]
  headline: string[]
  location: string[]
  realname: string[]
  summary: string[]
  shorturl: string
  accountid: string
  steamID2: string
  steamID3: string
  friends: Friend[] | string
  groups: string[]
  bans: {
    communityBanned: boolean
    vacBanned: boolean
    vacBans: number
    gameBans: number
    economyBan: string
    daysSinceLastBan: number
  }
  error?: string
}
