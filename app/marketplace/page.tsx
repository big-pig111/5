import { Suspense } from "react"
import MarketplaceDisplay from "@/components/marketplace-display"

export default function MarketplacePage() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-5xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-600">
              Marketplace
            </h1>
            <p className="text-gray-400 mt-2">
              Browse and trade grid blocks with other users. Each block can be customized with your own images.
            </p>
          </div>

          <Suspense
            fallback={<div className="h-[600px] w-full flex items-center justify-center">Loading marketplace...</div>}
          >
            <MarketplaceDisplay />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
