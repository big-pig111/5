// 中心化后端API服务
// 所有交易都通过后端处理，而不是直接与区块链交互

export interface GridBlock {
  id: number
  owner: string | null
  imageUrl: string | null
  forSale: boolean
  price: number | null
}

export interface TransactionRequest {
  blockId: number
  buyerWallet: string
  amount: number
}

export interface TransactionResponse {
  success: boolean
  transactionId: string
  message: string
}

export interface UploadRequest {
  blockId: number
  ownerWallet: string
  imageFile: File
}

export interface ListingRequest {
  blockId: number
  ownerWallet: string
  price: number
}

class BackendApiService {
  private baseUrl = '/api' // 后端API基础URL

  // 获取网格数据
  async getGridData(): Promise<GridBlock[]> {
    try {
      const response = await fetch(`${this.baseUrl}/grid`)
      if (!response.ok) {
        throw new Error('Failed to fetch grid data')
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching grid data:', error)
      // 返回模拟数据作为后备
      return this.getMockGridData()
    }
  }

  // 购买区块（中心化处理）
  async purchaseBlock(request: TransactionRequest): Promise<TransactionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })
      
      if (!response.ok) {
        throw new Error('Purchase failed')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error purchasing block:', error)
      return {
        success: false,
        transactionId: '',
        message: error instanceof Error ? error.message : 'Purchase failed'
      }
    }
  }

  // 上传图片
  async uploadImage(request: UploadRequest): Promise<TransactionResponse> {
    try {
      const formData = new FormData()
      formData.append('blockId', request.blockId.toString())
      formData.append('ownerWallet', request.ownerWallet)
      formData.append('image', request.imageFile)

      const response = await fetch(`${this.baseUrl}/upload`, {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error('Upload failed')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error uploading image:', error)
      return {
        success: false,
        transactionId: '',
        message: error instanceof Error ? error.message : 'Upload failed'
      }
    }
  }

  // 列出区块出售
  async listForSale(request: ListingRequest): Promise<TransactionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })
      
      if (!response.ok) {
        throw new Error('Listing failed')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error listing block:', error)
      return {
        success: false,
        transactionId: '',
        message: error instanceof Error ? error.message : 'Listing failed'
      }
    }
  }

  // 购买用户列出的区块
  async purchaseFromUser(request: TransactionRequest): Promise<TransactionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/purchase-from-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })
      
      if (!response.ok) {
        throw new Error('Purchase from user failed')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error purchasing from user:', error)
      return {
        success: false,
        transactionId: '',
        message: error instanceof Error ? error.message : 'Purchase failed'
      }
    }
  }

  // 获取用户交易历史
  async getTransactionHistory(walletAddress: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/transactions/${walletAddress}`)
      if (!response.ok) {
        throw new Error('Failed to fetch transaction history')
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching transaction history:', error)
      return []
    }
  }

  // 模拟网格数据
  private getMockGridData(): GridBlock[] {
    return Array(64).fill(null).map((_, index) => ({
      id: index,
      owner: "4RoLEw2ecABi5Q5oqVybgaR3xtdFEpiN79tKYJ5txpff", // 开发者地址
      imageUrl: null,
      forSale: true,
      price: 0.005,
    }))
  }
}

export const backendApiService = new BackendApiService() 