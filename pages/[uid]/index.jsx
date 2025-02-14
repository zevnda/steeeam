import React, { useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import Profile from '@/components/Profile';
import { UserDataContext } from '@/components/UserDataContext';

export default function Index({ userData, gamesList, gameData, userConnections, userExp, userBans }) {
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
        setUserBans
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
            setIsLoading(false);
        }
    }, [uid]);

    return (
        <Layout>
            <Profile />
        </Layout>
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
                userBans: null
            }
        };
    }
}