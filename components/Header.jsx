import { Fragment, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import localFont from 'next/font/local';
import { useTheme } from 'next-themes';
import { BiCoffeeTogo } from 'react-icons/bi';
import { FaDiscord, FaGithub } from 'react-icons/fa';

const elgraine = localFont({ src: '../public/Elgraine-Black-Italic.ttf' });

export default function Header() {
    const { theme } = useTheme();
    const [logoSrc, setLogoSrc] = useState(null);

    useEffect(() => {
        setLogoSrc(
            theme === 'dark'
                ? '/logo-white.svg'
                : '/logo-black.svg'
        );
    }, [theme]);

    return (
        <Fragment>
            <header className='h-[64px] bg-base'>
                <nav className='flex justify-between items-center h-full px-6'>
                    <Link href={'/'}>
                        <div className='flex items-center gap-1 select-none'>
                            {logoSrc && (<Image src={logoSrc} width={30} height={30} alt='steeeam logo' />)}
                            <p className={`${elgraine.className} hidden text-lg text-black dark:text-white font-medium sm:block`}>
                                Steeeam
                            </p>
                        </div>
                    </Link>

                    <div className='flex items-center gap-4'>
                        <Link href={'https://github.com/zevnda'} target='_blank'>
                            <FaGithub fontSize={26} className='text-black dark:text-white hover:text-link dark:hover:text-link' />
                        </Link>
                        <Link href={'https://discord.com/users/438434841617367080'} target='_blank'>
                            <FaDiscord fontSize={26} className='text-black dark:text-white hover:text-link dark:hover:text-link' />
                        </Link>
                        <Link href={'https://buymeacoffee.com/probablyraging'} target='_blank'>
                            <BiCoffeeTogo fontSize={26} className='text-black dark:text-white hover:text-link dark:hover:text-link' />
                        </Link>
                    </div>
                </nav>
            </header>
        </Fragment>
    );
}