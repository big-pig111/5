import { NextResponse } from 'next/server'
import { DEVELOPER_WALLET } from '@/lib/config'

// 模拟数据存储（实际项目中应该使用Supabase数据库）
let gridData = Array(64).fill(null).map((_, index) => ({
  id: index,
  owner: DEVELOPER_WALLET,
  imageUrl: null,
  forSale: true,
  price: 0.005,
}))

export async function GET() {
  try {
    // 这里应该从Supabase数据库获取数据
    // const { data, error } = await supabase.from('grid_blocks').select('*')
    
    return NextResponse.json(gridData)
  } catch (error) {
    console.error('Error fetching grid data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch grid data' },
      { status: 500 }
    )
  }
} 