-- SOL Grid Market 数据库初始化脚本
-- 在Supabase SQL编辑器中运行此脚本

-- 创建grid_blocks表
CREATE TABLE IF NOT EXISTS grid_blocks (
  id INT PRIMARY KEY,
  owner TEXT,
  image_url TEXT,
  for_sale BOOLEAN DEFAULT FALSE,
  price DECIMAL(10,6),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建transactions表
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id INT REFERENCES grid_blocks(id),
  buyer TEXT NOT NULL,
  seller TEXT,
  price DECIMAL(10,6) NOT NULL,
  transaction_hash TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 创建users表
CREATE TABLE IF NOT EXISTS users (
  wallet_address TEXT PRIMARY KEY,
  username TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 插入初始网格数据（64个区块，全部属于开发者）
INSERT INTO grid_blocks (id, owner, image_url, for_sale, price)
SELECT 
  generate_series(0, 63),
  '4RoLEw2ecABi5Q5oqVybgaR3xtdFEpiN79tKYJ5txpff',
  NULL,
  TRUE,
  0.005
ON CONFLICT (id) DO NOTHING;

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_grid_blocks_owner ON grid_blocks(owner);
CREATE INDEX IF NOT EXISTS idx_grid_blocks_for_sale ON grid_blocks(for_sale);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer ON transactions(buyer);
CREATE INDEX IF NOT EXISTS idx_transactions_seller ON transactions(seller);
CREATE INDEX IF NOT EXISTS idx_transactions_block_id ON transactions(block_id);

-- 启用行级安全(RLS)
ALTER TABLE grid_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 创建RLS政策
-- 允许所有人读取grid_blocks
CREATE POLICY "Allow read access to grid_blocks" ON grid_blocks
  FOR SELECT USING (true);

-- 允许服务角色所有操作
CREATE POLICY "Allow service role all operations on grid_blocks" ON grid_blocks
  FOR ALL USING (auth.role() = 'service_role');

-- 允许所有人读取transactions
CREATE POLICY "Allow read access to transactions" ON transactions
  FOR SELECT USING (true);

-- 允许服务角色所有操作
CREATE POLICY "Allow service role all operations on transactions" ON transactions
  FOR ALL USING (auth.role() = 'service_role');

-- 允许所有人读取users
CREATE POLICY "Allow read access to users" ON users
  FOR SELECT USING (true);

-- 允许服务角色所有操作
CREATE POLICY "Allow service role all operations on users" ON users
  FOR ALL USING (auth.role() = 'service_role');

-- 创建函数来更新updated_at字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为grid_blocks表创建触发器
CREATE TRIGGER update_grid_blocks_updated_at 
  BEFORE UPDATE ON grid_blocks 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 为users表创建触发器
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column(); 