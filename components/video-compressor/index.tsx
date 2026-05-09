"use client";

import type { FFmpeg } from "@ffmpeg/ffmpeg";
import { Upload } from "lucide-react";
import type { RefObject } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { BufferedPreviewVideo } from "@/components/video-compressor/buffered-preview-video";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Mode = "compress" | "resize" | "fps";
type Action = "download" | "preview";

type Resolution = {
  label: string;
  width: number;
  height: number;
};

const resolutions: Resolution[] = [
  { label: "4K", width: 3840, height: 2160 },
  { label: "1080p", width: 1920, height: 1080 },
  { label: "720p", width: 1280, height: 720 },
  { label: "480p", width: 854, height: 480 },
];

export function VideoCompressor() {
  const inputRef = useRef<HTMLInputElement>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [mode, setMode] = useState<Mode>("compress");
  const [resolution, setResolution] = useState<Resolution>(resolutions[1]);
  const [targetFps, setTargetFps] = useState(30);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [busyAction, setBusyAction] = useState<Action | null>(null);

  const fileSize = useMemo(() => (file ? formatFileSize(file.size) : ""), [file]);
  const isBusy = busyAction !== null;

  useEffect(() => {
    return () => {
      if (sourceUrl) {
        URL.revokeObjectURL(sourceUrl);
      }

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, sourceUrl]);

  function selectFile(nextFile: File | null) {
    if (!nextFile) {
      return;
    }

    if (!nextFile.type.startsWith("video/")) {
      toast.error("请选择视频文件");
      return;
    }

    if (sourceUrl) {
      URL.revokeObjectURL(sourceUrl);
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setFile(nextFile);
    setSourceUrl(URL.createObjectURL(nextFile));
    setPreviewUrl("");
    setProgress(0);
    setStatus("");
  }

  async function run(action: Action) {
    if (!file) {
      toast.error("请先选择视频");
      return;
    }

    if (mode === "fps" && targetFps < 1) {
      toast.error("帧率须大于 0");
      return;
    }

    setBusyAction(action);
    setProgress(0);
    setStatus("准备中");

    try {
      const { blob: outputBlob, streamingPreviewUsed } =
        mode === "resize"
          ? await resizeVideo(
              file,
              resolution,
              setStatus,
              setProgress,
              action === "preview"
                ? (url) => {
                    setPreviewUrl((previous) => {
                      if (previous) {
                        URL.revokeObjectURL(previous);
                      }

                      return url;
                    });
                  }
                : undefined,
            )
          : mode === "fps"
            ? {
                blob: await reduceFpsVideo(
                  file,
                  targetFps,
                  ffmpegRef,
                  setStatus,
                  setProgress,
                ),
                streamingPreviewUsed: false,
              }
            : {
                blob: await compressVideo(
                  file,
                  ffmpegRef,
                  setStatus,
                  setProgress,
                ),
                streamingPreviewUsed: false,
              };
      const outputUrl = URL.createObjectURL(outputBlob);

      setStatus("完成");
      setProgress(1);

      if (action === "download") {
        downloadFile(
          outputUrl,
          getOutputName(file.name, mode, resolution, outputBlob.type, targetFps),
        );
        window.setTimeout(() => URL.revokeObjectURL(outputUrl), 1000);
        toast.success("已开始下载");
      } else if (streamingPreviewUsed) {
        URL.revokeObjectURL(outputUrl);
        toast.success("预览已生成");
      } else {
        setPreviewUrl((previous) => {
          if (previous) {
            URL.revokeObjectURL(previous);
          }

          return outputUrl;
        });
        toast.success("预览已生成");
      }
    } catch {
      setStatus("处理失败");
      toast.error("处理失败");
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <section className="grid gap-6">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <button
          type="button"
          className="min-h-96 overflow-hidden rounded-4xl bg-card text-left shadow-sm outline-none hover:cursor-pointer focus-visible:ring-2 focus-visible:ring-foreground/20"
          onClick={() => inputRef.current?.click()}
        >
          {sourceUrl ? (
            <video
              src={sourceUrl}
              className="h-full max-h-[520px] w-full bg-foreground object-contain"
              controls
            />
          ) : (
            <div className="grid min-h-96 place-items-center p-8">
              <div className="grid justify-items-center gap-4">
                <div className="grid size-14 place-items-center rounded-2xl bg-foreground text-background">
                  <Upload className="size-6" aria-hidden />
                </div>
                <div className="text-xl font-semibold">选择视频</div>
              </div>
            </div>
          )}
        </button>

        <div className="grid content-start gap-5">
          <div className="rounded-4xl bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="font-medium">{file ? file.name : "未选择文件"}</div>
              <div className="shrink-0 font-mono text-sm text-muted-foreground">
                {fileSize}
              </div>
            </div>
            <input
              ref={inputRef}
              className="sr-only"
              type="file"
              name="video"
              accept="video/*"
              autoComplete="off"
              onChange={(event) => selectFile(event.target.files?.[0] ?? null)}
            />

            <Button type="button" onClick={() => inputRef.current?.click()}>
              选择文件
            </Button>
          </div>

          <div className="rounded-4xl bg-card p-2 shadow-sm">
            <div className="grid grid-cols-3 gap-2">
              <TabButton active={mode === "compress"} onClick={() => setMode("compress")}>
                压缩视频
              </TabButton>
              <TabButton active={mode === "resize"} onClick={() => setMode("resize")}>
                降低分辨率
              </TabButton>
              <TabButton active={mode === "fps"} onClick={() => setMode("fps")}>
                降低帧率
              </TabButton>
            </div>
          </div>

          {mode === "resize" ? (
            <div className="grid grid-cols-2 gap-2 rounded-4xl bg-card p-2 shadow-sm sm:grid-cols-4">
              {resolutions.map((item) => (
                <TabButton
                  key={item.label}
                  active={resolution.label === item.label}
                  onClick={() => setResolution(item)}
                >
                  {item.label}
                </TabButton>
              ))}
            </div>
          ) : null}

          {mode === "fps" ? (
            <div className="rounded-4xl bg-card p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-4">
                <span className="text-sm font-medium">目标帧率</span>
                <span className="font-mono text-sm text-muted-foreground">{targetFps}</span>
              </div>
              <input
                aria-label="目标帧率"
                className="h-2 w-full cursor-pointer accent-foreground"
                max={120}
                min={0}
                step={1}
                type="range"
                value={targetFps}
                onChange={(event) => setTargetFps(Number(event.target.value))}
              />
              <div className="mt-2 flex justify-between font-mono text-xs text-muted-foreground">
                <span>0</span>
                <span>120</span>
              </div>
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              type="button"
              disabled={!file || isBusy || (mode === "fps" && targetFps < 1)}
              onClick={() => run("download")}
            >
              {busyAction === "download" ? "处理中" : "执行"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={!file || isBusy || (mode === "fps" && targetFps < 1)}
              onClick={() => run("preview")}
            >
              {busyAction === "preview" ? "处理中" : "预览"}
            </Button>
          </div>

          {status ? (
            <div className="rounded-3xl bg-card p-4 text-sm shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <span>{status}</span>
                <span className="font-mono">{Math.round(progress * 100)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-foreground"
                  style={{ width: `${Math.round(progress * 100)}%` }}
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {previewUrl ? (
        <section className="rounded-4xl bg-card p-5 shadow-sm">
          <div className="mb-4 font-medium">预览</div>
          <BufferedPreviewVideo
            src={previewUrl}
            className="max-h-[560px] w-full rounded-3xl bg-foreground object-contain"
          />
        </section>
      ) : null}
    </section>
  );
}

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "rounded-3xl px-4 py-3 text-sm font-medium outline-none hover:cursor-pointer focus-visible:ring-2 focus-visible:ring-foreground/20",
        active ? "bg-foreground text-background" : "bg-muted text-foreground",
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

async function loadFFmpeg(ffmpegRef: RefObject<FFmpeg | null>) {
  let ffmpeg = ffmpegRef.current;

  if (!ffmpeg) {
    const { FFmpeg } = await import("@ffmpeg/ffmpeg");

    ffmpeg = new FFmpeg();
    ffmpegRef.current = ffmpeg;
  }

  if (ffmpeg.loaded) {
    return ffmpeg;
  }

  const { toBlobURL } = await import("@ffmpeg/util");
  const useMultiThread = typeof SharedArrayBuffer !== "undefined";
  const baseURL = useMultiThread
    ? "https://cdn.jsdelivr.net/npm/@ffmpeg/core-mt@0.12.10/dist/umd"
    : "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd";

  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
    ...(useMultiThread
      ? {
          workerURL: await toBlobURL(
            `${baseURL}/ffmpeg-core.worker.js`,
            "text/javascript",
          ),
        }
      : {}),
  });

  return ffmpeg;
}

async function compressVideo(
  file: File,
  ffmpegRef: RefObject<FFmpeg | null>,
  setStatus: (status: string) => void,
  setProgress: (progress: number) => void,
) {
  setStatus("加载引擎");
  const ffmpeg = await loadFFmpeg(ffmpegRef);
  const { fetchFile } = await import("@ffmpeg/util");
  const inputName = `input.${getExtension(file.name)}`;
  const outputName = "output.mp4";

  setStatus("读取视频");
  await ffmpeg.writeFile(inputName, await fetchFile(file));
  setStatus("处理中");

  const onProgress = ({ progress }: { progress: number }) => {
    setProgress(Math.max(0, Math.min(progress, 1)));
  };

  ffmpeg.on("progress", onProgress);
  let exitCode = 1;

  try {
    exitCode = await ffmpeg.exec(
      buildCompressArgs(inputName, outputName, true),
    );

    if (exitCode !== 0) {
      setStatus("处理中");
      exitCode = await ffmpeg.exec(
        buildCompressArgs(inputName, outputName, false),
      );
    }
  } finally {
    ffmpeg.off("progress", onProgress);
  }

  if (exitCode !== 0) {
    throw new Error("ffmpeg failed");
  }

  const data = await ffmpeg.readFile(outputName);
  await ffmpeg.deleteFile(inputName);
  await ffmpeg.deleteFile(outputName);

  return createVideoBlob(data);
}

async function reduceFpsVideo(
  file: File,
  targetFps: number,
  ffmpegRef: RefObject<FFmpeg | null>,
  setStatus: (status: string) => void,
  setProgress: (progress: number) => void,
) {
  setStatus("加载引擎");
  const ffmpeg = await loadFFmpeg(ffmpegRef);
  const { fetchFile } = await import("@ffmpeg/util");
  const inputName = `input.${getExtension(file.name)}`;
  const outputName = "output.mp4";

  setStatus("读取视频");
  await ffmpeg.writeFile(inputName, await fetchFile(file));
  setStatus("处理中");

  const onProgress = ({ progress }: { progress: number }) => {
    setProgress(Math.max(0, Math.min(progress, 1)));
  };

  ffmpeg.on("progress", onProgress);
  let exitCode = 1;

  try {
    exitCode = await ffmpeg.exec(
      buildReduceFpsArgs(inputName, outputName, targetFps, true),
    );

    if (exitCode !== 0) {
      setStatus("处理中");
      exitCode = await ffmpeg.exec(
        buildReduceFpsArgs(inputName, outputName, targetFps, false),
      );
    }
  } finally {
    ffmpeg.off("progress", onProgress);
  }

  if (exitCode !== 0) {
    throw new Error("ffmpeg failed");
  }

  const data = await ffmpeg.readFile(outputName);
  await ffmpeg.deleteFile(inputName);
  await ffmpeg.deleteFile(outputName);

  return createVideoBlob(data);
}

function buildReduceFpsArgs(
  inputName: string,
  outputName: string,
  fps: number,
  copyAudio: boolean,
) {
  const args = [
    "-i",
    inputName,
    "-map",
    "0:v:0",
    "-map",
    "0:a?",
    "-vf",
    `fps=${fps}`,
    "-c:v",
    "libx264",
    "-preset",
    "ultrafast",
    "-threads",
    "0",
    "-crf",
    "28",
    "-pix_fmt",
    "yuv420p",
  ];

  if (copyAudio) {
    args.push("-c:a", "copy");
  } else {
    args.push("-c:a", "aac", "-b:a", "96k");
  }

  args.push("-movflags", "faststart", outputName);

  return args;
}

function buildCompressArgs(
  inputName: string,
  outputName: string,
  copyAudio: boolean,
) {
  const args = [
    "-i",
    inputName,
    "-map",
    "0:v:0",
    "-map",
    "0:a?",
    "-c:v",
    "libx264",
    "-preset",
    "ultrafast",
    "-threads",
    "0",
    "-crf",
    "32",
    "-pix_fmt",
    "yuv420p",
  ];

  if (copyAudio) {
    args.push("-c:a", "copy");
  } else {
    args.push("-c:a", "aac", "-b:a", "96k");
  }

  args.push("-movflags", "faststart", outputName);

  return args;
}

async function resizeVideo(
  file: File,
  resolution: Resolution,
  setStatus: (status: string) => void,
  setProgress: (progress: number) => void,
  onPreviewUrl?: (url: string) => void,
): Promise<{ blob: Blob; streamingPreviewUsed: boolean }> {
  setStatus("读取视频");

  const sourceUrl = URL.createObjectURL(file);
  const video = document.createElement("video");
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    URL.revokeObjectURL(sourceUrl);
    throw new Error("canvas unavailable");
  }

  video.src = sourceUrl;
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";

  await waitForVideoMetadata(video);

  const target = getTargetSize(
    video.videoWidth,
    video.videoHeight,
    resolution.height,
  );

  canvas.width = target.width;
  canvas.height = target.height;

  const stream = canvas.captureStream(Math.min(30, getFrameRate(video)));
  const mimeType = getMediaRecorderMimeType();
  const streamingPreview =
    onPreviewUrl && mimeType.includes("webm")
      ? createStreamingPreview(mimeType, onPreviewUrl)
      : null;
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: getVideoBitrate(target.height),
  });
  const chunks: BlobPart[] = [];

  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      chunks.push(event.data);
      streamingPreview?.append(event.data);
    }
  };

  setStatus("处理中");

  const done = new Promise<Blob>((resolve, reject) => {
    recorder.onerror = () => reject(new Error("record failed"));
    recorder.onstop = () => {
      resolve(new Blob(chunks, { type: mimeType }));
    };
  });

  let rafId = 0;

  const draw = () => {
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    setProgress(video.duration ? video.currentTime / video.duration : 0);

    if (!video.ended) {
      rafId = requestAnimationFrame(draw);
    }
  };

  recorder.start(1000);
  const playbackDone = new Promise<void>((resolve) => {
    video.onended = () => resolve();
  });

  await video.play();
  draw();

  await playbackDone;

  cancelAnimationFrame(rafId);
  if (recorder.state !== "inactive") {
    recorder.stop();
  }

  const blob = await done;
  streamingPreview?.end();
  URL.revokeObjectURL(sourceUrl);

  return { blob, streamingPreviewUsed: streamingPreview != null };
}

function downloadFile(url: string, filename: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
}

function createVideoBlob(data: string | Uint8Array<ArrayBufferLike>) {
  if (typeof data === "string") {
    return new Blob([data], { type: "video/mp4" });
  }

  const copy = new Uint8Array(data.byteLength);
  copy.set(data);

  return new Blob([copy.buffer], { type: "video/mp4" });
}

function getExtension(filename: string) {
  return filename.split(".").pop()?.toLowerCase() || "mp4";
}

function waitForVideoMetadata(video: HTMLVideoElement) {
  return new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve();
    video.onerror = () => reject(new Error("video load failed"));
  });
}

