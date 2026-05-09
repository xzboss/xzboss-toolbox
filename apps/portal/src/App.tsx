import { Clock, Video } from 'lucide-react';
import { Badge, Card, CardContent, CardHeader } from '@xzboss/ui';

const timestampUrl = import.meta.env.VITE_TIMESTAMP_URL ?? '/';
const videoUrl = import.meta.env.VITE_VIDEO_URL ?? '/';

const tools = [
  {
    title: '时间戳工具',
    description: '秒毫秒识别、JSON 与文本批量扫描转换。',
    href: timestampUrl,
    icon: Clock,
  },
  {
    title: '视频压缩',
    description: '功能规划中，敬请期待。',
    href: videoUrl,
    icon: Video,
  },
];

export function App() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-200/70 via-zinc-50 to-zinc-50">
      <header className="border-b border-zinc-200/80 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              xzboss toolbox
            </p>
            <h1 className="text-lg font-semibold text-zinc-900">工具箱</h1>
          </div>
          <Badge>纯前端</Badge>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-600">
          下面是可用的子工具入口。公共开发环境下默认指向本地不同端口；生产环境请在 Vercel
          中为每个子项目配置 URL，并写入对应环境变量。
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <li key={tool.title}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardHeader title={tool.title} description={tool.description} />
                  <CardContent className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-zinc-500">
                      <Icon className="size-4" aria-hidden />
                      <span className="text-xs">独立应用</span>
                    </div>
                    <a
                      href={tool.href}
                      className="inline-flex items-center justify-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                    >
                      打开
                      <ArrowUpRight className="size-3.5" aria-hidden />
                    </a>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
