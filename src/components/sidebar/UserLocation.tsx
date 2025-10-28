'use client'

import type { UserSummary } from '@/types/user-summary'

import { Tooltip } from '@heroui/react'
import moment from 'moment'
import { BiSolidCake } from 'react-icons/bi'
import { FaEye, FaMapMarkerAlt } from 'react-icons/fa'

export default function UserLocation({ userSummary }: { userSummary: UserSummary }) {
  return (
    <div className='flex items-center flex-col w-full gap-2 mt-4 lg:items-start'>
      <Tooltip
        closeDelay={0}
        className='bg-tooltip'
        content={userSummary.location ? userSummary.location : 'Unknown location'}
      >
        <div className='flex items-center max-w-[300px] text-sm text-neutral-500 gap-2 lg:max-w-[200px]'>
          <FaMapMarkerAlt fontSize={16} className='min-w-4' />
          <p className='text-white truncate'>{userSummary.location ? userSummary.location : 'Unknown location'}</p>
        </div>
      </Tooltip>

      <div className='flex items-center max-w-[300px] text-sm text-neutral-500 gap-2 lg:max-w-[200px]'>
        <FaEye fontSize={16} />
        {userSummary.onlineState[0] === 'online' ? (
          <p className='text-white truncate'>Last seen now</p>
        ) : (
          <p className='text-white truncate'>
            Last seen{' '}
            {userSummary.lastLogOffTimestamp ? moment.unix(userSummary.lastLogOffTimestamp).fromNow() : 'never'}
          </p>
        )}
      </div>

      <div className='flex items-center max-w-[300px] text-sm text-neutral-500 gap-2 lg:max-w-[200px]'>
        <BiSolidCake fontSize={16} />
        <p className='text-white truncate'>
          {userSummary.createdTimestamp
            ? `Joined ${moment.unix(userSummary.createdTimestamp).fromNow()} ago`
            : 'Unknown'}
        </p>
      </div>
    </div>
  )
}
