import localFont from 'next/font/local'
import Image from 'next/image'
import Link from 'next/link'
import { TiArrowBack } from 'react-icons/ti'

const elgraine = localFont({ src: '../../fonts/Elgraine-Black-Italic.ttf' })

export default function Navigation() {
  return (
    <div className='relative flex justify-between items-center w-full'>
      <Link href={'/'} className='z-50'>
        <div className='flex justify-center items-center w-[30px] h-[30px] bg-pop text-black rounded-md cursor-pointer hover:opacity-90 duration-150'>
          <TiArrowBack fontSize={22} />
        </div>
      </Link>

      <div className='absolute flex justify-center items-center gap-1 w-full select-none grow'>
        <Link href={'/'} className='flex justify-center items-center gap-1 group'>
          <Image
            src='/logo.svg'
            width={30}
            height={30}
            alt='Steeeam logo'
            className='group-hover:opacity-90 duration-150'
          />
          <p className={`${elgraine.className} text-lg text-white font-medium group-hover:opacity-90 duration-150`}>
            Steeeam
          </p>
        </Link>
      </div>
    </div>
  )
}
