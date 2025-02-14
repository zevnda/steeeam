import React, { useState, useContext } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { IoGameController } from 'react-icons/io5';
import { Divider, Skeleton } from '@heroui/react';
import { UserDataContext } from '../UserDataContext';
import GameDetails from './GameDetails';

export default function TopGames({ steamId, countryCode }) {
    const { gamesList } = useContext(UserDataContext);
    const [isLoaded, setIsLoaded] = useState(false);

    const handleImageLoaded = () => {
        setIsLoaded(true);
    };

    if (!gamesList || !gamesList?.length) {
        return (
            <div className='flex flex-col w-full gap-4 mt-10'>
                <Skeleton className='rounded-lg min-h-[61.22px] md:min-h-[90px]' />
                <Skeleton className='rounded-lg min-h-[61.22px] md:min-h-[90px]' />
                <Skeleton className='rounded-lg min-h-[61.22px] md:min-h-[90px]' />
                <Skeleton className='rounded-lg min-h-[61.22px] md:min-h-[90px]' />
                <Skeleton className='rounded-lg min-h-[61.22px] md:min-h-[90px]' />
            </div>
        );
    };

    return (
        <React.Fragment>
            <div className='flex flex-col w-full mt-14'>
                <div className='flex justify-between items-center'>
                    <div className='flex items-center gap-1'>
                        <IoGameController fontSize={22} />
                        <p className='text-lg font-medium py-2'>
                            Top 5 Games
                        </p>
                    </div>
                    <Link href={`https://steamcommunity.com/profiles/${steamId}/games?tab=all`} target='_blank'>
                        <p className='text-sm'>
                            View All
                        </p>
                    </Link>
                </div>

                <Divider className='w-full h-[1px] bg-light-border mb-5 lg:mb-5' />

                <div className='flex flex-col w-full gap-4'>
                    {gamesList.map((item) => (
                        <Link key={item.game.id} href={`https://store.steampowered.com/app/${item.game.id}`} target='_blank'>
                            <div className='bg-base border border-light-border rounded-md min-h-[61.22px] hover:bg-base-hover hover:border-hover-border md:min-h-[110px]'>
                                <div className='flex gap-2'>
                                    <Skeleton isLoaded={isLoaded}>
                                        <Image
                                            className='rounded-l-md min-h-[110px] min-w-[131px] max-w-[131px] object-cover md:min-w-[231px] md:max-w-[231px]'
                                            src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${item.game.id}/header.jpg`}
                                            width={231}
                                            height={87}
                                            alt={`${item.game.name} capsule image`}
                                            onLoad={handleImageLoaded}
                                        />
                                    </Skeleton>

                                    <GameDetails gameId={item.game.id} minutes={item.minutes} lastPlayedTimestamp={item.lastPlayedTimestamp} countryCode={countryCode} />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </React.Fragment>
    );
}