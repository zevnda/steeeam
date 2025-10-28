'use client'

import type { UserSummary } from '@/types/user-summary'

import Avatar from '@/components/sidebar/Avatar'
import Navigation from '@/components/sidebar/Navigation'
import UserBans from '@/components/sidebar/UserBans'
import UserConnections from '@/components/sidebar/UserConnections'
import UserDetails from '@/components/sidebar/UserDetails'
import UserLocation from '@/components/sidebar/UserLocation'

export default function Sidebar({ userSummary }: { userSummary: UserSummary }) {
  return (
    <div className='flex flex-col gap-4 w-full pb-10 lg:h-[calc(100vh-45px)] lg:border-r border-light-border pr-4 items-center z-50 lg:absolute lg:item-start lg:max-w-60 lg:w-fit'>
      <Navigation />
      <Avatar userSummary={userSummary} />
      <UserDetails userSummary={userSummary} />
      <UserConnections userSummary={userSummary} />
      <UserLocation userSummary={userSummary} />
      <UserBans userSummary={userSummary} />
    </div>
  )
}
