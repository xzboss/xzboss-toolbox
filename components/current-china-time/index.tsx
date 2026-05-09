"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { FlipValue } from "@/components/flip-value";
import { formatChinaTime } from "@/lib/format";

export function CurrentChinaTime() {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 250);

    return () => window.clearInterval(timer);
  }, []);

  async function copyValue(value: string) {
    await navigator.clipboard.writeText(value);
    toast.success("复制成功");
  }

  const chinaTime = formatChinaTime(now);
  const milliseconds = String(now);
  const seconds = String(Math.floor(now / 1000));

  return (
    <section className="relative overflow-hidden rounded-4xl bg-foreground p-6 text-background shadow-xl sm:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-sm font-medium text-background/60">中国区</h2>
        <div className="text-sm text-background/60">点击复制</div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <FlipButton
          label="现在时间"
          value={chinaTime}
          size="lg"
          onCopy={copyValue}
        />

        <div className="grid min-w-0 content-end gap-5">
          <FlipButton
            label="毫秒时间戳"
            value={milliseconds}
            size="sm"
            onCopy={copyValue}
          />
          <FlipButton
            label="秒时间戳"
            value={seconds}
            size="sm"
            onCopy={copyValue}
          />
        </div>
      </div>
    </section>
  );
}

function FlipButton({
  label,
  value,
  size,
  onCopy,
}: {
  label: string;
  value: string;
  size: "sm" | "lg";
  onCopy: (value: string) => void;
}) {
  return (
    <button
      type="button"
      className="min-w-0 rounded-3xl p-0 text-left outline-none hover:cursor-pointer focus-visible:ring-2 focus-visible:ring-background/70"
      onClick={() => onCopy(value)}
      aria-label={`复制${label}`}
    >
      <div className="mb-2 text-sm text-background/55">{label}</div>
      <FlipValue
        value={value}
        size={size}
        className="w-full"
        color="var(--color-background)"
        background="oklch(0.22 0 0)"
      />
    </button>
  );
}
