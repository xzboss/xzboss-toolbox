"use client";

import dynamic from "next/dynamic";

import { cn } from "@/lib/utils";

const FlipNumbers = dynamic(() => import("react-flip-numbers"), {
  ssr: false,
});

type FlipValueProps = {
  value: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  color?: string;
  background?: string;
};

const sizeMap = {
  sm: { height: 22, width: 14 },
  md: { height: 30, width: 19 },
  lg: { height: 44, width: 28 },
};

export function FlipValue({
  value,
  size = "md",
  className,
  color = "var(--color-background)",
  background = "var(--color-foreground)",
}: FlipValueProps) {
  const dimensions = sizeMap[size];

  return (
    <div
      className={cn(
        "inline-flex max-w-full overflow-x-auto rounded-2xl p-1 font-mono tabular-nums",
        className,
      )}
    >
      <FlipNumbers
        play
        numbers={value}
        height={dimensions.height}
        width={dimensions.width}
        color={color}
        background={background}
        duration={0.45}
        perspective={500}
        nonNumberStyle={{
          color,
          fontSize: dimensions.height * 0.72,
          lineHeight: `${dimensions.height}px`,
          paddingInline: 1,
        }}
      />
    </div>
  );
}
