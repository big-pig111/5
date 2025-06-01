"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { Connection, type PublicKey } from "@solana/web3.js"
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom"

interface WalletContextType {
  connected: boolean
  publicKey: PublicKey | null
  connect: () => Promise<void>
  disconnect: () => void
  signTransaction: (transaction: any) => Promise<any>
  connection: Connection
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [adapter, setAdapter] = useState<PhantomWalletAdapter | null>(null)
  const [connected, setConnected] = useState(false)
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null)
  const [connection] = useState(new Connection("https://api.mainnet-beta.solana.com", "confirmed"))

  useEffect(() => {
    // Initialize wallet adapter
    const phantomAdapter = new PhantomWalletAdapter()
    setAdapter(phantomAdapter)

    return () => {
      if (adapter) {
        adapter.disconnect()
      }
    }
  }, [])

  const connect = async () => {
    if (!adapter) {
      throw new Error("Wallet adapter not initialized")
    }

    try {
      await adapter.connect()
      setConnected(true)
      setPublicKey(adapter.publicKey)
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      throw error
    }
  }

  const disconnect = () => {
    if (adapter) {
      adapter.disconnect()
      setConnected(false)
      setPublicKey(null)
    }
  }

  const signTransaction = async (transaction: any) => {
    if (!adapter) {
      throw new Error("Wallet adapter not initialized")
    }

    try {
      return await adapter.signTransaction(transaction)
    } catch (error) {
      console.error("Failed to sign transaction:", error)
      throw error
    }
  }

  return (
    <WalletContext.Provider
      value={{
        connected,
        publicKey,
        connect,
        disconnect,
        signTransaction,
        connection,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}
