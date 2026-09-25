import { useMemo } from 'react';
import { PLAN_AREAS, PLAN_BOUNDS, PLAN_CELLS, PLAN_ENTRANCE, PLAN_WALLS } from '@/data/storagePlanMap';

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
// Door openings in the thick walls: short (0.85–1.25 m) pieces of a 0.49 m wall.
const isDoor = (w: number, h: number) => Math.min(w, h) >= 0.4 && Math.max(w, h) >= 0.85 && Math.max(w, h) <= 1.25;

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

  // Drawn cell rects: real footprint with a thin gap so neighbours stay distinct.
  const rects = useMemo(() => {
    const INSET = 0.05;
    return cells.map((c) => {
      const isV = c.orientation === 'v';
      const fw = isV ? CELL_LONG : CELL_SHORT;
      const fh = isV ? CELL_SHORT : CELL_LONG;
      return { x1: c.x - fw / 2 + INSET, y1: c.y - fh / 2 + INSET, x2: c.x + fw / 2 - INSET, y2: c.y + fh / 2 - INSET };
    });
  }, [cells]);

  // Walkable grid: walls and all lockers are obstacles; the route is found
  // through the free aisles only (orthogonal moves, penalised turns).
  const grid = useMemo(() => {
    const STEP = 0.1;
    const gx0 = minX, gy0 = topY;
    const cols = Math.ceil((maxX - minX) / STEP) + 1;
    const rows = Math.ceil((maxY - topY) / STEP) + 1;
    const blocked = new Uint8Array(cols * rows);
    const mark = (x1: number, y1: number, x2: number, y2: number, v: number) => {
      const c1 = Math.max(0, Math.floor((x1 - gx0) / STEP)), c2 = Math.min(cols - 1, Math.ceil((x2 - gx0) / STEP));
      const r1 = Math.max(0, Math.floor((y1 - gy0) / STEP)), r2 = Math.min(rows - 1, Math.ceil((y2 - gy0) / STEP));
      for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) blocked[r * cols + c] = Math.max(blocked[r * cols + c], v) === 2 && blocked[r * cols + c] === 1 ? 1 : v === 1 ? 1 : Math.max(blocked[r * cols + c], v);
    };
    // Only the inside of the building is walkable.
    blocked.fill(1);
    PLAN_AREAS.forEach(([x, y, w2, h2]) => {
      const c1 = Math.max(0, Math.ceil((x - gx0) / STEP)), c2 = Math.min(cols - 1, Math.floor((x + w2 - gx0) / STEP));
      const r1 = Math.max(0, Math.ceil((y - gy0) / STEP)), r2 = Math.min(rows - 1, Math.floor((y + h2 - gy0) / STEP));
      for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) blocked[r * cols + c] = 0;
    });
    const PAD = 0.08;
    PLAN_WALLS.forEach(([x, y, w2, h2]) => {
      if (isDoor(w2, h2)) return;
      // Thin locker partitions are strongly avoided but not hard walls
      // (the drawing does not always leave a gap at the aisle end).
      if (Math.min(w2, h2) < 0.12) mark(x, y, x + w2, y + h2, 2);
      else mark(x - PAD, y - PAD, x + w2 + PAD, y + h2 + PAD, 1);
    });
    PLAN_CELLS.forEach((c) => {
      const isV = c.orientation === 'v';
      const fw = (isV ? CELL_LONG : CELL_SHORT) / 2, fh = (isV ? CELL_SHORT : CELL_LONG) / 2;
      mark(c.x - fw, c.y - fh, c.x + fw, c.y + fh, 1);
    });
    return { STEP, gx0, gy0, cols, rows, blocked };
  }, [minX, maxX, maxY, topY]);

  const routePoints = useMemo(() => {
    if (!selected) return [] as Array<[number, number]>;
    const { STEP, gx0, gy0, cols, rows, blocked } = grid;
    const toC = (x: number) => Math.min(cols - 1, Math.max(0, Math.round((x - gx0) / STEP)));
    const toR = (y: number) => Math.min(rows - 1, Math.max(0, Math.round((y - gy0) / STEP)));
    const N = cols * rows;
    // Nearest free node to a point (spiral search).
    const nearestFree = (x: number, y: number) => {
      const c0 = toC(x), r0 = toR(y);
      for (let d = 0; d < 40; d++) {
        let best = -1, bd = Infinity;
        for (let r = r0 - d; r <= r0 + d; r++) for (let c = c0 - d; c <= c0 + d; c++) {
          if (r < 0 || c < 0 || r >= rows || c >= cols) continue;
          if (Math.max(Math.abs(r - r0), Math.abs(c - c0)) !== d) continue;
          if (blocked[r * cols + c] !== 1) { const dd = (r - r0) ** 2 + (c - c0) ** 2; if (dd < bd) { bd = dd; best = r * cols + c; } }
        }
        if (best >= 0) return best;
      }
      return -1;
    };
    const start = nearestFree(PLAN_ENTRANCE.x, PLAN_ENTRANCE.y + 0.6);
    const goal = nearestFree(selected.x, selected.y);
    if (start < 0 || goal < 0) return [[PLAN_ENTRANCE.x, PLAN_ENTRANCE.y], [selected.x, selected.y]] as Array<[number, number]>;
    // Dijkstra over (node, direction) with a turn penalty.
    const DC = [1, -1, 0, 0], DR = [0, 0, 1, -1];
    const dist = new Float32Array(N * 4).fill(Infinity);
    const prev = new Int32Array(N * 4).fill(-1);
    const heap: Array<[number, number]> = [];
    const push = (d: number, s: number) => {
      heap.push([d, s]); let i = heap.length - 1;
      while (i > 0) { const p = (i - 1) >> 1; if (heap[p][0] <= heap[i][0]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; }
    };
    const pop = () => {
      const top = heap[0]; const last = heap.pop()!;
      if (heap.length) { heap[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i;
        if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r;
        if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m; } }
      return top;
    };
    for (let d = 0; d < 4; d++) { dist[start * 4 + d] = 0; push(0, start * 4 + d); }
    let end = -1;
    while (heap.length) {
      const [d, s] = pop();
      if (d > dist[s]) continue;
      const node = s >> 2, dir = s & 3;
      if (node === goal) { end = s; break; }
      const c = node % cols, r = (node / cols) | 0;
      for (let nd = 0; nd < 4; nd++) {
        const nc = c + DC[nd], nr = r + DR[nd];
        if (nc < 0 || nr < 0 || nc >= cols || nr >= rows) continue;
        const nn = nr * cols + nc;
        if (blocked[nn] === 1) continue;
        const cost = d + 1 + (nd !== dir ? 8 : 0) + (blocked[nn] === 2 ? 60 : 0);
        const ns = nn * 4 + nd;
        if (cost < dist[ns]) { dist[ns] = cost; prev[ns] = s; push(cost, ns); }
      }
    }
    if (end < 0) return [] as Array<[number, number]>;
    const nodes: number[] = [];
    for (let s = end; s >= 0; s = prev[s]) nodes.push(s >> 2);
    nodes.reverse();
    const pts: Array<[number, number]> = [[PLAN_ENTRANCE.x, PLAN_ENTRANCE.y]];
    const pt = (n: number): [number, number] => [gx0 + (n % cols) * STEP, gy0 + ((n / cols) | 0) * STEP];
    nodes.forEach((n, i) => {
      const p = pt(n);
      if (i === 0 || i === nodes.length - 1) { pts.push(p); return; }
      const a = pt(nodes[i - 1]), b = pt(nodes[i + 1]);
      const straight = (Math.abs(a[0] - b[0]) < 1e-6) || (Math.abs(a[1] - b[1]) < 1e-6);
      if (!straight) pts.push(p);
    });
    // Final short step to the locker door.
    const last = pts[pts.length - 1];
    const isV = selected.orientation === 'v';
    const hw = (isV ? CELL_LONG : CELL_SHORT) / 2, hh = (isV ? CELL_SHORT : CELL_LONG) / 2;
    const ex = Math.min(selected.x + hw, Math.max(selected.x - hw, last[0]));
    const ey = Math.min(selected.y + hh, Math.max(selected.y - hh, last[1]));
    if (Math.abs(ex - last[0]) < 0.6 && Math.abs(ey - last[1]) < 0.6) pts.push([ex, ey]);
    return pts;
  }, [selected, grid]);

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
        <rect key={i} {...rect(x, y, rw, rh)} className={isDoor(rw, rh) ? 'fill-accent/40' : Math.min(rw, rh) < 0.12 ? 'fill-foreground/15' : 'fill-foreground/40'} />
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

      {cells.map((c, idx) => {
        const dr = rects[idx];
        const r = rect(dr.x1, dr.y1, dr.x2 - dr.x1, dr.y2 - dr.y1);
        const cellW = dr.x2 - dr.x1;
        const cellH = dr.y2 - dr.y1;
        const center = tr(c.x, c.y);
        const isSel = c.number === selectedNumber;
        const dim = !visibleNumbers.has(c.number);
        const isLight = getStatus(c.number) === 'available';
        const fontSize = Math.min(0.46, Math.max(0.3, Math.min(cellW, cellH) * 0.55));
        return (
          <g
            key={c.number}
            onClick={() => onSelect(c.number)}
            className="group cursor-pointer"
            opacity={dim && !isSel ? 0.18 : 1}
          >
            {isSel && (
              <rect
                x={r.x - 0.12}
                y={r.y - 0.12}
                width={r.width + 0.24}
                height={r.height + 0.24}
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
              y={center.y - (isLight ? fontSize * 0.28 : 0)}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={fontSize}
              fontWeight={800}
              className={`pointer-events-none ${isLight ? 'fill-foreground' : 'fill-background'}`}
              style={isLight ? undefined : { paintOrder: 'stroke', stroke: 'hsl(var(--foreground))', strokeWidth: 0.03 }}
            >
              {c.number}
            </text>
            {isLight && (
              <text
                x={center.x}
                y={center.y + fontSize * 0.62}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={Math.min(0.24, fontSize * 0.5)}
                fontWeight={700}
                className="pointer-events-none fill-foreground"
                opacity={0.65}
              >
                Свободна
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

export default StoragePlanMap2D;
