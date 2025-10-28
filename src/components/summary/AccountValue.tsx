import type { UserGameData } from '@/types/user-game-data'

import { Divider, Skeleton, Tooltip } from '@heroui/react'
import { PiGraphBold } from 'react-icons/pi'

interface AccountValueProps {
  userGameData: UserGameData | null
  isLoading: boolean
}

export default function AccountValue({ userGameData, isLoading }: AccountValueProps) {
  return (
    <div className='flex flex-col w-full mt-14'>
      <div className='flex justify-between items-center'>
        <div className='flex items-center gap-2'>
          <PiGraphBold fontSize={22} />
          <p id='games-list' className='text-lg font-semibold py-2'>
            Account Statistics
          </p>
        </div>
      </div>

      <Divider className='w-full h-px bg-light-border mb-5 lg:mb-5' />

      <div className='flex justify-center items-center lg:justify-start'>
        <div className='flex justify-center items-center flex-col w-full lg:items-start'>
          <div className='flex flex-wrap justify-evenly gap-4 w-full lg:justify-start md:gap-10'>
            <Tooltip closeDelay={0} className='bg-tooltip' content='Based on game prices as of a few seconds ago'>
              <div className='flex items-center flex-col lg:items-start'>
                <p className='text-md text-alt font-semibold sm:text-lg'>Current Price</p>
                <Skeleton isLoaded={!isLoading} className='rounded-full'>
                  <p className='text-2xl font-bold text-red-400 md:text-3xl'>
                    {userGameData ? userGameData.totals.totalFinalFormatted : '$0,000.00'}
                  </p>
                </Skeleton>
              </div>
            </Tooltip>
            <Tooltip closeDelay={0} className='bg-tooltip' content='Based on game prices at time of release'>
              <div className='flex items-center flex-col lg:items-start'>
                <p className='text-md text-alt font-semibold sm:text-lg'>Initial Price</p>
                <Skeleton isLoaded={!isLoading} className='rounded-full'>
                  <p className='text-2xl font-bold text-green-400 md:text-3xl'>
                    {userGameData ? userGameData.totals.totalInitialFormatted : '$0,000.00'}
                  </p>
                </Skeleton>
              </div>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  )
}
