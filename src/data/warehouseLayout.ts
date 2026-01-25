import { StorageCell } from '@/types/storage';

// Данные ячеек согласно плану склада
// Зоны: 1-26.5м², 3-47.7м², 4-4.4м², 5-40.6м², 6-138м², 7-62.31м², 8-3.12м², 9-62.04м², 10-4.5м²

export const warehouseZones = [
  { id: 1, totalArea: 26.5, description: 'Малые ячейки' },
  { id: 3, totalArea: 47.7, description: 'Средние ячейки по полу 21.4м², второй ярус 18м², всего 39.4м²' },
  { id: 4, totalArea: 4.4, description: 'Малые ячейки' },
  { id: 5, totalArea: 40.6, description: 'Средние ячейки по полу 19.5м², второй ярус 19.5м², всего 39м²' },
  { id: 6, totalArea: 138.04, description: 'Большая зона, по полу 100.3м², второй ярус 4.2м², всего 104.5м²' },
  { id: 7, totalArea: 62.31, description: 'Средние ячейки по полу 40.05м², второй ярус 29м², всего 69м²' },
  { id: 8, totalArea: 3.12, description: 'Малые ячейки' },
  { id: 9, totalArea: 62.04, description: 'Средние ячейки по полу 38м², второй ярус 19м², всего 57м²' },
  { id: 10, totalArea: 4.5, description: 'Малые ячейки' },
];

