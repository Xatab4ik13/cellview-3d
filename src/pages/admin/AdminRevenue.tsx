import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, TrendingUp, Wallet, Repeat, ArrowLeft, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fetchRevenue, fetchRevenueByMonth, fetchRevenueForecast } from '@/lib/api';
import AnimatedCounter from '@/components/crm/AnimatedCounter';

const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

function fmtMonth(ym: string) {
  const [y, m] = ym.split('-').map(Number);
  return `${MONTH_NAMES[m - 1]} ${y}`;
}

function fmtRub(n: any) {
  const v = Number(n);
  if (!Number.isFinite(v)) return '0 ₽';
  return v.toLocaleString('ru-RU') + ' ₽';
}

function fmtDateTime(d: any) {
  if (!d) return '—';
  try {
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return '—';
    return dt.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return '—'; }
}

function fmtDate(d: any) {
  if (!d) return '—';
  try {
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return '—';
    return dt.toLocaleDateString('ru-RU');
  } catch { return '—'; }
}

const AdminRevenue = () => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  const from = `${year}-01`;
  const to = `${year}-12`;

  const { data: monthly = [], isLoading } = useQuery({
    queryKey: ['revenue', from, to],
    queryFn: () => fetchRevenue(from, to),
  });

  const { data: detail } = useQuery({
    queryKey: ['revenue-by-month', selectedMonth],
    queryFn: () => fetchRevenueByMonth(selectedMonth!),
    enabled: !!selectedMonth,
  });

  const { data: forecast } = useQuery({
    queryKey: ['revenue-forecast', selectedMonth],
    queryFn: () => fetchRevenueForecast(selectedMonth!),
    enabled: !!selectedMonth,
  });

  const yearMap = useMemo(() => {
    const map = new Map<string, { total: number; payments: number; customers: number }>();
    for (let m = 1; m <= 12; m++) {
      const ym = `${year}-${String(m).padStart(2, '0')}`;
      map.set(ym, { total: 0, payments: 0, customers: 0 });
    }
    monthly.forEach((r: any) => {
      map.set(r.month, {
        total: Number(r.total) || 0,
        payments: Number(r.payments) || 0,
        customers: Number(r.customers) || 0,
      });
    });
    return map;
  }, [monthly, year]);

  const currentYm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const yearTotal = Array.from(yearMap.values()).reduce((s, v) => s + v.total, 0);
  const yearPayments = Array.from(yearMap.values()).reduce((s, v) => s + v.payments, 0);

  // ===== Detail view =====
  if (selectedMonth) {
    const entries = detail?.entries || [];
    const total = detail?.total || 0;
    const count = detail?.count || 0;
    const customers = detail?.customers || 0;

    const forecastEntries = forecast?.entries || [];
    const forecastTotal = forecast?.total || 0;

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
              Поступления денег и прогноз продлений
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-sm text-muted-foreground mb-1">Поступило за месяц</div>
            <div className="text-2xl font-bold text-primary">{fmtRub(total)}</div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-sm text-muted-foreground mb-1">Платежей</div>
            <div className="text-2xl font-bold">{count}</div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-sm text-muted-foreground mb-1">Клиентов</div>
            <div className="text-2xl font-bold">{customers}</div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-sm text-muted-foreground mb-1">Прогноз продлений</div>
            <div className="text-2xl font-bold" style={{ color: 'hsl(var(--status-pending))' }}>
              {fmtRub(forecastTotal)}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 bg-muted/40 font-semibold">Платежи</div>
          <table className="w-full text-sm">
            <thead className="bg-muted/20">
              <tr>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Дата</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Клиент</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Ячейка</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Описание</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Способ</th>
                <th className="text-right px-4 py-2 font-medium text-muted-foreground">Сумма</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Нет платежей</td></tr>
              ) : entries.map(p => (
                <tr key={p.id} className="border-t border-border hover:bg-muted/20">
                  <td className="px-4 py-3 whitespace-nowrap">{fmtDateTime(p.paidAt)}</td>
                  <td className="px-4 py-3">
                    <div>{p.customerName || '—'}</div>
                    <div className="text-xs text-muted-foreground">{p.customerPhone}</div>
                  </td>
                  <td className="px-4 py-3 font-semibold">{p.cellNumber ? `№${p.cellNumber}` : '—'}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground max-w-[260px] truncate">{p.description || '—'}</td>
                  <td className="px-4 py-3"><Badge variant="outline">{p.paymentMethod || '—'}</Badge></td>
                  <td className="px-4 py-3 text-right font-semibold text-primary">{fmtRub(p.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 bg-muted/40 font-semibold flex items-center gap-2">
            <Repeat className="h-4 w-4" />
            Прогноз продлений — аренды, заканчивающиеся в этом месяце
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted/20">
              <tr>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Окончание</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Клиент</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Ячейка</th>
                <th className="text-right px-4 py-2 font-medium text-muted-foreground">Срок (мес)</th>
                <th className="text-right px-4 py-2 font-medium text-muted-foreground">Цена / мес</th>
                <th className="text-right px-4 py-2 font-medium text-muted-foreground">Прогноз</th>
              </tr>
            </thead>
            <tbody>
              {forecastEntries.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Нет аренд, заканчивающихся в этом месяце</td></tr>
              ) : forecastEntries.map(e => (
                <tr key={e.rentalId} className="border-t border-border hover:bg-muted/20">
                  <td className="px-4 py-3 whitespace-nowrap">{fmtDate(e.endDate)}</td>
                  <td className="px-4 py-3">
                    <div>{e.customerName || '—'}</div>
                    <div className="text-xs text-muted-foreground">{e.customerPhone}</div>
                  </td>
                  <td className="px-4 py-3 font-semibold">{e.cellNumber ? `№${e.cellNumber}` : '—'}</td>
                  <td className="px-4 py-3 text-right">{e.durationMonths}</td>
                  <td className="px-4 py-3 text-right">{fmtRub(e.pricePerMonth)}</td>
                  <td className="px-4 py-3 text-right font-semibold" style={{ color: 'hsl(var(--status-pending))' }}>
                    {fmtRub(e.forecastAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
            {forecastEntries.length > 0 && (
              <tfoot>
                <tr className="border-t border-border bg-muted/30 font-bold">
                  <td className="px-4 py-3" colSpan={5}>Итого прогноз</td>
                  <td className="px-4 py-3 text-right" style={{ color: 'hsl(var(--status-pending))' }}>{fmtRub(forecastTotal)}</td>
                </tr>
              </tfoot>
            )}
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
            Кассовый метод: учитываются деньги по дате поступления. Кликните месяц для деталей.
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

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: `Поступило за ${year}`, value: yearTotal, color: 'var(--primary)', icon: TrendingUp, suffix: ' ₽' },
          { label: 'Платежей за год', value: yearPayments, color: 'var(--status-active)', icon: Wallet, suffix: '' },
          { label: `Текущий месяц (${fmtMonth(currentYm)})`, value: yearMap.get(currentYm)?.total || 0, color: 'var(--status-pending)', icon: Users, suffix: ' ₽' },
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
              <AnimatedCounter value={s.value} />{s.suffix}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 bg-muted/40 font-semibold flex items-center justify-between">
          <span>Месяцы {year}</span>
          {isLoading && <span className="text-xs text-muted-foreground">Загрузка...</span>}
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/20">
            <tr>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">Месяц</th>
              <th className="text-right px-4 py-2 font-medium text-muted-foreground">Платежей</th>
              <th className="text-right px-4 py-2 font-medium text-muted-foreground">Клиентов</th>
              <th className="text-right px-4 py-2 font-medium text-muted-foreground">Поступило</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {Array.from(yearMap.entries()).map(([ym, v]) => {
              const isCurrent = ym === currentYm;
              const empty = v.total === 0 && v.payments === 0;
              return (
                <tr
                  key={ym}
                  className="border-t border-border hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => setSelectedMonth(ym)}
                >
                  <td className="px-4 py-3 font-semibold">
                    <span className="inline-flex items-center gap-2">
                      {fmtMonth(ym)}
                      {isCurrent && (
                        <Badge style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}>
                          Сейчас
                        </Badge>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">{v.payments || '—'}</td>
                  <td className="px-4 py-3 text-right">{v.customers || '—'}</td>
                  <td className="px-4 py-3 text-right font-semibold" style={{
                    color: empty ? 'hsl(var(--muted-foreground))' : 'hsl(var(--primary))'
                  }}>
                    {empty ? '—' : fmtRub(v.total)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ChevronRight className="h-4 w-4 inline text-muted-foreground" />
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-border bg-muted/30 font-bold">
              <td className="px-4 py-3">Итого за {year}</td>
              <td className="px-4 py-3 text-right">{yearPayments || '—'}</td>
              <td className="px-4 py-3"></td>
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
