# Web3 涂山大学 (Web3 Tushan University)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue)](https://soliditylang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.0-black)](https://nextjs.org/)

> 基于区块链的去中心化在线课程平台，使用 YCT 代币购买课程，支持 AAVE 理财

## 📋 项目简介

Web3 涂山大学是一个完全去中心化的在线课程平台，构建在以太坊区块链上。用户可以：

- 🎓 创建和发布课程
- 💰 使用 YCT (Yue Chu Token) 代币购买课程
- 🔄 使用 ETH 兑换 YCT 代币
- 📈 将 ETH 和 YCT 存入 AAVE 协议赚取收益
- 🔍 搜索和浏览优质课程

## 🌟 主要功能

### ✅ 已实现功能

- [x] YCToken (ERC20) 智能合约
- [x] UniversityCourse 智能合约
- [x] 自动化部署脚本
- [x] 合约自动验证
- [x] 前端 Web 应用（Next.js + React）
- [x] 钱包连接（RainbowKit）
- [x] 课程市场
- [x] 课程创建和购买
- [x] ETH ↔ YCT 兑换中心
- [x] 个人中心（显示余额和已购课程）
- [x] 课程搜索功能
- [x] ENS 名称支持

### 🚧 待完善功能

- [ ] AAVE 理财集成（合约逻辑需完善）
- [ ] Cloudflare R2 图片上传功能
- [ ] MetaMask 签名昵称功能
- [ ] 课程进度跟踪
- [ ] NFT 课程证书

## 🛠 技术栈

### 智能合约

- Solidity 0.8.20
- Hardhat
- OpenZeppelin Contracts
- TypeChain

### 前端

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Wagmi + Viem
- RainbowKit
- React Hot Toast

### 部署

- Sepolia 测试网
- Cloudflare Pages
- Cloudflare R2（图片存储）

## 📦 项目结构

```
web3-daxue/
├── contracts/              # 智能合约
│   ├── YCToken.sol        # YCT 代币合约
│   └── UniversityCourse.sol # 课程管理合约
├── scripts/               # 部署和验证脚本
│   ├── deploy.ts
│   └── verify.ts
├── frontend/              # 前端应用
│   ├── src/
│   │   ├── components/   # React 组件
│   │   ├── pages/        # Next.js 页面
│   │   ├── hooks/        # 自定义 Hooks
│   │   ├── utils/        # 工具函数
│   │   ├── types/        # TypeScript 类型
│   │   ├── config/       # 配置文件
│   │   └── contracts/    # ABI 和合约地址
│   ├── public/           # 静态资源
│   └── styles/           # 样式文件
├── shared/               # 共享文件
│   └── addresses.json    # 已部署合约地址
├── test/                 # 测试文件
├── hardhat.config.ts     # Hardhat 配置
├── package.json
└── README.md
```

## 🚀 快速开始

### 前提条件

- Node.js >= 18
- npm 或 yarn
- MetaMask 钱包
- Sepolia 测试网 ETH

### 1. 克隆仓库

```bash
git clone https://github.com/YOUR_USERNAME/web3-daxue.git
cd web3-daxue
```

### 2. 安装依赖

```bash
# 安装根目录依赖
npm install

# 安装前端依赖
cd frontend
npm install
cd ..
```

### 3. 配置环境变量

复制 `.env.example` 并重命名为 `.env`，然后填写以下信息：

```bash
# 根目录 .env
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
ETHERSCAN_API_KEY=your_etherscan_api_key

# Cloudflare R2 配置（用户需要填写）
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET_NAME=web3-university-uploads
R2_PUBLIC_URL=https://your-bucket.r2.dev
```

在 `frontend/` 目录下创建 `.env.local`：

```bash
cd frontend
cp .env.local.example .env.local
```

编辑 `.env.local`：

```bash
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=YOUR_WALLETCONNECT_PROJECT_ID
NEXT_PUBLIC_R2_PUBLIC_URL=https://your-bucket.r2.dev
```

### 4. 编译合约

```bash
npm run compile
```

### 5. 部署合约到 Sepolia

```bash
npm run deploy:sepolia
```

部署成功后，合约地址会自动保存到：

- `shared/addresses.json`
- `frontend/src/contracts/addresses.json`

