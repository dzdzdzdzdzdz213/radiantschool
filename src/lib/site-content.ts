import { supabase } from '@/lib/supabase';

export interface SiteIdentity {
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  maps_url: string;
  facebook: string;
  instagram: string;
  linkedin: string;
}

export const DEFAULT_IDENTITY: SiteIdentity = {
  tagline: "L'excellence en soutien scolaire",
  phone: '+213 779 89 34 02',
  whatsapp: '+213 779 89 34 02',
  email: 'contact@radiant.dz',
  address: 'Bordj El Bahri, Alger',
  maps_url: 'https://www.google.com/maps/search/Radiant+Academy+Bordj+El+Bahri+Alger/',
  facebook: 'https://www.facebook.com/radiantacademy.dz',
  instagram: 'https://www.instagram.com/radiantacademy.dz',
  linkedin: 'https://www.linkedin.com/company/radiantacademy-dz',
};

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
}

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  years: string;
  photo_url: string | null;
  sort_order: number;
  is_active: boolean;
}

export async function fetchSiteIdentity(): Promise<SiteIdentity> {
  const { data, error } = await supabase.from('system_settings').select('value').eq('key', 'site_identity').maybeSingle();
  if (error || !data) return DEFAULT_IDENTITY;
  return { ...DEFAULT_IDENTITY, ...(data.value as Partial<SiteIdentity>) };
}

export async function fetchPublicFaqs(): Promise<FaqItem[]> {
  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true });
  if (error || !data) return [];
  return data as FaqItem[];
}

export async function fetchPublicTeam(): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true });
  if (error || !data) return [];
  return data as TeamMember[];
}
