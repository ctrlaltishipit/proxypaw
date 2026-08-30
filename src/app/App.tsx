/**
 * Proxypaw public site — waitlist phase, now with real URLs.
 *
 * Routes: / /about /tour /blog /blog/:slug, plus /admin — the founder's
 * private dashboard (never linked from the site, noindex, robots-disallowed,
 * and gated server-side by the admin-stats Edge Function).
 *
 * The full app screens (Dashboard, BookingPage, …) remain in the repo but
 * unreachable while access is waitlist-only; they appear publicly only as
 * screenshots on the tour page.
 */
import { Suspense, lazy, useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import BlogPage from './components/BlogPage';
import TourPage from './components/TourPage';
import AboutUsPage from './components/AboutUsPage';
import WaitlistModal from './components/WaitlistModal';
import SiteFooter, { type FooterNav } from './components/SiteFooter';
import { ThemeProvider } from './contexts/ThemeContext';
import { useSeo } from './lib/seo';
import { getArticle } from './data/articles';

// Lazy: keeps supabase-js and the dashboard out of the public bundle.
const AdminPage = lazy(() => import('./components/AdminPage'));

type JoinFn = (source: string, intent?: 'owner' | 'walker') => void;

function ScrollManager() {
  const location = useLocation();
  useEffect(() => {
    const target = (location.state as { scrollTo?: string } | null)?.scrollTo;
    if (target) {
      requestAnimationFrame(() => requestAnimationFrame(() => {
        document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }));
    } else {
      window.scrollTo({ top: 0 });
    }
  }, [location.pathname, location.state]);
  return null;
}

function Home({ onJoin }: { onJoin: JoinFn }) {
  const navigate = useNavigate();
  useSeo({
    title: "Proxypaw — Your Neighbours. Your Pets' Best Friends.",
    description: 'Verified neighbours for dog walks, cat home visits and overnight boarding, inside your gated community in Hyderabad. From ₹149.',
    path: '/',
  });
  return (
    <LandingPage
      onJoin={onJoin}
      onBlogClick={() => navigate('/blog')}
      onTourClick={() => navigate('/tour')}
      onAboutClick={() => navigate('/about')}
    />
  );
}

function About({ onJoin }: { onJoin: JoinFn }) {
  const navigate = useNavigate();
  useSeo({
    title: 'About Proxypaw — every pet deserves a safe space',
    description: "Our vision, the founder's story, Pablo and Leo, and the six verification gates behind every Proxypaw volunteer.",
    path: '/about',
  });
  return <AboutUsPage onHomeClick={() => navigate('/')} onJoin={onJoin} onBlogClick={() => navigate('/blog')} />;
}

function Tour({ onJoin }: { onJoin: JoinFn }) {
  const navigate = useNavigate();
  useSeo({
    title: 'Inside the Proxypaw app',
    description: 'Real screens from the Proxypaw app: dashboard, verified walkers, 30-second booking, UPI checkout, live GPS tracking and safety training.',
    path: '/tour',
  });
  return <TourPage onHomeClick={() => navigate('/')} onJoin={onJoin} onAboutClick={() => navigate('/about')} />;
}

function Blog({ onJoin }: { onJoin: JoinFn }) {
  const navigate = useNavigate();
  const { slug } = useParams();
  const article = slug ? getArticle(slug) : undefined;

  useSeo(
    article
      ? { title: `${article.title} — The Paw Journal`, description: article.dek, path: `/blog/${article.slug}` }
      : {
          title: 'The Paw Journal — care guides from Proxypaw',
          description: 'Short, practical pet-care reads for flat-dwellers: grooming, feeding, safety, walking and play, for dogs and cats alike.',
          path: '/blog',
        },
  );

  // An unknown slug falls back to the index rather than a dead page.
  if (slug && !article) return <Navigate to="/blog" replace />;

  return (
    <BlogPage
      slug={slug}
      onOpenArticle={(s) => navigate(`/blog/${s}`)}
      onBackToIndex={() => navigate('/blog')}
      onTourClick={() => navigate('/tour')}
      onHomeClick={() => navigate('/')}
      onGetStarted={() => onJoin('blog')}
    />
  );
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [waitlist, setWaitlist] = useState<{ open: boolean; source: string; intent: 'owner' | 'walker' }>({
    open: false,
    source: 'site',
    intent: 'owner',
  });

  const openWaitlist: JoinFn = (source, intent = 'owner') =>
    setWaitlist({ open: true, source, intent });

  const footerNav: FooterNav = {
    toSection: (id) => navigate('/', { state: { scrollTo: id } }),
    toTour: () => navigate('/tour'),
    toBlog: () => navigate('/blog'),
    toAbout: () => navigate('/about'),
    onJoin: openWaitlist,
  };

  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <ThemeProvider>
      <div className="min-h-screen">
        <ScrollManager />
        <Routes>
          <Route path="/" element={<Home onJoin={openWaitlist} />} />
          <Route path="/about" element={<About onJoin={openWaitlist} />} />
          <Route path="/tour" element={<Tour onJoin={openWaitlist} />} />
          <Route path="/blog" element={<Blog onJoin={openWaitlist} />} />
          <Route path="/blog/:slug" element={<Blog onJoin={openWaitlist} />} />
          <Route
            path="/admin"
            element={
              <Suspense fallback={<div style={{ minHeight: '100vh', background: '#f6f1e7' }} />}>
                <AdminPage />
              </Suspense>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {!isAdmin && <SiteFooter nav={footerNav} />}

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
