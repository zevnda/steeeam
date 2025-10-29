'use client'

import type { UserSummary } from '@/types/user-summary'

import { Divider } from '@heroui/react'
import { FaCheck } from 'react-icons/fa'
import { FaX } from 'react-icons/fa6'

export default function UserBans({ userSummary }: { userSummary: UserSummary }) {
  return (
    <>
      <Divider className='hidden bg-light-border m-4 lg:block' />

      <div className='flex justify-center lg:block w-full mt-5 lg:mt-0'>
        <div className='grid grid-cols-2 grid-rows-6 gap-y-2 text-sm'>
          <div className='flex items-center max-w-[100px]'>
            <p className='truncate'>VAC Status</p>
          </div>
          <div className='flex justify-center items-center'>
            <p>
              {!userSummary.bans.vacBanned ? <FaCheck className='text-green-400' /> : <FaX className='text-red-400' />}
            </p>
          </div>

          <div className='flex items-center max-w-[100px]'>
            <p className='truncate'>Comm. Status</p>
          </div>
          <div className='flex justify-center items-center'>
            <p>
              {!userSummary.bans.communityBanned ? (
                <FaCheck className='text-green-400' />
              ) : (
                <FaX className='text-red-400' />
              )}
            </p>
          </div>

          <div className='flex items-center max-w-[100px]'>
            <p className='truncate'>Trade Status</p>
          </div>
          <div className='flex justify-center items-center'>
            <p>
              {userSummary.bans.economyBan === 'none' ? (
                <FaCheck className='text-green-400' />
              ) : (
                <FaX className='text-red-400' />
              )}
            </p>
          </div>

          <div className='flex items-center max-w-[100px]'>
            <p className='truncate'>VAC Bans</p>
          </div>
          <div className='flex justify-center items-center'>
            <p>{userSummary.bans.vacBans}</p>
          </div>

          <div className='flex items-center max-w-[100px]'>
            <p className='truncate'>Game Bans</p>
          </div>
          <div className='flex justify-center items-center'>
            <p>{userSummary.bans.gameBans}</p>
          </div>

          <div className='flex items-center max-w-[100px]'>
            <p className='truncate'>Last Ban</p>
          </div>
          <div className='flex justify-center items-center'>
            <p className='truncate'>{userSummary.bans.daysSinceLastBan} days ago</p>
          </div>
        </div>
      </div>
    </>
  )
}
