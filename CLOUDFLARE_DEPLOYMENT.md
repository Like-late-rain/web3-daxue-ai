# Cloudflare Pages 部署指南

本指南将帮助您将 Web3 涂山大学前端部署到 Cloudflare Pages。

## 前提条件

1. 拥有 Cloudflare 账户
2. 已在 GitHub 上创建仓库并推送代码
3. 已部署合约到 Sepolia 测试网

## 部署步骤

### 1. 登录 Cloudflare

访问 [Cloudflare Dashboard](https://dash.cloudflare.com/) 并登录您的账户。

### 2. 创建 Pages 项目

1. 进入 **Pages** 部分
2. 点击 **Create a project**
3. 选择 **Connect to Git**
4. 授权 Cloudflare 访问您的 GitHub 仓库
5. 选择 `web3-daxue` 仓库

### 3. 配置构建设置

在构建配置页面，填写以下信息：

- **Framework preset**: Next.js
- **Build command**: `cd frontend && npm install && npm run build`
- **Build output directory**: `frontend/.next`
- **Root directory**: `/` (保持为根目录)

### 4. 设置环境变量

在 **Environment variables** 部分，添加以下变量：

```
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=YOUR_WALLETCONNECT_PROJECT_ID
NEXT_PUBLIC_R2_PUBLIC_URL=https://your-bucket.r2.dev
```

> ⚠️ **重要**: 请替换为您自己的 API 密钥和配置

### 5. 部署

1. 点击 **Save and Deploy**
2. Cloudflare Pages 将自动构建和部署您的应用
3. 构建完成后，您将获得一个 `.pages.dev` 域名

### 6. 自定义域名（可选）

1. 在 Pages 项目设置中，进入 **Custom domains**
2. 点击 **Set up a custom domain**
3. 输入您的域名并按照说明配置 DNS

## 自动部署

每次您向 GitHub 仓库推送代码时，Cloudflare Pages 将自动重新构建和部署您的应用。

## Cloudflare R2 配置（图片存储）

### 1. 创建 R2 Bucket

1. 在 Cloudflare Dashboard 中，进入 **R2**
2. 点击 **Create bucket**
3. 输入 bucket 名称（例如：`web3-university-uploads`）
4. 选择位置并创建

### 2. 配置公开访问

1. 进入 bucket 设置
2. 在 **Settings** 中启用 **Public access**
3. 获取公开访问 URL（例如：`https://your-bucket.r2.dev`）

### 3. 生成 API Token

1. 进入 **R2** > **Manage R2 API Tokens**
2. 点击 **Create API token**
3. 设置权限为 **Edit** 或 **Admin**
4. 保存 Access Key ID 和 Secret Access Key

### 4. 更新环境变量

在前端和部署环境中更新以下变量：

```
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET_NAME=web3-university-uploads
R2_PUBLIC_URL=https://your-bucket.r2.dev
NEXT_PUBLIC_R2_PUBLIC_URL=https://your-bucket.r2.dev
```

## 故障排除

### 构建失败

- 检查构建日志，确认所有依赖都已正确安装
- 确保环境变量设置正确
- 验证 `package.json` 中的脚本是否正确

### 无法连接钱包

- 确保 `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` 已正确设置
- 检查浏览器控制台的错误信息

### 合约交互失败

- 确认合约已部署到 Sepolia 测试网
- 检查 `shared/addresses.json` 和 `frontend/src/contracts/addresses.json` 中的合约地址是否正确
- 确保 RPC URL 有效且未超过请求限制

## 相关资源

- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Cloudflare R2 文档](https://developers.cloudflare.com/r2/)
- [Next.js 部署指南](https://nextjs.org/docs/deployment)
