import type { Metadata } from "next";
import { Inter, Roboto } from "next/font/google";
import "./styles/globals.css";
import TanstackProvider from "../../providers/TanstackProvider";
import { SessionProvider } from "next-auth/react";

const geistSans = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: "400", // Specify the desired weight
});

export const metadata: Metadata = {
  title: "EcoHome",
  description: "Energy consumption monitoring and management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
  
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <TanstackProvider>
            <div>{children}</div>
          </TanstackProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
