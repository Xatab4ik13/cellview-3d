import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Box, CheckCircle2, Filter, Layers, Navigation, Ruler, RotateCcw, Search, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { calculatePrice, CELL_STATUS_LABELS, type CellStatus } from '@/types/storage';
import { useDiscounts } from '@/hooks/useSettings';
import { useIsMobile } from '@/hooks/use-mobile';
import { PLAN_CELLS } from '@/data/storagePlanMap';
import StoragePlanMap2D from '@/components/StoragePlanMap2D';

const API_BASE = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || 'https://api.kladovka78.ru');

type PlanStatus = CellStatus | 'unknown';
type LevelFilter = 'all' | '1' | '2';
type StatusFilter = 'all' | PlanStatus;
type DurationOption = 1 | 3 | 6 | 12;

type PublicCellInfo = {
  id?: string;
  cell?: number;
  number?: number;
  status?: unknown;
  width?: number;
  height?: number;
  depth?: number;
  area?: number;
  volume?: number;
  tier?: number;
  pricePerMonth?: number;
  hasSocket?: boolean;
  hasShelves?: boolean;
};

type DisplayPlanCell = {
  number: number;
  tier: number;
  generated?: boolean;
};

const statusDotStyles: Record<PlanStatus, string> = {
  available: 'bg-secondary-green',
  reserved: 'bg-accent',
  occupied: 'bg-destructive',
  unknown: 'bg-muted-foreground',
};

const statusLabels: Record<PlanStatus, string> = {
  ...CELL_STATUS_LABELS,
  unknown: 'Нет данных',
};

const statusOptions: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'Все' },
  { value: 'available', label: 'Свободные' },
  { value: 'reserved', label: 'Бронь' },
  { value: 'occupied', label: 'Занятые' },
];

const levelOptions: Array<{ value: LevelFilter; label: string }> = [
  { value: 'all', label: 'Все' },
  { value: '1', label: '1 ярус' },
  { value: '2', label: '2 ярус' },
];

const durationOptions: DurationOption[] = [1, 3, 6, 12];

const normalizeStatus = (status: unknown): PlanStatus => {
  const value = String(status || '').toLowerCase();
  if (value === 'available' || value.includes('свобод')) return 'available';
  if (value === 'reserved' || value.includes('брон')) return 'reserved';
  if (value === 'occupied' || value.includes('занят')) return 'occupied';
  return 'unknown';
};

const formatMeters = (value?: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed.toLocaleString('ru-RU') : '—';
};

const getCellNumber = (cell: PublicCellInfo) => {
  const number = Number(cell.number ?? cell.cell);
  return Number.isFinite(number) ? number : null;
};

const getPublicRows = (json: unknown): PublicCellInfo[] => {
  const value = json as { data?: unknown };
  if (Array.isArray(value?.data)) return value.data as PublicCellInfo[];
  return Array.isArray(json) ? json as PublicCellInfo[] : [];
};

const hasAnyStatus = (statuses: Record<number, PlanStatus>) => Object.keys(statuses).length > 0;

const getCellStatus = (number: number, statuses: Record<number, PlanStatus>): PlanStatus => (
  statuses[number] || (hasAnyStatus(statuses) ? 'unknown' : 'available')
);

