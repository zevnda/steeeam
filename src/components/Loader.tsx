'use client'

import Image from 'next/image'

export default function Loader() {
  return (
    <div className='flex flex-col items-center justify-center space-y-2 min-h-screen bg-black select-none'>
      <Image src='/logo.svg' alt='Steeeam Logo' className='animate-spinner-ease-spin' width={22} height={22} />
      <p className='text-xs'>Loading user data...</p>
    </div>
  )
}
