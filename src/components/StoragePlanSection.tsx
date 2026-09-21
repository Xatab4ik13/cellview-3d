import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Box, CheckCircle2, Filter, Layers, Navigation, Ruler, RotateCcw, Search, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PLAN_AREAS, PLAN_BOUNDS, PLAN_CELLS, PLAN_ENTRANCE, PLAN_MAIN_CORRIDOR_Y, PLAN_WALLS, type PlanCellPoint } from '@/data/storagePlanMap';
import { calculatePrice, CELL_STATUS_LABELS, type CellStatus } from '@/types/storage';
import { useDiscounts } from '@/hooks/useSettings';

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.kladovka78.ru';

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

type DisplayPlanCell = PlanCellPoint & {
  generated?: boolean;
};

const statusStyles: Record<PlanStatus, string> = {
  available: 'fill-secondary-green/25 stroke-secondary-green',
  reserved: 'fill-accent/35 stroke-accent',
  occupied: 'fill-destructive/25 stroke-destructive',
  unknown: 'fill-muted-foreground/25 stroke-muted-foreground',
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

const areaStyles = [
  'fill-primary/5 stroke-primary/20',
  'fill-accent/10 stroke-accent/30',
  'fill-secondary-green/10 stroke-secondary-green/30',
  'fill-secondary stroke-border',
];

const normalizeStatus = (status: unknown): PlanStatus => {
  const value = String(status || '').toLowerCase();
  if (value === 'available' || value.includes('свобод')) return 'available';
  if (value === 'reserved' || value.includes('брон')) return 'reserved';
  if (value === 'occupied' || value.includes('занят')) return 'occupied';
  return 'unknown';
};

const getDisplayPoint = (cell: PlanCellPoint, levelFilter: LevelFilter) => {
  const offset = levelFilter === 'all' ? (cell.tier === 2 ? -0.9 : cell.tier === 1 ? 0.9 : 0) : 0;
  return cell.orientation === 'v'
    ? { x: cell.x + offset, y: cell.y }
    : { x: cell.x, y: cell.y + offset };
};

const getRoutePoints = (cell: PlanCellPoint, levelFilter: LevelFilter) => {
  const target = getDisplayPoint(cell, levelFilter);
  const routeY = target.y < PLAN_MAIN_CORRIDOR_Y ? target.y : PLAN_MAIN_CORRIDOR_Y;

  return [
    PLAN_ENTRANCE,
    { x: PLAN_ENTRANCE.x, y: routeY },
    { x: target.x, y: routeY },
    target,
  ].filter((point, index, points) => index === 0 || point.x !== points[index - 1].x || point.y !== points[index - 1].y);
};

const routeSegments = (points: Array<{ x: number; y: number }>) => points.slice(1).map((point, index) => ({
  from: points[index],
  to: point,
}));

const selectedArrowPath = (point: { x: number; y: number }) => (
  `M ${point.x} ${point.y - 0.88} L ${point.x - 0.36} ${point.y - 0.38} L ${point.x - 0.14} ${point.y - 0.38} L ${point.x - 0.14} ${point.y - 0.06} L ${point.x + 0.14} ${point.y - 0.06} L ${point.x + 0.14} ${point.y - 0.38} L ${point.x + 0.36} ${point.y - 0.38} Z`
);

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

const generatedPoint = (number: number, index: number, info?: PublicCellInfo): DisplayPlanCell => ({
  number,
  x: 1.2 + (index % 22) * 1.85,
  y: 14.25 + Math.floor(index / 22) * 1.1,
  orientation: 'h',
  tier: Number(info?.tier) || 1,
  generated: true,
});

const StoragePlanSection = () => {
  const navigate = useNavigate();
  const { data: discountSettings } = useDiscounts();
  const [statuses, setStatuses] = useState<Record<number, PlanStatus>>({});
  const [cellDetails, setCellDetails] = useState<Record<number, PublicCellInfo>>({});
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
        const urls = [`${API_BASE}/api/cells/public-status`, `${API_BASE}/api/cells`];

        for (const url of urls) {
          const response = await fetch(url);
          if (!response.ok) continue;
          const json = await response.json();
          rows = getPublicRows(json);
          if (rows.length > 0) break;
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

  const planCells = useMemo<DisplayPlanCell[]>(() => {
    const baseCells = new Map(PLAN_CELLS.map((cell) => [cell.number, cell]));
    const numbersFromApi = Object.values(cellDetails)
      .map(getCellNumber)
      .filter((number): number is number => number !== null)
      .sort((a, b) => a - b);

    if (numbersFromApi.length === 0) return PLAN_CELLS;

    let generatedIndex = 0;
    return Array.from(new Set(numbersFromApi)).map((number) => {
      const baseCell = baseCells.get(number);
      if (baseCell) return baseCell;
      const point = generatedPoint(number, generatedIndex, cellDetails[number]);
      generatedIndex += 1;
      return point;
    });
  }, [cellDetails]);

  const planBounds = useMemo(() => {
    const generatedCells = planCells.filter((cell) => cell.generated);
    if (generatedCells.length === 0) return PLAN_BOUNDS;

    const maxGeneratedY = Math.max(...generatedCells.map((cell) => cell.y));
    return { ...PLAN_BOUNDS, maxY: Math.max(PLAN_BOUNDS.maxY, maxGeneratedY + 0.8) };
  }, [planCells]);

  const cellsByNumber = useMemo(() => new Map(planCells.map((cell) => [cell.number, cell])), [planCells]);
  const selectedCell = selectedNumber ? cellsByNumber.get(selectedNumber) || null : null;
  const selectedInfo = selectedNumber ? cellDetails[selectedNumber] : undefined;
  const selectedStatus = selectedNumber ? statuses[selectedNumber] || 'unknown' : 'unknown';
  const fullViewBox = `${planBounds.minX} ${planBounds.minY} ${planBounds.maxX - planBounds.minX} ${planBounds.maxY - planBounds.minY}`;

  const visibleCells = useMemo(() => {
    const number = Number(query.replace(/\D/g, ''));
    return planCells.filter((cell) => {
      const status = statuses[cell.number] || 'unknown';
      const matchQuery = !query || (Number.isFinite(number) && String(cell.number).includes(String(number)));
      const matchLevel = levelFilter === 'all' || String(cell.tier) === levelFilter;
      const matchStatus = statusFilter === 'all' || status === statusFilter;
      return matchQuery && matchLevel && matchStatus;
    });
  }, [planCells, query, levelFilter, statusFilter, statuses]);

  const filteredNumbers = useMemo(() => new Set(visibleCells.map((cell) => cell.number)), [visibleCells]);
  const selectedIsVisible = selectedCell ? filteredNumbers.has(selectedCell.number) : false;
  const selectedPoint = selectedCell && selectedIsVisible ? getDisplayPoint(selectedCell, levelFilter) : null;
  const routePoints = selectedCell && selectedIsVisible ? getRoutePoints(selectedCell, levelFilter) : [];
  const routeParts = routeSegments(routePoints);
  const viewBox = useMemo(() => {
    if (!selectedPoint || routePoints.length === 0) return fullViewBox;

    const xs = routePoints.map((point) => point.x);
    const ys = routePoints.map((point) => point.y);
    const minX = Math.max(planBounds.minX, Math.min(...xs) - 2.2);
    const maxX = Math.min(planBounds.maxX, Math.max(...xs) + 2.2);
    const minY = Math.max(planBounds.minY, Math.min(...ys) - 1.6);
    const maxY = Math.min(planBounds.maxY, Math.max(...ys) + 1.6);
    return `${minX} ${minY} ${Math.max(maxX - minX, 15)} ${Math.max(maxY - minY, 6)}`;
  }, [fullViewBox, planBounds, routePoints, selectedPoint]);
  const selectedVolume = Number(selectedInfo?.volume) || 0;
  const selectedMonthlyPrice = Number(selectedInfo?.pricePerMonth) || (selectedVolume > 0 ? calculatePrice(selectedVolume) : 0);
  const selectedDiscount = discountSettings?.[selectedDuration] ?? 0;
  const selectedTotalBeforeDiscount = selectedMonthlyPrice * selectedDuration;
  const selectedTotalPrice = Math.ceil((selectedTotalBeforeDiscount - Math.floor(selectedTotalBeforeDiscount * selectedDiscount / 100)) / 10) * 10;

  const selectCell = (number: number) => {
    setSelectedNumber(number);
    setSelectedDuration(1);
  };

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
            Выберите номер кладовки — маршрут от входа появится на плане.
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
                const status = statuses[cell.number] || 'unknown';
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

          <div className="order-1 overflow-hidden rounded-2xl border-2 border-border bg-card p-2 shadow-card sm:overflow-x-auto sm:p-3 xl:order-2">
            <svg
              viewBox={viewBox}
              role="img"
              aria-label="Карта кладовок сверху"
              preserveAspectRatio="xMidYMid meet"
              className="aspect-[43/14] w-full rounded-xl bg-muted"
            >
              <defs>
                <marker id="plan-route-arrow" markerWidth="0.8" markerHeight="0.8" refX="0.72" refY="0.4" orient="auto" markerUnits="strokeWidth">
                  <path d="M 0 0 L 0.8 0.4 L 0 0.8 z" className="fill-primary" />
                </marker>
              </defs>

              {PLAN_AREAS.map(([x, y, width, height], index) => (
                <rect key={`area-${index}`} x={x} y={y} width={width} height={height} rx="0.12" className={areaStyles[index % areaStyles.length]} strokeWidth="0.04" />
              ))}

              {PLAN_WALLS.map(([x, y, width, height], index) => (
                <rect key={`wall-${index}`} x={x} y={y} width={width} height={height} className="fill-foreground opacity-20" />
              ))}

              <path
                d={`M ${PLAN_ENTRANCE.x} ${PLAN_ENTRANCE.y + 0.52} L ${PLAN_ENTRANCE.x - 0.38} ${PLAN_ENTRANCE.y - 0.2} L ${PLAN_ENTRANCE.x + 0.38} ${PLAN_ENTRANCE.y - 0.2} Z`}
                className="fill-accent stroke-foreground"
                strokeWidth="0.05"
              />
              <text x={PLAN_ENTRANCE.x} y={PLAN_ENTRANCE.y - 0.42} textAnchor="middle" className="fill-foreground text-[0.44px] font-extrabold">
                ВХОД
              </text>

              {routeParts.map((part, index) => (
                <line
                  key={`route-${index}`}
                  x1={part.from.x}
                  y1={part.from.y}
                  x2={part.to.x}
                  y2={part.to.y}
                  className="stroke-primary"
                  strokeWidth="0.16"
                  strokeLinecap="round"
                  markerEnd="url(#plan-route-arrow)"
                />
              ))}

              {selectedPoint && (
                <path
                  d={selectedArrowPath(selectedPoint)}
                  className="fill-primary stroke-primary-foreground"
                  strokeWidth="0.05"
                />
              )}

              {visibleCells.map((cell) => {
                const point = getDisplayPoint(cell, levelFilter);
                const status = statuses[cell.number] || 'unknown';
                const isSelected = selectedNumber === cell.number;
                const markerWidth = levelFilter === 'all' ? 0.86 : 1.08;
                const markerHeight = levelFilter === 'all' ? 0.62 : 0.78;
                return (
                  <g
                    key={cell.number}
                    role="button"
                    tabIndex={0}
                    aria-label={`Ячейка ${cell.number}`}
                    className="cursor-pointer outline-none"
                    onClick={() => selectCell(cell.number)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') selectCell(cell.number);
                    }}
                  >
                    <rect
                      x={point.x - markerWidth / 2}
                      y={point.y - markerHeight / 2}
                      width={markerWidth}
                      height={markerHeight}
                      rx="0.08"
                      className={`${statusStyles[status]} ${isSelected ? 'stroke-foreground' : ''}`}
                      strokeWidth={isSelected ? '0.14' : '0.06'}
                    />
                    <text
                      x={point.x}
                      y={point.y + (levelFilter === 'all' ? 0.13 : 0.16)}
                      textAnchor="middle"
                      className={`pointer-events-none ${levelFilter === 'all' ? 'text-[0.34px]' : 'text-[0.43px]'} font-extrabold ${isSelected ? 'fill-primary-foreground' : 'fill-foreground'}`}
                    >
                      {cell.number}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StoragePlanSection;
