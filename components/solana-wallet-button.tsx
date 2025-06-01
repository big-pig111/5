"use client"

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { useEffect, useState } from "react"

export default function SolanaWalletButton() {
  const [mounted, setMounted] = useState(false)

  // Prevent hydration errors
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <WalletMultiButton className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500" />
  )
}
