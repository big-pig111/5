import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import WalletConnectButton from "@/components/wallet-connect-button"

export default function Home() {
  return (
    <div className="h-full flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] border border-cyan-500/30 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-purple-500/20 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-cyan-500/10 rounded-full"></div>
      </div>

      {/* Content */}
      <div className="z-10 text-center px-4 max-w-3xl">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-600">
          SOL Grid Market
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto">
          A futuristic marketplace for digital real estate on the Solana blockchain
        </p>

        <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
          <WalletConnectButton className="w-full md:w-auto" />
          <Button
            variant="outline"
            size="lg"
            className="w-full md:w-auto border-cyan-500/50 text-cyan-400 hover:bg-cyan-950/30"
            asChild
          >
            <Link href="/grid">
              Explore Grid <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard title="Buy Blocks" description="Purchase digital blocks starting at just 0.1 SOL" href="/grid" />
          <FeatureCard
            title="Customize"
            description="Upload your images to personalize your owned blocks"
            href="/my-blocks"
          />
          <FeatureCard
            title="Trade"
            description="Buy and sell blocks with other users in the marketplace"
            href="/marketplace"
          />
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ title, description, href }: { title: string; description: string; href: string }) {
  return (
    <Link href={href}>
      <div className="p-6 rounded-xl bg-gray-900/50 border border-gray-800 backdrop-blur-sm hover:bg-gray-800/50 transition-all hover:border-cyan-900/50 group">
        <h3 className="text-xl font-bold mb-2 text-cyan-400 group-hover:text-cyan-300">{title}</h3>
        <p className="text-gray-400">{description}</p>
      </div>
    </Link>
  )
}
