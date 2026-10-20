import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const title = "Radar do Emprego Tech PT";
const description = "O que as empresas tech em Portugal estão a pedir nas vagas, com dados do itjobs.pt.";

// The share image comes from app/opengraph-image.tsx; on Vercel, Next.js fills in the site URL for it.
export const metadata: Metadata = {
  title,
  description,
  authors: [{ name: "Gustavo Soro Costa", url: "https://www.linkedin.com/in/gustavo-soro-costa" }],
  openGraph: { title, description, siteName: title, locale: "pt_PT", type: "website" },
  twitter: { card: "summary_large_image", title, description },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-PT"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
