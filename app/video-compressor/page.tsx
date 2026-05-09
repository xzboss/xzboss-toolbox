import Link from "next/link";

import { VideoCompressor } from "@/components/video-compressor";
import { Button } from "@/components/ui/button";

export default function VideoCompressorPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">视频压缩</h1>
        <Button asChild variant="ghost">
          <Link href="/">返回首页</Link>
        </Button>
      </header>

      <VideoCompressor />
    </main>
  );
}
