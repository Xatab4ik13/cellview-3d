import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, TrendingUp, Calendar, Users, Wallet, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fetchRevenue, fetchRevenueByMonth, RevenueMonthEntry } from '@/lib/api';
import AnimatedCounter from '@/components/crm/AnimatedCounter';

const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

function fmtMonth(ym: string) {
  const [y, m] = ym.split('-').map(Number);
  return `${MONTH_NAMES[m - 1]} ${y}`;
}

function fmtRub(n: number) {
  return n.toLocaleString('ru-RU') + ' ₽';
}

function fmtDate(d: string) {
  try {
    return new Date(d).toLocaleDateString('ru-RU');
  } catch { return d; }
}

const AdminRevenue = () => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null); // YYYY-MM

  const from = `${year}-01`;
  const to = `${year}-12`;

  const { data: monthly = [], isLoading } = useQuery({
    queryKey: ['revenue', from, to],
    queryFn: () => fetchRevenue(from, to),
  });

  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ['revenue-by-month', selectedMonth],
    queryFn: () => fetchRevenueByMonth(selectedMonth!),
    enabled: !!selectedMonth,
  });

  // Полная карта 12 месяцев года
  const yearMap = useMemo(() => {
    const map = new Map<string, { total: number; rentals: number; customers: number }>();
    for (let m = 1; m <= 12; m++) {
      const ym = `${year}-${String(m).padStart(2, '0')}`;
      map.set(ym, { total: 0, rentals: 0, customers: 0 });
    }
    monthly.forEach(r => {
      map.set(r.month, {
        total: Number(r.total) || 0,
        rentals: Number(r.rentals) || 0,
        customers: Number(r.customers) || 0,
      });
    });
    return map;
  }, [monthly, year]);

  const currentYm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const yearTotal = Array.from(yearMap.values()).reduce((s, v) => s + v.total, 0);
  const factTotal = Array.from(yearMap.entries())
    .filter(([ym]) => ym <= currentYm)
    .reduce((s, [, v]) => s + v.total, 0);
  const planTotal = Array.from(yearMap.entries())
    .filter(([ym]) => ym > currentYm)
    .reduce((s, [, v]) => s + v.total, 0);

  // ===== Detail view =====
  if (selectedMonth && detail) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setSelectedMonth(null)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            К сводке
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{fmtMonth(selectedMonth)}</h2>
            <p className="text-base text-muted-foreground mt-1">
              Распределение выручки за месяц
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-sm text-muted-foreground mb-1">Выручка за месяц</div>
            <div className="text-2xl font-bold text-primary">{fmtRub(detail.total)}</div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-sm text-muted-foreground mb-1">Аренд</div>
            <div className="text-2xl font-bold">{detail.count}</div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-sm text-muted-foreground mb-1">Средний чек</div>
            <div className="text-2xl font-bold">
              {detail.count > 0 ? fmtRub(Math.round(detail.total / detail.count)) : '—'}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Ячейка</th>
                <th className="text-left px-4 py-3 font-semibold">Клиент</th>
                <th className="text-left px-4 py-3 font-semibold">Аренда</th>
                <th className="text-left px-4 py-3 font-semibold">Период аренды</th>
                <th className="text-right px-4 py-3 font-semibold">Доля за месяц</th>
                <th className="text-right px-4 py-3 font-semibold">Платёж (всего)</th>
              </tr>
            </thead>
            <tbody>
              {detail.entries.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Нет данных</td></tr>
              ) : detail.entries.map((e: RevenueMonthEntry) => (
                <tr key={e.id} className="border-t border-border hover:bg-muted/20">
                  <td className="px-4 py-3 font-semibold">№{e.cellNumber}</td>
                  <td className="px-4 py-3">
                    <div>{e.customerName}</div>
                    <div className="text-xs text-muted-foreground">{e.customerPhone}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div>{e.rentalMonths} мес × {fmtRub(e.pricePerMonth)}</div>
                    <div className="text-xs text-muted-foreground">Итого: {fmtRub(e.totalAmount)}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {fmtDate(e.rentalStart)} — {fmtDate(e.rentalEnd)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-primary">
                    {fmtRub(Number(e.amount))}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {e.paymentAmount ? (
                      <div>
                        <div>{fmtRub(Number(e.paymentAmount))}</div>
                        <div className="text-xs text-muted-foreground">
                          {e.paymentDate ? fmtDate(e.paymentDate) : ''}
                          {e.paymentStatus && (
                            <Badge variant="outline" className="ml-1 text-[10px]">
                              {e.paymentStatus}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ===== Year overview =====
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold">Выручка</h2>
          <p className="text-base text-muted-foreground mt-1">
            Распределение выручки по месяцам — кликните месяц для деталей
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setYear(y => y - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-xl font-bold min-w-[80px] text-center">{year}</div>
          <Button variant="outline" size="icon" onClick={() => setYear(y => y + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Итого за год', value: yearTotal, color: 'var(--primary)', icon: TrendingUp },
          { label: `Факт (до ${fmtMonth(currentYm)})`, value: factTotal, color: 'var(--status-active)', icon: Wallet },
          { label: 'План (будущие месяцы)', value: planTotal, color: 'var(--status-pending)', icon: Calendar },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">{s.label}</div>
              <s.icon className="h-4 w-4" style={{ color: `hsl(${s.color})` }} />
            </div>
            <div className="text-2xl font-bold" style={{ color: `hsl(${s.color})` }}>
              <AnimatedCounter value={s.value} /> ₽
            </div>
          </motion.div>
        ))}
      </div>

      {/* Months grid */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 bg-muted/40 font-semibold flex items-center justify-between">
          <span>Месяцы {year}</span>
          {isLoading && <span className="text-xs text-muted-foreground">Загрузка...</span>}
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/20">
            <tr>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">Месяц</th>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">Статус</th>
              <th className="text-right px-4 py-2 font-medium text-muted-foreground">Аренд</th>
              <th className="text-right px-4 py-2 font-medium text-muted-foreground">Клиентов</th>
              <th className="text-right px-4 py-2 font-medium text-muted-foreground">Сумма</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {Array.from(yearMap.entries()).map(([ym, v]) => {
              const isPast = ym < currentYm;
              const isCurrent = ym === currentYm;
              const isFuture = ym > currentYm;
              const empty = v.total === 0;
              return (
                <tr
                  key={ym}
                  className="border-t border-border hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => !empty && setSelectedMonth(ym)}
                >
                  <td className="px-4 py-3 font-semibold">{fmtMonth(ym)}</td>
                  <td className="px-4 py-3">
                    {isCurrent ? (
                      <Badge style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}>
                        Текущий
                      </Badge>
                    ) : isPast ? (
                      <Badge variant="outline" style={{ color: 'hsl(var(--status-active))', borderColor: 'hsl(var(--status-active) / 0.3)' }}>
                        Факт
                      </Badge>
                    ) : (
                      <Badge variant="outline" style={{ color: 'hsl(var(--status-pending))', borderColor: 'hsl(var(--status-pending) / 0.3)' }}>
                        План
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">{v.rentals || '—'}</td>
                  <td className="px-4 py-3 text-right">{v.customers || '—'}</td>
                  <td className="px-4 py-3 text-right font-semibold" style={{
                    color: empty ? 'hsl(var(--muted-foreground))' : isFuture ? 'hsl(var(--status-pending))' : 'hsl(var(--primary))'
                  }}>
                    {empty ? '—' : fmtRub(v.total)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!empty && <ChevronRight className="h-4 w-4 inline text-muted-foreground" />}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-border bg-muted/30 font-bold">
              <td className="px-4 py-3" colSpan={4}>Итого за {year}</td>
              <td className="px-4 py-3 text-right text-primary">{fmtRub(yearTotal)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default AdminRevenue;
