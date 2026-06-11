import "./globals.css";
import type { Viewport } from 'next';

import { Plus_Jakarta_Sans } from "next/font/google";

import { ReactNode } from "react";

import { NextIntlClientProvider } from "next-intl";
import { getTranslations, getMessages } from "next-intl/server";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/app/providers/ThemeProvider";

const font = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: Props) {
  const params = await props.params;

  const { locale } = params;

  const t = await getTranslations({ locale, namespace: "RootLayout" });

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL!),
    title: t("title"),
    description: t("description"),
    openGraph: {
      images: [
        {
          url: "/images/opengraph-image.png",
          width: 1200,
          height: 630,
          alt: t("title"),
        },
      ],
    },
    twitter: {
      cardType: "summary_large_image",
      image: "/images/opengraph-image.png",
      width: 1200,
      height: 630,
      alt: t("title"),
    },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export default async function RootLayout(props: Props) {
  const params = await props.params;

  const { locale } = params;

  const { children } = props;

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={font.className} suppressHydrationWarning>
        {/* Dark Mode Aurora Orbs */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none hidden dark:block">
          <div className="aurora-orb-1" />
          <div className="aurora-orb-2" />
          <div className="aurora-orb-3" />
        </div>
        {/* Light Mode Prismatic Orbs */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none block dark:hidden">
          <div className="prismatic-orb-1" />
          <div className="prismatic-orb-2" />
          <div className="prismatic-orb-3" />
        </div>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
          </NextIntlClientProvider>
        </ThemeProvider>
        <Toaster />
        <SonnerToaster />
      </body>
    </html>
  );
}
