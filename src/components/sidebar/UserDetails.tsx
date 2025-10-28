import type { UserSummary } from '@/types/user-summary'

import { Button, useDisclosure } from '@heroui/react'
import Link from 'next/link'

import IdModal from '@/components/sidebar/IdModal'

export default function UserDetails({ userSummary }: { userSummary: UserSummary }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  return (
    <>
      <div className='flex flex-col w-full gap-6 items-center lg:items-start'>
        <div className='flex flex-col w-full items-center lg:items-start lg:w-fit lg:max-w-60'>
          <div className='max-w-[220px]'>
            <Link href={`https://steamcommunity.com/profiles/${userSummary.steamID64[0]}`} target='_blank'>
              <p className='text-2xl text-white truncate'>{userSummary.nickname}</p>
            </Link>
          </div>

          <div className='flex items-center gap-2 max-w-[220px]'>
            <Link
              href={`https://steamcommunity.com/profiles/${userSummary.steamID64[0]}`}
              target='_blank'
              className='hover:text-white duration-150'
            >
              <p className='text-sm truncate'>{userSummary.steamID64[0]}</p>
            </Link>

            <div
              className='flex justify-center items-center w-4 h-4 border border-white hover:border-white/80 hover:text-white/80 duration-150 rounded-sm cursor-pointer'
              onClick={onOpen}
            >
              <p className='text-[10px] font-medium'>id</p>
            </div>
          </div>
        </div>

        <div className='w-[214px]'>
          <Link href={`https://steamcommunity.com/profiles/${userSummary.steamID64[0]}`} target='_blank'>
            <Button fullWidth size='sm' className='bg-pop text-black font-medium rounded-md'>
              View Steam Profile
            </Button>
          </Link>
        </div>
      </div>

      <IdModal isOpen={isOpen} onOpenChange={onOpenChange} userSummary={userSummary} />
    </>
  )
}
