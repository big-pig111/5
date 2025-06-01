"use client"

import { useEffect, useState } from "react"
import { ArrowUpRight, ArrowDownLeft, Clock } from "lucide-react"
import { useSolanaWallet } from "@/hooks/use-solana-wallet"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { ConfirmedSignatureInfo, ParsedTransactionWithMeta } from "@solana/web3.js"

export default function TransactionHistory() {
  const { connected, publicKey, connection } = useSolanaWallet()
  const [transactions, setTransactions] = useState<
    (ConfirmedSignatureInfo & { parsedTx?: ParsedTransactionWithMeta })[]
  >([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!connected || !publicKey) return

      setLoading(true)
      try {
        // Get recent transactions
        const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 10 })

        // Get transaction details
        const txDetails = await Promise.all(
          signatures.map(async (sig) => {
            try {
              const parsedTx = await connection.getParsedTransaction(sig.signature, "confirmed")
              return { ...sig, parsedTx }
            } catch (error) {
              console.error(`Error fetching transaction ${sig.signature}:`, error)
              return sig
            }
          }),
        )

        setTransactions(txDetails)
      } catch (error) {
        console.error("Error fetching transactions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [connection, publicKey, connected])

  if (!connected) {
    return (
      <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-cyan-400">Transaction History</CardTitle>
          <CardDescription className="text-gray-400">Connect your wallet to view transactions</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-cyan-400 flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Transaction History
        </CardTitle>
        <CardDescription className="text-gray-400">Your recent Solana transactions</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full bg-gray-800" />
            <Skeleton className="h-10 w-full bg-gray-800" />
            <Skeleton className="h-10 w-full bg-gray-800" />
          </div>
        ) : transactions.length > 0 ? (
          <div className="space-y-2">
            {transactions.map((tx, index) => {
              // Determine if this is an incoming or outgoing transaction
              const isOutgoing = tx.parsedTx?.transaction.message.accountKeys.some(
                (key, i) =>
                  key.pubkey.toString() === publicKey.toString() && tx.parsedTx?.transaction.message.isAccountSigner(i),
              )

              return (
                <div key={index} className="flex justify-between items-center p-2 border border-gray-800 rounded-md">
                  <div className="flex items-center">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center mr-2 ${
                        isOutgoing ? "bg-red-900/30 text-red-400" : "bg-green-900/30 text-green-400"
                      }`}
                    >
                      {isOutgoing ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-300">{isOutgoing ? "Sent" : "Received"}</p>
                      <p className="text-xs text-gray-500">{new Date(tx.blockTime! * 1000).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-gray-300 mr-2">
                      {tx.signature.slice(0, 4)}...{tx.signature.slice(-4)}
                    </p>
                    <a
                      href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-400">No transactions found</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
