import { heroui } from "@heroui/react";

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}'
    ],
    darkMode: 'class',
    plugins: [heroui({
        themes: {
            light: {
                colors: {
                    'dull': '#000',
                    'alt': '#787878',
                    'accent': '#fff',
                    'pop': '#171717',
                    'base': '#fafafa',
                    'base-hover': '#f5f5f5',
                    'tooltip': '#fafafa',
                    'light-border': '#00000020',
                    'hover-border': '#00000030',
                    'btn-active': '#f3f3f3',
                    'link': '#666',
                    'link-hover': '#000',
                    secondary: {
                        DEFAULT: '#0a0a0a',
                        foreground: '#fff'
                    },
                }
            },
            dark: {
                colors: {
                    'dull': '#fff',
                    'alt': '#a4a4a4',
                    'accent': '#fff',
                    'pop': '#ededed',
                    'base': '#0b0b0b',
                    'base-hover': '#0d0d0d',
                    'tooltip': '#1a1a1a',
                    'light-border': '#ffffff30',
                    'hover-border': '#ffffff40',
                    'btn-active': '#1f1f1f',
                    'link': '#888',
                    'link-hover': '#fff',
                    secondary: {
                        DEFAULT: '#ebebeb',
                        foreground: '#000'
                    },
                }
            },
        }
    })],
};
