import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.kladovka78.ru';

export type Discounts = { 1: number; 3: number; 6: number; 12: number };

const DEFAULT_DISCOUNTS: Discounts = { 1: 0, 3: 5, 6: 10, 12: 15 };

async function fetchDiscounts(): Promise<Discounts> {
  try {
    const res = await fetch(`${API_BASE}/api/settings/discounts`);
    const json = await res.json();
    if (!json.success) return DEFAULT_DISCOUNTS;
    const d = json.data || {};
    return {
      1: Number(d['1'] ?? DEFAULT_DISCOUNTS[1]),
      3: Number(d['3'] ?? DEFAULT_DISCOUNTS[3]),
      6: Number(d['6'] ?? DEFAULT_DISCOUNTS[6]),
      12: Number(d['12'] ?? DEFAULT_DISCOUNTS[12]),
    };
  } catch {
    return DEFAULT_DISCOUNTS;
  }
}

async function saveDiscounts(d: Discounts): Promise<Discounts> {
  const res = await fetch(`${API_BASE}/api/settings/discounts`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(d),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Не удалось сохранить');
  return json.data;
}

export function useDiscounts() {
  return useQuery<Discounts>({
    queryKey: ['settings', 'discounts'],
    queryFn: fetchDiscounts,
    staleTime: 1000 * 60,
    placeholderData: DEFAULT_DISCOUNTS,
  });
}

export function useSaveDiscounts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: saveDiscounts,
    onSuccess: (data) => {
      qc.setQueryData(['settings', 'discounts'], data);
    },
  });
}

export function getDiscountForMonths(d: Discounts, months: number): number {
  if (months >= 12) return d[12];
  if (months >= 6) return d[6];
  if (months >= 3) return d[3];
  return d[1];
}

// ============ Site content settings ============

export interface SiteSettings {
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  heroTitle: string;
  heroSubtitle: string;
  phone: string;
  email: string;
  address: string;
  workHours: string;
  telegram: string;
  whatsapp: string;
  vk: string;
  showPricing: boolean;
  showFAQ: boolean;
  showCatalog: boolean;
  showContacts: boolean;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  seoTitle: 'Кладовка78 — Аренда складских ячеек в Санкт-Петербурге',
  seoDescription: 'Надёжное хранение вещей от 1000₽/мес. Видеонаблюдение 24/7. Удобный доступ.',
  seoKeywords: 'склад, аренда ячейки, хранение вещей, Санкт-Петербург',
  heroTitle: 'Надёжное хранение вещей',
  heroSubtitle: 'Арендуйте складскую ячейку от 1000₽ в месяц с круглосуточным доступом',
  phone: '8 (911) 810-83-83',
  email: 'info@kladovka78.ru',
  address: 'Санкт-Петербург, ул. Алтайская, 21',
  workHours: 'Пн-Вс: 08:00 — 22:00',
  telegram: '',
  whatsapp: '',
  vk: '',
  showPricing: true,
  showFAQ: true,
  showCatalog: true,
  showContacts: true,
};

async function fetchSiteSettings(): Promise<SiteSettings> {
  try {
    const res = await fetch(`${API_BASE}/api/settings/site`);
    const json = await res.json();
    if (!json.success) return DEFAULT_SITE_SETTINGS;
    return { ...DEFAULT_SITE_SETTINGS, ...(json.data || {}) };
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}

async function saveSiteSettings(s: SiteSettings): Promise<SiteSettings> {
  const res = await fetch(`${API_BASE}/api/settings/site`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(s),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Не удалось сохранить');
  return json.data;
}

export function useSiteSettings() {
  return useQuery<SiteSettings>({
    queryKey: ['settings', 'site'],
    queryFn: fetchSiteSettings,
    staleTime: 1000 * 60,
    placeholderData: DEFAULT_SITE_SETTINGS,
  });
}

export function useSaveSiteSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: saveSiteSettings,
    onSuccess: (data) => qc.setQueryData(['settings', 'site'], data),
  });
}

// ============ Site documents ============

import type { SiteDocument } from '@/data/siteDocuments';
import { defaultDocuments } from '@/data/siteDocuments';

async function fetchSiteDocuments(): Promise<SiteDocument[]> {
  try {
    const res = await fetch(`${API_BASE}/api/settings/site-documents`);
    const json = await res.json();
    if (!json.success) return defaultDocuments;
    const data = json.data;
    if (!Array.isArray(data) || data.length === 0) return defaultDocuments;
    return data as SiteDocument[];
  } catch {
    return defaultDocuments;
  }
}

async function saveSiteDocuments(docs: SiteDocument[]): Promise<SiteDocument[]> {
  const res = await fetch(`${API_BASE}/api/settings/site-documents`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(docs),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Не удалось сохранить');
  return json.data;
}

export function useSiteDocuments() {
  return useQuery<SiteDocument[]>({
    queryKey: ['settings', 'site-documents'],
    queryFn: fetchSiteDocuments,
    staleTime: 1000 * 60,
    placeholderData: defaultDocuments,
  });
}

export function useSaveSiteDocuments() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: saveSiteDocuments,
    onSuccess: (data) => qc.setQueryData(['settings', 'site-documents'], data),
  });
}
