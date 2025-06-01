"use client"

import { useState, useEffect } from "react"
import { Wallet } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useSolanaWallet } from "@/hooks/use-solana-wallet"

interface WalletConnectButtonProps {
  className?: string
}

export default function WalletConnectButton({ className }: WalletConnectButtonProps) {
  const { connected, publicKey, connect, disconnect, balance } = useSolanaWallet()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration errors
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="outline" size="sm" disabled className={`border-cyan-500/50 text-cyan-400 ${className}`}>
        <Wallet className="mr-2 h-4 w-4" />
        Connect Wallet
      </Button>
    )
  }

  if (connected && publicKey) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={`border-cyan-500/50 bg-gray-900/50 text-cyan-400 hover:bg-gray-800/50 ${className}`}
          >
            <Wallet className="mr-2 h-4 w-4" />
            {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
            {balance !== null && ` (${balance.toFixed(2)} SOL)`}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-gray-900 border-gray-800">
          <DropdownMenuItem
            className="text-gray-300 focus:text-gray-300 focus:bg-gray-800"
            onClick={() =>
              window.open(`https://explorer.solana.com/address/${publicKey.toString()}?cluster=devnet`, "_blank")
            }
          >
            View on Explorer
          </DropdownMenuItem>
          <DropdownMenuItem onClick={disconnect} className="text-red-400 focus:text-red-400 focus:bg-gray-800">
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Button
      variant="default"
      size="sm"
      onClick={connect}
      className={`bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 ${className}`}
    >
      <Wallet className="mr-2 h-4 w-4" />
      Connect Wallet
    </Button>
  )
}
