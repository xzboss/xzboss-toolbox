import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { tools } from "@/config/tools";

type Tool = (typeof tools)[number];

export function ToolCard({ tool }: { tool: Tool }) {
  const Icon = tool.icon;

  return (
    <Link
      href={tool.href}
      className="group flex min-h-40 flex-col justify-between rounded-3xl bg-foreground p-5 text-background shadow-sm transition-shadow hover:shadow-lg focus-visible:ring-2 focus-visible:ring-foreground/20 focus-visible:outline-none"
    >
      <div className="flex items-start justify-between gap-6">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-background/10">
          <Icon className="size-5 text-background" aria-hidden />
        </div>
        <ArrowRight className="size-5 text-background" aria-hidden />
      </div>

      <div className="space-y-1.5">
        <h2 className="text-2xl font-semibold tracking-tight">{tool.title}</h2>
        <p className="text-sm text-background/80">{tool.description}</p>
      </div>
    </Link>
  );
}
