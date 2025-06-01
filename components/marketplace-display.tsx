"use client"

import { useState } from "react"
import Image from "next/image"
import { ImageIcon, ChevronLeft, ChevronRight } from "lucide-react"

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

export default function MarketplaceDisplay() {
  const { toast } = useToast()
  const { connected, publicKey, connection, sendTransaction } = useSolanaWallet()
  const { grid, purchaseFromUser, loading } = useGridStore()
  const [selectedBlock, setSelectedBlock] = useState<number | null>(null)
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)

  // Filter blocks that are listed for sale by other users
  const listedBlocks = grid.filter((block) => block.owner !== null && block.forSale)

  // Display 6 blocks per page
  const blocksPerPage = 6
  const totalPages = Math.ceil(listedBlocks.length / blocksPerPage)

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

      await purchaseFromUser(selectedBlock, publicKey, connection, sendTransaction, showToast)
      setPurchaseDialogOpen(false)
    } catch (error) {
      console.error("Purchase error:", error)
    }
  }

  const startIndex = currentPage * blocksPerPage
  const visibleBlocks = listedBlocks.slice(startIndex, startIndex + blocksPerPage)

  if (listedBlocks.length === 0) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center p-8 bg-gray-900/30 border border-gray-800 rounded-xl backdrop-blur-sm">
        <h3 className="text-xl font-medium text-cyan-400 mb-2">No blocks listed for sale</h3>
        <p className="text-gray-400 text-center max-w-md">Check back later or purchase new blocks from the grid.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleBlocks.map((block, index) => {
          const blockIndex = grid.findIndex((b) => b === block)
          return (
            <Card
              key={index}
              className="bg-gray-900/50 border-gray-800 backdrop-blur-sm hover:bg-gray-900/70 transition-all"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-cyan-400">Block #{blockIndex + 1}</CardTitle>
                <CardDescription className="text-gray-400">
                  Listed by {block.owner?.slice(0, 4)}...{block.owner?.slice(-4)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-square border border-gray-700 rounded-md overflow-hidden mb-4">
                  {block.imageUrl ? (
                    <Image
                      src={block.imageUrl || "/placeholder.svg"}
                      alt={`Grid block ${blockIndex}`}
                      width={300}
                      height={300}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900">
                      <ImageIcon className="h-8 w-8 text-gray-600" />
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-400">Price:</span>
                  <span className="text-lg font-bold text-purple-400">{block.price} SOL</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500"
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
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
            className="border-gray-700 text-gray-400"
          >
            <ChevronLeft className="h-4 w-4 mr-2" /> Previous
          </Button>

          <div className="text-sm text-gray-400">
            Page {currentPage + 1} of {totalPages}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
            disabled={currentPage === totalPages - 1}
            className="border-gray-700 text-gray-400"
          >
            Next <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}

      <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-cyan-400">
              Purchase Block #{selectedBlock !== null ? selectedBlock + 1 : ""}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              This block costs {selectedBlock !== null && grid[selectedBlock] ? grid[selectedBlock].price : 0} SOL. Once
              purchased, you can upload your own image.
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
                : `Purchase for ${selectedBlock !== null && grid[selectedBlock] ? grid[selectedBlock].price : 0} SOL`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
