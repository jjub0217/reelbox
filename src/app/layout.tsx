import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReelBox",
  description: "인스타그램 릴스 스마트 저장 & 검색",
  manifest: "/manifest.json",
  themeColor: "#7c3aed",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ReelBox",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-gray-950 text-gray-100 min-h-screen">
        <div className="mx-auto max-w-[420px] min-h-screen bg-gray-900">
          {children}
        </div>
      </body>
    </html>
  );
}
