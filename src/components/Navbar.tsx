import localFont from 'next/font/local'
import Image from 'next/image'
import Link from 'next/link'
import { BiCoffeeTogo } from 'react-icons/bi'
import { FaDiscord, FaGithub } from 'react-icons/fa'

const elgraine = localFont({ src: '../fonts/Elgraine-Black-Italic.ttf' })

export default function Navbar() {
  return (
    <nav className='relative flex items-center justify-between p-4 mx-auto max-w-7xl z-50'>
      <Link href='/' className='flex items-center justify-between space-x-3 group'>
        <Image
          src='/logo.svg'
          alt='Steeeam Logo'
          className='group-hover:opacity-80 duration-150'
          width={22}
          height={22}
        />
        <p className={`${elgraine.className} text-lg text-white group-hover:text-white/80 duration-150`}>Steeeam</p>
      </Link>

      <div className='flex justify-center items-center space-x-4'>
        <Link href='https://github.com/sponsors/zevnda/' target='_blank' rel='noopener noreferrer'>
          <FaGithub size={24} className='text-white hover:text-white/80 duration-150' />
        </Link>

        <Link href='https://discord.com/users/438434841617367080' target='_blank' rel='noopener noreferrer'>
          <FaDiscord size={24} className='text-white hover:text-white/80 duration-150' />
        </Link>

        <Link href='https://buymeacoffee.com/probablyraging' target='_blank' rel='noopener noreferrer'>
          <BiCoffeeTogo size={24} className='text-white hover:text-white/80 duration-150' />
        </Link>
      </div>
    </nav>
  )
}
