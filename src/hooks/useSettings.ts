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
