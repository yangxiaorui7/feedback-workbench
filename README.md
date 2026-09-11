# 需求收集工作台 - 云端同步服务器

## Render.com 部署步骤（免费）

### 第1步：注册 GitHub
如果已有 GitHub 账号，跳过。否则去 https://github.com/signup 注册。

### 第2步：创建 GitHub 仓库
1. 打开 https://github.com/new
2. Repository name: `feedback-workbench`
3. 选 **Public**（免费）
4. 勾选 "Add a README file"
5. 点 **Create repository**

### 第3步：上传文件
在刚创建的仓库页面：
1. 点 "uploading an existing file" 链接
2. 把 `sync-server` 文件夹里的以下文件拖进去：
   - `server.js`
   - `package.json`
   - `render.yaml`
   - `.gitignore`
   - `index.html`（工作台页面）
3. **不要上传** `data.json`（运行后自动生成）
4. 在底部 Commit message 填 "initial deploy"
5. 点 **Commit changes**

### 第4步：注册 Render
1. 打开 https://render.com → Sign Up
2. 用 GitHub 账号注册（点 "Sign up with GitHub"）
3. 授权 Render 访问你的 GitHub

### 第5步：创建 Web Service
1. Render 控制台 → **New +** → **Web Service**
2. 找到 `feedback-workbench` 仓库 → **Connect**
3. 填写配置：
   - **Name**: `feedback-workbench`（或自定义）
   - **Region**: 选离你最近的（如 Singapore）
   - **Runtime**: Node
   - **Build Command**: 留空（无依赖需要安装）
   - **Start Command**: `node server.js`
   - **Plan**: **Free**
4. 点 **Create Web Service**
5. 等待 1-2 分钟，状态变为 "Live"

### 第6步：获取公网地址
部署完成后，Render 会显示一个 URL，格式如：
```
https://feedback-workbench-xxxx.onrender.com
```
这就是你的公网地址。

### 第7步：配置工作台同步
1. 电脑浏览器打开上面的 URL → 工作台自动加载
2. 进入 **设置** 页 → **云端同步** 区域
3. 服务器地址填入这个 URL（如 `https://feedback-workbench-xxxx.onrender.com`）
4. 勾选 **自动同步**
5. 点 **测试连接** → 显示绿色"连接成功"
6. 点 **保存配置**
7. 手机浏览器打开同一个 URL
8. 手机上也做同样的设置

完成！现在手机和电脑的数据自动同步。

---

## 本地运行（备选）

```bash
# 进入 sync-server 文件夹
cd sync-server

# 启动服务器（需要安装 Node.js）
node server.js

# 电脑访问 http://localhost:3000
# 手机访问 http://你的局域网IP:3000
```

## 文件说明

| 文件 | 用途 |
|------|------|
| `server.js` | 同步服务器（零依赖纯 Node.js） |
| `package.json` | 项目配置 |
| `render.yaml` | Render 自动部署配置 |
| `index.html` | 工作台页面 |
| `.gitignore` | Git 忽略规则 |
| `data.json` | 数据存储（运行后自动生成，不提交） |

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | / | 打开工作台页面 |
| GET | /api/records | 获取全部记录 |
| POST | /api/records | 上传全部记录 |
| GET | /api/ping | 健康检查 |
| GET | /api/stats | 数据统计 |
