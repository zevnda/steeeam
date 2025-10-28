import type { UserGameData } from '@/types/user-game-data'
import type { UserSummary } from '@/types/user-summary'

import { Suspense } from 'react'

import Loader from '@/components/Loader'
import Sidebar from '@/components/sidebar/Sidebar'
import ProfileSummary from '@/components/summary/ProfileSummary'

async function fetchUserSummary(id: string, currency?: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/steaminfo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, currency }),
      cache: 'no-store',
    })
    const data = await res.json()
    if (data.success) {
      return { userSummary: data.userSummary, error: '' }
    }
    return { userSummary: null, error: data.error || 'Unknown error occurred.' }
  } catch (err) {
    console.error('Error fetching user summary:', err)
    return { userSummary: null, error: 'Failed to fetch user info.' }
  }
}

async function fetchUserGameData(
  steamID64: string,
  currency?: string,
): Promise<{ userGameData: UserGameData | null; error: string }> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/gamedata`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: steamID64, currency }),
      cache: 'no-store',
    })
    const data = await res.json()
    if (data.success) {
      return { userGameData: data.userGameData, error: '' }
    }
    return { userGameData: null, error: data.error || 'Unknown error occurred.' }
  } catch (err) {
    console.error('Error fetching user game data:', err)
    return { userGameData: null, error: 'Failed to fetch user info.' }
  }
}

async function UserSummary({ id, currency }: { id: string; currency?: string }) {
  const { userSummary, error: summaryError } = await fetchUserSummary(id, currency)

  if (summaryError || !userSummary) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen bg-black text-white'>
        <h1 className='text-3xl font-bold mb-4'>Steam User</h1>
        <div className='text-red-500 text-lg mt-4'>{summaryError}</div>
      </div>
    )
  }

  const gameDataPromise = fetchUserGameData(userSummary.steamID64[0], currency)

  return (
    <div className='max-w-7xl h-screen mx-auto'>
      <div className='flex items-center flex-col lg:items-start lg:gap-10 p-4 lg:p-6'>
        <Sidebar userSummary={userSummary} />

        <div className='relative w-full h-full min-h-screen lg:pl-[250px]'>
          <Suspense
            fallback={<ProfileSummary userSummary={userSummary} userGameData={null} error={''} currency={currency} />}
          >
            <GameDataSection gameDataPromise={gameDataPromise} userSummary={userSummary} currency={currency} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

// Helper component to await game data
async function GameDataSection({
  gameDataPromise,
  userSummary,
  currency,
}: {
  gameDataPromise: Promise<{ userGameData: UserGameData | null; error: string }>
  userSummary: UserSummary
  currency?: string
}) {
  const { userGameData, error } = await gameDataPromise
  return <ProfileSummary userSummary={userSummary} userGameData={userGameData} error={error} currency={currency} />
}

export default async function UserPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ c?: string }>
}) {
  const { id } = await params
  const { c: currency } = await searchParams

  return (
    <Suspense fallback={<Loader />}>
      <UserSummary id={id} currency={currency} />
    </Suspense>
  )
}
