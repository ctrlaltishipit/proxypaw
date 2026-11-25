/**
 * BrandLogo and BrandIcon, the ProxyPaw logo, shared by every page and the app mockups.
 *
 * The mark is drawn here as inline SVG (an orange paw with a golden puppy and an
 * orange tabby peeking over its pad), so it is crisp at any size and never waits
 * on a network request. The same artwork lives in public/brand/*.svg for the
 * favicon, emails and anything outside React; keep them in sync via
 * PAW_MARK_SVG below (scripts can write it out).
 *
 *   <BrandLogo tile={36} />         mark + two-tone name, for light pages
 *   <BrandLogo tile={30} onDark />  the same, for dark grounds ("Proxy" in white)
 *   <BrandIcon size={36} />         the mark on its own
 *
 * `tile` is the logo's height in px.
 */
import type { CSSProperties } from 'react';

const INK = '#14301f';
const MARIGOLD = '#e0662f';

/** Raw SVG markup of the mark (viewBox 0 0 256 256), used for files and favicons. */
export const PAW_MARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
<defs><linearGradient id="ppg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f28a45"/><stop offset="1" stop-color="#e0662f"/></linearGradient></defs>
<g fill="url(#ppg)" transform="translate(128 0) scale(0.92) translate(-128 0)">
<ellipse cx="50" cy="86" rx="22" ry="29" transform="rotate(-24 50 86)"/>
<ellipse cx="98" cy="46" rx="24" ry="31" transform="rotate(-8 98 46)"/>
<ellipse cx="158" cy="46" rx="24" ry="31" transform="rotate(8 158 46)"/>
<ellipse cx="206" cy="86" rx="22" ry="29" transform="rotate(24 206 86)"/>
<path d="M128 98C180 98 220 130 220 170C220 204 194 218 166 214C152 212 140 207 128 207C116 207 104 212 90 214C62 218 36 204 36 170C36 130 76 98 128 98Z"/>
</g>
<g transform="translate(128 247) scale(1.24) translate(-128 -247)">
<g stroke="#5b3a22" stroke-width="3" stroke-linejoin="round">
<path d="M64 170C51 175 45 199 53 217C59 226 71 222 74 208Z" fill="#c98b45"/>
<path d="M128 170C141 175 146 197 139 214C133 222 122 218 120 206Z" fill="#c98b45"/>
<ellipse cx="96" cy="194" rx="34" ry="32" fill="#edbe7a"/>
<ellipse cx="78" cy="238" rx="13" ry="9" fill="#edbe7a"/>
<ellipse cx="114" cy="238" rx="13" ry="9" fill="#edbe7a"/>
</g>
<ellipse cx="96" cy="210" rx="20" ry="14" fill="#fbebd0"/>
<g fill="#2a1a10"><circle cx="84" cy="190" r="5.2"/><circle cx="108" cy="190" r="5.2"/><ellipse cx="96" cy="203" rx="7" ry="5"/></g>
<g fill="#fff"><circle cx="85.8" cy="188.2" r="1.7"/><circle cx="109.8" cy="188.2" r="1.7"/></g>
<ellipse cx="96" cy="217" rx="4.5" ry="4.5" fill="#f2777a"/>
<path d="M96 208v4M88.5 213q7.5 6 15 0" fill="none" stroke="#2a1a10" stroke-width="2.6" stroke-linecap="round"/>
<g stroke="#5b3a22" stroke-width="3" stroke-linejoin="round">
<path d="M141 188L146 152L168 176Z" fill="#f4a55a"/>
<path d="M195 188L190 152L168 176Z" fill="#f4a55a"/>
<ellipse cx="168" cy="200" rx="31" ry="28" fill="#f4a55a"/>
<ellipse cx="152" cy="238" rx="12" ry="9" fill="#f4a55a"/>
<ellipse cx="184" cy="238" rx="12" ry="9" fill="#f4a55a"/>
</g>
<path d="M147 180L149 162L162 175Z" fill="#f7b7a3"/><path d="M189 180L187 162L174 175Z" fill="#f7b7a3"/>
<path d="M160 176q8 7 16 0M163 184q5 4 10 0" fill="none" stroke="#d97a2e" stroke-width="3" stroke-linecap="round"/>
<ellipse cx="168" cy="211" rx="14" ry="10" fill="#fcebd6"/>
<g fill="#2a1a10"><ellipse cx="156" cy="197" rx="4.6" ry="5.6"/><ellipse cx="180" cy="197" rx="4.6" ry="5.6"/></g>
<g fill="#fff"><circle cx="157.5" cy="195" r="1.6"/><circle cx="181.5" cy="195" r="1.6"/></g>
<path d="M164 205h8l-4 4.5Z" fill="#e86f7a"/>
<path d="M168 209.5v2.5M162 214q6 4 12 0M138 208h12M139 214l11-2M198 208h-12M197 214l-11-2" fill="none" stroke="#5b3a22" stroke-width="2" stroke-linecap="round"/>
</g>
</svg>`;

/** The mark as React SVG (same artwork as PAW_MARK_SVG). */
function PawMark({ size, title }: { size: number; title?: string }) {
  return (
    <span
      role={title ? 'img' : undefined}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
      style={{ display: 'inline-block', width: size, height: size, flexShrink: 0, lineHeight: 0 }}
      // Static, hard-coded artwork above; no user input reaches it.
      dangerouslySetInnerHTML={{ __html: PAW_MARK_SVG.replace('<svg ', `<svg width="${size}" height="${size}" `) }}
    />
  );
}

export function BrandIcon({ size, alt = 'ProxyPaw', className, style }: {
  size: number;
  /** Pass "" where the mark is decoration beside text that already says it. */
  alt?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span className={className} style={{ flexShrink: 0, lineHeight: 0, ...style }}>
      <PawMark size={size} title={alt} />
    </span>
  );
}

export default function BrandLogo({ tile, onDark = false, className }: {
  tile: number;
  onDark?: boolean;
  className?: string;
}) {
  return (
    <span
      className={className}
      role="img"
      aria-label="ProxyPaw"
      style={{ display: 'inline-flex', alignItems: 'center', gap: Math.round(tile * 0.22), flexShrink: 0, height: tile }}
    >
      <PawMark size={Math.round(tile * 1.08)} />
      <span
        aria-hidden="true"
        style={{
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 800,
          fontSize: Math.round(tile * 0.66), letterSpacing: '-0.025em', lineHeight: 1,
          color: onDark ? '#ffffff' : INK, whiteSpace: 'nowrap',
        }}
      >
        Proxy<span style={{ color: MARIGOLD }}>Paw</span>
      </span>
    </span>
  );
}
