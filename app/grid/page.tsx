import { Suspense } from "react"
import GridDisplay from "@/components/grid-display"
import AirdropCountdown from "@/components/airdrop-countdown"

export default function GridPage() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex items-center justify-center p-6 relative">
        {/* Token Info Panel - Left Side */}
        <div className="absolute top-2 left-2 bg-gray-900/70 border border-cyan-500/30 backdrop-blur-sm rounded-lg p-3 shadow-lg shadow-cyan-500/10 z-10 max-w-[250px]">
          <div className="text-center">
            <h3 className="text-sm font-medium text-purple-400 mb-1">Token Information</h3>
            <div className="space-y-2 text-left">
              <div>
                <p className="text-xs font-medium text-cyan-400">Contract Address:</p>
                <p className="text-xs text-gray-300 break-all">4RoLEw2ecABi5Q5oqVybgaR3xtdFEpiN79tKYJ5txpff</p>
              </div>
              <div>
                <p className="text-xs font-medium text-cyan-400">Token Name:</p>
                <p className="text-xs text-gray-300">SOL Grid Token (SGT)</p>
              </div>
              <div>
                <p className="text-xs font-medium text-cyan-400">Total Supply:</p>
                <p className="text-xs text-gray-300">1,000,000 SGT</p>
              </div>
              <div>
                <p className="text-xs font-medium text-cyan-400">Airdrop Amount:</p>
                <p className="text-xs text-gray-300">10 SGT per block owned</p>
              </div>
            </div>
          </div>
        </div>

        {/* Airdrop Countdown - Right Side */}
        <div className="absolute top-2 right-2 bg-gray-900/70 border border-purple-500/30 backdrop-blur-sm rounded-lg p-3 shadow-lg shadow-purple-500/10 z-10">
          <div className="text-center">
            <h3 className="text-sm font-medium text-cyan-400 mb-1">Next Airdrop</h3>
            <AirdropCountdown />
            <p className="text-xs text-gray-400 mt-1">Grid owners receive tokens at the top of each hour</p>
          </div>
        </div>

        <div className="w-full max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-600">
              Grid Marketplace
            </h1>
            <p className="text-gray-400 mt-2">
              Browse and purchase grid blocks in our 8×8 marketplace. Each block can be customized with your own images.
            </p>
          </div>

          <Suspense fallback={<div className="h-[450px] w-full flex items-center justify-center">Loading grid...</div>}>
            <GridDisplay />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
