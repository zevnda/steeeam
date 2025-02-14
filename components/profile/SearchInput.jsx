import { Fragment, useContext, useState } from 'react';
import { useRouter } from 'next/router';
import { Input, Button } from '@heroui/react';
import { FaArrowRight } from 'react-icons/fa';
import { RiSearchLine } from 'react-icons/ri';
import { formatSteamProfileUrl } from '@/utils/utils';
import { UserDataContext } from '../UserDataContext';

export default function SearchInput({ countryCode, countryAbbr }) {
    const router = useRouter();
    const {
        setIsLoading,
        setUserSummary,
        setGamesList,
        setGameData,
        setTotals,
        setPlayCount,
        setUserConnections,
        setUserExp,
        setUserBans
    } = useContext(UserDataContext);
    const [inputValue, setInputValue] = useState('');

    const handleSubmit = async () => {
        if (inputValue.length > 0) {
            const formatInput = formatSteamProfileUrl(inputValue).replace(/^\//, '');
            const currentPath = router.asPath.split('?')[0].replace(/^\//, '');

            if (formatInput !== currentPath) {
                setIsLoading(true);
                clearData();

                if (countryCode) {
                    router.push({
                        pathname: formatInput,
                        query: {
                            cc: countryCode,
                            abbr: countryAbbr
                        },
                    });
                } else {
                    router.push(formatInput);
                }
            }
            setInputValue('');
        }
    };

    const handleChange = (e) => {
        setInputValue(e.target.value.trim());
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    const clearData = () => {
        setUserSummary(null);
        setGamesList(null);
        setGameData(null);
        setTotals(null);
        setPlayCount(null);
        setUserConnections(null);
        setUserExp(null);
        setUserBans(null);
    };

    return (
        <Fragment>
            <div className='relative flex items-end w-full'>
                <Input
                    size='lg'
                    startContent={<RiSearchLine className='text-neutral-500' fontSize={20} />}
                    placeholder='Search again'
                    value={inputValue}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    endContent={
                        <Button
                            size='sm'
                            isIconOnly
                            isDisabled={!inputValue > 0}
                            startContent={<FaArrowRight />}
                            onPress={handleSubmit}
                            className='bg-pop text-white dark:text-black ml-[20px]'
                        />
                    }
                    classNames={{
                        inputWrapper: [
                            'bg-base',
                            'hover:!bg-base-hover',
                            'group-data-[focus=true]:!bg-base-hover',
                            'group-data-[focus=true]:!shadow-custom',
                            'border',
                            'border-light-border',
                            'group-data-[focus=true]:!border-hover-border',
                            'hover:!border-hover-border',
                            'rounded-lg',
                        ],
                    }}
                />
            </div>
        </Fragment>
    );
}