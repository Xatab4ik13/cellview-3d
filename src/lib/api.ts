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

// ============ Фото ячеек ============

export async function uploadCellPhotos(cellId: string, files: File[]): Promise<{ url: string; sortOrder: number }[]> {
  const formData = new FormData();
  files.forEach(file => formData.append('photos', file));

  const res = await fetch(`${API_BASE}/api/cells/${cellId}/photos`, {
    method: 'POST',
    body: formData,
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Ошибка загрузки фото');
  }
  return json.data;
}

export async function deleteCellPhoto(cellId: string, url: string): Promise<void> {
  await fetchApi(`/api/cells/${cellId}/photos`, {
    method: 'DELETE',
    body: JSON.stringify({ url }),
  });
}

// ============ Клиенты ============

export interface CustomerData {
  id?: string;
  type: 'individual' | 'company';
  name: string;
  phone: string;
  email?: string;
  telegram?: string;
  passportSeries?: string;
  passportNumber?: string;
  companyName?: string;
  inn?: string;
  ogrn?: string;
  contactPerson?: string;
  notes?: string;
  createdAt?: string;
}

export async function fetchCustomers(search?: string, type?: string): Promise<CustomerData[]> {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (type) params.set('type', type);
  const qs = params.toString();
  return fetchApi<CustomerData[]>(`/api/customers${qs ? `?${qs}` : ''}`);
}

export async function fetchCustomer(id: string): Promise<CustomerData> {
  return fetchApi<CustomerData>(`/api/customers/${id}`);
}

export async function createCustomer(data: Partial<CustomerData>): Promise<{ id: string }> {
  return fetchApi<{ id: string }>('/api/customers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCustomer(id: string, data: Partial<CustomerData>): Promise<void> {
  await fetchApi(`/api/customers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteCustomer(id: string): Promise<void> {
  await fetchApi(`/api/customers/${id}`, { method: 'DELETE' });
}

// ============ Аренда ============

export interface RentalData {
  id: string;
  cellId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerType: 'individual' | 'company';
  cellNumber?: number;
  startDate: string;
  endDate: string;
  months: number;
  pricePerMonth: number;
  discount: number;
  totalAmount: number;
  autoRenew: boolean;
  status: 'active' | 'expired' | 'cancelled';
  notes?: string;
  createdAt?: string;
}

export async function fetchRentals(filters?: { status?: string; cell_id?: string; customer_id?: string }): Promise<RentalData[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.cell_id) params.set('cell_id', filters.cell_id);
  if (filters?.customer_id) params.set('customer_id', filters.customer_id);
  const qs = params.toString();
  return fetchApi<RentalData[]>(`/api/rentals${qs ? `?${qs}` : ''}`);
}

export async function fetchRental(id: string): Promise<RentalData> {
  return fetchApi<RentalData>(`/api/rentals/${id}`);
}

export async function createRental(data: {
  cellId: string;
  customerId: string;
  startDate: string;
  months: number;
  pricePerMonth: number;
  discount?: number;
  totalAmount?: number;
  autoRenew?: boolean;
  notes?: string;
}): Promise<{ id: string; endDate: string }> {
  return fetchApi<{ id: string; endDate: string }>('/api/rentals', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function extendRental(id: string, months: number): Promise<{ endDate: string }> {
  return fetchApi<{ endDate: string }>(`/api/rentals/${id}/extend`, {
    method: 'PUT',
    body: JSON.stringify({ months }),
  });
}

export async function releaseRental(id: string): Promise<void> {
  await fetchApi(`/api/rentals/${id}/release`, { method: 'PUT' });
}

export async function deleteRental(id: string): Promise<void> {
  await fetchApi(`/api/rentals/${id}`, { method: 'DELETE' });
}

// ============ Авторизация ============

export interface AuthCustomer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  telegram?: string;
  type: 'individual' | 'company';
}

export async function verifyAuthToken(token: string): Promise<AuthCustomer> {
  return fetchApi<AuthCustomer>('/api/auth/verify-token', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

export async function createAuthSession(): Promise<{ sessionId: string }> {
  return fetchApi<{ sessionId: string }>('/api/auth/session', {
    method: 'POST',
  });
}

export async function pollAuthSession(sessionId: string): Promise<{ status: string; customer?: AuthCustomer }> {
  return fetchApi<{ status: string; customer?: AuthCustomer }>(`/api/auth/session/${sessionId}/status`);
}

export async function fetchAuthMe(customerId: string): Promise<AuthCustomer> {
  return fetchApi<AuthCustomer>('/api/auth/me', {
    headers: { 'X-Customer-Id': customerId },
  });
}

// ============ Health ============

export async function checkHealth(): Promise<{ status: string; services: Record<string, string> }> {
  return fetchApi('/api/health');
}
