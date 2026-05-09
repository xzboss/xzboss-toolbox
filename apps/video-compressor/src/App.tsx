import { ArrowLeft, Video } from 'lucide-react';
import { Badge, Card, CardContent, CardHeader } from '@xzboss/ui';

export function App() {
  const portalUrl = import.meta.env.VITE_PORTAL_URL ?? 'http://localhost:5173';

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-200/60 via-zinc-50 to-zinc-50">
      <header className="border-b border-zinc-200/80 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-6 py-3">
          <div className="flex items-center gap-3">
            <a
              href={portalUrl}
              className="inline-flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-900"
            >
              <ArrowLeft className="size-4" aria-hidden />
              工具箱
            </a>
            <span className="text-zinc-300">/</span>
            <h1 className="text-sm font-semibold text-zinc-900">视频压缩</h1>
          </div>
          <Badge>规划中</Badge>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-16">
        <Card className="shadow-sm">
          <CardHeader
            title="视频压缩"
            description="该子项目已创建为 React 壳工程，具体交互与实现将在后续迭代补充。"
          />
          <CardContent className="flex flex-col items-start gap-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-zinc-500">
                <Video className="size-5 shrink-0" aria-hidden />
              </div>
              <p className="text-sm leading-relaxed text-zinc-600">
                当前为空项目占位页。你可以先通过导航返回首页，或根据 README 补充需求后再实现压缩流程。
              </p>
            </div>
            <a
              href={portalUrl}
              className="inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
            >
              返回导航
            </a>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
