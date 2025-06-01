# SOL Grid Market - 中心化后端设置指南

## 概览

这个项目已经更新为使用中心化后端处理所有交易，而不是直接与Solana区块链交互。所有的购买、上传和销售操作都通过后端API处理，提供更好的用户体验和安全性。

## 主要变更

### 1. 开发者地址更新
- 开发者钱包地址已更新为：`4RoLEw2ecABi5Q5oqVybgaR3xtdFEpiN79tKYJ5txpff`
- 配置文件位置：`lib/config.ts`

### 2. 中心化后端架构
- 所有交易通过后端API处理
- 用户钱包仅用于身份验证
- 实际的SOL转账由后端钱包执行
- 状态管理通过Supabase数据库

## Supabase 设置

### 1. 创建Supabase项目
1. 访问 [Supabase](https://supabase.com)
2. 创建新项目
3. 获取项目URL和API密钥

### 2. 数据库表结构

#### grid_blocks 表
```sql
CREATE TABLE grid_blocks (
  id INT PRIMARY KEY,
  owner TEXT,
  image_url TEXT,
  for_sale BOOLEAN DEFAULT FALSE,
  price DECIMAL(10,6),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### transactions 表
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id INT REFERENCES grid_blocks(id),
  buyer TEXT NOT NULL,
  seller TEXT,
  price DECIMAL(10,6) NOT NULL,
  transaction_hash TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### users 表
```sql
CREATE TABLE users (
  wallet_address TEXT PRIMARY KEY,
  username TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 3. 环境变量配置

创建 `.env.local` 文件：
```env
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 开发者钱包地址
NEXT_PUBLIC_DEVELOPER_WALLET=4RoLEw2ecABi5Q5oqVybgaR3xtdFEpiN79tKYJ5txpff
```

### 4. 更新Supabase配置

编辑 `lib/supabase.ts`：
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## API路由功能

### 1. GET /api/grid
- 获取所有网格区块数据
- 从Supabase数据库读取

### 2. POST /api/purchase
- 处理区块购买
- 验证用户钱包
- 执行SOL转账
- 更新数据库

### 3. POST /api/upload
- 处理图片上传
- 上传到云存储
- 更新区块图片URL

### 4. POST /api/list
- 列出区块出售
- 设置价格和状态

### 5. POST /api/purchase-from-user
- 从其他用户购买区块
- 处理用户间转账

## 后端钱包设置

### 1. 创建后端钱包
```bash
# 生成新的钱包密钥对
solana-keygen new -o backend-wallet.json
```

### 2. 配置钱包私钥
```env
# 添加到环境变量
BACKEND_WALLET_PRIVATE_KEY=your_base58_encoded_private_key
```

### 3. 充值钱包
- 在devnet上获取SOL用于测试
- 在mainnet上充值真实SOL用于生产

## 交易流程

### 购买流程
1. 用户连接钱包进行身份验证
2. 前端发送购买请求到后端API
3. 后端验证请求和用户身份
4. 后端钱包执行SOL转账
5. 更新Supabase数据库
6. 返回交易确认

### 上传流程
1. 用户选择要上传的图片
2. 前端发送上传请求到后端API
3. 后端验证用户拥有该区块
4. 上传图片到云存储（AWS S3、Cloudinary等）
5. 更新数据库中的图片URL

### 销售流程
1. 用户设置区块销售价格
2. 后端更新数据库中的销售状态
3. 其他用户可以看到并购买该区块

## 安全考虑

### 1. 钱包验证
- 验证钱包签名确保用户身份
- 防止未授权的操作

### 2. 交易安全
- 所有转账通过后端钱包执行
- 实现交易确认机制
- 错误处理和回滚

### 3. 数据保护
- 使用Supabase RLS（行级安全）
- API速率限制
- 输入验证和清理

## 部署步骤

### 1. 安装依赖
```bash
npm install @supabase/supabase-js
```

### 2. 配置环境变量
- 设置Supabase连接信息
- 配置后端钱包私钥

### 3. 初始化数据库
- 创建必要的表
- 插入初始网格数据

### 4. 部署应用
```bash
npm run build
npm start
```

## 监控和维护

### 1. 交易监控
- 监控所有API调用
- 记录交易日志
- 设置错误告警

### 2. 钱包管理
- 监控后端钱包余额
- 定期备份钱包密钥
- 实施多重签名（推荐）

### 3. 数据库维护
- 定期备份Supabase数据
- 监控查询性能
- 优化数据库索引

## 开发注意事项

1. 当前实现包含模拟数据，生产环境需要完整的Supabase集成
2. 图片上传需要配置云存储服务
3. 需要实现真实的钱包签名验证
4. 建议添加交易手续费机制
5. 考虑实现退款和争议解决机制

## 技术支持

如有问题，请检查：
1. Supabase连接配置
2. 环境变量设置
3. API路由是否正确响应
4. 控制台错误日志 