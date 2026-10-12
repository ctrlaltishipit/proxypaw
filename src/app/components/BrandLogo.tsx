/**
 * BrandLogo and BrandIcon, the ProxyPaw logo, shared by every page.
 *
 * The artwork lives in public/brand/ and is shown as an image, never redrawn
 * in code, so the header, footer, waitlist modal, favicon and emails all show
 * exactly the same mark. To change the logo, replace those files.
 *
 *   <BrandLogo tile={36} />         tile + two-tone name, for the cream pages
 *   <BrandLogo tile={30} onDark />  the same, for the dark ink footer
 *   <BrandIcon size={36} />         the orange tile on its own
 *
 * `tile` is the height the orange tile renders at. The logo files carry 12 of
 * empty padding round the artwork (a 256 tile, then the name, 952.295 wide in
 * all). An SVG view on the image URL leaves that padding out, so the image box
 * is the tile's height and a whole number of pixels wide, and the tile lands
 * exactly where a plain box of that size would, with crisp edges.
 */
import type { CSSProperties } from 'react';

const LOGO = { width: 952.295, tile: 256 };

export function BrandIcon({ size, alt = 'ProxyPaw', className, style }: {
  size: number;
  /** Pass "" where the tile is decoration beside text that already says it. */
  alt?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <img
      className={className}
      src="/brand/proxypaw-icon-light.svg"
      alt={alt}
      width={size}
      height={size}
      // maxWidth: the base styles cap images at 100% of their box, which lets Safari squash the tile in a tight row.
      style={{ width: size, height: size, maxWidth: 'none', flexShrink: 0, ...style }}
    />
  );
}

export default function BrandLogo({ tile, onDark = false, className }: {
  tile: number;
  onDark?: boolean;
  className?: string;
}) {
  const k = tile / LOGO.tile;
  const width = Math.ceil(LOGO.width * k);
  // The view is as wide as the box at this scale, so nothing is stretched.
  const view = `svgView(viewBox(0,0,${(width / k).toFixed(3)},${LOGO.tile}))`;
  return (
    <img
      className={className}
      src={`/brand/proxypaw-logo-${onDark ? 'dark' : 'light'}.svg#${view}`}
      alt="ProxyPaw"
      width={width}
      height={tile}
      style={{ width, height: tile, maxWidth: 'none', flexShrink: 0 }}
    />
  );
}
