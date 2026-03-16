import type { Metadata, Viewport } from "next";
import "./globals.css";

const BASE_URL = "https://reelbox-pi.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "ReelBox",
    template: "%s | ReelBox",
  },
  description: "인스타그램 릴스를 카테고리, 태그, 메모와 함께 저장하고 검색할 수 있는 개인 웹 서비스",
  metadataBase: new URL(BASE_URL),
  manifest: "/manifest.json",
  verification: {
    google: "QwSeEYXUKCcLgTD8CtBEEpERKpp34sHBD_6r8dvKM2Q",
  },
  openGraph: {
    type: "website",
    siteName: "ReelBox",
    title: "ReelBox",
    description: "인스타그램 릴스를 카테고리, 태그, 메모와 함께 저장하고 검색할 수 있는 개인 웹 서비스",
    url: BASE_URL,
    locale: "ko_KR",
  },
  twitter: {
    card: "summary",
    title: "ReelBox",
    description: "인스타그램 릴스를 카테고리, 태그, 메모와 함께 저장하고 검색할 수 있는 개인 웹 서비스",
  },
  icons: {
    icon: "/icon-32.png",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ReelBox",
  },
};

export const viewport: Viewport = {
  themeColor: "#7c3aed",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="dns-prefetch" href="https://scontent.cdninstagram.com" />
        <link rel="preconnect" href="https://scontent.cdninstagram.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-gray-950 text-gray-100 min-h-screen">
        <div className="mx-auto max-w-[420px] min-h-screen bg-gray-900">
          {children}
        </div>
      </body>
    </html>
  );
}
