import type { Metadata, Viewport } from "next";
import { Archivo, Geist } from "next/font/google";
import { themeScript } from "@/lib/theme";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// The width axis lets the title and the numbers be set wide without a second display font.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

const title = "Radar do Emprego Tech PT";
// Between 100 and 160 characters: LinkedIn's Post Inspector asks for at least 100, and search
// results cut longer descriptions.
const description =
  "O que as empresas tech em Portugal estão a pedir nas vagas: tecnologias, áreas, cidades e trabalho remoto, com dados do itjobs.pt atualizados todos os dias.";

// Declares the page's own light and dark themes. Samsung Internet only applies its forced dark
// mode to pages without this meta tag; globals.css handles Chrome with "only light".
export const viewport: Viewport = {
  colorScheme: "light dark",
};

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
    // The head script may add data-theme before React loads; suppressHydrationWarning covers only
    // this element's attributes, not the page inside it.
    <html
      lang="pt-PT"
      className={`${geistSans.variable} ${archivo.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
