import { Suspense } from "react"
import AirdropRequest from "@/components/airdrop-request"

export default function WalletPage() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-5xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-600">
              Wallet Dashboard
            </h1>
            <p className="text-gray-400 mt-2">View your Solana wallet information and request devnet SOL</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <Suspense fallback={<div>Loading wallet information...</div>}>
                <AirdropRequest />
              </Suspense>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-cyan-400 mb-4">Wallet Information</h2>
              <p className="text-gray-400">
                Connect your wallet to view your balance and transaction history. You can use the airdrop feature to get
                SOL for testing on the Solana devnet.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
