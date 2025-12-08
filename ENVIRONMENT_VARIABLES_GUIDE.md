# 环境变量配置详细指南

本指南详细说明每个环境变量的用途和如何获取。

---

## 根目录 `.env` 文件

### 1. PRIVATE_KEY ✅（你已填写）

**用途**：部署合约时使用的钱包私钥

**如何获取**：
1. 打开 MetaMask
2. 点击三个点 → 账户详情
3. 点击"导出私钥"
4. 输入密码
5. 复制私钥（不包含 0x 前缀）

⚠️ **警告**：永远不要分享私钥！

---

### 2. SEPOLIA_RPC_URL ✅（你已填写）

**用途**：连接到 Sepolia 测试网的 RPC 节点

**格式**：
```
https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
```

**如何获取 Alchemy API Key**：
1. 访问 https://www.alchemy.com/
2. 注册/登录账户
3. 点击 "Create App"
4. 选择：
   - Chain: Ethereum
   - Network: Sepolia
5. 创建后复制 HTTPS URL

---

### 3. ETHERSCAN_API_KEY ✅（你已填写）

**用途**：自动验证合约到 Etherscan

**如何获取**：
1. 访问 https://etherscan.io/
2. 注册/登录账户
3. 进入 https://etherscan.io/myapikey
4. 点击 "Add" 创建新 API Key
5. 复制 API Key Token

---

### 4. Cloudflare R2 配置（可选）

详见 `CLOUDFLARE_R2_SETUP.md` 文件。

**快速说明**：

- **R2_ACCOUNT_ID** ✅（你已找到）
  - 在 Cloudflare Dashboard 的 R2 页面 URL 中可以看到

- **R2_ACCESS_KEY_ID** 和 **R2_SECRET_ACCESS_KEY**
  - 在 R2 → Manage R2 API Tokens → Create API token
  - 创建后会显示这两个值，只显示一次！

- **R2_BUCKET_NAME**
  - 你创建的 Bucket 名称，例如：`web3-university-uploads`

- **R2_PUBLIC_URL**
  - 在 Bucket Settings 中启用 "R2.dev subdomain" 后获取
  - 格式：`https://pub-xxxxxxxx.r2.dev`

---

## 前端 `frontend/.env.local` 文件

### 1. NEXT_PUBLIC_SEPOLIA_RPC_URL

**用途**：前端连接到 Sepolia 测试网

**值**：与根目录的 `SEPOLIA_RPC_URL` 相同
```
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
```

---

### 2. NEXT_PUBLIC_CHAIN_ID ✅

**用途**：指定区块链网络 ID

**值**：Sepolia 测试网的 Chain ID 是 **11155111**

```bash
NEXT_PUBLIC_CHAIN_ID=11155111
```

**各网络的 Chain ID**：
- Ethereum Mainnet: `1`
- Sepolia Testnet: `11155111` ← 使用这个
- Goerli Testnet: `5`（已弃用）
- Polygon Mainnet: `137`
- BSC Mainnet: `56`

**在哪里查看**：
- 方式一：查看 [Chainlist](https://chainlist.org/)
- 方式二：在 MetaMask 中，网络名称下方会显示 Chain ID
- 方式三：已在 `hardhat.config.ts:18` 中配置为 `11155111`

---

### 3. NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

**用途**：RainbowKit 钱包连接功能需要

**如何获取**：

1. **访问 WalletConnect Cloud**
   - https://cloud.walletconnect.com/

2. **注册/登录账户**

3. **创建新项目**
   - 点击 "Create" 或 "+ New Project"
   - 项目名称：`Web3 Tushan University`
   - 选择项目类型：App

4. **获取 Project ID**
   - 创建后会显示 Project ID
   - 格式：`a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

5. **填写到 .env.local**
   ```bash
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=你的_Project_ID
   ```

---

### 4. NEXT_PUBLIC_R2_PUBLIC_URL（可选）

**用途**：课程封面图片的 CDN 地址

**值**：与根目录的 `R2_PUBLIC_URL` 相同

```bash
NEXT_PUBLIC_R2_PUBLIC_URL=https://pub-xxxxxxxx.r2.dev
```

如果暂时不需要课程封面功能，可以留空或填写占位符：
```bash
NEXT_PUBLIC_R2_PUBLIC_URL=https://placeholder.com
```

---

## 完整配置示例

### `.env`（根目录）
```bash
# 部署配置
PRIVATE_KEY=你的钱包私钥（64位十六进制）
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/你的_Alchemy_API_Key
ETHERSCAN_API_KEY=你的_Etherscan_API_Key

# Cloudflare R2（可选，暂时可不配置）
R2_ACCOUNT_ID=你的账户ID
R2_ACCESS_KEY_ID=访问密钥ID
R2_SECRET_ACCESS_KEY=密钥
R2_BUCKET_NAME=web3-university-uploads
R2_PUBLIC_URL=https://pub-xxxxxxxx.r2.dev
```

### `frontend/.env.local`
```bash
# RPC 配置
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/你的_Alchemy_API_Key

# 网络配置
NEXT_PUBLIC_CHAIN_ID=11155111

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=你的_WalletConnect_Project_ID

# R2 公开 URL（可选）
NEXT_PUBLIC_R2_PUBLIC_URL=https://pub-xxxxxxxx.r2.dev
```

---

## 快速开始建议

### 最小配置（立即可用）

如果你想快速开始测试，只需配置以下必需项：

**`.env`**:
```bash
PRIVATE_KEY=已填写 ✅
SEPOLIA_RPC_URL=已填写 ✅
ETHERSCAN_API_KEY=已填写 ✅
```

**`frontend/.env.local`**:
```bash
NEXT_PUBLIC_SEPOLIA_RPC_URL=与SEPOLIA_RPC_URL相同
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=需要获取（5分钟）
```

**Cloudflare R2**：暂时可以不配置，不影响核心功能。

---

## 检查配置是否正确

### 1. 检查 .env 文件
```bash
cat .env
```

应该看到类似：
```
PRIVATE_KEY=xxxxxxxxxxxxx
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/xxxxx
ETHERSCAN_API_KEY=xxxxxxxxxxxxx
```

### 2. 测试连接
```bash
npm run compile
```

如果编译成功，说明基本配置正确。

### 3. 测试部署（可选）
```bash
npm run deploy:sepolia
```

如果部署成功，说明所有配置都正确！

---

## 常见问题

### Q1: NEXT_PUBLIC_CHAIN_ID 填错会怎样？

**症状**：前端无法连接钱包或显示"网络不匹配"

**解决**：确保填写 `11155111`（Sepolia 的 Chain ID）

### Q2: 没有 WalletConnect Project ID 可以运行吗？

**答案**：可以，但钱包连接功能可能受限。建议花 5 分钟创建一个（免费）。

### Q3: Cloudflare R2 是必需的吗？

**答案**：不是。这是用于课程封面图片存储的。可以暂时不配置，创建课程时不上传封面即可。

---

## 下一步

配置完环境变量后，你可以：

1. **编译合约**
   ```bash
   npm run compile
   ```

2. **部署到 Sepolia**
   ```bash
   npm run deploy:sepolia
   ```

3. **启动前端**
   ```bash
   npm run dev
   ```

4. **验证合约**
   ```bash
   npm run verify:sepolia
   ```
