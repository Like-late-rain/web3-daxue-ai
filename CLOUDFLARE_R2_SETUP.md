# Cloudflare R2 详细配置指南

## 获取 Cloudflare R2 凭证

### 1. R2_ACCOUNT_ID（你已找到）✅

这个你已经有了。

---

### 2. 获取 R2_ACCESS_KEY_ID 和 R2_SECRET_ACCESS_KEY

#### 步骤：

1. **登录 Cloudflare Dashboard**
   - 访问 https://dash.cloudflare.com/

2. **进入 R2 管理页面**
   - 在左侧菜单找到 **R2**
   - 点击进入 R2 页面

3. **创建 API Token**
   - 点击右上角的 **Manage R2 API Tokens**
   - 或者在 R2 Overview 页面找到 **API Tokens** 选项卡

4. **创建新的 API Token**
   - 点击 **Create API token** 按钮
   - 填写以下信息：
     - **Token name**: 例如 `web3-university-token`
     - **Permissions**: 选择 `Admin Read & Write` 或 `Object Read & Write`
     - **TTL**: 选择 `Forever`（永久有效）或设置过期时间
   - 点击 **Create API Token**

5. **保存凭证**（重要！）
   - 创建成功后会显示：
     - **Access Key ID** → 这是你的 `R2_ACCESS_KEY_ID`
     - **Secret Access Key** → 这是你的 `R2_SECRET_ACCESS_KEY`

   ⚠️ **警告**：Secret Access Key 只会显示一次，请立即复制保存！

6. **填写到 .env 文件**
   ```bash
   R2_ACCESS_KEY_ID=你刚才复制的_Access_Key_ID
   R2_SECRET_ACCESS_KEY=你刚才复制的_Secret_Access_Key
   ```

---

### 3. R2_BUCKET_NAME

这个是你自己创建的 Bucket 名称。

#### 创建 R2 Bucket：

1. 在 R2 页面，点击 **Create bucket**
2. 输入 Bucket 名称，例如：`web3-university-uploads`
3. 选择位置（推荐选择离用户近的位置）
4. 点击 **Create bucket**

#### 填写到 .env：
```bash
R2_BUCKET_NAME=web3-university-uploads
```

---

### 4. R2_PUBLIC_URL

这是你的 Bucket 的公开访问 URL。

#### 获取步骤：

1. **进入你创建的 Bucket**
   - 在 R2 页面点击你的 Bucket 名称

2. **配置公开访问**
   - 点击 **Settings** 标签
   - 找到 **Public access** 部分
   - 点击 **Connect domain** 或 **Allow access**

3. **有两种方式获取公开 URL**：

   **方式一：使用 R2.dev 子域名（推荐，最简单）**
   - 在 Bucket 设置中，找到 **R2.dev subdomain**
   - 点击 **Allow access** 启用
   - 会生成一个 URL，格式类似：
     ```
     https://pub-xxxxxxxxxxxxxxxx.r2.dev
     ```
   - 这就是你的 `R2_PUBLIC_URL`

   **方式二：使用自定义域名**
   - 点击 **Connect domain**
   - 添加你自己的域名（需要域名托管在 Cloudflare）
   - 配置完成后使用你的域名作为 `R2_PUBLIC_URL`

4. **填写到 .env 和 frontend/.env.local**
   ```bash
   # .env
   R2_PUBLIC_URL=https://pub-xxxxxxxxxxxxxxxx.r2.dev

   # frontend/.env.local
   NEXT_PUBLIC_R2_PUBLIC_URL=https://pub-xxxxxxxxxxxxxxxx.r2.dev
   ```

---

## 完整的 Cloudflare R2 配置示例

### .env 文件：
```bash
# Cloudflare R2 配置
R2_ACCOUNT_ID=abc123def456                    # 你已经有了
R2_ACCESS_KEY_ID=1a2b3c4d5e6f7g8h9i0j          # 从 API Token 获取
R2_SECRET_ACCESS_KEY=aBcDeFgHiJkLmNoPqRsTuVwXyZ  # 从 API Token 获取
R2_BUCKET_NAME=web3-university-uploads         # 你创建的 Bucket 名称
R2_PUBLIC_URL=https://pub-xxxxxxxx.r2.dev      # Bucket 公开 URL
```

---

## ⚠️ 重要提示

1. **Secret Access Key 只显示一次**
   - 如果忘记保存，需要删除旧 Token 并创建新的

2. **不要将 .env 文件提交到 Git**
   - 已经在 .gitignore 中排除

3. **API Token 权限建议**
   - 开发环境：可以使用 Admin 权限
   - 生产环境：建议只给 Object Read & Write 权限

4. **R2.dev 域名限制**
   - 免费提供
   - 有一定的速率限制
   - 生产环境建议使用自定义域名

---

## 如果暂时不需要 R2（课程封面功能）

如果你现在不打算使用课程封面功能，可以暂时留空这些配置：

```bash
# 可以先不填写，不影响其他功能
# R2_ACCOUNT_ID=
# R2_ACCESS_KEY_ID=
# R2_SECRET_ACCESS_KEY=
# R2_BUCKET_NAME=
# R2_PUBLIC_URL=
```

创建课程时，封面 URL 字段留空即可，会显示默认图标。

---

## 需要帮助？

如果在配置过程中遇到问题：

1. 确认已登录正确的 Cloudflare 账户
2. 检查账户是否已启用 R2 功能
3. 查看 [Cloudflare R2 官方文档](https://developers.cloudflare.com/r2/)
