import { useEffect, useMemo, useState } from 'react';
import { Navigation, RotateCcw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PLAN_AREAS, PLAN_BOUNDS, PLAN_CELLS, PLAN_ENTRANCE, PLAN_MAIN_CORRIDOR_Y, type PlanCellPoint } from '@/data/storagePlanMap';
import { CELL_STATUS_LABELS, type CellStatus } from '@/types/storage';

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.kladovka78.ru';

type PlanStatus = CellStatus | 'unknown';

const statusStyles: Record<PlanStatus, string> = {
  available: 'fill-secondary-green stroke-secondary-green',
  reserved: 'fill-accent stroke-accent',
  occupied: 'fill-destructive stroke-destructive',
  unknown: 'fill-muted-foreground stroke-muted-foreground',
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

const normalizeStatus = (status: unknown): PlanStatus => {
  const value = String(status || '').toLowerCase();
  if (value === 'available' || value.includes('свобод')) return 'available';
  if (value === 'reserved' || value.includes('брон')) return 'reserved';
  if (value === 'occupied' || value.includes('занят')) return 'occupied';
  return 'unknown';
};

const getDisplayPoint = (cell: PlanCellPoint) => {
  const offset = cell.tier === 2 ? -0.18 : cell.tier === 1 ? 0.18 : 0;
  return cell.orientation === 'v'
    ? { x: cell.x + offset, y: cell.y }
    : { x: cell.x, y: cell.y + offset };
};

const getRoutePoints = (cell: PlanCellPoint) => {
  const target = getDisplayPoint(cell);
  const verticalLane = Math.abs(target.x - PLAN_ENTRANCE.x) < 2.5 && target.y < PLAN_MAIN_CORRIDOR_Y
    ? target.x
    : PLAN_ENTRANCE.x;

  if (target.y < PLAN_MAIN_CORRIDOR_Y && Math.abs(target.x - PLAN_ENTRANCE.x) < 2.5) {
    return [PLAN_ENTRANCE, { x: verticalLane, y: target.y }, target];
  }

  return [
    PLAN_ENTRANCE,
    { x: PLAN_ENTRANCE.x, y: PLAN_MAIN_CORRIDOR_Y },
    { x: target.x, y: PLAN_MAIN_CORRIDOR_Y },
    target,
  ];
};

const pathFromPoints = (points: Array<{ x: number; y: number }>) => points.map((point) => `${point.x},${point.y}`).join(' ');

const StoragePlanSection = () => {
  const [statuses, setStatuses] = useState<Record<number, PlanStatus>>({});
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadStatuses = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/cells/public-status`);
        const json = await response.json();
        const rows = Array.isArray(json?.data) ? json.data : [];
        const nextStatuses = rows.reduce<Record<number, PlanStatus>>((acc, row) => {
          const number = Number(row.cell ?? row.number);
          if (Number.isFinite(number)) acc[number] = normalizeStatus(row.status);
          return acc;
        }, {});
        if (isMounted) setStatuses(nextStatuses);
      } catch {
        if (isMounted) setStatuses({});
      }
    };

    loadStatuses();
    const timer = window.setInterval(loadStatuses, 60000);

    return () => {
      isMounted = false;
      window.clearInterval(timer);
    };
  }, []);

  const cellsByNumber = useMemo(() => new Map(PLAN_CELLS.map((cell) => [cell.number, cell])), []);
  const selectedCell = selectedNumber ? cellsByNumber.get(selectedNumber) || null : null;
  const route = selectedCell ? pathFromPoints(getRoutePoints(selectedCell)) : '';
  const viewBox = `${PLAN_BOUNDS.minX} ${PLAN_BOUNDS.minY} ${PLAN_BOUNDS.maxX - PLAN_BOUNDS.minX} ${PLAN_BOUNDS.maxY - PLAN_BOUNDS.minY}`;

  const visibleCells = useMemo(() => {
    const number = Number(query.replace(/\D/g, ''));
    if (!query || !Number.isFinite(number)) return PLAN_CELLS;
    return PLAN_CELLS.filter((cell) => String(cell.number).includes(String(number)));
  }, [query]);

  const selectCell = (number: number) => {
    setSelectedNumber(number);
    setQuery(String(number));
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

        <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
          <div className="rounded-2xl border-2 border-border bg-card p-5 shadow-card">
            <label className="text-sm font-bold text-foreground" htmlFor="plan-cell-search">
              Номер ячейки
            </label>
            <div className="relative mt-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="plan-cell-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                inputMode="numeric"
                placeholder="Например, 104"
                className="h-11 w-full rounded-lg border-2 border-input bg-background pl-10 pr-3 text-sm font-semibold text-foreground outline-none transition-colors focus:border-primary"
              />
            </div>

            <div className="mt-4 grid max-h-56 grid-cols-4 gap-2 overflow-auto pr-1">
              {visibleCells.slice(0, 60).map((cell) => {
                const status = statuses[cell.number] || 'unknown';
                return (
                  <button
                    key={cell.number}
                    type="button"
                    onClick={() => selectCell(cell.number)}
                    className={`h-10 rounded-lg border-2 text-sm font-bold transition-colors ${
                      selectedNumber === cell.number
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background text-foreground hover:border-primary'
                    }`}
                  >
                    {cell.number}
                    <span className={`ml-1 inline-block h-2 w-2 rounded-full ${statusDotStyles[status]}`} />
                  </button>
                );
              })}
            </div>

            <div className="mt-5 space-y-2 text-sm text-muted-foreground">
              {(['available', 'reserved', 'occupied'] as PlanStatus[]).map((status) => (
                <div key={status} className="flex items-center gap-2">
                  <span className={`h-3 w-3 rounded-full ${statusDotStyles[status]}`} />
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
                <div className="mt-1 text-sm text-muted-foreground">
                  {statusLabels[statuses[selectedCell.number] || 'unknown']}, ярус {selectedCell.tier}
                </div>
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

          <div className="overflow-x-auto rounded-2xl border-2 border-border bg-card p-3 shadow-card">
            <svg
              viewBox={viewBox}
              role="img"
              aria-label="Карта кладовок сверху"
              className="h-[620px] min-w-[980px] w-full rounded-xl bg-muted"
            >
              <defs>
                <marker id="plan-route-arrow" markerWidth="0.8" markerHeight="0.8" refX="0.72" refY="0.4" orient="auto" markerUnits="strokeWidth">
                  <path d="M 0 0 L 0.8 0.4 L 0 0.8 z" className="fill-primary" />
                </marker>
              </defs>

              {PLAN_AREAS.map(([x, y, width, height], index) => (
                <rect key={`area-${index}`} x={x} y={y} width={width} height={height} rx="0.12" className="fill-background stroke-border" strokeWidth="0.04" />
              ))}

              {PLAN_WALLS.map(([x, y, width, height], index) => (
                <rect key={`wall-${index}`} x={x} y={y} width={width} height={height} className="fill-muted-foreground opacity-30" />
              ))}

              <circle cx={PLAN_ENTRANCE.x} cy={PLAN_ENTRANCE.y} r="0.3" className="fill-accent stroke-foreground" strokeWidth="0.05" />
              <text x={PLAN_ENTRANCE.x} y={PLAN_ENTRANCE.y - 0.42} textAnchor="middle" className="fill-foreground text-[0.44px] font-extrabold">
                ВХОД
              </text>

              {route && (
                <polyline
                  points={route}
                  fill="none"
                  className="stroke-primary"
                  strokeWidth="0.16"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  markerEnd="url(#plan-route-arrow)"
                />
              )}

              {PLAN_CELLS.map((cell) => {
                const point = getDisplayPoint(cell);
                const status = statuses[cell.number] || 'unknown';
                const isSelected = selectedNumber === cell.number;
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
                      x={point.x - 0.36}
                      y={point.y - 0.26}
                      width="0.72"
                      height="0.52"
                      rx="0.08"
                      className={`${statusStyles[status]} ${isSelected ? 'stroke-foreground' : ''}`}
                      strokeWidth={isSelected ? '0.12' : '0.04'}
                    />
                    <text
                      x={point.x}
                      y={point.y + 0.11}
                      textAnchor="middle"
                      className="pointer-events-none fill-primary-foreground text-[0.28px] font-extrabold"
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
