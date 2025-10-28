export interface UserGameData {
  topFiveGames: {
    game: {
      id: number
      name: string
      icon: string
      hasCommunityVisibleStats: boolean
      hasLeaderboards: boolean
      descriptorIDs?: number[]
      hasWorkshop: boolean
      hasMarket: boolean
      hasDLC: boolean
      capsuleFilename: string
      priceOverview?: {
        initial: number
        final: number
        discount_percent: number
        initial_formatted: string
        final_formatted: string
      }
    }
    minutes: number
    recentMinutes: number
    disconnectedMinutes: number

    lastPlayedTimestamp?: number
  }[]
  topFiveGameDetails: {
    priceOverview: {
      initial: number
      final: number
      discount_percent: number
      initial_formatted: string
      final_formatted: string
    }
    name: string
  }[]
  totals: {
    totalInitialFormatted: string
    totalFinalFormatted: string
    averageGamePrice: string
    totalPlaytimeHours: string
    averagePlaytime: string
    totalGames: number
  }
  playCount: {
    playedCount: number
    unplayedCount: number
    totalPlaytime: number
  }
  userXP: {
    xpRemaining: number
    requiredXP: number
    level: number
  }
  error?: string
}
