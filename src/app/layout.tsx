import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { APP_DESCRIPTION, APP_NAME, LANDING_TITLE } from "@/lib/config";
import { Providers } from "@/components/providers";
import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: LANDING_TITLE,
    template: `%s · ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  keywords: [
    "controle financeiro",
    "gastos pessoais",
    "orçamento",
    "comprovante",
    "finanças",
    "Folio",
  ],
  authors: [{ name: APP_NAME }],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: APP_NAME,
    title: LANDING_TITLE,
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: LANDING_TITLE,
    description: APP_DESCRIPTION,
  },
  appleWebApp: {
    capable: true,
    title: APP_NAME,
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#B7E34B",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${sans.variable} ${display.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background font-sans text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