const StoragePlanSection = () => {
  const navigate = useNavigate();
  const { data: discountSettings } = useDiscounts();
  const planFrameRef = useRef<HTMLIFrameElement | null>(null);
  const [statuses, setStatuses] = useState<Record<number, PlanStatus>>({});
  const [cellDetails, setCellDetails] = useState<Record<number, PublicCellInfo>>({});
  const [modelCells, setModelCells] = useState<DisplayPlanCell[]>(() => PLAN_CELLS.map((c) => ({ number: c.number, tier: c.tier })));
  const isMobile = useIsMobile();
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedDuration, setSelectedDuration] = useState<DurationOption>(1);

  useEffect(() => {
    let isMounted = true;

    const loadStatuses = async () => {
      try {
        let rows: PublicCellInfo[] = [];
        const urls = [
          `${API_BASE}/api/cells/public-status`,
          ...(import.meta.env.DEV ? [`${API_BASE}/api/cells`] : []),
        ];

        for (const url of urls) {
          try {
            const response = await fetch(url);
            if (!response.ok) continue;
            const json = await response.json();
            rows = getPublicRows(json);
            if (rows.length > 0) break;
          } catch {
            continue;
          }
        }

        const nextStatuses: Record<number, PlanStatus> = {};
        const nextDetails: Record<number, PublicCellInfo> = {};
        rows.forEach((row) => {
          const number = getCellNumber(row);
          if (number !== null) {
            nextStatuses[number] = normalizeStatus(row.status);
            nextDetails[number] = { ...row, number };
          }
        });
        if (isMounted) {
          setStatuses(nextStatuses);
          setCellDetails(nextDetails);
        }
      } catch {
        if (isMounted) {
          setStatuses({});
          setCellDetails({});
        }
      }
    };

    loadStatuses();
    const timer = window.setInterval(loadStatuses, 60000);

    return () => {
      isMounted = false;
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: string; cell?: string | number; cells?: Array<{ cell?: string | number; tier?: string }> };
      if (data.type === 'kladovka78:cell') {
        const number = Number(data.cell);
        if (Number.isFinite(number)) {
          setSelectedNumber(number);
          setSelectedDuration(1);
        }
      }
      if (data.type === 'kladovka78:ready') {
        const cells = (data.cells || [])
          .map((cell) => ({
            number: Number(cell.cell),
            tier: String(cell.tier || '').includes('верх') ? 2 : 1,
          }))
          .filter((cell): cell is DisplayPlanCell => Number.isFinite(cell.number));
        if (cells.length === 0) setModelCells(cells);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const planCells = useMemo<DisplayPlanCell[]>(() => {
    const baseCells = new Map(modelCells.map((cell) => [cell.number, cell]));
    const numbersFromApi = Object.values(cellDetails)
      .map(getCellNumber)
      .filter((number): number is number => number !== null)
      .sort((a, b) => a - b);

    if (numbersFromApi.length === 0) return modelCells;

    return Array.from(new Set(numbersFromApi)).map((number) => {
      const baseCell = baseCells.get(number);
      if (baseCell) return baseCell;
      return { number, tier: Number(cellDetails[number]?.tier) || 1, generated: true };
    });
  }, [cellDetails, modelCells]);

  const cellsByNumber = useMemo(() => new Map(planCells.map((cell) => [cell.number, cell])), [planCells]);
  const selectedCell = selectedNumber ? cellsByNumber.get(selectedNumber) || null : null;
  const selectedInfo = selectedNumber ? cellDetails[selectedNumber] : undefined;
  const selectedStatus = selectedNumber ? getCellStatus(selectedNumber, statuses) : 'unknown';

  const visibleCells = useMemo(() => {
    const number = Number(query.replace(/\D/g, ''));
    return planCells.filter((cell) => {
      const status = getCellStatus(cell.number, statuses);
      const matchQuery = !query || (Number.isFinite(number) && String(cell.number).includes(String(number)));
      const matchLevel = levelFilter === 'all' || String(cell.tier) === levelFilter;
      const matchStatus = statusFilter === 'all' || status === statusFilter;
      return matchQuery && matchLevel && matchStatus;
    });
  }, [planCells, query, levelFilter, statusFilter, statuses]);
  const selectedVolume = Number(selectedInfo?.volume) || 0;
  const selectedMonthlyPrice = Number(selectedInfo?.pricePerMonth) || (selectedVolume > 0 ? calculatePrice(selectedVolume) : 0);
  const selectedDiscount = discountSettings?.[selectedDuration] ?? 0;
  const selectedTotalBeforeDiscount = selectedMonthlyPrice * selectedDuration;
  const selectedTotalPrice = Math.ceil((selectedTotalBeforeDiscount - Math.floor(selectedTotalBeforeDiscount * selectedDiscount / 100)) / 10) * 10;

  const selectCell = (number: number) => {
    setSelectedNumber(number);
    setSelectedDuration(1);
  };

  const visibleNumberSet = useMemo(() => new Set(visibleCells.map((c) => c.number)), [visibleCells]);
  const mapTier = levelFilter !== 'all' ? Number(levelFilter) : (selectedCell?.tier ?? 1);

  const goToBooking = () => {
    if (!selectedCell || selectedStatus !== 'available') return;

    const bookingState = {
      cellId: selectedInfo?.id || `cell-${selectedCell.number}`,
      cellNumber: selectedCell.number,
      duration: selectedDuration,
      totalPrice: selectedTotalPrice,
      pricePerMonth: selectedMonthlyPrice,
    };

    const customer = localStorage.getItem('kladovka78_customer');
    if (customer) {
      navigate('/dashboard', { state: { booking: bookingState } });
    } else {
      navigate('/auth', { state: bookingState });
    }
  };

  return (
    <section id="plan" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">План склада</h2>
          <p className="text-muted-foreground">
            Выберите ярус и нажмите на ячейку — маршрут от входа появится на плане.
          </p>
        </div>

        <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
          <div className="order-2 rounded-2xl border-2 border-border bg-card p-5 shadow-card xl:order-1">
            <label className="text-sm font-bold text-foreground" htmlFor="plan-cell-search">
              Номер ячейки
            </label>
            <div className="relative mt-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="plan-cell-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                inputMode="numeric"
                placeholder="Например, 104"
                className="h-11 border-2 pl-10 text-sm font-semibold"
              />
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-bold text-foreground">
                  <Layers className="h-4 w-4 text-primary" />
                  Ярус
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {levelOptions.map((option) => (
                    <Button
                      key={option.value}
                      type="button"
                      variant={levelFilter === option.value ? 'default' : 'outline'}
                      size="sm"
                      className="px-2 text-xs"
                      onClick={() => setLevelFilter(option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-bold text-foreground">
                  <Filter className="h-4 w-4 text-primary" />
                  Статус
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {statusOptions.map((option) => (
                    <Button
                      key={option.value}
                      type="button"
                      variant={statusFilter === option.value ? 'default' : 'outline'}
                      size="sm"
                      className="justify-start px-2 text-xs"
                      onClick={() => {
                        setStatusFilter(option.value);
                        setQuery('');
                        setSelectedNumber(null);
                      }}
                    >
                      {option.value !== 'all' && <span className={`h-2.5 w-2.5 rounded-sm ${statusDotStyles[option.value]}`} />}
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 grid max-h-48 grid-cols-5 gap-2 overflow-auto pr-1 sm:grid-cols-6 xl:grid-cols-5">
              {visibleCells.map((cell) => {
                const status = getCellStatus(cell.number, statuses);
                return (
                  <Button
                    key={cell.number}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => selectCell(cell.number)}
                    className={`h-10 min-w-0 border-2 px-2 text-sm font-bold ${
                      selectedNumber === cell.number
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background text-foreground hover:border-primary'
                    }`}
                  >
                    {cell.number}
                    <span className={`ml-1 inline-block h-2 w-2 rounded-sm ${statusDotStyles[status]}`} />
                  </Button>
                );
              })}
              {visibleCells.length === 0 && (
                <div className="col-span-5 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                  Ничего не найдено
                </div>
              )}
            </div>

            <div className="mt-5 space-y-2 text-sm text-muted-foreground">
              {(['available', 'reserved', 'occupied'] as PlanStatus[]).map((status) => (
                <div key={status} className="flex items-center gap-2">
                  <span className={`h-3 w-3 rounded-sm ${statusDotStyles[status]}`} />
                  <span>{statusLabels[status]}</span>
                </div>
              ))}
            </div>

            {selectedCell && (
              <div className="mt-5 rounded-xl bg-muted p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <Navigation className="h-4 w-4 text-primary" />
                  Ячейка №{selectedCell.number}
                </div>
                <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <span className={`h-2.5 w-2.5 rounded-sm ${statusDotStyles[selectedStatus]}`} />
                  {statusLabels[selectedStatus]}, ярус {selectedCell.tier}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-lg bg-background p-3">
                    <div className="flex items-center gap-1 text-muted-foreground"><Ruler className="h-3.5 w-3.5" />Размер</div>
                    <div className="mt-1 font-bold text-foreground">
                      {selectedInfo?.width && selectedInfo?.height && selectedInfo?.depth
                        ? `${formatMeters(selectedInfo.width)}×${formatMeters(selectedInfo.height)}×${formatMeters(selectedInfo.depth)} м`
                        : '—'}
                    </div>
                  </div>
                  <div className="rounded-lg bg-background p-3">
                    <div className="flex items-center gap-1 text-muted-foreground"><Box className="h-3.5 w-3.5" />Объём</div>
                    <div className="mt-1 font-bold text-foreground">
                      {selectedVolume > 0 ? `${selectedVolume.toLocaleString('ru-RU')} м³` : '—'}
                    </div>
                  </div>
                  <div className="rounded-lg bg-background p-3">
                    <div className="text-muted-foreground">Площадь</div>
                    <div className="mt-1 font-bold text-foreground">
                      {selectedInfo?.area ? `${formatMeters(selectedInfo.area)} м²` : '—'}
                    </div>
                  </div>
                  <div className="rounded-lg bg-background p-3">
                    <div className="text-muted-foreground">Цена</div>
                    <div className="mt-1 font-bold text-primary">
                      {selectedMonthlyPrice > 0 ? `${selectedMonthlyPrice.toLocaleString('ru-RU')} ₽/мес` : '—'}
                    </div>
                  </div>
                </div>
                {selectedStatus === 'available' && selectedMonthlyPrice > 0 && (
                  <div className="mt-4">
                    <div className="mb-2 text-sm font-bold text-foreground">Срок</div>
                    <div className="grid grid-cols-4 gap-2">
                      {durationOptions.map((duration) => (
                        <Button
                          key={duration}
                          type="button"
                          variant={selectedDuration === duration ? 'default' : 'outline'}
                          size="sm"
                          className="px-2 text-xs"
                          onClick={() => setSelectedDuration(duration)}
                        >
                          {duration} мес.
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                {(selectedInfo?.hasSocket || selectedInfo?.hasShelves) && (
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                    {selectedInfo?.hasSocket && <span className="inline-flex items-center gap-1 rounded-full bg-background px-3 py-1 text-foreground"><Zap className="h-3 w-3 text-accent" />Розетка</span>}
                    {selectedInfo?.hasShelves && <span className="inline-flex items-center gap-1 rounded-full bg-background px-3 py-1 text-foreground"><CheckCircle2 className="h-3 w-3 text-secondary-green" />Полки</span>}
                  </div>
                )}
                {selectedStatus === 'available' ? (
                  <Button type="button" className="mt-4 w-full" onClick={goToBooking} disabled={selectedMonthlyPrice <= 0}>
                    Забронировать{selectedTotalPrice > 0 ? ` за ${selectedTotalPrice.toLocaleString('ru-RU')} ₽` : ''}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <div className="mt-4 rounded-lg bg-background p-3 text-sm text-muted-foreground">
                    Бронь доступна только для свободной ячейки
                  </div>
                )}
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-5 w-full"
              onClick={() => {
                setSelectedNumber(null);
                setQuery('');
              }}
            >
              <RotateCcw className="h-4 w-4" />
              Сбросить
            </Button>
          </div>

          <div className="order-1 rounded-2xl border-2 border-border bg-card p-3 shadow-card xl:order-2">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="grid grid-cols-2 gap-2">
                {[1, 2].map((t) => (
                  <Button
                    key={t}
                    type="button"
                    size="sm"
                    variant={mapTier === t ? 'default' : 'outline'}
                    className="px-3 text-xs"
                    onClick={() => setLevelFilter(String(t) as LevelFilter)}
                  >
                    {t} ярус
                  </Button>
                ))}
              </div>
              <div className="flex items-center gap-3 text-[11px] font-bold text-foreground">
                <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm border border-foreground/60 bg-secondary" />Свободна</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm border border-foreground/60 bg-accent" />Бронь</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm border border-foreground/60 bg-primary" />Занята</span>
              </div>
            </div>
            <p className="mb-2 text-xs text-muted-foreground">Нажмите на ячейку, чтобы увидеть маршрут от входа</p>
            <div className={isMobile ? 'mx-auto max-w-[420px]' : ''}>
              <StoragePlanMap2D
                tier={mapTier}
                vertical={isMobile}
                selectedNumber={selectedNumber}
                visibleNumbers={visibleNumberSet}
                getStatus={(n) => getCellStatus(n, statuses)}
                onSelect={selectCell}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StoragePlanSection;
