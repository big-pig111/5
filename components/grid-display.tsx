"use client"

import { useState } from "react"
import Image from "next/image"
import { ImageIcon, ShoppingCart } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useSolanaWallet } from "@/hooks/use-solana-wallet"
import { useGridStore } from "@/hooks/use-grid-store"
import { DEVELOPER_WALLET } from "@/lib/config"

export default function GridDisplay() {
  const { toast } = useToast()
  const { connected, publicKey, connection, sendTransaction } = useSolanaWallet()
  const { grid, purchaseBlock, loading } = useGridStore()
  const [selectedBlock, setSelectedBlock] = useState<number | null>(null)
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false)

  const handleBlockClick = (index: number) => {
    if (!connected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to purchase blocks",
        variant: "destructive",
      })
      return
    }

    // Don't allow purchase of your own blocks
    if (publicKey && grid[index].owner === publicKey.toString()) {
      toast({
        title: "You already own this block",
        description: "Visit 'My Blocks' to manage your blocks",
      })
      return
    }

    // Only allow purchase of blocks that are for sale
    if (!grid[index].forSale) {
      toast({
        title: "Block not for sale",
        description: "This block is not currently for sale",
        variant: "destructive",
      })
      return
    }

    setSelectedBlock(index)
    setPurchaseDialogOpen(true)
  }

  const handlePurchase = async () => {
    if (selectedBlock === null) return

    try {
      const showToast = (title: string, description: string, variant: "default" | "destructive" = "default") => {
        toast({
          title,
          description,
          variant,
        })
      }

      await purchaseBlock(selectedBlock, publicKey, connection, sendTransaction, showToast)
      setPurchaseDialogOpen(false)
    } catch (error) {
      console.error("Purchase error:", error)
    }
  }

  const getBlockPrice = (index: number) => {
    if (index !== null && grid[index] && grid[index].price !== null) {
      return grid[index].price
    }

    // Default pricing logic for new blocks
    const soldBlocks = grid.filter((block) => block.owner !== DEVELOPER_WALLET).length
    const tier = Math.floor(soldBlocks / 10)
    return 0.005 + tier * 0.005
  }

  // Calculate how many blocks have been sold (not owned by developer)
  const soldBlocks = grid.filter((block) => block.owner !== DEVELOPER_WALLET).length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-8 gap-1 border border-gray-700 rounded-lg p-2 bg-gray-900/50 backdrop-blur-sm">
        {grid.map((block, index) => (
          <div
            key={block.id}
            className={`aspect-square border border-gray-600 rounded-sm overflow-hidden cursor-pointer transition-all ${
              block.forSale 
                ? "hover:border-cyan-400 hover:shadow-md hover:shadow-cyan-400/50" 
                : "border-gray-700 opacity-75"
            } ${
              connected && publicKey && block.owner === publicKey.toString()
                ? "border-purple-500 bg-purple-900/20"
                : ""
            }`}
            onClick={() => handleBlockClick(index)}
          >
            {block.imageUrl ? (
              <Image
                src={block.imageUrl}
                alt={`Grid block ${index}`}
                width={50}
                height={50}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                {block.forSale ? (
                  <ShoppingCart className="h-3 w-3 text-gray-500" />
                ) : (
                  <ImageIcon className="h-3 w-3 text-gray-600" />
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex justify-between items-center p-4 bg-gray-900/50 border border-gray-800 rounded-lg backdrop-blur-sm">
          <div>
            <p className="text-sm font-medium text-gray-400">Current tier price</p>
            <p className="text-xl font-bold text-cyan-400">{getBlockPrice(0)} SOL</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400">Next tier at</p>
            <p className="text-lg font-semibold text-purple-400">{Math.ceil((soldBlocks + 1) / 10) * 10} blocks</p>
          </div>
        </div>

        <div className="flex justify-between items-center p-4 bg-gray-900/50 border border-gray-800 rounded-lg backdrop-blur-sm">
          <div>
            <p className="text-sm font-medium text-gray-400">Developer</p>
            <p className="text-xs text-gray-300 break-all">{DEVELOPER_WALLET}</p>
          </div>
        </div>

        <div className="flex justify-between items-center p-4 bg-gray-900/50 border border-gray-800 rounded-lg backdrop-blur-sm">
          <div>
            <p className="text-sm font-medium text-gray-400">Blocks sold</p>
            <p className="text-2xl font-bold text-purple-400">{soldBlocks} / 64</p>
          </div>
        </div>
      </div>

      <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-cyan-400">
              Purchase Block #{selectedBlock !== null ? selectedBlock + 1 : ""}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedBlock !== null && grid[selectedBlock].owner === DEVELOPER_WALLET ? (
                <span>
                  This is an initial sale. Payment of {getBlockPrice(selectedBlock)} SOL will go to the developer through our secure backend.
                </span>
              ) : (
                <span>
                  This block costs {getBlockPrice(selectedBlock)} SOL. Once purchased, you can upload your own image.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPurchaseDialogOpen(false)}
              className="border-gray-700 text-gray-400"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePurchase}
              disabled={loading}
              className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500"
            >
              {loading
                ? "Processing..."
                : `Purchase for ${selectedBlock !== null ? getBlockPrice(selectedBlock) : 0} SOL`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
