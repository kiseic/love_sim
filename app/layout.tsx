import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ノッテコLove",
  description: "AIを使って様々な恋愛シミュレーションを体験できるツール",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* グローバルヘッダー（ダーク＋グラデ＋ロゴ） */}
        <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0B0D14] relative">
          {/* やわらかなグラデントのグロー */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-pink-500/5 via-fuchsia-500/5 to-purple-600/5" />
          <div className="relative mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
            {/* ブランド */}
            <Link href="/" className="group flex items-center gap-3">
              {/* シンプルなピン風ロゴ（SVG） */}
              <svg width="36" height="36" viewBox="0 0 48 48" aria-hidden="true" className="shrink-0">
                <defs>
                  <linearGradient id="nl-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FF2D83" />
                    <stop offset="100%" stopColor="#7C3AED" />
                  </linearGradient>
                </defs>
                <path d="M24 4c8.284 0 15 6.3 15 14.074 0 7.774-6.716 14.074-15 24.852C15.716 32.148 9 25.848 9 18.074 9 10.3 15.716 4 24 4Z" fill="url(#nl-grad)"/>
                <circle cx="24" cy="18" r="7" fill="#0B0D14"/>
                <text x="24" y="21" textAnchor="middle" fontSize="14" fontWeight="700" fill="url(#nl-grad)">N</text>
              </svg>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">ノッテコ</span>
                <span className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-fuchsia-500 to-violet-500 bg-clip-text text-transparent">Love</span>
              </div>
            </Link>

            {/* 右側（将来の操作領域） */}
            <div className="flex items-center gap-2">
              <Link href="/ops" className="hidden sm:inline-flex items-center gap-1 rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-white/80 hover:text-white hover:border-white/25 transition-colors">Ops</Link>
            </div>
          </div>
          {/* 下辺のグラデ波ライン */}
          <div className="relative h-[2px]">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 4" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="nl-wave" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FF2D83" />
                  <stop offset="100%" stopColor="#7C3AED" />
                </linearGradient>
              </defs>
              <path d="M0 2 C 200 0.5, 400 3.5, 600 2 C 800 0.5, 1000 3.5, 1200 2" stroke="url(#nl-wave)" strokeWidth="2" fill="none"/>
            </svg>
          </div>
        </header>

        {children}
      </body>
    </html>
  );
}
