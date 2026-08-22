import { Globe } from 'lucide-react';

export interface SocialUrls {
  facebook_url?: string | null;
  instagram_url?: string | null;
  linkedin_url?: string | null;
  twitter_url?: string | null;
  youtube_url?: string | null;
  tiktok_url?: string | null;
  website_url?: string | null;
}

const ICON_CLASS = 'h-4 w-4';

const icons: { key: keyof SocialUrls; label: string; icon: React.ReactNode; color: string }[] = [
  { key: 'facebook_url', label: 'Facebook', color: '#1877f2', icon: <svg viewBox="0 0 24 24" fill="currentColor" className={ICON_CLASS}><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z"/></svg> },
  { key: 'instagram_url', label: 'Instagram', color: '#e4405f', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={ICON_CLASS}><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/></svg> },
  { key: 'linkedin_url', label: 'LinkedIn', color: '#0a66c2', icon: <svg viewBox="0 0 24 24" fill="currentColor" className={ICON_CLASS}><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.55V9h3.57v11.45Z"/></svg> },
  { key: 'twitter_url', label: 'Twitter / X', color: '#000000', icon: <svg viewBox="0 0 24 24" fill="currentColor" className={ICON_CLASS}><path d="M18.9 2.2h3.68l-8.04 9.19L24 23.8h-7.4l-5.8-7.58-6.63 7.58H.49l8.6-9.83L0 2.2h7.59l5.24 6.93L18.9 2.2Zm-1.29 19.4h2.04L6.48 4.24H4.3l13.31 17.36Z"/></svg> },
  { key: 'youtube_url', label: 'YouTube', color: '#ff0000', icon: <svg viewBox="0 0 24 24" fill="currentColor" className={ICON_CLASS}><path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81ZM9.55 15.57V8.43L15.82 12l-6.27 3.57Z"/></svg> },
  { key: 'tiktok_url', label: 'TikTok', color: '#010101', icon: <svg viewBox="0 0 24 24" fill="currentColor" className={ICON_CLASS}><path d="M19.32 5.56a5.1 5.1 0 0 1-3.05-1.06 5.1 5.1 0 0 1-1.9-3.08h-3.2v13.16a2.98 2.98 0 1 1-2.98-2.98c.31 0 .6.05.89.13V8.52a6.3 6.3 0 0 0-.89-.06 6.18 6.18 0 1 0 6.18 6.18V9.77a8.3 8.3 0 0 0 4.63 1.4V7.98a5.2 5.2 0 0 1-1.68-.28V5.56Z"/></svg> },
  { key: 'website_url', label: 'Site web', color: 'var(--primary)', icon: <Globe className={ICON_CLASS} /> },
];

export function getSocialLinks(urls: SocialUrls | null | undefined) {
  return icons
    .map((s) => ({ ...s, href: urls?.[s.key] }))
    .filter((s): s is typeof s & { href: string } => !!s.href && s.href.trim().length > 0);
}

interface SocialLinksProps {
  urls: SocialUrls | null | undefined;
  size?: 'sm' | 'md';
  className?: string;
}

export default function SocialLinks({ urls, size = 'md', className = '' }: SocialLinksProps) {
  const links = getSocialLinks(urls);
  if (links.length === 0) return null;
  const btnClass = size === 'sm' ? 'h-8 w-8' : 'h-9 w-9';
  const iconScale = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {links.map((link) => (
        <a
          key={link.key}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          title={link.label}
          onClick={(e) => e.stopPropagation()}
          className={`flex items-center justify-center rounded-full border transition-transform duration-200 hover:scale-110 ${btnClass}`}
          style={{ borderColor: 'var(--border)', color: link.color }}
        >
          <span style={{ width: iconScale, height: iconScale }}>{link.icon}</span>
        </a>
      ))}
    </div>
  );
}

export function hasSocialLinks(urls: SocialUrls | null | undefined): boolean {
  return getSocialLinks(urls).length > 0;
}

export const socialFieldList = [
  { key: 'facebook_url', label: 'Facebook' },
  { key: 'instagram_url', label: 'Instagram' },
  { key: 'linkedin_url', label: 'LinkedIn' },
  { key: 'twitter_url', label: 'Twitter / X' },
  { key: 'youtube_url', label: 'YouTube' },
  { key: 'tiktok_url', label: 'TikTok' },
  { key: 'website_url', label: 'Site web' },
] as const;

export function normalizeSocialUrl(key: keyof SocialUrls, value: string): string {
  const v = value.trim();
  if (!v) return '';
  if (/^https?:\/\//i.test(v)) return v;
  if (key === 'website_url') return `https://${v}`;
  const platform = key.replace('_url', '');
  return `https://${platform}.com/${v.replace(/^@/, '')}`;
}