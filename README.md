# Web3 涂山大学

一个基于区块链的去中心化在线课程平台，使用智能合约管理课程创建、购买和学习。

## 项目简介

Web3 涂山大学是一个去中心化的教育平台，通过以太坊智能合约实现课程管理和交易。教师可以创建课程并设定价格，学生使用平台代币（YCT）购买课程，所有交易记录均不可篡改地存储在区块链上。

## 主要功能

### 智能合约功能

- **YCToken (YCT) 代币系统**
  - ERC20 标准代币
  - ETH 与 YCT 兑换功能（1 ETH = 10000 YCT）
  - 代币买卖功能

- **课程管理系统**
  - 课程创建与发布
  - 课程信息更新（标题、描述、价格等）
  - 课程购买（使用 YCT 支付）
  - 课程搜索与分页
  - 平台抽成机制（默认 5%）

### 前端功能

- 钱包连接（使用 RainbowKit）
- 课程浏览与搜索
- 课程购买流程
- 个人课程管理
- YCT 代币兑换

## 技术栈

### 智能合约

- **Solidity** ^0.8.20
- **Hardhat** - 开发框架
- **OpenZeppelin** - 安全的合约库
- **TypeChain** - TypeScript 类型生成
- **Ethers.js** v6 - 以太坊交互库

### 前端

- **Next.js** 14 - React 框架
- **TypeScript** - 类型安全
- **RainbowKit** - 钱包连接 UI
- **Wagmi** - React Hooks for Ethereum
- **Tailwind CSS** - 样式框架
- **Viem** - 以太坊工具库

## 项目结构

```
web3-daxue/
├── contracts/              # 智能合约
│   ├── YCToken.sol        # YCT 代币合约
│   └── UniversityCourse.sol # 课程管理合约
├── frontend/              # Next.js 前端应用
│   ├── app/              # Next.js App Router
│   ├── components/       # React 组件
│   └── lib/             # 工具函数
├── scripts/              # 部署和验证脚本
├── test/                # 合约测试
├── types/               # TypeChain 生成的类型
└── hardhat.config.ts    # Hardhat 配置
```

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm 或 yarn
- MetaMask 或其他以太坊钱包

### 安装依赖

```bash
# 安装所有依赖
npm install
```

### 环境配置

创建 `.env` 文件并配置以下变量：

```env
# Sepolia 测试网 RPC URL
SEPOLIA_RPC_URL=your_sepolia_rpc_url

# 部署账户私钥
PRIVATE_KEY=your_private_key

# Etherscan API Key（用于合约验证）
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### 开发流程

#### 1. 编译智能合约

```bash
npm run compile
```

#### 2. 运行测试

```bash
npm test
```

#### 3. 部署到本地网络

```bash
# 启动本地 Hardhat 节点
npm run node

# 在新终端部署合约
npm run deploy:localhost
```

#### 4. 部署到 Sepolia 测试网

```bash
npm run deploy:sepolia
```

#### 5. 验证合约

```bash
npm run verify:sepolia
```

#### 6. 生成 TypeScript 类型

```bash
npm run generate-types
```

#### 7. 启动前端开发服务器

```bash
npm run dev
```

前端应用将在 `http://localhost:3000` 启动。

### 构建生产版本

```bash
npm run build
```

## 智能合约详解

### YCToken 合约

YCToken 是平台的 ERC20 代币，用于课程交易。

**主要功能：**
- `buyTokens()` - 使用 ETH 购买 YCT
- `sellTokens(uint256 tokenAmount)` - 出售 YCT 换回 ETH
- `withdrawETH()` - 合约所有者提取 ETH
- `getTokenAmount(uint256 ethAmount)` - 查询 ETH 可兑换的 YCT 数量
- `getETHAmount(uint256 tokenAmount)` - 查询 YCT 可兑换的 ETH 数量

**兑换比例：** 1 ETH = 10000 YCT

### UniversityCourse 合约

课程管理合约，处理课程的创建、购买和管理。

**主要功能：**
- `createCourse()` - 创建新课程
- `purchaseCourse(uint256 courseId)` - 购买课程
- `updateCourse()` - 更新课程信息
- `deactivateCourse(uint256 courseId)` - 停用课程
- `getActiveCourses(uint256 offset, uint256 limit)` - 获取活跃课程（分页）
- `getStudentCourses(address student)` - 获取学生购买的课程
- `getInstructorCourses(address instructor)` - 获取教师创建的课程
- `setPlatformFee(uint256 feePercent)` - 设置平台抽成比例

**课程信息结构：**
```solidity
struct Course {
    uint256 id;
    string title;
    string description;
    string coverUrl;
    uint256 priceYCT;
    address instructor;
    bool isActive;
    uint256 createdAt;
    uint256 totalStudents;
}
```

## 部署信息

查看 `DEPLOYMENT_SUCCESS.md` 文件了解已部署合约的地址和详细信息。

## 开发指南

### 运行合约测试

```bash
npm test
```

### 查看测试覆盖率

```bash
npx hardhat coverage
```

### 查看 Gas 使用情况

在 `hardhat.config.ts` 中启用 gas reporter 后运行测试即可查看。

## 安全考虑

- 使用 OpenZeppelin 的安全合约库
- 实现了 ReentrancyGuard 防止重入攻击
- 严格的权限控制（Ownable）
- 所有外部调用都有适当的检查

## 许可证

MIT License - 查看 [LICENSE](LICENSE) 文件了解详情

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 联系方式

如有问题或建议，请通过 GitHub Issues 联系我们。
