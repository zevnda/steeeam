import type { UserGameData } from '@/types/user-game-data'
import type { UserSummary } from '@/types/user-summary'

import { Suspense } from 'react'
import { Metadata } from 'next'

import Footer from '@/components/Footer'
import Loader from '@/components/Loader'
import Sidebar from '@/components/sidebar/Sidebar'
import ProfileSummary from '@/components/summary/ProfileSummary'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<void | Metadata> {
  const { id } = await params
  const data = await fetchUserSummary(id)
  if (data.userSummary) {
    return {
      title: `${data.userSummary.steamID[0] || id} - Steeeam Profile`,
      description: `View the Steam profile of ${data.userSummary.steamID[0] || id} on Steeeam, a modern web app that allows you to visualize and share your Steam profile with customizable cards.`,
      openGraph: {
        url: `https://steeeam.vercel.app/${id}`,
        title: `${data.userSummary.steamID[0] || id} - Steeeam Profile`,
        description: `View the Steam profile of ${data.userSummary.steamID[0] || id} on Steeeam, a modern web app that allows you to visualize and share your Steam profile with customizable cards.`,
        siteName: 'Steeeam',
        images: [
          {
            url: `https://steeeam.vercel.app/api/${id}`,
            width: 1200,
            height: 630,
            alt: `Steeeam Profile Card for ${data.userSummary.steamID[0] || id}`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${data.userSummary.steamID[0] || id} - Steeeam Profile`,
        description: `View the Steam profile of ${data.userSummary.steamID[0] || id} on Steeeam, a modern web app that allows you to visualize and share your Steam profile with customizable cards.`,
        images: [`https://steeeam.vercel.app/api/${id}`],
      },
    }
  }
}

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
    console.error(`Error fetching user summary for ${id}:`, err)
    return { userSummary: null, error: 'Failed to fetch user info.' }
  }
}

async function fetchUserGameData(
  userSummary: UserSummary,
  currency?: string,
): Promise<{ userGameData: UserGameData | null; error: string }> {
  try {
    if (userSummary.privacyState[0] === 'private' || userSummary.privacyState[0] === 'friendsonly') {
      return { userGameData: null, error: 'User profile is private.' }
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/gamedata`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: userSummary.steamID64[0], currency }),
      cache: 'no-store',
    })
    const data = await res.json()
    if (data.success) {
      return { userGameData: data.userGameData, error: '' }
    }
    return { userGameData: null, error: data.error || 'Unknown error occurred.' }
  } catch (err) {
    console.error(`Error fetching user game data for ${userSummary.steamID64[0]}:`, err)
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

  const gameDataPromise = fetchUserGameData(userSummary, currency)

  return (
    <>
      <div className='max-w-7xl h-full mx-auto'>
        <div className='flex items-center flex-col lg:items-start lg:gap-10 p-4 lg:p-6'>
          <Sidebar userSummary={userSummary} />

          <div className='relative w-full h-full min-h-screen lg:pl-[230px]'>
            <Suspense
              fallback={<ProfileSummary userSummary={userSummary} userGameData={null} error={''} currency={currency} />}
            >
              <GameDataSection gameDataPromise={gameDataPromise} userSummary={userSummary} currency={currency} />
            </Suspense>
          </div>
        </div>
      </div>
      <Footer fixed={false} />
    </>
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
