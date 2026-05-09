import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Card } from "@/components/ui/card";
import type { tools } from "@/config/tools";

type Tool = (typeof tools)[number];

export function ToolCard({ tool }: { tool: Tool }) {
  const Icon = tool.icon;

  return (
    <Link href={tool.href} className="group block h-full">
      <Card className="relative h-full min-h-56 overflow-hidden p-6 transition-shadow hover:shadow-lg">
        <div className="absolute -right-10 -top-10 size-40 rounded-full bg-primary/10 blur-2xl" />
        <div className="relative flex h-full flex-col justify-between">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-background shadow-xs">
            <Icon className="size-6 text-primary" aria-hidden />
          </div>

          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight">
              {tool.title}
            </h2>
            <ArrowRight
              className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary"
              aria-hidden
            />
          </div>
        </div>
      </Card>
    </Link>
  );
}
