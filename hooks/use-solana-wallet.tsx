"use client"

import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import { useConnection } from "@solana/wallet-adapter-react"
import { useCallback, useEffect, useState } from "react"
import { LAMPORTS_PER_SOL, type Transaction } from "@solana/web3.js"
import { useToast } from "@/hooks/use-toast"

export function useSolanaWallet() {
  const { connection } = useConnection()
  const {
    publicKey,
    sendTransaction: walletSendTransaction,
    signTransaction,
    signAllTransactions,
    connected,
    disconnect,
  } = useWallet()
  const { setVisible } = useWalletModal()
  const { toast } = useToast()
  const [balance, setBalance] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const connect = useCallback(() => {
    setVisible(true)
  }, [setVisible])

  // Wrapper for sendTransaction that handles errors
  const sendTransaction = useCallback(
    async (transaction: Transaction): Promise<string> => {
      if (!connected || !publicKey) {
        throw new Error("Wallet not connected")
      }

      try {
        return await walletSendTransaction(transaction, connection)
      } catch (error) {
        console.error("Transaction error:", error)
        throw error
      }
    },
    [connected, publicKey, walletSendTransaction, connection],
  )

  // Fetch balance when wallet is connected
  useEffect(() => {
    if (connected && publicKey) {
      const fetchBalance = async () => {
        try {
          const walletBalance = await connection.getBalance(publicKey)
          setBalance(walletBalance / LAMPORTS_PER_SOL)
        } catch (error) {
          console.error("Error fetching balance:", error)
          setBalance(null)
        }
      }

      fetchBalance()
      // Set up interval to refresh balance
      const intervalId = setInterval(fetchBalance, 30000) // every 30 seconds

      return () => clearInterval(intervalId)
    } else {
      setBalance(null)
    }
  }, [connection, publicKey, connected])

  // Function to request an airdrop (for devnet/testnet)
  const requestAirdrop = async (amount = 1) => {
    if (!publicKey || !connected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to request an airdrop",
        variant: "destructive",
      })
      return null
    }

    try {
      setIsLoading(true)
      const signature = await connection.requestAirdrop(publicKey, amount * LAMPORTS_PER_SOL)

      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(signature, "confirmed")

      if (confirmation.value.err) {
        throw new Error("Airdrop failed")
      }

      // Refresh balance
      const newBalance = await connection.getBalance(publicKey)
      setBalance(newBalance / LAMPORTS_PER_SOL)

      toast({
        title: "Airdrop successful",
        description: `Received ${amount} SOL`,
      })

      return signature
    } catch (error) {
      console.error("Error requesting airdrop:", error)
      toast({
        title: "Airdrop failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return {
    publicKey,
    connected,
    connect,
    disconnect,
    balance,
    sendTransaction,
    signTransaction,
    signAllTransactions,
    requestAirdrop,
    isLoading,
    connection,
  }
}