function getTargetSize(sourceWidth: number, sourceHeight: number, targetHeight: number) {
  if (sourceHeight <= targetHeight) {
    return {
      width: ensureEven(sourceWidth),
      height: ensureEven(sourceHeight),
    };
  }

  return {
    width: ensureEven((sourceWidth / sourceHeight) * targetHeight),
    height: ensureEven(targetHeight),
  };
}

function ensureEven(value: number) {
  const rounded = Math.round(value);

  return rounded % 2 === 0 ? rounded : rounded - 1;
}

function getFrameRate(_video: HTMLVideoElement) {
  return 24;
}

function getMediaRecorderMimeType() {
  const candidates = [
    "video/webm;codecs=vp8",
    "video/webm",
    "video/mp4",
  ];

  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
}

function createStreamingPreview(
  mimeType: string,
  onPreviewUrl: (url: string) => void,
) {
  if (!("MediaSource" in window) || !MediaSource.isTypeSupported(mimeType)) {
    return null;
  }

  const mediaSource = new MediaSource();
  const url = URL.createObjectURL(mediaSource);
  const queue: ArrayBuffer[] = [];
  let sourceBuffer: SourceBuffer | null = null;
  let ended = false;

  const pump = () => {
    if (!sourceBuffer || sourceBuffer.updating) {
      return;
    }

    const next = queue.shift();

    if (next) {
      sourceBuffer.appendBuffer(next);
      return;
    }

    if (ended && mediaSource.readyState === "open") {
      mediaSource.endOfStream();
    }
  };

  mediaSource.addEventListener(
    "sourceopen",
    () => {
      sourceBuffer = mediaSource.addSourceBuffer(mimeType);
      sourceBuffer.mode = "sequence";
      sourceBuffer.addEventListener("updateend", pump);
      pump();
    },
    { once: true },
  );

  onPreviewUrl(url);

  return {
    async append(blob: Blob) {
      queue.push(await blob.arrayBuffer());
      pump();
    },
    end() {
      ended = true;
      pump();
    },
  };
}

function getVideoBitrate(height: number) {
  if (height >= 2160) {
    return 12_000_000;
  }

  if (height >= 1080) {
    return 5_000_000;
  }

  if (height >= 720) {
    return 2_500_000;
  }

  return 1_000_000;
}

function getOutputName(
  filename: string,
  mode: Mode,
  resolution: Resolution,
  mimeType: string,
  targetFps?: number,
) {
  const basename = filename.replace(/\.[^.]+$/, "");
  let suffix: string;

  if (mode === "compress") {
    suffix = "compressed";
  } else if (mode === "fps") {
    suffix = `${targetFps ?? 0}fps`;
  } else {
    suffix = resolution.label.toLowerCase();
  }

  const extension = mimeType.includes("webm") ? "webm" : "mp4";

  return `${basename}-${suffix}.${extension}`;
}

function formatFileSize(bytes: number) {
  return new Intl.NumberFormat("zh-CN", {
    maximumFractionDigits: 1,
  }).format(bytes / 1024 / 1024) + " MB";
}
