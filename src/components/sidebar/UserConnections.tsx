import type { UserSummary } from '@/types/user-summary'

import { Divider } from '@heroui/react'
import Link from 'next/link'
import { HiMiniUserGroup } from 'react-icons/hi2'
import { RiBuilding4Fill } from 'react-icons/ri'

export default function UserConnections({ userSummary }: { userSummary: UserSummary }) {
  return (
    <div className='flex justify-center items-center max-w-60 gap-2 w-full mt-2 lg:justify-start'>
      <div className='flex items-center max-w-[100px] text-sm gap-2'>
        <HiMiniUserGroup fontSize={16} />
        <Link
          href={`https://steamcommunity.com/profiles/${userSummary.steamID64[0]}/friends`}
          target='_blank'
          className='hover:text-white duration-150'
        >
          <p className='flex gap-1 truncate'>
            <span className='text-white'>{userSummary.friends.length > 99 ? '99+' : userSummary.friends.length}</span>{' '}
            friends
          </p>
        </Link>
      </div>

      <Divider orientation='vertical' className='w-0.5 h-0.5 bg-white rounded-full' />

      <div className='flex items-center max-w-[100px] text-sm gap-2'>
        <RiBuilding4Fill fontSize={16} />
        <Link
          href={`https://steamcommunity.com/profiles/${userSummary.steamID64[0]}/groups`}
          target='_blank'
          className='hover:text-white duration-150'
        >
          <p className='flex gap-1 truncate'>
            <span className='text-white'>{userSummary.groups.length > 99 ? '99+' : userSummary.groups.length}</span>{' '}
            groups
          </p>
        </Link>
      </div>
    </div>
  )
}
