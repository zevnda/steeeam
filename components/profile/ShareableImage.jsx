import { Fragment, useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/router';
import { Divider } from '@heroui/react';
import { FaImage, FaRegCopy } from 'react-icons/fa';
import Image from 'next/image';
import { Slide, ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CodeWithSelection = ({ label, code }) => {
    const { theme } = useTheme();

    const getToastStyles = () => {
        if (typeof window === 'undefined') return {};

        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDarkMode = theme === 'system' ? prefersDark : theme === 'dark';

        const background = isDarkMode ? '#0a0a0a' : '#f5f5f5';
        const border = isDarkMode ? '1px solid #333' : '1px solid #ccc';
        const color = isDarkMode ? '#fff' : '#000';

        return { background, border, color, fontSize: 12 };
    };

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const toastContainers = document.querySelectorAll('.Toastify__toast');
        toastContainers.forEach(container => {
            Object.assign(container.style, getToastStyles());
        });
    }, [theme]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(code);
        toast.success('Copied to clipboard');
    };

    return (
        <Fragment>
            <div className='flex flex-col'>
                <p className='font-semibold mb-1'>
                    {label}
                </p>
                <div className='flex justify-between items-center gap-4 bg-[#f0f0f0] dark:bg-[#1c1c1c] p-1.5 rounded w-full lg:w-[70%] cursor-pointer' onClick={copyToClipboard}>
                    <p className='text-xs font-mono w-[95%]'>
                        {code}
                    </p>
                    <FaRegCopy className='text-md' />
                </div>
            </div>

            <ToastContainer
                toastStyle={getToastStyles()}
                position='bottom-right'
                theme={theme}
                transition={Slide}
                pauseOnHover
                pauseOnFocusLoss={false}
                limit={2}
                newestOnTop
                autoClose={2000}
            />
        </Fragment>
    );
};

export default function ShareableImage() {
    const router = useRouter();
    const { theme } = useTheme();
    const { uid } = router.query;

    const [imgSrc, setImgSrc] = useState(`https://steeeam.vercel.app/api/${uid}`);

    useEffect(() => {
        setImgSrc(
            theme === 'dark'
                ? `https://steeeam.vercel.app/api/${uid}`
                : `https://steeeam.vercel.app/api/${uid}?theme=light`
        );
    }, [theme]);

    return (
        <Fragment>
            <div className='flex flex-col w-full mt-14'>
                <div className='flex justify-between items-center'>
                    <div className='flex items-center gap-2'>
                        <FaImage fontSize={22} />
                        <p className='text-lg font-semibold py-2'>
                            Steeeam Card
                        </p>
                    </div>
                </div>

                <Divider className='w-full h-[1px] bg-light-border mb-5 lg:mb-5' />

                <div className='flex flex-col w-full gap-4'>
                    <div className='w-full lg:max-w-[70%]'>
                        <Link href={`https://steeeam.vercel.app/api/${uid}`} target='_blank'>
                            <Image
                                src={imgSrc}
                                width={705}
                                height={385}
                                alt='Steeeam Card'
                                className='rounded-md border border-light-border w-full'
                            />
                        </Link>
                    </div>

                    <p className='text-sm'>
                        This image can be fully customized to your liking. <Link href={'https://github.com/zevnda/steeeam?tab=readme-ov-file#shareable-image'} target='_blank'>Learn more here.</Link>
                    </p>

                    <div className='flex flex-col gap-2'>
                        <CodeWithSelection
                            label='Discord'
                            code={`https://steeeam.vercel.app/api/${uid}`}
                        />
                        <CodeWithSelection
                            label='Twitter, Facebook, WhatsApp, etc..'
                            code={`https://steeeam.vercel.app/${uid}`}
                        />
                        <CodeWithSelection
                            label='HTML'
                            code={`<a href="https://steeeam.vercel.app/${uid}"><img src="https://steeeam.vercel.app/api/${uid}" alt="Generate by Steeeam"/></a>`}
                        />
                        <CodeWithSelection
                            label='Markdown'
                            code={`[![Generated by Steeeam](https://steeeam.vercel.app/api/${uid})](https://steeeam.vercel.app)`}
                        />
                        <CodeWithSelection
                            label='BBCode'
                            code={`[url=https://steeeam.vercel.app/${uid}][img]https://steeeam.vercel.app/api/${uid}[/img][/url]`}
                        />
                    </div>
                </div>
            </div>
        </Fragment>
    );
}