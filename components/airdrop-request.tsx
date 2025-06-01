"use client"

import { useState } from "react"
import { Coins } from "lucide-react"
import { useSolanaWallet } from "@/hooks/use-solana-wallet"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { LAMPORTS_PER_SOL } from "@solana/web3.js"

export default function AirdropRequest() {
  const { connected, publicKey, connection } = useSolanaWallet()
  const [amount, setAmount] = useState("0.05") // 默认值改为0.05
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleAirdrop = async () => {
    if (!connected || !publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to request an airdrop",
        variant: "destructive",
      })
      return
    }

    const parsedAmount = Number.parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0 || parsedAmount > 2) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount between 0.01 and 2 SOL", // 最小值改为0.01
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const signature = await connection.requestAirdrop(publicKey, parsedAmount * LAMPORTS_PER_SOL)

      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(signature, "confirmed")

      if (confirmation.value.err) {
        throw new Error("Airdrop failed")
      }

      toast({
        title: "Airdrop successful",
        description: `Received ${parsedAmount} SOL`,
      })
    } catch (error) {
      console.error("Error requesting airdrop:", error)
      toast({
        title: "Airdrop failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!connected) {
    return (
      <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-cyan-400 flex items-center">
            <Coins className="h-5 w-5 mr-2" />
            Request Devnet SOL
          </CardTitle>
          <CardDescription className="text-gray-400">Connect your wallet to request SOL</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-cyan-400 flex items-center">
          <Coins className="h-5 w-5 mr-2" />
          Request Devnet SOL
        </CardTitle>
        <CardDescription className="text-gray-400">Get SOL for testing on devnet</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="amount" className="text-gray-300">
            Amount (max 2 SOL)
          </Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0.01" // 最小值改为0.01
            max="2"
            step="0.01" // 步长改为0.01
            className="bg-gray-800 border-gray-700 text-gray-300"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleAirdrop}
          disabled={loading}
          className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500"
        >
          {loading ? "Processing..." : "Request Airdrop"}
        </Button>
      </CardFooter>
    </Card>
  )
}
