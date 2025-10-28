'use client'

import type { UserGameData } from '@/types/user-game-data'
import type { UserSummary } from '@/types/user-summary'

import { Button } from '@heroui/react'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import SearchInput from '@/components/SearchInput'
import AccountValue from '@/components/summary/AccountValue'
import ExpProgressBar from '@/components/summary/ExpProgressBar'
import GameProgressBar from '@/components/summary/GameProgressBar'
import GameStats from '@/components/summary/GameStats'
import ShareableImage from '@/components/summary/ShareableImage'
import TopFiveGames from '@/components/summary/TopFiveGames'

export default function ProfileSummary({
  userSummary,
  userGameData,
  error,
  currency,
}: {
  userSummary: UserSummary
  userGameData: UserGameData | null
  error: string
  currency?: string
}) {
  const [inputValue, setInputValue] = useState('')
  const router = useRouter()

  const handleEnterPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  const handleSubmit = () => {
    if (!inputValue) return
    router.push(`/${inputValue}${currency ? `?c=${currency}` : ''}`)
  }

  return (
    <>
      <div className='flex justify-between items-center flex-col gap-4 lg:items-end lg:flex-row'>
        <SearchInput
          placeholder='Search again'
          inputValue={inputValue}
          setInputValue={setInputValue}
          handleSubmit={handleSubmit}
          handleEnterPress={handleEnterPress}
        />
      </div>

      {error ? (
        <div className='flex justify-center w-full h-full mt-4'>
          <div className='relative flex justify-center items-center flex-col gap-8 w-full h-3/4 bg-base border border-light-border p-4 rounded-md'>
            <p className='text-4xl font-bold text-center'>Uh-oh!</p>
            <p className='text-center'>
              This account has their games list set to private so we&apos;re unable to provide much information.
            </p>
            <Link
              href={`https://steamcommunity.com/profiles/${userSummary.steamID64[0]}/edit/settings`}
              target='_blank'
            >
              <Button className='bg-pop text-black font-medium rounded-md'>Change Account Privacy</Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className='flex items-start flex-col gap-12'>
            <AccountValue userGameData={userGameData} />
            <GameStats userGameData={userGameData} currency={currency} />

            <div className='flex justify-between items-start flex-col w-full gap-8 lg:flex-row'>
              <GameProgressBar id={userSummary.steamID64[0]} userGameData={userGameData} />
              <ExpProgressBar userGameData={userGameData} />
            </div>
          </div>

          <div className='flex items-start flex-col gap-4'>
            <TopFiveGames id={userSummary.steamID64[0]} userGameData={userGameData} isLoading={false} />
          </div>

          <div className='flex items-start flex-col gap-4'>
            <ShareableImage id={userSummary.steamID64[0]} />
          </div>
        </>
      )}
    </>
  )
}
