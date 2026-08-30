/**
 * Proxypaw public site — waitlist phase.
 *
 * Three public pages (landing, blog, tour) plus the waitlist modal. The full
 * app screens (Dashboard, BookingPage, PaymentScreen, …) are still in
 * src/app/components but deliberately unreachable: while access is
 * waitlist-only, showing them would undercut the waitlist. They appear on the
 * public site only as screenshots on the TourPage. When access opens, restore
 * routing to them from the pre-waitlist version of this file in git history.
 */
import { useState } from 'react';
import LandingPage from './components/LandingPage';
import BlogPage from './components/BlogPage';
import TourPage from './components/TourPage';
import AboutUsPage from './components/AboutUsPage';
import WaitlistModal from './components/WaitlistModal';
import SiteFooter, { type FooterNav } from './components/SiteFooter';
import { ThemeProvider } from './contexts/ThemeContext';

type Page = 'home' | 'blog' | 'tour' | 'about';

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [waitlist, setWaitlist] = useState<{ open: boolean; source: string; intent: 'owner' | 'walker' }>({
    open: false,
    source: 'site',
    intent: 'owner',
  });

  const openWaitlist = (source: string, intent: 'owner' | 'walker' = 'owner') =>
    setWaitlist({ open: true, source, intent });

  const go = (p: Page) => {
    setPage(p);
    window.scrollTo({ top: 0 });
  };

  /** Footer links to landing sections work from any page: route home, then scroll. */
  const toSection = (id: string) => {
    setPage('home');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }));
  };

  const footerNav: FooterNav = {
    toSection,
    toTour: () => go('tour'),
    toBlog: () => go('blog'),
    toAbout: () => go('about'),
    onJoin: openWaitlist,
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen">
        {page === 'home' && (
          <LandingPage
            onJoin={openWaitlist}
            onBlogClick={() => go('blog')}
            onTourClick={() => go('tour')}
            onAboutClick={() => go('about')}
          />
        )}

        {page === 'blog' && (
          <BlogPage
            onHomeClick={() => go('home')}
            onGetStarted={() => openWaitlist('blog')}
          />
        )}

        {page === 'about' && (
          <AboutUsPage
            onHomeClick={() => go('home')}
            onJoin={openWaitlist}
          />
        )}

        {page === 'tour' && (
          <TourPage
            onHomeClick={() => go('home')}
            onJoin={openWaitlist}
          />
        )}

        <SiteFooter nav={footerNav} />

        <WaitlistModal
          open={waitlist.open}
          source={waitlist.source}
          intent={waitlist.intent}
          onClose={() => setWaitlist((w) => ({ ...w, open: false }))}
        />
      </div>
    </ThemeProvider>
  );
}
