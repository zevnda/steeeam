import React, { useEffect } from 'react';
import Head from 'next/head';
import { useTheme } from 'next-themes';
import { GeistSans } from 'geist/font/sans';
import { Slide, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Layout({ children }) {
    const { theme } = useTheme();

    const getToastStyles = () => {
        if (typeof window === 'undefined') return {};

        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDarkMode = theme === 'system' ? prefersDark : theme === 'dark';

        const background = isDarkMode ? '#0a0a0a' : '#f5f5f5';
        const border = isDarkMode ? '1px solid #333' : '1px solid #ccc';
        const color = isDarkMode ? '#fff' : '#000';

        return { background, border, color, fontSize: 12 };
    };

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const toastContainers = document.querySelectorAll('.Toastify__toast');
        toastContainers.forEach(container => {
            Object.assign(container.style, getToastStyles());
        });
    }, [theme]);

    return (
        <React.Fragment>
            <Head>
                <title>Steeeam - Visualize your Steam profile</title>
                <meta name="description" content="Generate a shareable image to brag (or cry) about your Steam collection on Discord and other platforms." />
                <meta name="keywords" content="Steam library calculator, Steam playtime tracker, Steam game cost analyzer, free Steam library calculator, compare Steam playtime with friends, Steam profile stats, Steam library stats generator, shareable Steam library image, Discord Steam library image" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="author" content="zevnda" />

                <meta property='og:title' content='Steeeam - Visualize your Steam profile' />
                <meta property="og:description" content="Generate a shareable image to brag (or cry) about your Steam collection on Discord and other platforms." />
                <meta property="og:url" content="https://steeeam.vercel.app" />
                <meta property="og:type" content="website" />
                <meta property="og:image" content="/steeeam-og-image.png" />

                <meta name='twitter:title' content='Steeeam - Visualize your Steam profile' />
                <meta name="twitter:description" content="Generate a shareable image to brag (or cry) about your Steam collection on Discord and other platforms." />
                <meta name='twitter:card' content='summary_large_image' />
                <meta name="twitter:image" content="/steeeam-og-image.png" />

                <meta httpEquiv='content-language' content='en' />
                <meta name="theme-color" content="#000" />
                <link rel="canonical" href="https://steeeam.vercel.app" />
            </Head>

            <main className={`${GeistSans.className}`}>
                {children}
            </main>

            <ToastContainer
                toastStyle={getToastStyles()}
                position='top-center'
                theme={theme}
                transition={Slide}
                pauseOnHover
                pauseOnFocusLoss={false}
                limit={2}
                newestOnTop
                autoClose={3000}
            />
        </React.Fragment>
    );
}