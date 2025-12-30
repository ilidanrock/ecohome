import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { QueryProvider } from '@/providers/query-provider';
import { SessionProvider } from '@/providers/session-provider';
import { ThemeProvider } from '@/components/theme/theme-provider';
import './globals.css';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'EcoHome',
  description: 'Energy consumption monitoring and management',
  metadataBase: new URL('https://ecohome-two.vercel.app'),
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen w-full`}
      >
        <QueryProvider>
          <ThemeProvider defaultTheme="light" storageKey="ecohome-theme">
            <div className="w-full min-h-screen flex flex-col bg-background text-foreground">
              <SidebarProvider>
                <SessionProvider>{children}</SessionProvider>
              </SidebarProvider>
              <Toaster position="top-right" richColors />
            </div>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
