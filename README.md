# xzboss-toolbox 项目规划

这是一个基于 Moonrepo + pnpm workspace 的纯前端工具箱聚合项目。整体使用 React，根页面就是导航项目，打包后产物可以作为静态站点直接运行，也可以部署到 Vercel。

当前仓库已初始化 `pnpm` workspace、Moonrepo 与各前端应用骨架，可直接安装依赖后开发或构建。

## 目标

- 使用 `pnpm --filter` 精确运行指定项目。
- 使用 Moonrepo 管理任务依赖、缓存、并行执行和项目关系。
- 根项目提供统一导航页，作为工具箱入口。
- 每个子项目独立维护自己的说明文档、功能需求和实现细节。
- 仓库提供一个总打包命令，一次构建所有前端项目。
- 整体不引入后端服务，默认按静态前端项目设计。
- 默认不使用 emoji。

## 技术栈

### 基础工程

- 包管理器：`pnpm`
- Monorepo 任务编排：`moonrepo`
- 语言：`TypeScript`
- UI 框架：`React`
- 构建工具：`Vite`
- 代码规范：`ESLint` + `Prettier`
- 测试：`Vitest`，必要时补充 `Playwright`

### 前端界面

- 样式：`Tailwind CSS`
- 组件库：`shadcn/ui` 或 `Radix UI` 组合封装
- 图标：`lucide-react`
- 路由：`React Router`
- 状态管理：优先使用 React 内置状态；跨页面共享状态再引入轻量方案

## 目录结构规划

```text
xzboss-toolbox/
├── .moon/
│   ├── workspace.yml
│   ├── toolchain.yml
│   └── tasks.yml
├── apps/
│   ├── portal/
│   │   ├── README.md
│   │   ├── package.json
│   │   ├── project.yml
│   │   └── src/
│   ├── timestamp/
│   │   ├── README.md
│   │   ├── package.json
│   │   ├── project.yml
│   │   └── src/
│   └── video-compressor/
│       ├── README.md
│       ├── package.json
│       ├── project.yml
│       └── src/
├── packages/
│   ├── ui/
│   │   ├── package.json
│   │   ├── project.yml
│   │   └── src/
│   ├── config/
│   │   ├── package.json
│   │   ├── project.yml
│   │   └── src/
│   └── utils/
│       ├── package.json
│       ├── project.yml
│       └── src/
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── README.md
```

## 子项目

根文档只登记子项目名称和职责，具体需求写在各子项目自己的 `README.md` 中。

| 子项目 | 说明文档 | 职责 |
| --- | --- | --- |
| `apps/portal` | `apps/portal/README.md` | 工具箱导航首页 |
| `apps/timestamp` | `apps/timestamp/README.md` | 时间戳工具 |
| `apps/video-compressor` | `apps/video-compressor/README.md` | 视频压缩工具，当前先作为 React 空项目 |

## 共享包

| 包 | 职责 |
| --- | --- |
| `packages/ui` | 共享基础 UI 组件和业务组件 |
| `packages/config` | 共享 ESLint、Prettier、Tailwind、TypeScript、Vite 配置 |
| `packages/utils` | 共享纯前端工具函数，例如日期格式化、文件大小格式化、复制到剪贴板 |

## 运行方式

根目录推荐脚本：

```json
{
  "scripts": {
    "dev": "pnpm --filter @xzboss/portal dev",
    "build": "moon run :build",
    "lint": "moon run :lint",
    "test": "moon run :test",
    "dev:portal": "pnpm --filter @xzboss/portal dev",
    "dev:timestamp": "pnpm --filter @xzboss/timestamp dev",
    "dev:video": "pnpm --filter @xzboss/video-compressor dev"
  }
}
```

常用命令：

```bash
pnpm --filter @xzboss/portal dev
pnpm --filter @xzboss/timestamp dev
pnpm --filter @xzboss/video-compressor dev

pnpm build
moon run :build
moon run portal:build
moon run timestamp:build
moon run video-compressor:build
```

## 打包策略

项目是纯前端静态站点，不需要后端进程。

- `pnpm build` 作为总打包命令，内部执行 `moon run :build`。
- 每个 `apps/*` 项目独立产出自己的 `dist`。
- `portal` 是根页面项目，部署时优先作为站点入口。
- 子项目可以通过路由、静态子路径或独立 Vercel Project 承载。
- 共享包只参与编译，不单独部署。

推荐两种部署方式：

1. 单站点模式：`portal` 作为根站点，其他工具被构建后挂到固定子路径。
2. 多站点模式：每个 app 独立部署，`portal` 只维护跳转链接。

第一阶段建议使用多站点模式，配置简单，项目边界清晰。后续如果需要统一域名和统一路径，再把构建产物聚合到一个静态目录。

## Vercel 部署策略

项目可以部署到 Vercel，推荐先按静态前端项目处理：

- Framework Preset：`Vite`
- Install Command：`pnpm install`
- Build Command：`pnpm build` 或指定 app 的 `pnpm --filter @xzboss/portal build`
- Output Directory：按部署目标选择对应 app 的 `dist`

如果使用多站点模式：

- `@xzboss/portal` 部署为主入口。
- `@xzboss/timestamp` 独立部署。
- `@xzboss/video-compressor` 独立部署。
- `portal` 的卡片链接指向各子项目的 Vercel 地址。

## Moonrepo 项目命名建议

| 目录 | package name | moon project |
| --- | --- | --- |
| `apps/portal` | `@xzboss/portal` | `portal` |
| `apps/timestamp` | `@xzboss/timestamp` | `timestamp` |
| `apps/video-compressor` | `@xzboss/video-compressor` | `video-compressor` |
| `packages/ui` | `@xzboss/ui` | `ui` |
| `packages/config` | `@xzboss/config` | `config` |
| `packages/utils` | `@xzboss/utils` | `utils` |

## 里程碑

### Milestone 1：工程骨架

- 初始化 `pnpm-workspace.yaml`
- 初始化 Moonrepo 配置
- 创建 `portal`、`timestamp`、`video-compressor` 三个 React app
- 创建共享 `ui`、`utils`、`config` 包
- 配置 TypeScript、ESLint、Prettier
- 配置 `pnpm build` 一次打包所有项目

### Milestone 2：导航项目

- 实现工具卡片网格
- 使用静态工具配置
- 链接到时间戳和视频压缩项目
- 接入共享 UI 组件

### Milestone 3：时间戳工具

- 按 `apps/timestamp/README.md` 实现时间戳工具。

### Milestone 4：视频压缩工具

- 先创建 React 空项目。
- 具体功能等待后续补充到 `apps/video-compressor/README.md`。

### Milestone 5：质量与体验

- 增加测试
- 增加错误边界
- 增加构建缓存
- 优化移动端布局
- 补充部署文档
