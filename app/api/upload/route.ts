import { NextRequest } from 'next/server'

// 模拟数据存储
let gridData = Array(64).fill(null).map((_, index) => ({
  id: index,
  owner: "4RoLEw2ecABi5Q5oqVybgaR3xtdFEpiN79tKYJ5txpff",
  imageUrl: null,
  forSale: true,
  price: 0.005,
}))

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const blockId = formData.get('blockId') as string
    const ownerWallet = formData.get('ownerWallet') as string
    const imageFile = formData.get('image') as File

    // 验证请求数据
    if (!blockId || !ownerWallet || !imageFile) {
      return Response.json(
        { success: false, transactionId: '', message: 'Missing required fields' },
        { status: 400 }
      )
    }

    const blockIndex = parseInt(blockId)

    // 检查区块是否存在
    if (blockIndex < 0 || blockIndex >= gridData.length) {
      return Response.json(
        { success: false, transactionId: '', message: 'Invalid block ID' },
        { status: 400 }
      )
    }

    // 检查用户是否拥有该区块
    if (gridData[blockIndex].owner !== ownerWallet) {
      return Response.json(
        { success: false, transactionId: '', message: 'You do not own this block' },
        { status: 403 }
      )
    }

    // 在实际项目中，这里应该：
    // 1. 验证钱包签名
    // 2. 上传图片到云存储（如AWS S3、Cloudinary等）
    // 3. 更新Supabase数据库
    // 4. 返回图片URL

    // 模拟上传处理
    const imageUrl = `https://placeholder-images.com/${blockIndex}`

    // 更新区块数据
    gridData[blockIndex] = {
      ...gridData[blockIndex],
      imageUrl: imageUrl
    }

    const transactionId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    console.log(`Image uploaded for block ${blockIndex} by ${ownerWallet}`)
    console.log(`Upload ID: ${transactionId}`)

    return Response.json({
      success: true,
      transactionId,
      message: 'Image uploaded successfully',
      imageUrl: imageUrl
    })

  } catch (error) {
    console.error('Error processing upload:', error)
    return Response.json(
      { success: false, transactionId: '', message: 'Internal server error' },
      { status: 500 }
    )
  }
} 