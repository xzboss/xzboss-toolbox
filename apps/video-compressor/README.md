# 视频压缩项目说明

`apps/video-compressor` 当前先规划为一个独立的 React 空项目。具体视频压缩功能、交互和实现方案等待后续补充。

## 当前定位

- React 前端项目
- TypeScript
- Vite
- 静态站点部署
- 不接入后端服务
- 不设计具体视频压缩需求

## 初始页面建议

在功能需求明确前，页面只需要保留基础空状态：

- 项目标题
- 简短说明
- “功能规划中”的空状态文案
- 返回工具箱首页的入口

## 构建与运行

开发运行：

```bash
pnpm --filter @xzboss/video-compressor dev
```

单独打包：

```bash
pnpm --filter @xzboss/video-compressor build
```

总打包：

```bash
pnpm build
```
