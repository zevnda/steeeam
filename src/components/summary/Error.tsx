'use client'

import { Button } from '@heroui/react'
import Link from 'next/link'
import { TiArrowBack } from 'react-icons/ti'

export default function Error({ error }: { error: string }) {
  return (
    <div className='absolute top-0 left-0 flex flex-col w-screen items-center justify-center min-h-screen bg-black text-white'>
      <div className='flex justify-center h-full mt-4 mx-auto max-w-7xl'>
        <div className='relative flex justify-center items-center flex-col gap-8 w-full h-3/4 bg-base border border-light-border p-4 rounded-md'>
          <p className='text-4xl font-bold text-center'>Oh no!</p>

          <div className='flex flex-col justify-center items-center space-y-3'>
            <p className='text-center text-sm'>
              {error
                ? error.split('\n').map((line, idx) => (
                    <span key={idx}>
                      {line}
                      {idx < error.split('\n').length - 1 && <br />}
                    </span>
                  ))
                : 'An unexpected error occurred while fetching the user data.'}
            </p>
          </div>

          <div className='flex justify-center items-center gap-3'>
            <Link href='/'>
              <Button startContent={<TiArrowBack fontSize={22} />} className='bg-pop text-black font-medium rounded-md'>
                Go back
              </Button>
            </Link>

            <Link href='https://github.com/zevnda/steeeam/issues/new' target='_blank' rel='noopener noreferrer'>
              <Button className='bg-pop text-black font-medium rounded-md'>Report Issue</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
