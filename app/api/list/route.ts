export async function POST(request: Request) {
  try {
    const { blockId, ownerWallet, price } = await request.json()

    // 验证请求数据
    if ((!blockId && blockId !== 0) || !ownerWallet || !price) {
      return Response.json(
        { success: false, transactionId: '', message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 验证价格
    if (price <= 0) {
      return Response.json(
        { success: false, transactionId: '', message: 'Price must be greater than 0' },
        { status: 400 }
      )
    }

    // 在实际项目中，这里应该：
    // 1. 验证钱包签名
    // 2. 验证用户拥有该区块
    // 3. 更新Supabase数据库
    // 4. 发送确认

    // 生成模拟交易ID
    const transactionId = `list_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    console.log(`Block ${blockId} listed for sale by ${ownerWallet} at ${price} SOL`)
    console.log(`Listing ID: ${transactionId}`)

    return Response.json({
      success: true,
      transactionId,
      message: 'Block listed for sale successfully'
    })

  } catch (error) {
    console.error('Error processing listing:', error)
    return Response.json(
      { success: false, transactionId: '', message: 'Internal server error' },
      { status: 500 }
    )
  }
} 