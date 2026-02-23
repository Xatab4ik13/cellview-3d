import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchRentals, fetchRental, createRental, extendRental, releaseRental, deleteRental, RentalData } from '@/lib/api';
import { toast } from 'sonner';

export function useRentals(filters?: { status?: string; cell_id?: string; customer_id?: string }) {
  return useQuery<RentalData[]>({
    queryKey: ['rentals', filters],
    queryFn: () => fetchRentals(filters),
    staleTime: 1000 * 60 * 5,
  });
}

export function useRental(id: string | undefined) {
  return useQuery<RentalData>({
    queryKey: ['rentals', id],
    queryFn: () => fetchRental(id!),
    enabled: !!id,
  });
}

export function useCreateRental() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createRental,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rentals'] });
      qc.invalidateQueries({ queryKey: ['cells'] });
      toast.success('Аренда оформлена');
    },
    onError: (e: any) => toast.error(`Ошибка: ${e.message}`),
  });
}

export function useExtendRental() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, months }: { id: string; months: number }) => extendRental(id, months),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rentals'] });
      toast.success('Аренда продлена');
    },
    onError: (e: any) => toast.error(`Ошибка: ${e.message}`),
  });
}

export function useReleaseRental() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: releaseRental,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rentals'] });
      qc.invalidateQueries({ queryKey: ['cells'] });
      toast.success('Ячейка освобождена');
    },
    onError: (e: any) => toast.error(`Ошибка: ${e.message}`),
  });
}

export function useDeleteRental() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteRental,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rentals'] });
      toast.success('Аренда удалена');
    },
    onError: (e: any) => toast.error(`Ошибка: ${e.message}`),
  });
}
