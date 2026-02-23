import { StorageCell } from '@/types/storage';

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.kladovka78.ru';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  const json: ApiResponse<T> = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Ошибка сервера');
  }

  return json.data;
}

// ============ Ячейки ============

export async function fetchCells(): Promise<StorageCell[]> {
  return fetchApi<StorageCell[]>('/api/cells');
}

export async function fetchCell(id: string): Promise<StorageCell> {
  return fetchApi<StorageCell>(`/api/cells/${id}`);
}

export async function createCell(cell: Partial<StorageCell>): Promise<void> {
  await fetchApi('/api/cells', {
    method: 'POST',
    body: JSON.stringify(cell),
  });
}

export async function updateCell(id: string, data: Partial<StorageCell>): Promise<void> {
  await fetchApi(`/api/cells/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteCell(id: string): Promise<void> {
  await fetchApi(`/api/cells/${id}`, {
    method: 'DELETE',
  });
}

// ============ Health ============

export async function checkHealth(): Promise<{ status: string; services: Record<string, string> }> {
  return fetchApi('/api/health');
}