### 6. 验证合约

```bash
npm run verify:sepolia
```

### 7. 启动前端

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 🔑 重要配置

### 获取 Alchemy API Key

1. 访问 [Alchemy](https://www.alchemy.com/)
2. 注册并创建新应用
3. 选择 Sepolia 测试网
4. 复制 API Key 并填写到 `.env` 文件

### 获取 Etherscan API Key

1. 访问 [Etherscan](https://etherscan.io/)
2. 注册并进入 **API Keys** 页面
3. 创建新的 API Key
4. 复制并填写到 `.env` 文件

### 获取 WalletConnect Project ID

1. 访问 [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. 注册并创建新项目
3. 复制 Project ID 并填写到 `frontend/.env.local`

### 配置 Cloudflare R2

请参考 [CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md) 获取详细的配置说明。

## 📝 智能合约说明

### YCToken (YCT)

ERC20 代币合约，用于课程购买和平台交易。

- **名称**: Yue Chu Token
- **符号**: YCT
- **初始供应**: 1,000,000 YCT
- **兑换比例**: 0.0001 ETH = 1 YCT (即 1 ETH = 10,000 YCT)

主要功能：

- `buyTokens()`: 使用 ETH 购买 YCT
- `sellTokens(uint256)`: 出售 YCT 换回 ETH
- `getTokenAmount(uint256)`: 计算 ETH 可兑换的 YCT 数量
- `getETHAmount(uint256)`: 计算 YCT 可兑换的 ETH 数量

### UniversityCourse

课程管理合约，处理课程创建、购买和管理。

主要功能：

- `createCourse()`: 创建新课程
- `purchaseCourse(uint256)`: 购买课程
- `updateCourse()`: 更新课程信息（仅教师）
- `deactivateCourse()`: 停用课程
- `getActiveCourses()`: 获取活跃课程列表
- `getStudentCourses()`: 获取学生已购课程

**平台抽成**: 默认 5%，可由合约 owner 调整（不超过 20%）

## 🎨 前端页面

- **首页** (`/`): 平台介绍和快速导航
- **课程市场** (`/market`): 浏览和搜索所有课程
- **课程详情** (`/course/[id]`): 查看课程详细信息并购买
- **创建课程** (`/create-course`): 发布新课程
- **兑换中心** (`/exchange`): ETH ↔ YCT 兑换
- **个人中心** (`/profile`): 查看余额和已购课程
- **理财页** (`/aave`): AAVE 存款和收益（开发中）

## 🧪 测试

```bash
npm run test
```

## 📄 许可证

本项目采用 [MIT](LICENSE) 许可证。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式

如有问题，请通过以下方式联系：

- GitHub Issues: [创建 Issue](https://github.com/YOUR_USERNAME/web3-daxue/issues)
- Email: your_email@example.com

## 🙏 致谢

- [OpenZeppelin](https://openzeppelin.com/) - 智能合约库
- [Hardhat](https://hardhat.org/) - 开发框架
- [RainbowKit](https://www.rainbowkit.com/) - 钱包连接
- [Tailwind CSS](https://tailwindcss.com/) - UI 框架

---

**注意**: 本项目仅用于学习和演示目的。请勿在主网使用未经审计的合约。

## 📌 TODO 清单（需用户补充）

以下是需要您手动填写或配置的内容：

### 1. Logo 图片

- 在 `frontend/public/` 目录下添加您的 Logo 文件
- 更新 `frontend/src/components/Navbar.tsx` 中的 Logo 引用

### 2. Cloudflare R2 配置

- 创建 R2 Bucket
- 获取访问凭证
- 更新 `.env` 和 `frontend/.env.local` 中的 R2 配置
- 实现图片上传功能（可选）

### 3. API Keys

- Alchemy API Key
- Etherscan API Key
- WalletConnect Project ID

### 4. 图片域名

- 更新 `frontend/next.config.js` 中的 `images.domains`，添加您的 R2 域名

### 5. GitHub 仓库

- 将代码推送到您的 GitHub 仓库
- 更新 README 中的仓库链接

### 6. 自定义配置

- 根据需求调整主题色（`frontend/tailwind.config.js`）
- 修改平台名称和描述
- 添加自定义页面或功能
