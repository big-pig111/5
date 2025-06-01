"use client"

import type React from "react"

import { useState, useRef } from "react"
import Image from "next/image"
import { ImageIcon, Upload, Tag, ChevronLeft, ChevronRight } from "lucide-react"

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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useSolanaWallet } from "@/hooks/use-solana-wallet"
import { useGridStore } from "@/hooks/use-grid-store"

export default function MyBlocksDisplay() {
  const { toast } = useToast()
  const { connected, publicKey, connection, sendTransaction } = useSolanaWallet()
  const { grid, uploadImage, listForSale, loading } = useGridStore()
  const [selectedBlock, setSelectedBlock] = useState<number | null>(null)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [sellDialogOpen, setSellDialogOpen] = useState(false)
  const [price, setPrice] = useState<string>("1.0")
  const [currentPage, setCurrentPage] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Filter blocks owned by the current user
  const myBlocks = connected && publicKey ? grid.filter((block) => block.owner === publicKey.toString()) : []

  // Display 6 blocks per page
  const blocksPerPage = 6
  const totalPages = Math.ceil(myBlocks.length / blocksPerPage)

  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault()
    if (selectedBlock === null || !fileInputRef.current?.files?.length) return

    try {
      const file = fileInputRef.current.files[0]
      const showToast = (title: string, description: string, variant: "default" | "destructive" = "default") => {
        toast({
          title,
          description,
          variant,
        })
      }

      await uploadImage(selectedBlock, file, publicKey, showToast)
      setUploadDialogOpen(false)
    } catch (error) {
      console.error("Upload error:", error)
    }
  }

  const handleListForSale = async (event: React.FormEvent) => {
    event.preventDefault()
    if (selectedBlock === null) return

    try {
      const priceValue = Number.parseFloat(price)
      if (isNaN(priceValue) || priceValue <= 0) {
        throw new Error("Please enter a valid price")
      }

      const showToast = (title: string, description: string, variant: "default" | "destructive" = "default") => {
        toast({
          title,
          description,
          variant,
        })
      }

      await listForSale(selectedBlock, priceValue, publicKey, connection, sendTransaction, showToast)
      setSellDialogOpen(false)
    } catch (error) {
      console.error("Listing error:", error)
      toast({
        title: "Listing failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    }
  }

  const startIndex = currentPage * blocksPerPage
  const visibleBlocks = myBlocks.slice(startIndex, startIndex + blocksPerPage)

  if (!connected) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center p-8 bg-gray-900/30 border border-gray-800 rounded-xl backdrop-blur-sm">
        <h3 className="text-xl font-medium text-cyan-400 mb-2">Wallet not connected</h3>
        <p className="text-gray-400 text-center max-w-md">Please connect your wallet to view your blocks.</p>
      </div>
    )
  }

  if (myBlocks.length === 0) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center p-8 bg-gray-900/30 border border-gray-800 rounded-xl backdrop-blur-sm">
        <h3 className="text-xl font-medium text-cyan-400 mb-2">You don't own any blocks yet</h3>
        <p className="text-gray-400 text-center max-w-md">
          Purchase blocks from the grid or marketplace to get started.
        </p>
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
                  {block.forSale ? "Listed for sale" : "Not listed for sale"}
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
                {block.forSale && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-400">Listed price:</span>
                    <span className="text-lg font-bold text-purple-400">{block.price} SOL</span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 border-cyan-500/30 text-cyan-400 hover:bg-cyan-950/30"
                  onClick={() => {
                    setSelectedBlock(blockIndex)
                    setUploadDialogOpen(true)
                  }}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500"
                  onClick={() => {
                    setSelectedBlock(blockIndex)
                    setPrice(block.price?.toString() || "1.0")
                    setSellDialogOpen(true)
                  }}
                >
                  <Tag className="h-4 w-4 mr-2" />
                  {block.forSale ? "Update" : "Sell"}
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

      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800">
          <form onSubmit={handleUpload}>
            <DialogHeader>
              <DialogTitle className="text-cyan-400">
                Upload Image to Block #{selectedBlock !== null ? selectedBlock + 1 : ""}
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Choose an image to upload to your block. The image will be visible on the grid.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="image" className="text-gray-300">
                Image
              </Label>
              <Input
                id="image"
                type="file"
                ref={fileInputRef}
                accept="image/*"
                required
                className="bg-gray-800 border-gray-700 text-gray-300"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => setUploadDialogOpen(false)}
                className="border-gray-700 text-gray-400"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500"
              >
                {loading ? "Uploading..." : "Upload Image"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={sellDialogOpen} onOpenChange={setSellDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800">
          <form onSubmit={handleListForSale}>
            <DialogHeader>
              <DialogTitle className="text-cyan-400">
                {selectedBlock !== null && grid[selectedBlock]?.forSale ? "Update Listing" : "List Block for Sale"}
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Set a price in SOL for your block. Other users will be able to purchase it.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="price" className="text-gray-300">
                Price (SOL)
              </Label>
              <Input
                id="price"
                type="number"
                step="0.001"
                min="0.001"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="bg-gray-800 border-gray-700 text-gray-300"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => setSellDialogOpen(false)}
                className="border-gray-700 text-gray-400"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500"
              >
                {loading
                  ? "Processing..."
                  : selectedBlock !== null && grid[selectedBlock]?.forSale
                    ? "Update Price"
                    : "List for Sale"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
