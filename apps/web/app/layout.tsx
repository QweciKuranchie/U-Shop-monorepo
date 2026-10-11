import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { cn } from "@repo/utils";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://ushopgh.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    template: "%s | UShop - Ghana's Tech Marketplace",
    default: "UShop | Ghana's Tech E-Commerce Platform",
  },
  description:
    "UShop — Ghana's trusted tech e-commerce platform. Buy and sell phones, laptops, tablets, and gadgets from Personal, Business, and Student sellers across Ghana.",
  applicationName: "UShop",
  authors: [{ name: "UShop Team" }],
  generator: "Next.js",
  keywords: [
    "UShop",
    "Ghana tech store",
    "buy phones Ghana",
    "laptops Accra",
    "tech marketplace Ghana",
    "student tech hub",
    "electronics Ghana",
  ],
  referrer: "origin-when-cross-origin",
  creator: "UShop",
  publisher: "UShop",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_GH",
    url: BASE_URL,
    siteName: "UShop",
    title: "UShop | Ghana's Tech E-Commerce Platform",
    description:
      "Ghana's trusted tech e-commerce platform. Buy and sell phones, laptops, tablets, and gadgets from Personal, Business, and Student sellers across Ghana.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "UShop - Ghana's Tech Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "UShop | Ghana's Tech E-Commerce Platform",
    description:
      "Ghana's trusted tech e-commerce platform. Buy and sell phones, laptops, and gadgets.",
    images: ["/og-image.jpg"],
    creator: "@ushopgh",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "UShop",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/assets/logos/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/assets/logos/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/assets/logos/favicon/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#6B1FA8",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/themes";
import { ClerkAuthFetchInterceptor } from "@/components/auth/ClerkAuthFetchInterceptor";

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ClerkProvider
      appearance={{ theme: shadcn }}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
    >
      <html lang="en" className={cn("font-sans", inter.variable)}>
        <head>
          <meta name="mobile-web-app-capable" content="yes" />
          <link rel="mask-icon" href="/assets/logos/favicon/favicon-32x32.png" color="#6B1FA8" />
        </head>
        <body className="font-sans antialiased">
          <ClerkAuthFetchInterceptor />
          {children}
          <ServiceWorkerRegister />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
};
export default RootLayout;
