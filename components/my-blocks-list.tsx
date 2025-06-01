"use client"

import type React from "react"

import { useState, useRef } from "react"
import Image from "next/image"
import { ImageIcon, Upload, Tag } from "lucide-react"

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

export default function MyBlocksList() {
  const { toast } = useToast()
  const { connected, publicKey } = useSolanaWallet()
  const { grid, uploadImage, listForSale, loading } = useGridStore()
  const [selectedBlock, setSelectedBlock] = useState<number | null>(null)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [sellDialogOpen, setSellDialogOpen] = useState(false)
  const [price, setPrice] = useState<string>("1.0")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Filter blocks owned by the current user
  const myBlocks = connected && publicKey ? grid.filter((block) => block.owner === publicKey.toString()) : []

  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault()
    if (selectedBlock === null || !fileInputRef.current?.files?.length || !publicKey) return

    try {
      const file = fileInputRef.current.files[0]
      await uploadImage(selectedBlock, file, publicKey.toString())
      toast({
        title: "Image uploaded!",
        description: "Your image has been successfully uploaded to the block",
      })
      setUploadDialogOpen(false)
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    }
  }

  const handleListForSale = async (event: React.FormEvent) => {
    event.preventDefault()
    if (selectedBlock === null || !publicKey) return

    try {
      const priceValue = Number.parseFloat(price)
      if (isNaN(priceValue) || priceValue <= 0) {
        throw new Error("Please enter a valid price")
      }

      await listForSale(selectedBlock, priceValue, publicKey.toString())
      toast({
        title: "Block listed for sale!",
        description: `Your block is now available for ${priceValue} SOL`,
      })
      setSellDialogOpen(false)
    } catch (error) {
      toast({
        title: "Listing failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    }
  }

  if (!connected) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-300">Wallet not connected</h3>
        <p className="text-gray-400 mt-2">Please connect your wallet to view your blocks.</p>
      </div>
    )
  }

  if (myBlocks.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-300">You don't own any blocks yet</h3>
        <p className="text-gray-400 mt-2">Purchase blocks from the grid or marketplace to get started.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myBlocks.map((block) => {
          const blockIndex = grid.findIndex((b) => b === block)
          return (
            <Card key={block.id} className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-cyan-400">Block #{blockIndex + 1}</CardTitle>
                <CardDescription className="text-gray-400">
                  {block.forSale ? `Listed for ${block.price} SOL` : "Not for sale"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-square border border-gray-700 rounded-md overflow-hidden mb-4">
                  {block.imageUrl ? (
                    <Image
                      src={block.imageUrl}
                      alt={`Grid block ${blockIndex}`}
                      width={300}
                      height={300}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                      <ImageIcon className="h-8 w-8 text-gray-600" />
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedBlock(blockIndex)
                    setUploadDialogOpen(true)
                  }}
                  className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedBlock(blockIndex)
                    setPrice(block.price?.toString() || "1.0")
                    setSellDialogOpen(true)
                  }}
                  className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  <Tag className="h-4 w-4 mr-2" />
                  {block.forSale ? "Update Price" : "List for Sale"}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800">
          <form onSubmit={handleUpload}>
            <DialogHeader>
              <DialogTitle className="text-cyan-400">Upload Image</DialogTitle>
              <DialogDescription className="text-gray-400">
                Upload an image for Block #{selectedBlock !== null ? selectedBlock + 1 : ""}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="image" className="text-gray-300">
                Select Image
              </Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                ref={fileInputRef}
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
                {loading ? "Uploading..." : "Upload"}
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
                Set a price in SOL for your block. Other users will be able to purchase it through our secure backend.
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
