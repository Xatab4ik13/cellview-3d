import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCustomers, fetchCustomer, createCustomer, updateCustomer, deleteCustomer, CustomerData } from '@/lib/api';
import { toast } from 'sonner';

export function useCustomers(search?: string, type?: string) {
  return useQuery<CustomerData[]>({
    queryKey: ['customers', search, type],
    queryFn: () => fetchCustomers(search, type),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCustomer(id: string | undefined) {
  return useQuery<CustomerData>({
    queryKey: ['customers', id],
    queryFn: () => fetchCustomer(id!),
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Клиент создан');
    },
    onError: (e: any) => toast.error(`Ошибка: ${e.message}`),
  });
}

export function useUpdateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CustomerData> }) => updateCustomer(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Клиент обновлён');
    },
    onError: (e: any) => toast.error(`Ошибка: ${e.message}`),
  });
}

export function useDeleteCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Клиент удалён');
    },
    onError: (e: any) => toast.error(`Ошибка: ${e.message}`),
  });
}
