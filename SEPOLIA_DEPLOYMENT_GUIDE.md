# Sepolia 测试网部署指南

## 📋 准备工作

### 1. 获取 Sepolia 测试网 ETH

你需要至少 **0.5 ETH** 用于：
- 部署 YCToken 合约
- 部署 UniversityCourse 合约
- 向合约存入初始流动性

**获取测试 ETH 的方式：**

#### 方法 1: Alchemy Faucet（推荐）
1. 访问：https://sepoliafaucet.com/
2. 使用你的 Alchemy 账号登录
3. 输入钱包地址
4. 每天可领取 0.5 Sepolia ETH

#### 方法 2: Infura Faucet
1. 访问：https://www.infura.io/faucet/sepolia
2. 输入钱包地址
3. 每天可领取 0.5 Sepolia ETH

#### 方法 3: Google Cloud Faucet
1. 访问：https://cloud.google.com/application/web3/faucet/ethereum/sepolia
2. 需要 Google 账号登录
3. 每天可领取 0.05 Sepolia ETH

### 2. 获取 Infura 或 Alchemy RPC URL

#### 使用 Infura（推荐）
1. 访问：https://infura.io/
2. 注册并创建新项目
3. 选择 "Ethereum" 网络
4. 复制 Sepolia RPC URL，格式如：
   ```
   https://sepolia.infura.io/v3/YOUR_PROJECT_ID
   ```

#### 使用 Alchemy
1. 访问：https://www.alchemy.com/
2. 注册并创建新应用
3. 选择 "Ethereum" → "Sepolia"
4. 复制 HTTPS URL

### 3. 获取 Etherscan API Key

1. 访问：https://etherscan.io/
2. 注册账号并登录
3. 前往：https://etherscan.io/myapikey
4. 创建新的 API Key
5. 复制 API Key

### 4. 导出钱包私钥

⚠️ **警告：私钥是敏感信息，永远不要分享或提交到 Git！**

#### 从 MetaMask 导出私钥：
1. 打开 MetaMask
2. 点击右上角的三个点
3. 选择"账户详情"
4. 点击"导出私钥"
5. 输入密码
6. 复制私钥（不包含 0x 前缀）

## 🔧 配置步骤

### 1. 编辑 `.env` 文件

打开项目根目录的 `.env` 文件，填入以下信息：

```bash
# Sepolia 测试网配置
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
PRIVATE_KEY=your_private_key_without_0x_prefix
ETHERSCAN_API_KEY=your_etherscan_api_key

# 网络选择
NETWORK=sepolia
```

**替换说明：**
- `YOUR_INFURA_PROJECT_ID` → 你的 Infura 项目 ID
- `your_private_key_without_0x_prefix` → 你的钱包私钥（不要 0x 前缀）
- `your_etherscan_api_key` → 你的 Etherscan API Key

### 2. 验证配置

运行以下命令检查配置是否正确：

```bash
npx hardhat run scripts/check-balance.ts --network sepolia
```

如果没有 `check-balance.ts`，创建一个：

```typescript
import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log("部署账户:", deployer.address);
  console.log("余额:", ethers.formatEther(balance), "ETH");

  if (balance < ethers.parseEther("0.1")) {
    console.log("⚠️  余额不足！请先获取测试 ETH");
  } else {
    console.log("✅ 余额充足，可以开始部署");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

## 🚀 部署到 Sepolia

### 1. 编译合约

```bash
npx hardhat compile
```

### 2. 部署合约

```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

**预期输出：**
```
开始部署到 Sepolia 测试网...
部署账户: 0x...
账户余额: X.XXXX ETH

正在部署 YCToken...
✅ YCToken 部署成功
地址: 0x...
初始供应量: 1000000.0 YCT

正在部署 UniversityCourse...
✅ UniversityCourse 部署成功
地址: 0x...

向 UniversityCourse 授权 YCToken...
✅ 授权成功

存入初始 ETH 流动性...
✅ ETH 流动性存入成功

💾 合约地址已保存到: /path/to/shared/addresses.json
📋 复制 ABI 文件到前端...
✅ YCToken ABI 已复制
✅ UniversityCourse ABI 已复制
✅ 合约地址已复制到前端

🎉 部署完成！
```

### 3. 验证合约（推荐）

部署完成后，验证合约可以让其他人在 Etherscan 上查看源代码：

