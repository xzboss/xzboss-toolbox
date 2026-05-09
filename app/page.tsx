import { ToolCard } from "@/components/tool-card";
import { tools } from "@/config/tools";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex items-center">
        <h1 className="font-mono text-sm font-medium text-muted-foreground" translate="no">
          xzboss-toolbox
        </h1>
      </header>

      <section className="grid content-start gap-4 py-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tools.map((tool) => (
          <ToolCard key={tool.href} tool={tool} />
        ))}
      </section>
    </main>
  );
}
