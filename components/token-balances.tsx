"use client"

import { useEffect, useState } from "react"
import { Coins } from "lucide-react"
import { useSolanaWallet } from "@/hooks/use-solana-wallet"
import { getTokenAccounts, type TokenInfo } from "@/services/token-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function TokenBalances() {
  const { connected, publicKey, connection } = useSolanaWallet()
  const [tokens, setTokens] = useState<TokenInfo[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchTokens = async () => {
      if (!connected || !publicKey) return

      setLoading(true)
      try {
        const tokenAccounts = await getTokenAccounts(connection, publicKey)
        setTokens(tokenAccounts)
      } catch (error) {
        console.error("Error fetching token accounts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTokens()
    // Set up interval to refresh tokens
    const intervalId = setInterval(fetchTokens, 30000) // every 30 seconds

    return () => clearInterval(intervalId)
  }, [connection, publicKey, connected])

  if (!connected) {
    return (
      <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-cyan-400">Token Balances</CardTitle>
          <CardDescription className="text-gray-400">Connect your wallet to view tokens</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-cyan-400 flex items-center">
          <Coins className="h-5 w-5 mr-2" />
          Token Balances
        </CardTitle>
        <CardDescription className="text-gray-400">Your SPL token balances</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full bg-gray-800" />
            <Skeleton className="h-10 w-full bg-gray-800" />
            <Skeleton className="h-10 w-full bg-gray-800" />
          </div>
        ) : tokens.length > 0 ? (
          <div className="space-y-2">
            {tokens.map((token, index) => (
              <div key={index} className="flex justify-between items-center p-2 border border-gray-800 rounded-md">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-gray-800 rounded-full flex items-center justify-center mr-2">
                    {token.symbol?.charAt(0) || "T"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-300">{token.symbol || "Unknown Token"}</p>
                    <p className="text-xs text-gray-500">
                      {token.mint.slice(0, 4)}...{token.mint.slice(-4)}
                    </p>
                  </div>
                </div>
                <p className="text-sm font-medium text-purple-400">{token.amount.toFixed(token.decimals)}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-400">No tokens found in your wallet</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
