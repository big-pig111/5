"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Grid, ShoppingBag, Layers, Menu, X, Wallet } from "lucide-react"

import { Button } from "@/components/ui/button"
import WalletConnectButton from "@/components/wallet-connect-button"

export default function Navigation() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { name: "Grid", href: "/grid", icon: <Grid className="h-4 w-4 mr-2" /> },
    { name: "Marketplace", href: "/marketplace", icon: <ShoppingBag className="h-4 w-4 mr-2" /> },
    { name: "My Blocks", href: "/my-blocks", icon: <Layers className="h-4 w-4 mr-2" /> },
    { name: "Wallet", href: "/wallet", icon: <Wallet className="h-4 w-4 mr-2" /> },
  ]

  return (
    <header className="h-16 border-b border-gray-800 backdrop-blur-md bg-black/50 sticky top-0 z-50">
      <div className="container h-full flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-600">
            SOL Grid
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant={pathname === item.href ? "secondary" : "ghost"}
              size="sm"
              className={pathname === item.href ? "bg-gray-800 text-cyan-400" : "text-gray-400 hover:text-white"}
              asChild
            >
              <Link href={item.href} className="flex items-center">
                {item.icon}
                {item.name}
              </Link>
            </Button>
          ))}
          <div className="ml-4">
            <WalletConnectButton />
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-4">
          <WalletConnectButton />
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 inset-x-0 bg-black/95 border-b border-gray-800 backdrop-blur-md z-50">
          <nav className="container py-4 flex flex-col space-y-2">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant={pathname === item.href ? "secondary" : "ghost"}
                className={
                  pathname === item.href
                    ? "bg-gray-800 text-cyan-400 justify-start"
                    : "text-gray-400 hover:text-white justify-start"
                }
                asChild
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link href={item.href} className="flex items-center">
                  {item.icon}
                  {item.name}
                </Link>
              </Button>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
