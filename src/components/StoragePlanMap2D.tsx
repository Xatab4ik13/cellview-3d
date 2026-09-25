import { useMemo } from 'react';
import { PLAN_BOUNDS, PLAN_CELLS, PLAN_ENTRANCE, PLAN_MAIN_CORRIDOR_Y, PLAN_WALLS } from '@/data/storagePlanMap';

type Status = 'available' | 'reserved' | 'occupied' | 'unknown';

type Props = {
  tier: number;
  vertical: boolean;
  selectedNumber: number | null;
  visibleNumbers: Set<number>;
  getStatus: (n: number) => Status;
  onSelect: (n: number) => void;
};

const fillByStatus: Record<Status, string> = {
  available: 'fill-secondary-green',
  reserved: 'fill-accent',
  occupied: 'fill-destructive',
  unknown: 'fill-muted-foreground',
};

const CELL_LONG = 1.0;
const CELL_SHORT = 0.9;

const StoragePlanMap2D = ({ tier, vertical, selectedNumber, visibleNumbers, getStatus, onSelect }: Props) => {
  const { minX, minY, maxX, maxY } = PLAN_BOUNDS;
  const topY = Math.min(minY, -3.2);
  const w = maxX - minX;
  const h = maxY - topY;

  // On phones the long plan is turned 90° so it fits the tall screen.
  const tr = (x: number, y: number) => (vertical ? { x: maxY - y, y: x - minX } : { x: x - minX, y: y - topY });
  const vbW = vertical ? maxY - topY : w;
  const vbH = vertical ? w : h;

  const cells = useMemo(() => PLAN_CELLS.filter((c) => c.tier === tier), [tier]);
  const selected = PLAN_CELLS.find((c) => c.number === selectedNumber) || null;

  const route = useMemo(() => {
    if (!selected) return '';
    const pts: Array<[number, number]> = [[PLAN_ENTRANCE.x, PLAN_ENTRANCE.y]];
    const nearEntranceZone = selected.y < PLAN_MAIN_CORRIDOR_Y && selected.x < 14.5;
    if (nearEntranceZone) {
      pts.push([PLAN_ENTRANCE.x, selected.y]);
    } else {
      pts.push([PLAN_ENTRANCE.x, PLAN_MAIN_CORRIDOR_Y], [selected.x, PLAN_MAIN_CORRIDOR_Y], [selected.x, selected.y]);
    }
    pts.push([selected.x, selected.y]);
    return pts.map(([x, y], i) => { const p = tr(x, y); return `${i ? 'L' : 'M'}${p.x.toFixed(2)},${p.y.toFixed(2)}`; }).join(' ');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, vertical]);

  const rect = (x: number, y: number, rw: number, rh: number) => {
    const a = tr(x, y);
    const b = tr(x + rw, y + rh);
    return { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), width: Math.abs(b.x - a.x), height: Math.abs(b.y - a.y) };
  };

  const entrance = tr(PLAN_ENTRANCE.x, PLAN_ENTRANCE.y - 1.4);

  return (
    <svg
      viewBox={`0 0 ${vbW} ${vbH}`}
      className="h-auto w-full select-none"
      role="img"
      aria-label={`План склада, ${tier} ярус`}
    >
      {PLAN_WALLS.map(([x, y, rw, rh], i) => (
        <rect key={i} {...rect(x, y, rw, rh)} className="fill-foreground/35" />
      ))}

      {route && (
        <path d={route} fill="none" className="stroke-primary" strokeWidth={0.22} strokeDasharray="0.5 0.3" strokeLinecap="round" strokeLinejoin="round" />
      )}

      <text x={entrance.x} y={entrance.y} textAnchor="middle" dominantBaseline="middle" fontSize={0.8} fontWeight={800} className="fill-primary">
        {PLAN_ENTRANCE.label}
      </text>

      {cells.map((c) => {
        const isV = c.orientation === 'v';
        const cw = isV ? CELL_LONG : CELL_SHORT;
        const ch = isV ? CELL_SHORT : CELL_LONG;
        const r = rect(c.x - cw / 2, c.y - ch / 2, cw, ch);
        const center = tr(c.x, c.y);
        const isSel = c.number === selectedNumber;
        const dim = !visibleNumbers.has(c.number);
        return (
          <g
            key={c.number}
            onClick={() => onSelect(c.number)}
            className="cursor-pointer"
            opacity={dim && !isSel ? 0.18 : 1}
          >
            <rect
              {...r}
              rx={0.08}
              className={`${fillByStatus[getStatus(c.number)]} ${isSel ? 'stroke-primary' : 'stroke-background'}`}
              strokeWidth={isSel ? 0.2 : 0.06}
            />
            <text
              x={center.x}
              y={center.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={0.42}
              fontWeight={800}
              className="pointer-events-none fill-background"
            >
              {c.number}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export default StoragePlanMap2D;
