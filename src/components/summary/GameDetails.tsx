import type { UserGameData } from '@/types/user-game-data'

import { minutesToHoursCompact, recentMinutesToHoursCompact } from '@/utils/utils'
import { FaMoneyBillWave } from 'react-icons/fa'
import { IoGameController } from 'react-icons/io5'
import { MdAvTimer } from 'react-icons/md'

interface GameDetailsProps {
  userGameData: UserGameData | null
  gameName: string
  minutes: number
  recentMinutes?: number
}

export default function GameDetails({ userGameData, gameName, minutes, recentMinutes }: GameDetailsProps) {
  const gameDetail = userGameData?.topFiveGameDetails.find(g => g.name === gameName)

  return (
    <div className='flex flex-col justify-between text-white w-full overflow-hidden py-1'>
      <p className='font-bold truncate'>{gameName}</p>

      <div className='hidden gap-8 py-1 flex-wrap mt-5 md:mt-0 md:gap-10 md:flex'>
        <div className='flex flex-col text-sm'>
          <div className='flex items-center gap-1'>
            <MdAvTimer className='text-yellow-400' fontSize={20} />
            <p className='text-md font-medium uppercase text-dull'>Total Playtime</p>
          </div>
          <p className='text-alt'>{minutesToHoursCompact(minutes)}</p>
        </div>

        <div className='flex flex-col text-sm'>
          <div className='flex items-center gap-1'>
            <IoGameController className='text-blue-400' fontSize={20} />
            <p className='text-md font-medium uppercase text-dull'>Recent Playtime</p>
          </div>
          <p className='text-alt'>{recentMinutesToHoursCompact(recentMinutes)}</p>
        </div>

        <div className='flex flex-col text-sm'>
          <div className='flex items-center gap-1'>
            <FaMoneyBillWave className='text-green-400' fontSize={20} />
            <p className='text-md font-medium uppercase text-dull'>Current Price</p>
          </div>
          {gameDetail && gameDetail.priceOverview ? (
            <p className='text-alt'>{gameDetail.priceOverview.final_formatted}</p>
          ) : (
            <p className='text-alt'>Free</p>
          )}
        </div>
      </div>

      <div className='grid grid-cols-1 w-full mt-2 py-1 flex-wrap gap-1 sm:gap-4 sm:grid-cols-3 md:hidden'>
        <div className='flex items-center justify-start gap-2 text-sm'>
          <MdAvTimer className='text-yellow-400' fontSize={20} />
          <p className='truncate text-alt'>{minutesToHoursCompact(minutes)}</p>
        </div>

        <div className='flex items-center justify-start gap-2 text-sm'>
          <IoGameController className='text-blue-400' fontSize={20} />
          <p className='truncate text-alt'>{recentMinutesToHoursCompact(recentMinutes)}</p>
        </div>

        <div className='flex items-center justify-start grow gap-2 text-sm'>
          <FaMoneyBillWave className='text-green-400' fontSize={20} />
          {gameDetail && gameDetail.priceOverview ? (
            <p className='truncate text-alt'>{gameDetail.priceOverview.final_formatted}</p>
          ) : (
            <p className='text-alt'>Free</p>
          )}
        </div>
      </div>
    </div>
  )
}
