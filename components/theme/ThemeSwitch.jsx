import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { LuMoonStar } from 'react-icons/lu';
import { LuSun } from 'react-icons/lu';

export default function ThemeSwitch() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    const handleClick = (mode) => {
        if (mode === 'dark') {
            setTheme('dark');
        } else {
            setTheme('light');
        }
    };

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <React.Fragment>
            <div className='flex justify-center items-center'>
                <div className={`${theme === 'dark' && 'bg-btn-active'} p-2 rounded-full cursor-pointer group`} onClick={() => handleClick('dark')}>
                    <LuMoonStar fontSize={18} className={`${theme === 'dark' ? 'text-link-hover' : 'text-link'} group-hover:text-link-hover`} />
                </div>
                <div className={`${theme === 'light' && 'bg-btn-active'} p-2 rounded-full cursor-pointer group`} onClick={() => handleClick('light')}>
                    <LuSun fontSize={18} className={`${theme === 'light' ? 'text-link-hover' : 'text-link'} group-hover:text-link-hover`} />
                </div>
            </div>
        </React.Fragment>
    );
}