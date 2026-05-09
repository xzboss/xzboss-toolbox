"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      richColors={false}
      closeButton={false}
      toastOptions={{
        duration: 1400,
        classNames: {
          toast:
            "rounded-full border-0 bg-foreground text-background shadow-lg font-sans",
          title: "text-sm font-medium",
        },
      }}
    />
  );
}
