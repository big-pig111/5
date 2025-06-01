"use client"

import { useState } from "react"
import Image from "next/image"
import { ImageIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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

export default function MarketplaceList() {
  const { toast } = useToast()
  const { connected } = useSolanaWallet()
  const { grid, purchaseFromUser, loading } = useGridStore()
  const [selectedBlock, setSelectedBlock] = useState<number | null>(null)
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false)

  // Filter blocks that are listed for sale by other users
  const listedBlocks = grid.filter((block) => block.owner !== null && block.forSale)

  const handlePurchase = async () => {
    if (selectedBlock === null) return

    try {
      await purchaseFromUser(selectedBlock)
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

  if (listedBlocks.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">No blocks listed for sale</h3>
        <p className="text-muted-foreground mt-2">Check back later or purchase new blocks from the grid.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {listedBlocks.map((block, index) => {
        const blockIndex = grid.findIndex((b) => b === block)
        return (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle>Block #{blockIndex + 1}</CardTitle>
              <CardDescription>
                Listed by {block.owner?.slice(0, 4)}...{block.owner?.slice(-4)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-square border rounded-md overflow-hidden mb-4">
                {block.imageUrl ? (
                  <Image
                    src={block.imageUrl || "/placeholder.svg"}
                    alt={`Grid block ${blockIndex}`}
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Price:</span>
                <span className="text-lg font-bold">{block.price} SOL</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => {
                  if (!connected) {
                    toast({
                      title: "Wallet not connected",
                      description: "Please connect your wallet to purchase blocks",
                      variant: "destructive",
                    })
                    return
                  }
                  setSelectedBlock(blockIndex)
                  setPurchaseDialogOpen(true)
                }}
              >
                Purchase
              </Button>
            </CardFooter>
          </Card>
        )
      })}

      <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Purchase Block #{selectedBlock !== null ? selectedBlock + 1 : ""}</DialogTitle>
            <DialogDescription>
              This block costs {selectedBlock !== null && grid[selectedBlock] ? grid[selectedBlock].price : 0} SOL. Once
              purchased, you can upload your own image.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPurchaseDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePurchase} disabled={loading}>
              {loading
                ? "Processing..."
                : `Purchase for ${selectedBlock !== null && grid[selectedBlock] ? grid[selectedBlock].price : 0} SOL`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
