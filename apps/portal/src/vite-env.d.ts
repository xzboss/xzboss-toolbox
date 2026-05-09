/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TIMESTAMP_URL: string;
  readonly VITE_VIDEO_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
