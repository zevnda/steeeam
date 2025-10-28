import Link from 'next/link'

export default function Footer() {
  return (
    <div className='absolute bottom-0 left-0 flex justify-center items-center bg-black border-t border-light-border w-screen h-20 z-50'>
      <div className='flex flex-col justify-center items-center space-y-3'>
        <p className='text-xs'>
          Website created and managed by{' '}
          <Link href='https://aswebdesign.com.au' target='_blank' className='duration-150'>
            AS Web Design
          </Link>
          .
        </p>
        <p className='text-xs'>Copyright © {new Date().getFullYear()} zevnda.</p>
      </div>
    </div>
  )
}
