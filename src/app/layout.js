import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import PwaProvider from './pwa-provider';
import ThemeColorUpdater from './theme-color-updater';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata = {
    title: 'Convector',
    description: 'Convect video to mp3 / wav',
    manifest: '/manifest.webmanifest',
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#f4f4f5' },
        { media: '(prefers-color-scheme: dark)', color: '#18181b' },
    ],
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'Convector',
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased h-[100vh] bg-zinc-100 dark:bg-zinc-900`}
            >
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                    <PwaProvider />
                    <ThemeColorUpdater />
                    {children}
                    <Toaster position="bottom-center" toastOptions={{ duration: 5000 }} />
                </ThemeProvider>
            </body>
        </html>
    );
}
