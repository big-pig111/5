"use client"

import { useState } from "react"
import Image from "next/image"
import { ImageIcon, Unlock } from "lucide-react"

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

export default function GridMarketplace() {
  const { toast } = useToast()
  const { connected } = useSolanaWallet()
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

    setSelectedBlock(index)
    setPurchaseDialogOpen(true)
  }

  const handlePurchase = async () => {
    if (selectedBlock === null) return

    try {
      await purchaseBlock(selectedBlock)
      toast({
        title: "Block purchased!",
        description: "You can now upload an image to your block",
      })
      setPurchaseDialogOpen(false)
    } catch (error) {
      toast({
        title: "Purchase failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    }
  }

  const getBlockPrice = (index: number) => {
    const soldBlocks = grid.filter((block) => block.owner !== null).length
    const tier = Math.floor(soldBlocks / 10)
    return 0.005 + tier * 0.005 // Initial price and increment reduced to 0.005 SOL
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-10 gap-1 md:gap-2">
        {grid.map((block, index) => (
          <div
            key={index}
            className={`aspect-square border rounded-md overflow-hidden cursor-pointer transition-all hover:opacity-90 ${
              block.owner ? "border-primary" : "border-muted"
            }`}
            onClick={() => handleBlockClick(index)}
          >
            {block.imageUrl ? (
              <Image
                src={block.imageUrl || "/placeholder.svg"}
                alt={`Grid block ${index}`}
                width={100}
                height={100}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                {block.owner ? (
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Unlock className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
        <div>
          <p className="text-sm font-medium">Current price per block</p>
          <p className="text-2xl font-bold">{getBlockPrice(0)} SOL</p>
        </div>
        <div>
          <p className="text-sm font-medium">Blocks sold</p>
          <p className="text-2xl font-bold">{grid.filter((block) => block.owner !== null).length} / 100</p>
        </div>
      </div>

      <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Purchase Block #{selectedBlock !== null ? selectedBlock + 1 : ""}</DialogTitle>
            <DialogDescription>
              This block costs {selectedBlock !== null ? getBlockPrice(selectedBlock) : 0} SOL. Once purchased, you can
              upload your own image.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPurchaseDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePurchase} disabled={loading}>
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
