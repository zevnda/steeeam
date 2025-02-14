import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Spinner } from '@heroui/react';
import { useTheme } from 'next-themes';

export default function Loader() {
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
        <div className='flex justify-center items-center w-screen h-screen'>
            <div className='absolute'>
                {logoSrc && (<Image src={logoSrc} width={18} height={18} alt='steeeam logo' />)}
            </div>
            <Spinner size='lg' color='current' />
        </div>
    );
}