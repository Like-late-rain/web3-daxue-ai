# GitHub 上传指南

## 已为你准备好的文件

✅ `.gitignore` - Git 忽略文件配置
✅ `.env.example` - 环境变量模板
✅ `frontend/src/contracts/addresses.json.example` - 合约地址模板

## 被忽略的敏感文件（不会上传到 GitHub）

- `node_modules/` - 依赖包
- `.env` - 环境变量（包含私钥等敏感信息）
- `frontend/.env` - 前端环境变量
- `frontend/src/contracts/addresses.json` - 部署的合约地址
- `cache/` - Hardhat 缓存
- `artifacts/` - 编译产物
- `typechain-types/` - TypeChain 生成的类型
- `.next/` - Next.js 构建文件
- `.history/` - 历史记录

## 上传步骤

### 1. 添加所有文件到 Git

```bash
git add .
```

### 2. 创建初始提交

```bash
git commit -m "Initial commit: Web3 涂山大学去中心化课程平台

功能特性：
- ✅ YCToken (ERC20) 智能合约
- ✅ UniversityCourse 课程管理合约
- ✅ ETH ↔ YCT 兑换中心
- ✅ 课程创建和购买
- ✅ 个人中心
- ✅ 课程市场
- 🚧 AAVE 理财（UI 完成，待集成）

技术栈：
- Solidity 0.8.20
- Hardhat
- Next.js 14
- RainbowKit + Wagmi
- TailwindCSS
"
```

### 3. 在 GitHub 上创建仓库

1. 访问 https://github.com/new
2. 输入仓库名称，例如：`web3-tushan-university`
3. 选择 Public 或 Private
4. **不要**勾选 "Initialize this repository with a README"（因为本地已有）
5. 点击 "Create repository"

### 4. 关联远程仓库

```bash
# 将下面的 YOUR_USERNAME 替换为你的 GitHub 用户名
# 将 YOUR_REPO_NAME 替换为你创建的仓库名
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

### 5. 推送到 GitHub

```bash
git branch -M main
git push -u origin main
```

## 其他开发者克隆项目后的设置步骤

### 1. 克隆仓库

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
```

### 2. 安装依赖

```bash
# 安装根目录依赖（Hardhat）
npm install

# 安装前端依赖
cd frontend
npm install
cd ..
```

### 3. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env
cp frontend/.env.local.example frontend/.env

# 编辑 .env 文件，填入你的配置
# SEPOLIA_RPC_URL=...
# PRIVATE_KEY=...
# ETHERSCAN_API_KEY=...
```

### 4. 启动本地 Hardhat 网络

```bash
npx hardhat node
```

### 5. 部署合约（新终端）

```bash
npx hardhat run scripts/deploy.ts --network localhost
```

### 6. 启动前端（新终端）

```bash
cd frontend
npm run dev
```

### 7. 访问应用

打开浏览器访问：http://localhost:3000

## 注意事项

⚠️ **永远不要提交以下文件到 GitHub：**
- `.env` - 包含私钥
- `frontend/.env` - 包含 API 密钥
- `frontend/src/contracts/addresses.json` - 本地部署地址（每次部署都会变）

✅ **可以安全提交的文件：**
- `.env.example` - 环境变量模板（不含敏感信息）
- `frontend/src/contracts/addresses.json.example` - 合约地址模板
- 所有源代码文件
- 配置文件
- 文档文件

## 部署到测试网

如果要部署到 Sepolia 测试网：

1. 在 `.env` 文件中配置 Sepolia RPC URL 和私钥
2. 运行部署脚本：
   ```bash
   npx hardhat run scripts/deploy.ts --network sepolia
   ```
3. 将生成的 `frontend/src/contracts/addresses.json` 文件内容更新到你的前端环境变量或配置中

## 问题排查

如果遇到问题，请检查：

1. Node.js 版本是否 >= 18
2. 是否正确配置了环境变量
3. Hardhat 本地网络是否正在运行
4. MetaMask 是否连接到正确的网络
5. 是否导入了正确的测试账户私钥

## 许可证

MIT License - 详见 LICENSE 文件
