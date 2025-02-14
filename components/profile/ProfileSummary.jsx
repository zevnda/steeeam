import React, { useContext } from 'react';
import AccountValue from './AccountValue';
import SearchInput from './SearchInput';
import GameProgressBar from './GameProgressBar';
import GameStats from './GameStats';
import TopGames from './TopGames';
import PrivateGames from '../PrivateGames';
import ExpProgressBar from './ExpProgressBar';
import ShareableImage from './ShareableImage';
import { UserDataContext } from '../UserDataContext';

export default function ProfileSummary({ steamId, countryCode, countryAbbr }) {
    const { totals, playCount } = useContext(UserDataContext);

    if (!totals) return <PrivateGames steamId={steamId} />;

    return (
        <React.Fragment>
            <div className='flex justify-between items-center flex-col gap-4 lg:items-end lg:flex-row'>
                <SearchInput countryCode={countryCode} countryAbbr={countryAbbr} />
            </div>

            <div className='flex items-start flex-col gap-12'>
                <AccountValue totals={totals} />
                <GameStats totals={totals} countryAbbr={countryAbbr} />
                <div className='flex justify-between items-start flex-col w-full gap-8 lg:flex-row'>
                    <GameProgressBar steamId={steamId} playCount={playCount} totals={totals} />
                    <ExpProgressBar steamId={steamId} />
                </div>
            </div>

            <div className='flex items-start flex-col gap-4'>
                <TopGames steamId={steamId} countryCode={countryCode} />
            </div>

            <div className='flex items-start flex-col gap-4'>
                <ShareableImage />
            </div>
        </React.Fragment>
    );
}