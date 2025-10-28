import type { UserGameData } from '@/types/user-game-data'

import { Progress, Skeleton } from '@heroui/react'
import Link from 'next/link'

interface GameProgressBarProps {
  id: string
  userGameData: UserGameData | null
}

export default function GameProgressBar({ id, userGameData }: GameProgressBarProps) {
  if (!userGameData) {
    return (
      <div className='w-full grow lg:w-fit'>
        <div className='flex flex-col gap-2'>
          <Skeleton className='w-[200px] h-[18px] rounded-full' />
          <Skeleton className='w-full h-3.5 rounded-full' />
          <Skeleton className='w-[120px] h-4 rounded-full' />
        </div>
      </div>
    )
  }

  return (
    <div className='w-full grow lg:w-fit'>
      <Progress
        value={userGameData.playCount.playedCount ? userGameData.playCount.playedCount : 0}
        maxValue={userGameData.totals.totalGames ? userGameData.totals.totalGames : 1}
        color='primary'
        formatOptions={{ style: 'percent' }}
        showValueLabel={true}
        label={
          <p>
            <span className='font-bold text-blue-400'>{userGameData.playCount.playedCount}</span> /{' '}
            <span className='font-bold text-blue-400'>{userGameData.totals.totalGames}</span> games played
          </p>
        }
        classNames={{
          value: ['font-medium'],
        }}
      />

      <Link href={`https://steamcommunity.com/profiles/${id}/games?tab=all`} target='_blank'>
        <p className='text-sm mt-1'>View Games List</p>
      </Link>
    </div>
  )
}
