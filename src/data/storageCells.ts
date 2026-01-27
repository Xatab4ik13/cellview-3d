import { StorageCell } from '@/types/storage';

// Импорт фотографий ячеек
import cell1Photo1 from '@/assets/cells/cell-1-photo-1.jpg';
import cell1Photo2 from '@/assets/cells/cell-1-photo-2.jpg';
import cell2Photo1 from '@/assets/cells/cell-2-photo-1.jpg';
import cell2Photo2 from '@/assets/cells/cell-2-photo-2.jpg';
import cell3Photo1 from '@/assets/cells/cell-3-photo-1.jpg';
import cell3Photo2 from '@/assets/cells/cell-3-photo-2.jpg';
import cell4Photo1 from '@/assets/cells/cell-4-photo-1.jpg';
import cell4Photo2 from '@/assets/cells/cell-4-photo-2.jpg';
import cell5Photo1 from '@/assets/cells/cell-5-photo-1.jpg';
import cell6Photo1 from '@/assets/cells/cell-6-photo-1.jpg';
import cell6Photo2 from '@/assets/cells/cell-6-photo-2.jpg';
import cell7Photo1 from '@/assets/cells/cell-7-photo-1.jpg';
import cell7Photo2 from '@/assets/cells/cell-7-photo-2.jpg';
import cell8Photo1 from '@/assets/cells/cell-8-photo-1.jpg';
import cell8Photo2 from '@/assets/cells/cell-8-photo-2.jpg';
import cell9Photo1 from '@/assets/cells/cell-9-photo-1.jpg';
import cell9Photo2 from '@/assets/cells/cell-9-photo-2.jpg';
import cell10Photo1 from '@/assets/cells/cell-10-photo-1.jpg';
import cell11Photo1 from '@/assets/cells/cell-11-photo-1.jpg';
import cell11Photo2 from '@/assets/cells/cell-11-photo-2.jpg';
import cell12Photo1 from '@/assets/cells/cell-12-photo-1.jpg';
import cell12Photo2 from '@/assets/cells/cell-12-photo-2.jpg';
import cell13Photo1 from '@/assets/cells/cell-13-photo-1.jpg';
import cell13Photo2 from '@/assets/cells/cell-13-photo-2.jpg';
import cell14Photo1 from '@/assets/cells/cell-14-photo-1.jpg';
import cell14Photo2 from '@/assets/cells/cell-14-photo-2.jpg';
import cell15Photo1 from '@/assets/cells/cell-15-photo-1.jpg';
import cell15Photo2 from '@/assets/cells/cell-15-photo-2.jpg';

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
  {
    id: 'cell-2',
    number: 2,
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
    photos: [cell2Photo1, cell2Photo2],
  },
  {
    id: 'cell-3',
    number: 3,
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
    photos: [cell3Photo1, cell3Photo2],
  },
  {
    id: 'cell-4',
    number: 4,
    width: 1.1,
    height: 2.5,
    depth: 1.5,
    area: 1.65,
    volume: 4.13,
    floor: 1,
    tier: 1,
    pricePerMonth: 2700,
    isAvailable: true,
    hasSocket: false,
    hasShelves: false,
    photos: [cell4Photo1, cell4Photo2],
  },
  {
    id: 'cell-5',
    number: 5,
    width: 1.1,
    height: 2.5,
    depth: 1.5,
    area: 1.65,
    volume: 4.13,
    floor: 1,
    tier: 1,
    pricePerMonth: 2700,
    isAvailable: true,
    hasSocket: false,
    hasShelves: false,
    photos: [cell5Photo1],
  },
  {
    id: 'cell-6',
    number: 6,
    width: 1.1,
    height: 1.35,
    depth: 0.6,
    area: 0.66,
    volume: 0.89,
    floor: 1,
    tier: 2,
    pricePerMonth: 1200,
    isAvailable: true,
    hasSocket: false,
    hasShelves: false,
    photos: [cell6Photo1, cell6Photo2],
  },
  {
    id: 'cell-7',
    number: 7,
    width: 1.1,
    height: 1.1,
    depth: 0.6,
    area: 0.66,
    volume: 0.73,
    floor: 1,
    tier: 1,
    pricePerMonth: 1100,
    isAvailable: true,
    hasSocket: false,
    hasShelves: false,
    photos: [cell7Photo1, cell7Photo2],
  },
  {
    id: 'cell-8',
    number: 8,
    width: 1.05,
    height: 1.35,
    depth: 0.6,
    area: 0.63,
    volume: 0.85,
    floor: 1,
    tier: 2,
    pricePerMonth: 1200,
    isAvailable: true,
    hasSocket: false,
    hasShelves: false,
    photos: [cell8Photo1, cell8Photo2],
  },
  {
    id: 'cell-9',
    number: 9,
    width: 1.05,
    height: 1.1,
    depth: 0.6,
    area: 0.63,
    volume: 0.69,
    floor: 1,
    tier: 1,
    pricePerMonth: 1100,
    isAvailable: true,
    hasSocket: false,
    hasShelves: false,
    photos: [cell9Photo1, cell9Photo2],
  },
  {
    id: 'cell-10',
    number: 10,
    width: 1.55,
    height: 2.5,
    depth: 1.3,
    area: 2.02,
    volume: 5.04,
    floor: 1,
    tier: 1,
    pricePerMonth: 3200,
    isAvailable: true,
    hasSocket: false,
    hasShelves: false,
    photos: [cell10Photo1],
  },
  {
    id: 'cell-11',
    number: 11,
    width: 1,
    height: 1.35,
    depth: 1.3,
    area: 1.3,
    volume: 1.76,
    floor: 1,
    tier: 2,
    pricePerMonth: 1800,
    isAvailable: true,
    hasSocket: false,
    hasShelves: false,
    photos: [cell11Photo1, cell11Photo2],
  },
  {
    id: 'cell-12',
    number: 12,
    width: 1,
    height: 1.1,
    depth: 1.3,
    area: 1.3,
    volume: 1.43,
    floor: 1,
    tier: 2,
    pricePerMonth: 1700,
    isAvailable: true,
    hasSocket: false,
    hasShelves: false,
    photos: [cell12Photo1, cell12Photo2],
  },
  {
    id: 'cell-13',
    number: 13,
    width: 1.1,
    height: 1.35,
    depth: 1.3,
    area: 1.43,
    volume: 1.93,
    floor: 1,
    tier: 2,
    pricePerMonth: 2000,
    isAvailable: true,
    hasSocket: false,
    hasShelves: false,
    photos: [cell13Photo1, cell13Photo2],
  },
  {
    id: 'cell-14',
    number: 14,
    width: 1.1,
    height: 1.1,
    depth: 1.3,
    area: 1.43,
    volume: 1.57,
    floor: 1,
    tier: 1,
    pricePerMonth: 1900,
    isAvailable: true,
    hasSocket: false,
    hasShelves: false,
    photos: [cell14Photo1, cell14Photo2],
  },
  {
    id: 'cell-15',
    number: 15,
    width: 1,
    height: 1.35,
    depth: 1.3,
    area: 1.3,
    volume: 1.76,
    floor: 1,
    tier: 2,
    pricePerMonth: 1800,
    isAvailable: true,
    hasSocket: false,
    hasShelves: false,
    photos: [cell15Photo1, cell15Photo2],
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
