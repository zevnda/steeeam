import React, { useContext } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Loader from './Loader';
import ProfileSummary from './profile/ProfileSummary';
import Sidebar from './profile/Sidebar';
import { Divider } from '@heroui/react';
import Footer from './Footer';
import { UserDataContext } from './UserDataContext';

export default function Profile() {
    const router = useRouter();
    const { userSummary } = useContext(UserDataContext);
    const countryCode = router.query.cc;
    const countryAbbr = router.query.abbr;

    if (!userSummary) return <Loader />;

    return (
        <React.Fragment>
            <Head>
                <title>{`${userSummary.personaName} - Steeeam`}</title>
            </Head>

            <div className='bg-base'>
                <div className='max-w-[1300px] mx-auto'>
                    <div className='flex items-center flex-col lg:items-start lg:gap-10 p-4 lg:p-6'>
                        <Sidebar steamId={userSummary.steamId} userSummary={userSummary} />

                        <div className='relative w-full h-full min-h-screen lg:pl-[250px]'>
                            <Divider className='mt-5 mb-7 bg-light-border lg:m-0 lg:absolute lg:top-0 lg:left-[230px] lg:w-[1px] lg:h-full' />
                            <ProfileSummary steamId={userSummary.steamId} countryCode={countryCode} countryAbbr={countryAbbr} />
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </React.Fragment>
    );
}