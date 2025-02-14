import { Fragment } from 'react';
import Link from 'next/link';
import { Progress, Skeleton } from '@heroui/react';

export default function GameProgressBar({ steamId, playCount, totals }) {

    if (!playCount) {
        return (
            <Fragment>
                <div className='w-full flex-grow lg:w-fit'>
                    <div className='flex flex-col gap-2'>
                        <Skeleton className='w-[200px] h-[18px] rounded-full' />
                        <Skeleton className='w-full h-[14px] rounded-full' />
                        <Skeleton className='w-[120px] h-[16px] rounded-full' />
                    </div>
                </div>
            </Fragment>
        );
    }

    return (
        <Fragment>
            <div className='w-full flex-grow lg:w-fit'>
                <Progress
                    value={playCount.playedCount ? playCount.playedCount : 0}
                    maxValue={totals.totalGames ? totals.totalGames : 1}
                    color='primary'
                    formatOptions={{ style: 'percent' }}
                    showValueLabel={true}
                    label={
                        <p>
                            <span className='font-bold text-blue-400'>{playCount.playedCount}</span> / <span className='font-bold text-blue-400'>{totals.totalGames}</span> games played
                        </p>
                    }
                    classNames={{
                        value: ['font-medium']
                    }}
                />

                <Link href={`https://steamcommunity.com/profiles/${steamId}/games?tab=all`} target='_blank'>
                    <p className='text-sm mt-1'>
                        View Games List
                    </p>
                </Link>
            </div>
        </Fragment >
    );
}