```bash
# 验证 YCToken
npx hardhat verify --network sepolia <YCTOKEN_ADDRESS>

# 验证 UniversityCourse
npx hardhat verify --network sepolia <UNIVERSITYCOURSE_ADDRESS> <YCTOKEN_ADDRESS>
```

将 `<YCTOKEN_ADDRESS>` 和 `<UNIVERSITYCOURSE_ADDRESS>` 替换为实际部署的地址（可在 `shared/addresses.json` 中查看）。

**成功输出示例：**
```
Successfully verified contract YCToken on Etherscan.
https://sepolia.etherscan.io/address/0x.../contracts
```

## 🌐 更新前端配置

### 1. 更新前端环境变量

编辑 `frontend/.env`：

```bash
# Sepolia 测试网配置
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_NETWORK_NAME=sepolia
```

### 2. 验证合约地址

检查 `frontend/src/contracts/addresses.json` 文件，确认：
- `network` 字段为 `"sepolia"`
- `chainId` 字段为 `"11155111"`
- 合约地址已正确填充

### 3. 配置 RainbowKit

编辑 `frontend/src/config/wagmi.ts`，确保包含 Sepolia 网络：

```typescript
import { sepolia } from 'wagmi/chains';

// 在 chains 配置中添加
const chains = [sepolia];
```

## 🧪 测试部署

### 1. 启动前端

```bash
cd frontend
npm run dev
```

### 2. 连接 MetaMask

1. 打开 http://localhost:3000
2. 点击"连接钱包"
3. 在 MetaMask 中切换到 **Sepolia 测试网络**
4. 确认连接

### 3. 测试功能

#### 测试 1: 兑换 YCT
1. 访问"兑换中心"页面
2. 输入 0.01 ETH
3. 点击"购买 YCT"
4. 在 MetaMask 中确认交易
5. 等待交易确认
6. 查看 YCT 余额是否增加

#### 测试 2: 创建课程
1. 访问"创建课程"页面
2. 填写课程信息
3. 设置价格（YCT）
4. 提交创建
5. 在 MetaMask 中确认交易

#### 测试 3: 购买课程
1. 在首页或市场找到课程
2. 点击"购买课程"
3. 在 MetaMask 中确认 approve 交易
4. 确认购买交易
5. 在个人中心查看已购课程

## 📊 查看交易

所有交易都可以在 Sepolia Etherscan 上查看：

1. 访问：https://sepolia.etherscan.io/
2. 搜索你的钱包地址或合约地址
3. 查看所有交易记录

## 🔍 常见问题

### Q1: 部署时提示 "insufficient funds"
**A:** 你的钱包 Sepolia ETH 不足，请从 faucet 获取更多测试 ETH。

### Q2: 前端连接钱包后显示"网络不匹配"
**A:** 在 MetaMask 中切换到 Sepolia 测试网络。

### Q3: 交易一直 pending
**A:** Sepolia 网络可能拥堵，耐心等待或提高 gas price。

### Q4: 合约验证失败
**A:**
- 检查 Etherscan API Key 是否正确
- 确认使用的 Solidity 版本与 hardhat.config.ts 中一致
- 检查构造函数参数是否正确

### Q5: 前端无法读取合约数据
**A:**
- 检查 `frontend/src/contracts/addresses.json` 是否更新
- 确认 MetaMask 连接到 Sepolia 网络
- 查看浏览器控制台的错误信息

## 📝 部署清单

- [ ] 获取 Sepolia 测试 ETH (至少 0.5 ETH)
- [ ] 获取 Infura/Alchemy RPC URL
- [ ] 获取 Etherscan API Key
- [ ] 导出钱包私钥
- [ ] 配置 `.env` 文件
- [ ] 编译合约
- [ ] 部署合约到 Sepolia
- [ ] 验证合约（可选）
- [ ] 更新前端配置
- [ ] 测试所有功能

## 🎯 下一步

部署完成后，你可以：

1. **分享你的 DApp**
   - 将前端部署到 Vercel 或 Netlify
   - 分享 Sepolia Etherscan 上的合约地址

2. **继续开发**
   - 实现 AAVE 理财功能
   - 添加更多功能

3. **准备主网部署**
   - 全面测试所有功能
   - 审计智能合约
   - 准备足够的 ETH（主网 gas 费用更高）

## ⚠️ 重要提醒

1. **永远不要在主网使用测试私钥**
2. **不要将 `.env` 文件提交到 Git**
3. **定期备份你的私钥**
4. **测试网合约和数据随时可能丢失**
5. **主网部署前务必进行充分测试和审计**

---

祝部署顺利！🎉
