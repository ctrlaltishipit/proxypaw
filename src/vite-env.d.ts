/// <reference types="vite/client" />

// The figmaAssetResolver plugin in vite.config.ts maps these to src/assets/*
declare module 'figma:asset/*.png' {
  const src: string;
  export default src;
}

// Google Maps is loaded at runtime via a <script> tag in GoogleMapView.tsx
declare namespace google.maps {
  type Map = any;
  type Marker = any;
  type InfoWindow = any;
  type LatLng = any;
}
declare const google: any;
