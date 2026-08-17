import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCells, fetchCell, createCell, updateCell, deleteCell, reserveCell, cancelCellReservation, type ReserveCellPayload } from '@/lib/api';
import { StorageCell } from '@/types/storage';
import { toast } from 'sonner';

/**
 * Хук для получения всех ячеек.
 */
export function useCells() {
  return useQuery<StorageCell[]>({
    queryKey: ['cells'],
    queryFn: fetchCells,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

/**
 * Хук для получения одной ячейки.
 */
export function useCell(id: string | undefined) {
  return useQuery<StorageCell>({
    queryKey: ['cells', id],
    queryFn: () => fetchCell(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Хук для создания ячейки.
 */
export function useCreateCell() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCell,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cells'] });
      toast.success('Ячейка успешно создана');
    },
    onError: (error: any) => {
      toast.error(`Ошибка при создании: ${error.message}`);
    },
  });
}

/**
 * Хук для обновления ячейки.
 */
export function useUpdateCell() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, cell }: { id: string; cell: Partial<StorageCell> }) => updateCell(id, cell),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cells'] });
      queryClient.invalidateQueries({ queryKey: ['cells', variables.id] });
      toast.success('Данные ячейки обновлены');
    },
    onError: (error: any) => {
      toast.error(`Ошибка при обновлении: ${error.message}`);
    },
  });
}

/**
 * Хук для удаления ячейки.
 */
export function useDeleteCell() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCell,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cells'] });
      toast.success('Ячейка удалена');
    },
    onError: (error: any) => {
      toast.error(`Ошибка при удалении: ${error.message}`);
    },
  });
}

/**
 * Хук для бронирования ячейки (CRM).
 */
export function useReserveCell() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ReserveCellPayload }) => reserveCell(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cells'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Ячейка забронирована');
    },
    onError: (error: any) => {
      toast.error(`Не удалось забронировать: ${error.message}`);
    },
  });
}

/**
 * Хук для снятия брони с ячейки (CRM).
 */
export function useCancelCellReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelCellReservation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cells'] });
      toast.success('Бронь снята');
    },
    onError: (error: any) => {
      toast.error(`Не удалось снять бронь: ${error.message}`);
    },
  });
}
