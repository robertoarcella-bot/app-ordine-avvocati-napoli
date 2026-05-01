/**
 * Client HTTP per l'API REST di WordPress (sito COA Napoli).
 * Gestisce news, pagine, media, ricerche.
 */

import { SITE, NEWS_PER_PAGE } from '../config/site';

export interface NewsItem {
  id: number;
  date: string;
  title: string;
  excerpt: string;
  link: string;
  contentHtml?: string;
  featuredImageUrl?: string;
  categories: number[];
}

interface WpPostRaw {
  id: number;
  date: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content?: { rendered: string };
  link: string;
  featured_media: number;
  categories: number[];
  _embedded?: {
    'wp:featuredmedia'?: Array<{ source_url: string }>;
  };
}

const decodeEntities = (s: string): string => {
  if (typeof window === 'undefined' || !window.document) return s;
  const ta = document.createElement('textarea');
  ta.innerHTML = s;
  return ta.value;
};

const stripTags = (html: string): string =>
  html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

const mapPost = (p: WpPostRaw): NewsItem => ({
  id: p.id,
  date: p.date,
  title: decodeEntities(stripTags(p.title?.rendered || '')),
  excerpt: decodeEntities(stripTags(p.excerpt?.rendered || '')),
  contentHtml: p.content?.rendered,
  link: p.link,
  featuredImageUrl: p._embedded?.['wp:featuredmedia']?.[0]?.source_url,
  categories: p.categories || [],
});

export interface FetchNewsOptions {
  page?: number;
  perPage?: number;
  search?: string;
}

export async function fetchNews(opts: FetchNewsOptions = {}): Promise<NewsItem[]> {
  const page = opts.page ?? 1;
  const perPage = opts.perPage ?? NEWS_PER_PAGE;
  const params = new URLSearchParams({
    per_page: String(perPage),
    page: String(page),
    _embed: 'wp:featuredmedia',
  });
  if (opts.search) params.set('search', opts.search);

  const url = `${SITE.wpApi}/posts?${params.toString()}`;
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} su ${url}`);
  }
  const data = (await res.json()) as WpPostRaw[];
  return data.map(mapPost);
}

export async function fetchNewsById(id: number): Promise<NewsItem | null> {
  const url = `${SITE.wpApi}/posts/${id}?_embed=wp:featuredmedia`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) return null;
  const data = (await res.json()) as WpPostRaw;
  return mapPost(data);
}
