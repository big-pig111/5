import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

import { ThemeProvider } from "@/components/theme-provider"
import { WalletProvider } from "@/providers/wallet-provider"
import { Toaster } from "@/components/ui/toaster"
import Navigation from "@/components/navigation"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SOL Grid Market",
  description: "Buy, customize, and trade grid blocks on the Solana blockchain",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <WalletProvider>
            <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
              <Navigation />
              <main className="h-[calc(100vh-4rem)] overflow-auto">{children}</main>
              <Toaster />
            </div>
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
