/// <reference types="vite/client" />

// The figmaAssetResolver plugin in vite.config.ts maps these to src/assets/*
declare module 'figma:asset/*.png' {
  const src: string;
  export default src;
}
