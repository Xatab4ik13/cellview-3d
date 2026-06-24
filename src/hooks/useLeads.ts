import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.kladovka78.ru';

export type LeadStatus = 'new' | 'in_progress' | 'done' | 'cancelled';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  size?: string | null;
  message?: string | null;
  source?: string | null;
  status: LeadStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.error || 'Ошибка сервера');
  return json.data as T;
}

export function useLeads(status?: LeadStatus | 'all') {
  return useQuery<Lead[]>({
    queryKey: ['leads', status || 'all'],
    queryFn: () => api<Lead[]>(`/api/leads${status && status !== 'all' ? `?status=${status}` : ''}`),
    refetchInterval: 30_000,
  });
}

export function useUpdateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...patch }: { id: string; status?: LeadStatus; notes?: string }) =>
      api<void>(`/api/leads/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Заявка обновлена');
    },
    onError: (e: any) => toast.error(e.message || 'Не удалось обновить'),
  });
}

export function useDeleteLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api<void>(`/api/leads/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Заявка удалена');
    },
    onError: (e: any) => toast.error(e.message || 'Не удалось удалить'),
  });
}
