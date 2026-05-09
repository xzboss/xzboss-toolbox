# xzboss-toolbox 项目规划

这是一个单体 Next.js 前端工具箱项目。项目只维护一个 Next.js 应用，根页面作为工具箱入口，各工具通过 App Router 路由承载，不使用 Moonrepo、workspace 或多应用架构。

当前仓库已初始化为单个 Next.js 项目，可直接安装依赖后开发或构建。

## 本地 Quick Start

本地开发推荐使用：

```bash
pnpm install
pnpm dev
```

常用命令：

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
```

## 目标

- 使用单个 Next.js 项目承载所有工具页面。
- 根页面提供统一导航页，作为工具箱入口。
- 每个工具使用独立路由，例如 `/timestamp`、`/video-compressor`。
- 共享组件、工具函数和页面配置都放在同一个项目内维护。
- 整体默认不引入独立后端服务，优先实现为前端工具。
- 默认不使用 emoji。

## 产品与文案原则

- 这是一个面向普通用户的 toC 产品，不是工程演示页。
- 用户界面只表达用户能获得什么，不解释技术栈、实现方式或内部规划。
- 避免“前端”“Next.js”“接口数据”“日志排查”“功能规划中”等工程语境出现在核心界面。
- 文案优先短、直接、可行动，例如“粘贴时间戳，立即看到可读时间”。
- 页面空状态、未上线状态也要按产品语言表达，避免写成开发备注。

## 技术栈

### 基础工程

- 包管理器：`pnpm`
- 框架：`Next.js 16.2.6`
- 路由：`App Router`
- 语言：`TypeScript`
- UI 框架：`React`
- 代码规范：`ESLint` + `Prettier`
- 测试：必要时补充 `Vitest` 或 `Playwright`

### 前端界面

- 样式：`Tailwind CSS`
- 组件库：`shadcn/ui` 风格组件，底层使用 `Radix UI`
- 图标：`lucide-react`
- 状态管理：优先使用 React 内置状态；跨页面共享状态再引入轻量方案
- 字体：优先使用 `next/font`

## 目录结构规划

```text
xzboss-toolbox/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── timestamp/
│   │   └── page.tsx
│   └── video-compressor/
│       └── page.tsx
├── components/
│   ├── ui/
│   └── tool-card.tsx
├── config/
│   └── tools.ts
├── lib/
│   ├── format.ts
│   └── utils.ts
├── public/
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tsconfig.json
└── README.md
```

## 页面规划

| 路由 | 职责 |
| --- | --- |
| `/` | 工具箱导航首页 |
| `/timestamp` | 时间戳工具 |
| `/video-compressor` | 视频压缩工具，第一阶段可先作为占位页面 |

工具导航配置统一维护在 `config/tools.ts`，页面根据配置渲染卡片入口。

## 共享代码规划

| 目录 | 职责 |
| --- | --- |
| `components/ui` | 基础 UI 组件 |
| `components` | 业务组件，例如工具卡片、页面容器 |
| `config` | 工具列表、导航配置、静态元信息 |
| `lib` | 纯前端工具函数，例如日期格式化、文件大小格式化、复制到剪贴板 |

## 运行方式

根目录推荐脚本：

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

## 打包策略

项目作为单个 Next.js 应用构建和部署：

- `pnpm build` 执行一次完整构建。
- 所有工具页面都随同一个 Next.js 应用发布。
- 不需要单独打包多个子项目。
- 不需要维护独立应用之间的链接地址。
- 后续如果所有功能都保持纯前端，可以按静态站点能力优化；如果某个工具需要服务端能力，再使用 Next.js Route Handler 或 Server Action。

## Vercel 部署策略

项目可以部署到 Vercel：

- Framework Preset：`Next.js`
- Install Command：`pnpm install`
- Build Command：`pnpm build`
- Output Directory：保持默认

单项目部署后，所有工具页面都通过同一个域名访问：

- 首页：`/`
- 时间戳工具：`/timestamp`
- 视频压缩工具：`/video-compressor`

## 里程碑

### Milestone 1：工程骨架

- 初始化单个 Next.js 项目。
- 配置 TypeScript、ESLint、Prettier、Tailwind CSS。
- 配置基础布局、全局样式和站点元信息。
- 配置 `pnpm dev`、`pnpm build`、`pnpm lint`。

### Milestone 2：工具箱首页

- 实现工具卡片网格。
- 使用 `config/tools.ts` 维护静态工具配置。
- 首页展示时间戳工具和视频压缩工具入口。
- 优化移动端布局。

### Milestone 3：时间戳工具

- 实现时间戳与日期时间互转。
- 支持秒级、毫秒级时间戳识别。
- 支持复制转换结果。
- 补充常用日期格式展示。

### Milestone 4：视频压缩工具

- 第一阶段先创建占位页面。
- 后续补充视频选择、参数配置、压缩进度和结果下载。
- 优先评估浏览器端压缩能力，避免过早引入服务端处理。

### Milestone 5：质量与体验

- 增加错误边界或页面级错误提示。
- 增加必要测试。
- 优化移动端布局。
- 补充部署文档。
