# Aurora Blog Frontend

当前主站前端使用：

- `Vite`
- `React 19`
- `React Router`
- `Framer Motion`
- `react-helmet-async`
- 构建期文章详情页 prerender

部署方式已经不是“Vercel 直接构建仓库”，而是：

1. GitHub Actions 在 Linux 容器里执行测试和 prerender 构建
2. GitHub Actions 使用 Vercel CLI 部署预构建产物
3. Vercel 负责托管和自定义域名

## 本地开发

```bash
npm install
npm run dev
```

## 本地构建

```bash
npm run build
```

构建会执行：

1. 生成 `public/robots.txt`
2. 生成 `public/sitemap.xml`
3. 执行 Vite 构建
4. 在 `dist/` 下写入部署用的 `vercel.json`

## 环境变量

参考 `.env.example`：

```env
VITE_API_BASE=https://api.aurorablog.me
VITE_SITE_URL=https://aurorablog.me
VITE_ASSET_CDN_BASE=https://cdn.aurorablog.me
VITE_TURNSTILE_SITE_KEY=
VITE_SITE_LAUNCH_DATE=2026-03-22
```

## SEO 与 prerender

当前策略：

- prerender 静态页：
  - `/`
  - `/about`
  - `/contact`
- prerender 文章详情页：
  - `/blog/:slug`
- `/blog` 列表页保留普通 SPA 页面，但仍会出现在 `sitemap.xml`

## GitHub Actions 部署

工作流文件：

- `.github/workflows/frontend-prerender-deploy.yml`

### GitHub Secrets

必须配置：

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

### GitHub Variables

必须配置：

- `VITE_API_BASE`
- `VITE_SITE_URL`
- `VITE_ASSET_CDN_BASE`
- `VITE_TURNSTILE_SITE_KEY`
- `VITE_SITE_LAUNCH_DATE`

## 日常发布

当前推荐流程：

1. 提交并推送到 `master`
2. GitHub Actions 触发 `Frontend Prerender Deploy`
3. 工作流执行：
   - `npm run test:seo`
   - `npm run build`
   - `npm run verify:prerender`
   - `vercel pull`
   - `vercel build`
   - `vercel deploy --prebuilt --prod`
4. 部署完成后由 Vercel 更新正式域名

如果需要手动重发版：

1. 打开 GitHub 仓库 `Actions`
2. 选择 `Frontend Prerender Deploy`
3. 点击 `Run workflow`

## 验证命令

本地 SEO 验证：

```bash
npm run test:seo
```

本地产物校验：

```bash
npm run verify:prerender
```

Docker 验证示例：

```bash
docker run --rm -v \"$PWD\":/app -w /app node:22-bookworm bash -lc '
  apt-get update >/tmp/apt.log &&
  DEBIAN_FRONTEND=noninteractive apt-get install -y chromium git >/tmp/chromium.log &&
  export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium &&
  export PUPPETEER_SKIP_DOWNLOAD=true &&
  npm ci --no-fund --no-audit >/tmp/npm-install.log &&
  npm run test:seo &&
  npm run build &&
  npm run verify:prerender
'
```
