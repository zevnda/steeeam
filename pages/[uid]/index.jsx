import { Fragment, useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import Profile from '@/components/Profile';
import { UserDataContext } from '@/components/UserDataContext';
import Head from 'next/head';

export default function Index({ userData, gamesList, gameData, userConnections, userExp, userBans, gameDetails }) {
    const router = useRouter();
    const { uid } = router.query;
    const {
        setIsLoading,
        setUserSummary,
        setGamesList,
        setGameData,
        setTotals,
        setPlayCount,
        setUserConnections,
        setUserExp,
        setUserBans,
        setGameDetails
    } = useContext(UserDataContext);

    useEffect(() => {
        if (uid) {
            setUserSummary(userData);
            setGamesList(gamesList);
            setGameData(gameData);
            if (gameData) {
                setTotals(gameData[gameData.length - 2].totals);
                setPlayCount(gameData[gameData.length - 1].playCount);
            }
            setUserConnections(userConnections);
            setUserExp(userExp);
            setUserBans(userBans);
            setGameDetails(gameDetails);
            setIsLoading(false);
        }
    }, [uid]);

    return (
        <Fragment>
            <Head>
                <title>{`${userData.personaName} - Steeeam`}</title>
                <meta name="description" content={`An overview of ${userData.personaName}'s Steam account including their library value, total playtime, average game cost, and more.`} />
                <meta property='og:title' content={`${userData.personaName} - Steeeam`} />
                <meta property="og:description" content={`An overview of ${userData.personaName}'s Steam account including their library value, total playtime, average game cost, and more.`} />
                <meta property="og:image" content={userData.avatar} />
            </Head>
            <Profile />
        </Fragment>
    );
}

export async function getServerSideProps(context) {
    const { uid } = context.params;
    const host = context.req.headers.host;
    const protocol = context.req.headers['x-forwarded-proto'] || 'http';
    const domain = `${protocol}://${host}`;
    const url = new URL(context.req.url, domain);
    const searchParams = url.searchParams;
    searchParams.delete('uid');

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const data = await fetch(`${domain}/api/user-data?uid=${uid}&${searchParams.toString()}`, { signal: controller.signal })
            .then(response => response.json());

        clearTimeout(timeoutId);

        return {
            props: {
                userData: data.userSummary,
                gamesList: data.gamesList,
                gameData: data.gameData,
                userConnections: data.userConnections,
                userExp: data.userExp,
                userBans: data.userBans,
                gameDetails: data.gameDetails
            }
        };
    } catch (error) {
        console.error('Error fetching user data:', error);
        return {
            props: {
                userData: null,
                gamesList: null,
                gameData: null,
                userConnections: null,
                userExp: null,
                userBans: null,
                gameDetails: null
            }
        };
    }
}