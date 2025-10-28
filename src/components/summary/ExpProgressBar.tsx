import type { UserGameData } from '@/types/user-game-data'

import { Progress, Skeleton } from '@heroui/react'

interface ExpProgressBarProps {
  userGameData: UserGameData | null
}

export default function ExpProgressBar({ userGameData }: ExpProgressBarProps) {
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
        value={userGameData.userXP.requiredXP - userGameData.userXP.xpRemaining}
        maxValue={userGameData.userXP.requiredXP}
        color='primary'
        formatOptions={{ style: 'percent' }}
        showValueLabel
        valueLabel={`Level ${userGameData.userXP.level}`}
        label={
          <p>
            <span className='font-bold text-blue-400'>{userGameData.userXP.xpRemaining}</span> XP to next level
          </p>
        }
        classNames={{
          value: ['font-medium'],
        }}
      />
    </div>
  )
}
