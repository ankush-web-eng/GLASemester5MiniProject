import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { metadata as siteMetadata } from '@/config/metadata';
import "@/styles/globals.css";
import { Toaster } from "@/components/ui/toaster";
import NextTopLoader from "nextjs-toploader";
// import { Navbar } from "@/components/header/Navbar";
import AuthProvider from "@/context/SessionProvider";
import { ThemeProvider } from "@/context/ThemeProvider";
import Header from "@/components/header/header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = siteMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem >
            <Toaster />
            <NextTopLoader
              showSpinner={false}
              color="#33F9FF"
            />
            {/* <Navbar /> */}
            <Header />
            {children}
          </ThemeProvider>
        </AuthProvider>
        {/* <OfflineNotification /> */}
      </body>
    </html>
  );
}
