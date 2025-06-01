import { Suspense } from "react"
import MyBlocksDisplay from "@/components/my-blocks-display"

export default function MyBlocksPage() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-5xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-600">
              My Blocks
            </h1>
            <p className="text-gray-400 mt-2">
              Manage your purchased grid blocks, upload images, and list them for sale.
            </p>
          </div>

          <Suspense
            fallback={<div className="h-[600px] w-full flex items-center justify-center">Loading your blocks...</div>}
          >
            <MyBlocksDisplay />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
