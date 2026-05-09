"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Textarea } from "@/components/ui/textarea";
import {
  getTimestampUnitLabel,
  tokenizeTimestampText,
  type TimestampTextPart,
} from "@/lib/format";

export function TimestampConverter() {
  const [text, setText] = useState(() => `${Date.now()} xxxxxx\nxxxxxx ${Date.now()}`);

  const parts = useMemo(() => tokenizeTimestampText(text), [text]);
  const hasTimestamp = parts.some((part) => part.type === "timestamp");

  async function copyValue(value: string) {
    await navigator.clipboard.writeText(value);
    toast.success("复制成功");
  }

  return (
    <section className="grid gap-5 lg:grid-cols-2">
      <div className="min-w-0 space-y-3">
        <label className="text-sm font-medium" htmlFor="timestamp-text">
          输入
        </label>
        <Textarea
          id="timestamp-text"
          name="timestampText"
          autoComplete="off"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="粘贴文本…"
          spellCheck={false}
          className="min-h-80 resize-y rounded-3xl border-0 bg-card p-5 text-base shadow-sm focus-visible:ring-foreground/20"
        />
      </div>

      <div className="min-w-0 space-y-3">
        <div className="text-sm font-medium">输出</div>
        <div className="min-h-80 rounded-3xl bg-card p-5 shadow-sm">
          {text ? (
            <div className="whitespace-pre-wrap wrap-break-word text-base leading-8">
              {parts.map((part, index) => (
                <TextPart
                  key={`${part.type}-${index}`}
                  part={part}
                  onCopy={copyValue}
                />
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground">—</div>
          )}

          {text && !hasTimestamp ? (
            <div className="mt-4 text-sm text-muted-foreground">未识别到时间戳</div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function TextPart({
  part,
  onCopy,
}: {
  part: TimestampTextPart;
  onCopy: (value: string) => void;
}) {
  if (part.type === "text") {
    return part.value;
  }

  return (
    <button
      type="button"
      className="mx-1 inline-flex max-w-full -translate-y-px items-center rounded-full bg-foreground px-3 py-1 font-mono text-sm leading-none text-background shadow-sm outline-none tabular-nums hover:cursor-pointer focus-visible:ring-2 focus-visible:ring-foreground/30"
      title={`${part.value} · ${getTimestampUnitLabel(part.result.unit)}`}
      translate="no"
      onClick={() => onCopy(part.result.chinaTime)}
      aria-label={`复制${part.result.chinaTime}`}
    >
      {part.result.chinaTime}
    </button>
  );
}
