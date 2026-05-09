import { ToolCard } from "@/components/tool-card";
import { tools } from "@/config/tools";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">工具箱</h1>
        <p className="text-sm font-medium text-muted-foreground">
          xzboss toolbox
        </p>
      </header>

      <section className="grid flex-1 content-center gap-4 py-8 sm:grid-cols-2 lg:gap-6">
        {tools.map((tool) => (
          <ToolCard key={tool.href} tool={tool} />
        ))}
      </section>
    </main>
  );
}
