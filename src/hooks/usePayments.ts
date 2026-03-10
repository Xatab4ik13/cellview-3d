import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPayments, createCashPayment, PaymentData } from '@/lib/api';
import { toast } from 'sonner';

export function usePayments(filters?: { status?: string; customer_id?: string }) {
  return useQuery<PaymentData[]>({
    queryKey: ['payments', filters],
    queryFn: () => fetchPayments(filters),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateCashPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCashPayment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] });
      qc.invalidateQueries({ queryKey: ['rentals'] });
      qc.invalidateQueries({ queryKey: ['cells'] });
      toast.success('Наличная оплата зарегистрирована, аренда активирована');
    },
    onError: (e: any) => toast.error(`Ошибка: ${e.message}`),
  });
}
