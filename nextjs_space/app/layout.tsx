import type { Metadata } from "next";
import './globals.css'

export const metadata: Metadata = {
  title: "AuroraInvest Stock Analyzer | Investment Analysis Tool",
  description: "Professional stock analysis tool providing comprehensive insights including fundamentals, technicals, sentiment analysis, and scenario projections for informed investment decisions.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "AuroraInvest Stock Analyzer",
    description: "Professional investment analysis tool for stock market research",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}