import { Fragment } from 'react';
import SearchInput from './landing/SearchInput';
import Footer from './Footer';
import Header from './Header';

export default function Landing() {
    return (
        <Fragment>
            <div className='h-screen'>
                <Header />

                <div className='flex justify-center items-stretch flex-col min-h-[calc(100vh-64px)]'>
                    <div className='flex justify-center items-center w-full bg-base flex-grow bg-image bg-cover bg-center'>
                        <SearchInput />
                    </div>

                    <Footer />
                </div>
            </div>
        </Fragment>
    );
}