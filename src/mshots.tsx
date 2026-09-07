// TEMPORARY-style capture harness for the mobile app mockups (dev only).
// Open /mshots.html?s=home|services|pet|walkers|booking|payment|track
import { createRoot } from 'react-dom/client';
import { MOBILE_SCREENS } from './mobile/screens';
import './styles/index.css';

const key = new URLSearchParams(location.search).get('s') ?? 'home';
const Screen = MOBILE_SCREENS[key];

createRoot(document.getElementById('root')!).render(
  <div style={{ width: 390, height: 844, overflow: 'hidden' }}>
    {Screen ? <Screen /> : <div>unknown screen: {key}</div>}
  </div>,
);
