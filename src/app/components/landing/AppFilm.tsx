/**
 * The whole app in one video (public/films/proxypaw-app-tour.mp4).
 *
 * A 72-second portrait film made with HyperFrames from the real app screens
 * (project: ~/Documents/product-demos/proxypaw-app). One phone, all ten screens,
 * a cursor navigating from one to the next, a card per screen sliding to the left.
 * It plays muted while it is on screen and pauses when it leaves; the native
 * controls turn the sound on. Under reduced motion it waits for a press on play.
 * To change the film, re-render the project and replace the two files in public/films.
 */
import { useEffect, useRef } from 'react';
import { T, head, body, eyebrow, h2, lead, usePrefersReducedMotion, useOnScreen } from './ui';

export default function AppFilm() {
  const boxRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const onScreen = useOnScreen(boxRef, 0.45);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (onScreen && !reduced) v.play().catch(() => { /* autoplay refused: the controls still work */ });
    else v.pause();
  }, [onScreen, reduced]);

  return (
    <div className="pp-film" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 'clamp(28px, 6vw, 88px)', alignItems: 'center' }}>
      <style>{`
        @media (max-width: 860px) { .pp-film { grid-template-columns: 1fr !important; } .pp-film-box { justify-self: center; } }
      `}</style>
      <div>
        <div style={eyebrow}>The whole app, one video</div>
        <h2 style={h2}>Watch a walk get booked, start to finish.</h2>
        <p style={{ ...lead, marginTop: 16, maxWidth: 520 }}>
          Seventy seconds, every screen in order: home, your pet's profile, choosing a neighbour, booking, paying, the live walk,
          asking for a switch, your bookings and your community. A cursor does the tapping, so you can just watch.
        </p>
        <ul style={{ listStyle: 'none', margin: '22px 0 0', padding: 0, display: 'grid', gap: 10, maxWidth: 520 }}>
          {['These are the real app screens, with sample pets and people.', 'It plays muted. Use the controls to turn the music on.', 'Below, the same screens one at a time, at your own pace.'].map((t) => (
            <li key={t} style={{ fontFamily: body, fontSize: 15.5, lineHeight: 1.55, color: T.sub, background: T.leafGlass, borderRadius: 14, padding: '10px 14px' }}>{t}</li>
          ))}
        </ul>
      </div>
      <div ref={boxRef} className="pp-film-box" style={{ width: 'min(340px, 84vw)', borderRadius: 34, padding: 8, background: T.surface, border: `1px solid ${T.line}`, boxShadow: '0 34px 70px rgba(20,48,31,.16)' }}>
        <video
          ref={videoRef}
          src="/films/proxypaw-app-tour.mp4"
          poster="/films/proxypaw-app-tour.jpg"
          muted loop playsInline controls preload="none"
          aria-label="A 70-second video of the ProxyPaw app: a cursor moves through all ten screens, from the home screen to a live walk and the community"
          style={{ display: 'block', width: '100%', aspectRatio: '9 / 16', borderRadius: 27, background: T.canvas, objectFit: 'cover' }}
        />
        <div style={{ fontFamily: head, fontWeight: 700, fontSize: 12.5, color: T.muted, textAlign: 'center', padding: '8px 0 4px' }}>The app in 70 seconds</div>
      </div>
    </div>
  );
}
