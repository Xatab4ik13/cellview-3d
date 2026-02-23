import { useQuery } from '@tanstack/react-query';
import { fetchCells, fetchCell } from '@/lib/api';
import { StorageCell } from '@/types/storage';
// Fallback to local data while API is being set up
import { storageCells as localCells } from '@/data/storageCells';

/**
 * Хук для получения всех ячеек.
 * Пытается загрузить с API, при ошибке использует локальные данные.
 */
export function useCells() {
  return useQuery<StorageCell[]>({
    queryKey: ['cells'],
    queryFn: fetchCells,
    staleTime: 1000 * 60 * 5, // 5 минут кеш
    retry: 1,
    // Fallback на локальные данные при ошибке API
    placeholderData: localCells,
  });
}

/**
 * Хук для получения одной ячейки.
 */
export function useCell(id: string) {
  return useQuery<StorageCell>({
    queryKey: ['cells', id],
    queryFn: () => fetchCell(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
