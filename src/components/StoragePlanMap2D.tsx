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
  available: 'fill-secondary',
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

  // Drawn cell rects: slightly inset from the real footprint, then relaxed so
  // neighbours whose real pitch is tighter than MIN_GAP are pushed apart —
  // every aisle between lockers stays visible and readable on screen.
  const rects = useMemo(() => {
    const INSET = 0.16;
    const MIN_GAP = 0.38;
    type R = { x1: number; y1: number; x2: number; y2: number; fw: number; fh: number; cx: number; cy: number };
    const list: R[] = cells.map((c) => {
      const isV = c.orientation === 'v';
      const fw = isV ? CELL_LONG : CELL_SHORT;
      const fh = isV ? CELL_SHORT : CELL_LONG;
      return {
        x1: c.x - fw / 2 + INSET,
        y1: c.y - fh / 2 + INSET,
        x2: c.x + fw / 2 - INSET,
        y2: c.y + fh / 2 - INSET,
        fw,
        fh,
        cx: c.x,
        cy: c.y,
      };
    });
    // Pull one edge of a cell toward its centre by `amount`, never shrinking
    // it below 55% of its real footprint. Returns the applied distance.
    const shrink = (r: R, axis: 'x' | 'y', side: 1 | -1, amount: number) => {
      const full = axis === 'x' ? r.fw : r.fh;
      const len = axis === 'x' ? r.x2 - r.x1 : r.y2 - r.y1;
      const use = Math.min(Math.max(0, amount), Math.max(0, len - full * 0.55));
      if (axis === 'x') {
        if (side === 1) r.x2 -= use;
        else r.x1 += use;
      } else if (side === 1) r.y2 -= use;
      else r.y1 += use;
      return use;
    };
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i];
        const b = list[j];
        // Neighbours in the same row share their centre Y: widen the gap
        // between them horizontally.
        if (Math.abs(a.cy - b.cy) < 0.05) {
          const left = a.cx <= b.cx ? a : b;
          const right = left === a ? b : a;
          const gap = right.x1 - left.x2;
          if (gap < MIN_GAP) {
            const need = MIN_GAP - gap;
            const useL = shrink(left, 'x', 1, need / 2);
            shrink(right, 'x', -1, need - useL);
          }
        }
        // Neighbours in the same column share their centre X: widen the gap
        // between them vertically.
        if (Math.abs(a.cx - b.cx) < 0.05) {
          const top = a.cy <= b.cy ? a : b;
          const bottom = top === a ? b : a;
          const gap = bottom.y1 - top.y2;
          if (gap < MIN_GAP) {
            const need = MIN_GAP - gap;
            const useT = shrink(top, 'y', 1, need / 2);
            shrink(bottom, 'y', -1, need - useT);
          }
        }
      }
    }
    return list;
  }, [cells]);

  const routePoints = useMemo(() => {
    if (!selected) return [] as Array<[number, number]>;
    const pts: Array<[number, number]> = [[PLAN_ENTRANCE.x, PLAN_ENTRANCE.y]];
    const nearEntranceZone = selected.y < PLAN_MAIN_CORRIDOR_Y && selected.x < 14.5;
    if (nearEntranceZone) {
      pts.push([PLAN_ENTRANCE.x, selected.y]);
    } else {
      pts.push([PLAN_ENTRANCE.x, PLAN_MAIN_CORRIDOR_Y], [selected.x, PLAN_MAIN_CORRIDOR_Y], [selected.x, selected.y]);
    }
    return pts;
  }, [selected, vertical]);

  const route = useMemo(
    () => routePoints.map(([x, y], i) => { const p = tr(x, y); return `${i ? 'L' : 'M'}${p.x.toFixed(2)},${p.y.toFixed(2)}`; }).join(' '),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [routePoints, vertical],
  );

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
      <defs>
        <pattern id={`plan-grid-${tier}`} width="1" height="1" patternUnits="userSpaceOnUse">
          <path d="M 1 0 L 0 0 0 1" fill="none" className="stroke-foreground" strokeOpacity="0.06" strokeWidth={0.02} />
        </pattern>
      </defs>

      <rect x={0} y={0} width={vbW} height={vbH} fill={`url(#plan-grid-${tier})`} />

      {PLAN_WALLS.map(([x, y, rw, rh], i) => (
        <rect key={i} {...rect(x, y, rw, rh)} className="fill-foreground/40" />
      ))}

      {route && (
        <>
          <path d={route} fill="none" className="stroke-background" strokeWidth={0.3} strokeLinecap="round" strokeLinejoin="round" />
          <path d={route} fill="none" className="stroke-accent" strokeWidth={0.16} strokeDasharray="0.5 0.3" strokeLinecap="round" strokeLinejoin="round" />
          {(() => {
            const [ex, ey] = routePoints[routePoints.length - 1];
            const p = tr(ex, ey);
            return <circle cx={p.x} cy={p.y} r={0.22} className="fill-accent stroke-foreground" strokeWidth={0.05} />;
          })()}
        </>
      )}

      <rect x={entrance.x - 1.7} y={entrance.y - 0.55} width={3.4} height={1.1} rx={0.2} className="fill-accent stroke-foreground" strokeWidth={0.05} />
      <text x={entrance.x} y={entrance.y} textAnchor="middle" dominantBaseline="middle" fontSize={0.7} fontWeight={800} className="pointer-events-none fill-foreground">
        {PLAN_ENTRANCE.label}
      </text>

      {cells.map((c) => {
        const isV = c.orientation === 'v';
        const cw = isV ? CELL_LONG : CELL_SHORT;
        const ch = isV ? CELL_SHORT : CELL_LONG;
        // Draw cells slightly smaller than their real footprint so the
        // passageways between them stay visible at every scale.
        const inset = 0.14;
        const r = rect(c.x - (cw - inset) / 2, c.y - (ch - inset) / 2, cw - inset, ch - inset);
        const center = tr(c.x, c.y);
        const isSel = c.number === selectedNumber;
        const dim = !visibleNumbers.has(c.number);
        const isLight = getStatus(c.number) === 'available';
        return (
          <g
            key={c.number}
            onClick={() => onSelect(c.number)}
            className="group cursor-pointer"
            opacity={dim && !isSel ? 0.18 : 1}
          >
            {isSel && (
              <rect
                x={r.x - 0.14}
                y={r.y - 0.14}
                width={r.width + 0.28}
                height={r.height + 0.28}
                rx={0.14}
                fill="none"
                className="stroke-accent"
                strokeWidth={0.08}
              />
            )}
            <rect
              {...r}
              rx={0.08}
              className={`${fillByStatus[getStatus(c.number)]} ${isSel ? 'stroke-accent' : 'stroke-foreground'}`}
              strokeWidth={isSel ? 0.14 : 0.045}
            />
            {!isSel && (
              <rect {...r} rx={0.08} fill="none" className="pointer-events-none fill-primary opacity-0 transition-opacity group-hover:opacity-25" strokeWidth={0} />
            )}
            <text
              x={center.x}
              y={center.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={0.4}
              fontWeight={800}
              className={`pointer-events-none ${isLight ? 'fill-foreground' : 'fill-background'}`}
              style={isLight ? undefined : { paintOrder: 'stroke', stroke: 'hsl(var(--foreground))', strokeWidth: 0.03 }}
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