// Полная карта всех ячеек на основе плана
export const warehouseCells: StorageCell[] = [
  // ===== ЗОНА 1 (26.5 м²) - левый нижний угол =====
  { id: 'z1-1', number: 101, width: 1.4, height: 2.0, depth: 1.4, area: 1.9, volume: 3.9, floor: 1, tier: 1, pricePerMonth: 2500, isAvailable: true, hasSocket: false, hasShelves: false, position: { x: -18, y: 0, z: -8 } },
  { id: 'z1-2', number: 102, width: 1.6, height: 2.0, depth: 1.4, area: 2.0, volume: 4.5, floor: 1, tier: 1, pricePerMonth: 2700, isAvailable: true, hasSocket: false, hasShelves: false, position: { x: -16.5, y: 0, z: -8 } },
  { id: 'z1-3', number: 103, width: 0.5, height: 2.0, depth: 1.0, area: 0.5, volume: 1.0, floor: 1, tier: 1, pricePerMonth: 1200, isAvailable: true, hasSocket: false, hasShelves: false, position: { x: -15, y: 0, z: -8 } },
  { id: 'z1-4', number: 104, width: 0.5, height: 2.0, depth: 1.0, area: 0.5, volume: 1.0, floor: 1, tier: 2, pricePerMonth: 1200, isAvailable: false, hasSocket: false, hasShelves: false, position: { x: -15, y: 2.1, z: -8 } },

  // ===== ЗОНА 3 (47.7 м²) - верхний левый блок =====
  { id: 'z3-1', number: 301, width: 1.7, height: 2.5, depth: 1.5, area: 3.1, volume: 6.4, floor: 1, tier: 1, pricePerMonth: 3500, isAvailable: true, hasSocket: true, hasShelves: false, position: { x: -18, y: 0, z: 2 } },
  { id: 'z3-2', number: 302, width: 1.2, height: 1.5, depth: 1.0, area: 1.08, volume: 1.8, floor: 1, tier: 2, pricePerMonth: 1900, isAvailable: true, hasSocket: false, hasShelves: true, position: { x: -18, y: 2.6, z: 2 } },
  { id: 'z3-3', number: 303, width: 1.2, height: 1.5, depth: 1.0, area: 1.08, volume: 1.8, floor: 1, tier: 2, pricePerMonth: 1900, isAvailable: false, hasSocket: false, hasShelves: true, position: { x: -16.7, y: 2.6, z: 2 } },
  { id: 'z3-4', number: 304, width: 1.2, height: 1.5, depth: 1.0, area: 1.08, volume: 1.8, floor: 1, tier: 2, pricePerMonth: 1900, isAvailable: true, hasSocket: false, hasShelves: false, position: { x: -15.4, y: 2.6, z: 2 } },

  // ===== ЗОНА 4 (4.4 м²) =====
  { id: 'z4-1', number: 401, width: 1.7, height: 2.5, depth: 1.2, area: 4.4, volume: 5.1, floor: 1, tier: 1, pricePerMonth: 4200, isAvailable: true, hasSocket: true, hasShelves: true, position: { x: -18, y: 0, z: 5 } },

  // ===== ЗОНА 5 (40.6 м²) - центральный блок =====
  { id: 'z5-1', number: 501, width: 2.2, height: 2.0, depth: 1.75, area: 1.75, volume: 7.7, floor: 1, tier: 1, pricePerMonth: 2800, isAvailable: true, hasSocket: false, hasShelves: false, position: { x: -12, y: 0, z: 2 } },
  { id: 'z5-2', number: 502, width: 2.0, height: 2.0, depth: 1.5, area: 2.2, volume: 6.0, floor: 1, tier: 1, pricePerMonth: 3000, isAvailable: false, hasSocket: true, hasShelves: false, position: { x: -9.5, y: 0, z: 2 } },
  { id: 'z5-3', number: 503, width: 1.5, height: 1.2, depth: 1.0, area: 1.3, volume: 1.8, floor: 1, tier: 2, pricePerMonth: 1800, isAvailable: true, hasSocket: false, hasShelves: true, position: { x: -12, y: 2.1, z: 2 } },
  { id: 'z5-4', number: 504, width: 2.0, height: 2.0, depth: 2.0, area: 4.0, volume: 8.0, floor: 1, tier: 1, pricePerMonth: 4500, isAvailable: true, hasSocket: true, hasShelves: false, position: { x: -7, y: 0, z: 2 } },
  { id: 'z5-5', number: 505, width: 1.5, height: 1.2, depth: 1.0, area: 0.06, volume: 1.8, floor: 1, tier: 2, pricePerMonth: 1500, isAvailable: true, hasSocket: false, hasShelves: false, position: { x: -7, y: 2.1, z: 2 } },

  // ===== ЗОНА 6 (138 м²) - большая центральная зона =====
  { id: 'z6-1', number: 601, width: 2.76, height: 2.5, depth: 2.3, area: 2.76, volume: 15.9, floor: 1, tier: 1, pricePerMonth: 5500, isAvailable: true, hasSocket: true, hasShelves: true, position: { x: 0, y: 0, z: 2 } },
  { id: 'z6-2', number: 602, width: 2.76, height: 2.5, depth: 2.0, area: 2.76, volume: 13.8, floor: 1, tier: 1, pricePerMonth: 5500, isAvailable: false, hasSocket: true, hasShelves: false, position: { x: 3, y: 0, z: 2 } },
  { id: 'z6-3', number: 603, width: 2.76, height: 2.5, depth: 2.0, area: 2.76, volume: 13.8, floor: 1, tier: 1, pricePerMonth: 5500, isAvailable: true, hasSocket: false, hasShelves: false, position: { x: 6, y: 0, z: 2 } },
  { id: 'z6-4', number: 604, width: 2.6, height: 2.5, depth: 1.2, area: 2.6, volume: 7.8, floor: 1, tier: 1, pricePerMonth: 4200, isAvailable: true, hasSocket: false, hasShelves: true, position: { x: 9, y: 0, z: 2 } },
  { id: 'z6-5', number: 605, width: 3.4, height: 2.5, depth: 1.17, area: 3.4, volume: 9.9, floor: 1, tier: 1, pricePerMonth: 4800, isAvailable: true, hasSocket: true, hasShelves: false, position: { x: 12, y: 0, z: 2 } },
  { id: 'z6-6', number: 606, width: 2.3, height: 1.2, depth: 1.0, area: 2.3, volume: 2.8, floor: 1, tier: 2, pricePerMonth: 2500, isAvailable: true, hasSocket: false, hasShelves: true, position: { x: 12, y: 2.6, z: 2 } },
  { id: 'z6-7', number: 607, width: 2.9, height: 2.5, depth: 1.08, area: 2.9, volume: 7.8, floor: 1, tier: 1, pricePerMonth: 4500, isAvailable: false, hasSocket: false, hasShelves: false, position: { x: 15, y: 0, z: 2 } },
  { id: 'z6-8', number: 608, width: 7.6, height: 3.0, depth: 3.3, area: 7.6, volume: 75.2, floor: 1, tier: 1, pricePerMonth: 8500, isAvailable: true, hasSocket: true, hasShelves: true, position: { x: 18, y: 0, z: 2 } },

  // ===== ЗОНА 7 (62.31 м²) - правый верхний угол =====
  { id: 'z7-1', number: 701, width: 3.12, height: 2.5, depth: 2.2, area: 3.0, volume: 17.2, floor: 1, tier: 1, pricePerMonth: 4500, isAvailable: true, hasSocket: true, hasShelves: false, position: { x: 18, y: 0, z: -6 } },
  { id: 'z7-2', number: 702, width: 2.2, height: 1.5, depth: 1.45, area: 2.2, volume: 4.8, floor: 1, tier: 2, pricePerMonth: 3200, isAvailable: false, hasSocket: false, hasShelves: true, position: { x: 18, y: 2.6, z: -6 } },
  { id: 'z7-3', number: 703, width: 1.4, height: 1.5, depth: 1.0, area: 1.4, volume: 2.1, floor: 1, tier: 2, pricePerMonth: 2100, isAvailable: true, hasSocket: false, hasShelves: false, position: { x: 20.5, y: 2.6, z: -6 } },

  // ===== ЗОНА 8 (3.12 м²) =====
  { id: 'z8-1', number: 801, width: 3.12, height: 2.0, depth: 1.0, area: 3.12, volume: 6.2, floor: 1, tier: 1, pricePerMonth: 3800, isAvailable: true, hasSocket: false, hasShelves: true, position: { x: 18, y: 0, z: -10 } },

  // ===== ЗОНА 9 (62.04 м²) - правый средний блок =====
  { id: 'z9-1', number: 901, width: 1.28, height: 2.0, depth: 1.8, area: 1.28, volume: 4.6, floor: 1, tier: 1, pricePerMonth: 2800, isAvailable: true, hasSocket: false, hasShelves: false, position: { x: 8, y: 0, z: -6 } },
  { id: 'z9-2', number: 902, width: 2.6, height: 2.0, depth: 1.23, area: 2.6, volume: 6.4, floor: 1, tier: 1, pricePerMonth: 3500, isAvailable: false, hasSocket: true, hasShelves: false, position: { x: 10, y: 0, z: -6 } },
  { id: 'z9-3', number: 903, width: 1.9, height: 2.0, depth: 1.17, area: 1.9, volume: 4.4, floor: 1, tier: 1, pricePerMonth: 3000, isAvailable: true, hasSocket: false, hasShelves: true, position: { x: 12.5, y: 0, z: -6 } },
  { id: 'z9-4', number: 904, width: 2.06, height: 1.5, depth: 1.0, area: 2.06, volume: 3.1, floor: 1, tier: 2, pricePerMonth: 2600, isAvailable: true, hasSocket: false, hasShelves: false, position: { x: 10, y: 2.1, z: -6 } },
  { id: 'z9-5', number: 905, width: 1.06, height: 1.5, depth: 1.0, area: 1.06, volume: 1.6, floor: 1, tier: 2, pricePerMonth: 1800, isAvailable: true, hasSocket: false, hasShelves: true, position: { x: 12.5, y: 2.1, z: -6 } },

  // ===== ЗОНА 10 (4.5 м²) =====
  { id: 'z10-1', number: 1001, width: 2.0, height: 2.5, depth: 1.25, area: 2.0, volume: 6.3, floor: 1, tier: 1, pricePerMonth: 3200, isAvailable: true, hasSocket: true, hasShelves: false, position: { x: 4, y: 0, z: -8 } },
  { id: 'z10-2', number: 1002, width: 2.0, height: 2.5, depth: 1.5, area: 2.0, volume: 7.5, floor: 1, tier: 1, pricePerMonth: 3200, isAvailable: false, hasSocket: false, hasShelves: true, position: { x: 6.5, y: 0, z: -8 } },

  // ===== ЗОНА 11 (11.6 м²) - центральный левый =====
  { id: 'z11-1', number: 1101, width: 2.0, height: 2.5, depth: 1.33, area: 2.0, volume: 6.7, floor: 1, tier: 1, pricePerMonth: 3400, isAvailable: true, hasSocket: false, hasShelves: false, position: { x: -8, y: 0, z: -6 } },
  { id: 'z11-2', number: 1102, width: 1.9, height: 2.0, depth: 1.4, area: 1.9, volume: 5.3, floor: 1, tier: 1, pricePerMonth: 3000, isAvailable: true, hasSocket: true, hasShelves: true, position: { x: -5.5, y: 0, z: -6 } },
  { id: 'z11-3', number: 1103, width: 1.4, height: 2.0, depth: 1.6, area: 1.4, volume: 4.5, floor: 1, tier: 1, pricePerMonth: 2600, isAvailable: false, hasSocket: false, hasShelves: false, position: { x: -3.5, y: 0, z: -6 } },
  { id: 'z11-4', number: 1104, width: 1.06, height: 1.0, depth: 0.8, area: 1.06, volume: 0.8, floor: 1, tier: 2, pricePerMonth: 1500, isAvailable: true, hasSocket: false, hasShelves: false, position: { x: -5.5, y: 2.1, z: -6 } },

  // ===== Дополнительные ячейки второго яруса (Яч. в 2 ур.) =====
  { id: 'z2-1', number: 201, width: 3.25, height: 1.5, depth: 1.2, area: 3.25, volume: 5.9, floor: 1, tier: 2, pricePerMonth: 3500, isAvailable: true, hasSocket: false, hasShelves: true, position: { x: -12, y: 2.6, z: -4 } },
  { id: 'z2-2', number: 202, width: 1.9, height: 1.5, depth: 1.4, area: 1.9, volume: 4.0, floor: 1, tier: 2, pricePerMonth: 2800, isAvailable: false, hasSocket: false, hasShelves: false, position: { x: -9, y: 2.6, z: -4 } },
];

// Функция для получения всех ячеек
export const getAllCells = (): StorageCell[] => warehouseCells;

// Функция для получения ячейки по ID
export const getCellById = (id: string): StorageCell | undefined => 
  warehouseCells.find(cell => cell.id === id);

// Функция для получения свободных ячеек
export const getAvailableCells = (): StorageCell[] => 
  warehouseCells.filter(cell => cell.isAvailable);

// Статистика склада
export const getWarehouseStats = () => {
  const total = warehouseCells.length;
  const available = warehouseCells.filter(c => c.isAvailable).length;
  const totalArea = warehouseCells.reduce((sum, c) => sum + c.area, 0);
  const availableArea = warehouseCells.filter(c => c.isAvailable).reduce((sum, c) => sum + c.area, 0);
  const minPrice = Math.min(...warehouseCells.map(c => c.pricePerMonth));
  const maxPrice = Math.max(...warehouseCells.map(c => c.pricePerMonth));

  return { total, available, totalArea, availableArea, minPrice, maxPrice };
};
