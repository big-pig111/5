import { NextRequest } from 'next/server'
import { DEVELOPER_WALLET } from '@/lib/config'

// 模拟数据存储
let gridData = Array(64).fill(null).map((_, index) => ({
  id: index,
  owner: DEVELOPER_WALLET,
  imageUrl: null,
  forSale: true,
  price: 0.005,
}))

export async function POST(request: NextRequest) {
  try {
    const { blockId, buyerWallet, amount } = await request.json()

    // 验证请求数据
    if (!blockId && blockId !== 0 || !buyerWallet || !amount) {
      return Response.json(
        { success: false, transactionId: '', message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 检查区块是否存在
    if (blockId < 0 || blockId >= gridData.length) {
      return Response.json(
        { success: false, transactionId: '', message: 'Invalid block ID' },
        { status: 400 }
      )
    }

    // 检查区块是否可购买
    if (!gridData[blockId].forSale) {
      return Response.json(
        { success: false, transactionId: '', message: 'Block is not for sale' },
        { status: 400 }
      )
    }

    // 检查用户是否已拥有该区块
    if (gridData[blockId].owner === buyerWallet) {
      return Response.json(
        { success: false, transactionId: '', message: 'You already own this block' },
        { status: 400 }
      )
    }

    // 模拟交易处理
    // 在实际项目中，这里应该：
    // 1. 验证钱包签名
    // 2. 处理SOL转账（通过后端钱包）
    // 3. 更新Supabase数据库
    // 4. 发送交易确认

    // 更新区块所有权
    gridData[blockId] = {
      ...gridData[blockId],
      owner: buyerWallet,
      forSale: false,
      price: null
    }

    // 生成模拟交易ID
    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    console.log(`Block ${blockId} purchased by ${buyerWallet} for ${amount} SOL`)
    console.log(`Transaction ID: ${transactionId}`)

    return Response.json({
      success: true,
      transactionId,
      message: 'Block purchased successfully'
    })

  } catch (error) {
    console.error('Error processing purchase:', error)
    return Response.json(
      { success: false, transactionId: '', message: 'Internal server error' },
      { status: 500 }
    )
  }
} 