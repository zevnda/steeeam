import { ThemeProvider } from '@/components/theme/theme-provider';
import { HeroUIProvider } from '@heroui/react';
import { UserDataProvider } from '@/components/UserDataContext';
import '../styles/globals.css';

export default function MyApp({ Component, pageProps }) {
    return (
        <ThemeProvider
            attribute='class'
            themes={['light', 'dark']}
            enableSystem={true}
            defaultTheme='system'
            disableTransitionOnChange
        >
            <HeroUIProvider>
                <UserDataProvider>
                    <Component {...pageProps} />
                </UserDataProvider>
            </HeroUIProvider>
        </ThemeProvider>
    );
}