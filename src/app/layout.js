import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';

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
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased h-[100vh] bg-zinc-100 dark:bg-zinc-900`}
            >
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                    {children}
                    <Toaster position="bottom-center" toastOptions={{ duration: 5000 }} />
                </ThemeProvider>
            </body>
        </html>
    );
}
