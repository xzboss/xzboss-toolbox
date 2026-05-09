import { Clock3, Video } from "lucide-react";

export const tools = [
  {
    title: "时间转换",
    description: "时间戳转日期",
    href: "/timestamp",
    icon: Clock3,
  },
  {
    title: "视频压缩",
    description: "减小视频体积",
    href: "/video-compressor",
    icon: Video,
  },
] as const;
