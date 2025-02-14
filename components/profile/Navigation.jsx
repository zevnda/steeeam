import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { TiArrowBack } from 'react-icons/ti';
import { useTheme } from 'next-themes';
import localFont from 'next/font/local';

const elgraine = localFont({ src: '../../public/Elgraine-Black-Italic.ttf' });

export default function Navigation() {
    const { theme } = useTheme();
    const [logoSrc, setLogoSrc] = useState('');

    useEffect(() => {
        setLogoSrc(
            theme === 'dark'
                ? '/logo-white.svg'
                : '/logo-black.svg'
        );
    }, [theme]);

    return (
        <React.Fragment>
            <div className='relative flex justify-between items-center w-full'>
                <Link href={'/'} className='z-50'>
                    <div className='flex justify-center items-center w-[30px] h-[30px] bg-pop text-white dark:text-black rounded-md cursor-pointer hover:opacity-[.8]'>
                        <TiArrowBack fontSize={22} />
                    </div>
                </Link>

                <div className='absolute flex justify-center items-center gap-1 w-full select-none flex-grow'>
                    <Link href={'/'} className='flex justify-center items-center gap-1'>
                        {logoSrc && (<Image src={logoSrc} width={30} height={30} alt='steeeam logo' />)}
                        <p className={`${elgraine.className} text-lg text-black dark:text-white font-medium`}>
                            Steeeam
                        </p>
                    </Link>
                </div>
            </div>
        </React.Fragment>
    );
}