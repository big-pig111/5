import { createClient } from '@supabase/supabase-js'

// 从环境变量获取配置，如果没有则使用占位符（开发模式）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

// 创建Supabase客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 检查是否使用占位符配置
export const isSupabaseConfigured = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL && 
         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
         !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
}

// Database types
export interface GridBlock {
  id: number
  owner: string | null
  image_url: string | null
  for_sale: boolean
  price: number | null
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  block_id: number
  buyer: string
  seller: string | null
  price: number
  transaction_hash: string | null
  status: 'pending' | 'completed' | 'failed'
  created_at: string
}

export interface User {
  wallet_address: string
  username: string | null
  created_at: string
  updated_at: string
} 