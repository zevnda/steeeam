import { useContext } from 'react';
import Layout from '@/components/Layout';
import Landing from '@/components/Landing';
import { UserDataContext } from '@/components/UserDataContext';
import Loader from '@/components/Loader';

export default function Index() {
    const { isLoading } = useContext(UserDataContext);

    if (isLoading) {
        return (
            <Loader />
        );
    };

    return (
        <Layout>
            <Landing />
        </Layout>
    );
}