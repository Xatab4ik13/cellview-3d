import { StorageCell } from '@/types/storage';

// Импорт фотографий ячеек
import cell1Photo1 from '@/assets/cells/cell-1-photo-1.jpg';
import cell1Photo2 from '@/assets/cells/cell-1-photo-2.jpg';

// Данные ячеек
export const storageCells: StorageCell[] = [
  {
    id: 'cell-1',
    number: 1,
    width: 1.25,
    height: 2.5,
    depth: 1.5,
    area: 1.875,
    volume: 4.69,
    floor: 1,
    tier: 1,
    pricePerMonth: 3000,
    isAvailable: true,
    hasSocket: false,
    hasShelves: false,
    photos: [cell1Photo1, cell1Photo2],
  },
];

export const getCellsBySize = (cells: StorageCell[]) => {
  return {
    small: cells.filter(c => c.area < 2),
    medium: cells.filter(c => c.area >= 2 && c.area < 6),
    large: cells.filter(c => c.area >= 6 && c.area < 15),
    xlarge: cells.filter(c => c.area >= 15),
  };
};

export const getMinMaxPrices = (cells: StorageCell[]) => {
  const prices = cells.map(c => c.pricePerMonth);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
};
