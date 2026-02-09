import { Mulish, Satisfy } from 'next/font/google';

export const muli = Mulish({
    subsets: ['latin'],
    weight: ['300', '400', '700'],
    variable: '--font-muli',
    display: 'swap',
    preload: true,
});

export const satisfy = Satisfy({
    subsets: ['latin'],
    weight: ['400'],
    variable: '--font-satisfy',
    display: 'swap',
    preload: true,
});
