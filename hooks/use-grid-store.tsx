"use client"

import { create } from "zustand"
import { PublicKey, type Connection } from "@solana/web3.js"
import { backendApiService } from "@/services/backend-api"
import { DEVELOPER_WALLET } from "@/lib/config"

// Initial owner wallet address - this would be the marketplace authority
const MARKETPLACE_AUTHORITY = "4RoLEw2ecABi5Q5oqVybgaR3xtdFEpiN79tKYJ5txpff"

interface GridBlock {
  id: number
  owner: string | null
  imageUrl: string | null
  forSale: boolean
  price: number | null
}

interface GridStore {
  grid: GridBlock[]
  loading: boolean
  fetchGridData: () => Promise<void>
  purchaseBlock: (
    index: number,
    publicKey: PublicKey | null,
    connection: Connection,
    sendTransaction: any,
    showToast: (title: string, description: string, variant?: "default" | "destructive") => void
  ) => Promise<void>
  uploadImage: (index: number, file: File, walletAddress?: string) => Promise<void>
  listForSale: (index: number, price: number, walletAddress?: string) => Promise<void>
  purchaseFromUser: (
    index: number,
    publicKey: PublicKey | null,
    connection: Connection,
    sendTransaction: any,
    showToast: (title: string, description: string, variant?: "default" | "destructive") => void
  ) => Promise<void>
}

// Initialize a 8x8 grid (64 blocks)
const initialGrid: GridBlock[] = Array(64)
  .fill(null)
  .map((_, index) => ({
    id: index,
    owner: DEVELOPER_WALLET, // 使用配置中的开发者地址
    imageUrl: null,
    forSale: true, // All blocks are initially for sale
    price: 0.005, // Initial price reduced to 0.005 SOL
  }))

export const useGridStore = create<GridStore>((set, get) => ({
  grid: initialGrid,
  loading: false,

  fetchGridData: async () => {
    try {
      const gridData = await backendApiService.getGridData()
      set({ grid: gridData })
    } catch (error) {
      console.error('Error fetching grid data:', error)
      // 如果后端API失败，保持使用初始数据
    }
  },

  purchaseBlock: async (index, publicKey, connection, sendTransaction, showToast) => {
    const { grid } = get()

    if (!grid[index].forSale) {
      throw new Error("This block is not for sale")
    }

    if (!publicKey) {
      throw new Error("Wallet not connected")
    }

    set({ loading: true })

    try {
      // 计算价格
      const soldBlocks = grid.filter((block) => block.owner !== DEVELOPER_WALLET).length
      const tier = Math.floor(soldBlocks / 10)
      const price = 0.005 + tier * 0.005

      // 通过后端API处理购买
      const result = await backendApiService.purchaseBlock({
        blockId: index,
        buyerWallet: publicKey.toString(),
        amount: price
      })

      if (!result.success) {
        throw new Error(result.message)
      }

      // 更新本地状态
      const newGrid = [...grid]
      newGrid[index] = {
        ...newGrid[index],
        owner: publicKey.toString(),
        forSale: false,
        price: 0,
      }

      set({ grid: newGrid, loading: false })
      showToast("Block purchased!", "You can now upload an image to your block")

      console.log(`Purchase successful. Transaction ID: ${result.transactionId}`)
    } catch (error) {
      set({ loading: false })
      showToast("Purchase failed", error instanceof Error ? error.message : "Unknown error occurred", "destructive")
      throw error
    }
  },

  uploadImage: async (index, file, walletAddress) => {
    const { grid } = get()
    
    if (!walletAddress) {
      throw new Error("Wallet address required")
    }

    // 检查用户是否拥有该区块
    if (grid[index].owner !== walletAddress) {
      throw new Error("You don't own this block")
    }

    set({ loading: true })

    try {
      const result = await backendApiService.uploadImage({
        blockId: index,
        ownerWallet: walletAddress,
        imageFile: file
      })

      if (!result.success) {
        throw new Error(result.message)
      }

      // 模拟图片URL（实际项目中应该从后端返回）
      const imageUrl = URL.createObjectURL(file)

      // 更新本地状态
      const newGrid = [...grid]
      newGrid[index] = {
        ...newGrid[index],
        imageUrl: imageUrl,
      }

      set({ grid: newGrid, loading: false })
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },

  listForSale: async (index, price, walletAddress) => {
    const { grid } = get()
    
    if (!walletAddress) {
      throw new Error("Wallet address required")
    }

    // 检查用户是否拥有该区块
    if (grid[index].owner !== walletAddress) {
      throw new Error("You don't own this block")
    }

    set({ loading: true })

    try {
      const result = await backendApiService.listForSale({
        blockId: index,
        ownerWallet: walletAddress,
        price: price
      })

      if (!result.success) {
        throw new Error(result.message)
      }

      // 更新本地状态
      const newGrid = [...grid]
      newGrid[index] = {
        ...newGrid[index],
        forSale: true,
        price: price,
      }

      set({ grid: newGrid, loading: false })
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },

  purchaseFromUser: async (index, publicKey, connection, sendTransaction, showToast) => {
    const { grid } = get()

    if (!grid[index].forSale) {
      throw new Error("This block is not for sale")
    }

    if (!publicKey) {
      throw new Error("Wallet not connected")
    }

    if (grid[index].owner === publicKey.toString()) {
      throw new Error("You already own this block")
    }

    set({ loading: true })

    try {
      const price = grid[index].price || 0

      const result = await backendApiService.purchaseFromUser({
        blockId: index,
        buyerWallet: publicKey.toString(),
        amount: price
      })

      if (!result.success) {
        throw new Error(result.message)
      }

      // 更新本地状态
      const newGrid = [...grid]
      newGrid[index] = {
        ...newGrid[index],
        owner: publicKey.toString(),
        forSale: false,
        price: 0,
      }

      set({ grid: newGrid, loading: false })
      showToast("Block purchased!", "You can now upload an image to your block")

      console.log(`Purchase from user successful. Transaction ID: ${result.transactionId}`)
    } catch (error) {
      set({ loading: false })
      showToast("Purchase failed", error instanceof Error ? error.message : "Unknown error occurred", "destructive")
      throw error
    }
  }
}))
