export interface StorageCell {
  id: string;
  number: number;
  width: number;
  height: number;
  depth: number;
  area: number;
  volume: number;
  floor: number;
  tier: number;
  pricePerMonth: number;
  isAvailable: boolean;
  hasSocket: boolean;
  hasShelves: boolean;
  photos: string[];
}

export interface FilterOptions {
  minArea?: number;
  maxArea?: number;
  minPrice?: number;
  maxPrice?: number;
  floor?: number;
  tier?: number;
  availableOnly: boolean;
  hasShelves?: boolean;
}

export type CellSize = 'small' | 'medium' | 'large' | 'xlarge';

export const CELL_SIZE_LABELS: Record<CellSize, string> = {
  small: 'Маленькая (0.5-2 м²)',
  medium: 'Средняя (2-6 м²)',
  large: 'Большая (6-15 м²)',
  xlarge: 'Очень большая (от 15 м²)',
};

// Расчёт цены: 1500₽ за кубометр, округление до десятков вверх
export const calculatePrice = (volume: number): number => {
  const rawPrice = volume * 1500;
  return Math.ceil(rawPrice / 10) * 10;
};
