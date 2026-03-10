import { useNavigate } from 'react-router-dom';
import { Box, Key, Users, CreditCard, Clock, ArrowUpRight, Loader2, AlertTriangle } from 'lucide-react';
import CrmCard from '@/components/crm/CrmCard';
import AnimatedCounter from '@/components/crm/AnimatedCounter';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { useCells } from '@/hooks/useCells';
import { useRentals } from '@/hooks/useRentals';
import { useCustomers } from '@/hooks/useCustomers';
import { usePayments } from '@/hooks/usePayments';
import { differenceInDays, parseISO, format, startOfMonth, subMonths } from 'date-fns';
import { ru } from 'date-fns/locale';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const container = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const COLORS = {
  occupied: 'hsl(var(--status-overdue))',
  reserved: 'hsl(var(--status-pending))',
  available: 'hsl(var(--status-active))',
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { data: cells = [], isLoading: cellsLoading } = useCells();
  const { data: rentals = [], isLoading: rentalsLoading } = useRentals();
  const { data: customers = [], isLoading: customersLoading } = useCustomers();
  const { data: payments = [], isLoading: paymentsLoading } = usePayments();

  const isLoading = cellsLoading || rentalsLoading || customersLoading || paymentsLoading;

  // Cell stats
  const totalCells = cells.length;
  const occupiedCells = cells.filter(c => c.status === 'occupied').length;
  const reservedCells = cells.filter(c => c.status === 'reserved').length;
  const freeCells = cells.filter(c => c.status === 'available').length;

  // Rental stats
  const activeRentals = rentals.filter(r => r.status === 'active');
  const expiringRentals = activeRentals.filter(r => {
    const daysLeft = differenceInDays(parseISO(r.endDate), new Date());
    return daysLeft >= 0 && daysLeft <= 7;
  });
  const debtorRentals = activeRentals.filter(r => {
    return differenceInDays(parseISO(r.endDate), new Date()) < 0;
  });

  // Customer stats
  const totalCustomers = customers.length;
  const recentCustomers = customers.filter(c => {
    if (!c.createdAt) return false;
    return differenceInDays(new Date(), parseISO(c.createdAt)) <= 7;
  });

  // Revenue stats
  const paidPayments = payments.filter(p => p.status === 'paid');
  const totalRevenue = paidPayments.reduce((s, p) => s + (p.amount || 0), 0);
  const monthlyRevenue = activeRentals.reduce((sum, r) => sum + (r.pricePerMonth || 0), 0);
  const avgCheck = paidPayments.length > 0 ? Math.round(totalRevenue / paidPayments.length) : 0;

  // Revenue by month (last 6 months)
  const revenueByMonth = Array.from({ length: 6 }, (_, i) => {
    const month = subMonths(new Date(), 5 - i);
    const monthStart = startOfMonth(month);
    const monthEnd = startOfMonth(subMonths(new Date(), 4 - i));
    const monthPayments = paidPayments.filter(p => {
      const d = new Date(p.paidAt || p.createdAt);
      return d >= monthStart && d < (i === 5 ? new Date(2099, 0) : monthEnd);
    });
    return {
      name: format(month, 'MMM', { locale: ru }),
      revenue: monthPayments.reduce((s, p) => s + (p.amount || 0), 0),
    };
  });

  // Occupancy pie chart
  const occupancyData = [
    { name: 'Занято', value: occupiedCells, color: COLORS.occupied },
    { name: 'Бронь', value: reservedCells, color: COLORS.reserved },
    { name: 'Свободно', value: freeCells, color: COLORS.available },
  ].filter(d => d.value > 0);

  const stats = [
    {
      title: 'Всего ячеек',
      value: totalCells,
      description: `${occupiedCells} занято · ${freeCells} свободно`,
      icon: Box,
      color: 'hsl(var(--status-new))',
      link: '/admin/cells',
    },
    {
      title: 'Активных аренд',
      value: activeRentals.length,
      description: debtorRentals.length > 0 ? `${debtorRentals.length} просрочено!` : `${expiringRentals.length} заканчиваются`,
      icon: Key,
      color: debtorRentals.length > 0 ? 'hsl(var(--status-overdue))' : 'hsl(var(--status-active))',
      link: '/admin/rentals',
    },
    {
      title: 'Клиентов',
      value: totalCustomers,
      description: `${recentCustomers.length} новых за неделю`,
      icon: Users,
      color: 'hsl(var(--primary))',
      link: '/admin/customers',
    },
    {
      title: 'Выручка',
      value: totalRevenue,
      prefix: '₽ ',
      description: `Средний чек: ₽ ${avgCheck.toLocaleString('ru-RU')}`,
      icon: CreditCard,
      color: 'hsl(var(--status-active))',
      link: '/admin/payments',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Загрузка данных...</span>
      </div>
    );
  }

  return (
    <motion.div className="space-y-8" variants={container} initial="initial" animate="animate">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Дашборд</h2>
        <p className="text-base text-muted-foreground mt-1">Обзор текущего состояния склада</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <CrmCard key={stat.title} className="cursor-pointer" onClick={() => navigate(stat.link)}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">{stat.title}</span>
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
              >
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <div className="text-3xl font-bold">
              <AnimatedCounter value={stat.value} prefix={stat.prefix} duration={1 + i * 0.2} />
            </div>
            <p className="text-sm text-muted-foreground mt-1">{stat.description}</p>
          </CrmCard>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-5 md:grid-cols-3">
        {/* Revenue Chart */}
        <CrmCard className="md:col-span-2">
          <h3 className="text-base font-semibold mb-4">Выручка по месяцам</h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: number) => [`${value.toLocaleString('ru-RU')} ₽`, 'Выручка']}
                  contentStyle={{ borderRadius: 8, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }}
                />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CrmCard>

        {/* Occupancy Pie */}
        <CrmCard>
          <h3 className="text-base font-semibold mb-4">Заполняемость</h3>
          <div className="h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={occupancyData} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3}>
                  {occupancyData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number, name: string) => [value, name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {occupancyData.map(d => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                {d.name}: {d.value}
              </div>
            ))}
          </div>
        </CrmCard>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {/* Debtors */}
        <CrmCard>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-[hsl(var(--status-overdue))]" />
                Должники
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">{debtorRentals.length} просроченных аренд</p>
            </div>
            <button onClick={() => navigate('/admin/rentals')} className="text-sm text-primary hover:underline flex items-center gap-1">
              Все <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-3">
            {debtorRentals.length > 0 ? debtorRentals.slice(0, 5).map((rental) => {
              const daysOverdue = Math.abs(differenceInDays(parseISO(rental.endDate), new Date()));
              return (
                <motion.div
                  key={rental.id}
                  whileHover={{ x: 3 }}
                  onClick={() => navigate('/admin/rentals')}
                  className="flex items-center justify-between p-4 rounded-lg bg-[hsl(var(--status-overdue))]/5 hover:bg-[hsl(var(--status-overdue))]/10 transition-colors cursor-pointer"
                >
                  <div>
                    <p className="text-sm font-medium">{rental.customerName}</p>
                    <p className="text-sm text-muted-foreground">Ячейка №{rental.cellNumber || '—'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[hsl(var(--status-overdue))]">
                      {daysOverdue} дн. просрочки
                    </p>
                    <p className="text-xs text-muted-foreground">{rental.pricePerMonth?.toLocaleString('ru-RU')} ₽/мес</p>
                  </div>
                </motion.div>
              );
            }) : (
              <p className="text-sm text-muted-foreground text-center py-6">Нет просроченных аренд 🎉</p>
            )}
          </div>
        </CrmCard>

        {/* Expiring Rentals */}
        <CrmCard>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5 text-[hsl(var(--status-pending))]" />
                Заканчиваются скоро
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">Ближайшие 7 дней</p>
            </div>
            <button onClick={() => navigate('/admin/rentals')} className="text-sm text-primary hover:underline flex items-center gap-1">
              Все <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-3">
            {expiringRentals.length > 0 ? expiringRentals.slice(0, 5).map((rental) => {
              const daysLeft = differenceInDays(parseISO(rental.endDate), new Date());
              return (
                <motion.div
                  key={rental.id}
                  whileHover={{ x: 3 }}
                  onClick={() => navigate('/admin/rentals')}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors cursor-pointer"
                >
                  <div>
                    <p className="text-sm font-medium">{rental.customerName}</p>
                    <p className="text-sm text-muted-foreground">Ячейка №{rental.cellNumber || '—'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[hsl(var(--status-pending))]">
                      {daysLeft === 0 ? 'Сегодня' : `${daysLeft} дн.`}
                    </p>
                    <p className="text-xs text-muted-foreground">{rental.pricePerMonth?.toLocaleString('ru-RU')} ₽/мес</p>
                  </div>
                </motion.div>
              );
            }) : (
              <p className="text-sm text-muted-foreground text-center py-6">Нет истекающих аренд</p>
            )}
          </div>
        </CrmCard>
      </div>

      {/* Quick stats footer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border p-4 text-center">
          <p className="text-xs text-muted-foreground">Доход/мес (активные)</p>
          <p className="text-xl font-bold mt-1">{monthlyRevenue.toLocaleString('ru-RU')} ₽</p>
        </div>
        <div className="rounded-xl border border-border p-4 text-center">
          <p className="text-xs text-muted-foreground">Средний чек</p>
          <p className="text-xl font-bold mt-1">{avgCheck.toLocaleString('ru-RU')} ₽</p>
        </div>
        <div className="rounded-xl border border-border p-4 text-center">
          <p className="text-xs text-muted-foreground">Заполняемость</p>
          <p className="text-xl font-bold mt-1">{totalCells ? Math.round((occupiedCells / totalCells) * 100) : 0}%</p>
        </div>
        <div className="rounded-xl border border-border p-4 text-center">
          <p className="text-xs text-muted-foreground">Всего платежей</p>
          <p className="text-xl font-bold mt-1">{paidPayments.length}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
