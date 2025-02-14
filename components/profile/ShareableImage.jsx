import { Fragment, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Divider } from '@heroui/react';
import { FaImage, FaRegCopy } from 'react-icons/fa';
import { Accordion, AccordionItem } from '@heroui/react';
import Image from 'next/image';

export default function ShareableImage() {
    const router = useRouter();
    const { uid } = router.query;
    const [isCopied, setIsCopied] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(`https://steeeam.vercel.app/api/${uid}`);
        setIsCopied(true);
        setTimeout(() => {
            setIsCopied(false);
        }, 2000);
    };

    return (
        <Fragment>
            <div className='flex flex-col w-full mt-14'>
                <div className='flex justify-between items-center'>
                    <div className='flex items-center gap-1'>
                        <FaImage fontSize={22} />
                        <p className='text-lg font-medium py-2'>
                            Shareable Image
                        </p>
                    </div>
                </div>

                <Divider className='w-full h-[1px] bg-light-border mb-5 lg:mb-5' />

                <div className='flex flex-col w-full gap-4'>
                    <p>This is your dynamically generated image URL</p>

                    <div className='flex items-center gap-2 bg-neutral-200 dark:bg-neutral-800 p-1.5 rounded-md max-w-fit cursor-pointer' onClick={copyToClipboard}>
                        <p className='text-sm text-dull truncate'>
                            https://steeeam.vercel.app/api/{uid}
                        </p>
                        <FaRegCopy fontSize={16} />
                    </div>

                    <div className='w-full lg:max-w-[50%]'>
                        <Link href={`https://steeeam.vercel.app/api/${uid}`} target='_blank'>
                            <Image
                                src={`https://steeeam.vercel.app/api/${uid}`}
                                width={501}
                                height={273}
                                alt='Shareable Image'
                                className='rounded-md'
                            />
                        </Link>
                    </div>

                    <div className='w-full lg:max-w-[50%]'>
                        <Accordion
                            isCompact
                            itemClasses={{
                                title: ['text-lg', 'font-medium']
                            }}
                        >
                            <AccordionItem key='1' aria-label='What is it?' title='What is it?'>
                                <p>Steeeam dynamically generates a Steam card image accessable via the URL above.</p><br />
                                <p>The URL allows you to share your Steam card directly in places like Discord channels, Facebook posts, GitHub markdown files, and more, by simply copying and pasting it where you want to share the image</p>
                            </AccordionItem>
                            <AccordionItem key='2' aria-label='Can I customize it?' title='Can I customize it?'>
                                <p>Yes! Your Steam card is fully customizable, from the background color, to the text color. <Link href={'https://github.com/zevnda/steeeam?tab=readme-ov-file#shareable-image'} target='_blank'>Learn more here</Link>.</p>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </div>
            </div>
            <div className={`${isCopied ? 'flex' : 'hidden'} flex fixed bottom-0 right-0 m-5 z-50`}>
                <div className='bg-base border border-light-border rounded-md p-4'>
                    <p className='font-medium'>Copied to clipboard</p>
                </div>
            </div>
        </Fragment>
    );
}