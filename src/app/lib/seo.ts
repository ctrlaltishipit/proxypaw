/**
 * Per-route SEO: title, description, canonical and robots, set imperatively.
 * Google renders JS, so these are picked up at index time; /admin also sits
 * behind robots.txt Disallow and is absent from the sitemap.
 */
import { useEffect } from 'react';

const ORIGIN = 'https://www.proxypaw.com';

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function useSeo(opts: { title: string; description: string; path: string; noindex?: boolean }) {
  useEffect(() => {
    document.title = opts.title;
    upsertMeta('name', 'description', opts.description);
    upsertMeta('property', 'og:title', opts.title);
    upsertMeta('property', 'og:description', opts.description);
    upsertMeta('property', 'og:url', ORIGIN + opts.path);
    upsertMeta('name', 'robots', opts.noindex ? 'noindex, nofollow' : 'index, follow');

    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = ORIGIN + opts.path;
  }, [opts.title, opts.description, opts.path, opts.noindex]);
}
