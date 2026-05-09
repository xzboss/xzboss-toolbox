"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

const AUTO_PLAY_AHEAD = 5;
const MANUAL_AFTER_AUTO_PAUSE = 2;
/** Slippage at buffered range boundaries (seconds). */
const BUFFER_EDGES_EPS = 0.05;

type PauseReason = "auto-buffer" | "user" | null;

function isBlobUrl(video: HTMLVideoElement): boolean {
  const u = video.currentSrc || video.src;

  return typeof u === "string" && u.startsWith("blob:");
}

/**
 * Finished local file (`blob:` + finite duration): enough decoded data at current time to start / resume UI playback.
 * Does not apply to `duration === Infinity` (in-progress MediaSource).
 */
function blobAllowsStartingPlayback(video: HTMLVideoElement): boolean {
  if (!isBlobUrl(video)) {
    return false;
  }

  const d = video.duration;

  if (!Number.isFinite(d) || d <= 0) {
    return false;
  }

  return video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA;
}

/**
 * Finite blob: UA estimates playback can continue without stalling (auto-resume after buffer pause).
 */
function isFiniteBlobPlaythroughReady(video: HTMLVideoElement): boolean {
  if (!isBlobUrl(video)) {
    return false;
  }

  const d = video.duration;

  if (!Number.isFinite(d) || d <= 0) {
    return false;
  }

  return video.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA;
}

function getBufferedAhead(video: HTMLVideoElement): number {
  const t = video.currentTime;
  const { buffered } = video;
  const eps = BUFFER_EDGES_EPS;
  let best = 0;

  for (let i = 0; i < buffered.length; i++) {
    const start = buffered.start(i);
    const end = buffered.end(i);

    if (t >= start - eps && t <= end + eps) {
      best = Math.max(best, Math.max(0, end - t));
    }
  }

  return best;
}

function isBufferedToEnd(video: HTMLVideoElement): boolean {
  if (video.ended) {
    return true;
  }

  const d = video.duration;

  if (Number.isFinite(d) && d > 0) {
    const { buffered } = video;

    if (buffered.length === 0) {
      return false;
    }

    const lastEnd = buffered.end(buffered.length - 1);

    return lastEnd >= d - 0.25;
  }

  return false;
}

function isNearEndOfTimeline(video: HTMLVideoElement): boolean {
  const d = video.duration;

  if (!Number.isFinite(d) || d <= 0) {
    return false;
  }

  return d - video.currentTime <= AUTO_PLAY_AHEAD + 0.5;
}

type BufferedPreviewVideoProps = {
  src: string;
  className?: string;
};

export function BufferedPreviewVideo({ src, className }: BufferedPreviewVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const pauseReasonRef = useRef<PauseReason>(null);
  const internalPauseRef = useRef(false);
  const ignorePauseRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    pauseReasonRef.current = null;

    const pauseForBuffer = () => {
      internalPauseRef.current = true;
      video.pause();
    };

    const tryAutoResume = () => {
      if (!video.paused) {
        return;
      }

      if (pauseReasonRef.current !== "auto-buffer") {
        return;
      }

      const ahead = getBufferedAhead(video);

      if (
        ahead >= AUTO_PLAY_AHEAD ||
        isBufferedToEnd(video) ||
        isFiniteBlobPlaythroughReady(video)
      ) {
        ignorePauseRef.current = true;
        void video.play().catch(() => {
          /* ignore */
        });
      }
    };

    const onPlay = (event: Event) => {
      const trusted = event.isTrusted;
      const ahead = getBufferedAhead(video);
      const atEnd = isBufferedToEnd(video);
      const nearEnd = isNearEndOfTimeline(video);
      const blobStartOk = blobAllowsStartingPlayback(video);

      if (atEnd || nearEnd || blobStartOk) {
        pauseReasonRef.current = null;

        return;
      }

      if (trusted) {
        const reason = pauseReasonRef.current;

        if (reason === "auto-buffer") {
          if (ahead < MANUAL_AFTER_AUTO_PAUSE) {
            video.pause();
            toast.error("缓冲不足，请稍候再播放");
            return;
          }
        } else if (ahead < AUTO_PLAY_AHEAD) {
          video.pause();
          toast.error("缓冲不足，请稍候再播放");
          return;
        }

        pauseReasonRef.current = null;

        return;
      }

      if (ahead < AUTO_PLAY_AHEAD && !atEnd && !nearEnd) {
        video.pause();

        return;
      }

      pauseReasonRef.current = null;
    };

    const onPause = (event: Event) => {
      if (ignorePauseRef.current) {
        ignorePauseRef.current = false;
        return;
      }

      if (internalPauseRef.current) {
        pauseReasonRef.current = "auto-buffer";
        internalPauseRef.current = false;
        return;
      }

      if (!event.isTrusted) {
        return;
      }

      pauseReasonRef.current = "user";
    };

    const onTimeUpdate = () => {
      if (video.paused || video.ended) {
        return;
      }

      if (isNearEndOfTimeline(video) || isBufferedToEnd(video)) {
        return;
      }

      const ahead = getBufferedAhead(video);

      if (ahead < AUTO_PLAY_AHEAD) {
        pauseForBuffer();
      }
    };

    const onLoadedMetadata = () => {
      pauseReasonRef.current = null;
    };

    const onProgress = () => {
      tryAutoResume();
    };

    const onCanPlay = () => {
      tryAutoResume();
    };

    const onEnded = () => {
      pauseReasonRef.current = null;
    };

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("progress", onProgress);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("ended", onEnded);
    video.addEventListener("loadedmetadata", onLoadedMetadata);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("progress", onProgress);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      key={src}
      src={src}
      className={className}
      controls
      playsInline
      preload="auto"
    />
  );
}
