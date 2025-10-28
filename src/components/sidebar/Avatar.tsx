import type { UserSummary } from '@/types/user-summary'

import { Tooltip } from '@heroui/react'
import Image from 'next/image'

export default function Avatar({ userSummary }: { userSummary: UserSummary }) {
  return (
    <>
      {userSummary.onlineState[0] === 'offline' ? (
        <div className='relative w-fit'>
          <Image
            src={userSummary.avatar.large}
            loading='eager'
            width={214}
            height={214}
            alt={`${userSummary.steamID[0]}'s Steam avatar`}
            className='border-2 border-light-border rounded-full w-[114px] h-[114px] lg:w-[214px] lg:h-[214px]'
          />
          <div className='absolute right-0 top-20 w-7 h-7 bg-black rounded-full lg:right-0 lg:top-[150px] lg:w-[38px] lg:h-[38px]'></div>
          <Tooltip closeDelay={0} className='bg-tooltip' content='Offline'>
            <div className='absolute right-[5px] top-[85px] w-[18px] h-[18px] bg-red-400 rounded-full lg:right-[5px] lg:top-[155px] lg:w-7 lg:h-7'></div>
          </Tooltip>
        </div>
      ) : (
        <div className='relative w-fit'>
          <Image
            src={userSummary?.avatar?.large}
            loading='eager'
            width={214}
            height={214}
            alt={`${userSummary.steamID[0]}'s Steam avatar`}
            className='border-2 border-light-border rounded-full w-[114px] h-[114px] lg:w-[214px] lg:h-[214px]'
          />
          <div className='absolute right-0 top-20 w-7 h-7 bg-black rounded-full lg:right-0 lg:top-[150px] lg:w-[38px] lg:h-[38px]'></div>
          <Tooltip closeDelay={0} className='bg-tooltip' content='Online'>
            <div className='absolute right-[5px] top-[85px] w-[18px] h-[18px] bg-green-400 rounded-full lg:right-[5px] lg:top-[155px] lg:w-7 lg:h-7'></div>
          </Tooltip>
        </div>
      )}
    </>
  )
}
