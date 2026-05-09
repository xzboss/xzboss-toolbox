import Link from "next/link";

import { CurrentChinaTime } from "@/components/current-china-time";
import { TimestampConverter } from "@/components/timestamp-converter";
import { Button } from "@/components/ui/button";

export default function TimestampPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-8 flex items-center gap-4">
        <Button asChild variant="ghost">
          <Link href="/">返回首页</Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">时间转换</h1>
      </header>

      <section className="grid flex-1 content-start gap-6">
        <CurrentChinaTime />
        <TimestampConverter />
      </section>
    </main>
  );
}
