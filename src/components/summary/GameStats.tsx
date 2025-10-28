import type { UserGameData } from '@/types/user-game-data'

import { Skeleton, Tooltip } from '@heroui/react'
import { pricePerHour } from '@/utils/utils'

interface GameStatsProps {
  userGameData: UserGameData | null
  currency?: string
}

export default function GameStats({ userGameData, currency }: GameStatsProps) {
  if (!userGameData) {
    return (
      <div className='grid grid-cols-2 gap-y-4 w-full md:grid-cols-4 lg:w-auto lg:gap-x-10'>
        <div className='flex items-center flex-col gap-5 lg:items-end'>
          <Skeleton className='w-[100px] h-[18px] rounded-full' />
          <Skeleton className='w-[150px] h-[18px] rounded-full' />
        </div>
        <div className='flex items-center flex-col gap-5 lg:items-end'>
          <Skeleton className='w-[100px] h-[18px] rounded-full' />
          <Skeleton className='w-[150px] h-[18px] rounded-full' />
        </div>
        <div className='flex items-center flex-col gap-5 lg:items-end'>
          <Skeleton className='w-[100px] h-[18px] rounded-full' />
          <Skeleton className='w-[150px] h-[18px] rounded-full' />
        </div>
        <div className='flex items-center flex-col gap-5 lg:items-end'>
          <Skeleton className='w-[100px] h-[18px] rounded-full' />
          <Skeleton className='w-[150px] h-[18px] rounded-full' />
        </div>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-2 gap-x-4 gap-y-4 w-full md:grid-cols-5 lg:w-auto lg:gap-x-7'>
      <Tooltip closeDelay={0} className='bg-tooltip' content="All free and paid games in the user's library">
        <div className='flex items-center flex-col lg:items-start'>
          <p className='text-md text-alt font-semibold sm:text-lg'>Total Games</p>
          <p className='text-2xl font-bold sm:text-3xl'>{userGameData.totals.totalGames.toLocaleString()}</p>
        </div>
      </Tooltip>

      <Tooltip
        closeDelay={0}
        className='bg-tooltip'
        content="The average prices of all paid games in the user's library"
      >
        <div className='flex items-center flex-col lg:items-start'>
          <p className='text-md text-alt font-semibold sm:text-lg'>Avg. Price</p>
          <p className='text-2xl font-bold sm:text-3xl'>{userGameData.totals.averageGamePrice}</p>
        </div>
      </Tooltip>

      <Tooltip closeDelay={0} className='bg-tooltip' content='The amount of money spent on games per hour of gameplay'>
        <div className='flex items-center flex-col lg:items-start'>
          <p className='text-md text-alt font-semibold sm:text-lg'>Price Per Hour</p>
          <p className='text-2xl font-bold sm:text-3xl'>
            {pricePerHour(userGameData.totals.totalFinalFormatted, userGameData.totals.totalPlaytimeHours, currency)}
          </p>
        </div>
      </Tooltip>

      <Tooltip
        closeDelay={0}
        className='bg-tooltip'
        content="The average playtime across all games in the user's library"
      >
        <div className='flex items-center flex-col lg:items-start'>
          <p className='text-md text-alt font-semibold sm:text-lg'>Avg. Playtime</p>
          <p className='text-2xl font-bold sm:text-3xl'>{userGameData.totals.averagePlaytime}h</p>
        </div>
      </Tooltip>

      <Tooltip closeDelay={0} className='bg-tooltip' content='Total playtime across all games'>
        <div className='flex items-center flex-col lg:items-start'>
          <p className='text-md text-alt font-semibold sm:text-lg'>Total Playtime</p>
          <p className='text-2xl font-bold sm:text-3xl'>{userGameData.totals.totalPlaytimeHours.toLocaleString()}h</p>
        </div>
      </Tooltip>
    </div>
  )
}
