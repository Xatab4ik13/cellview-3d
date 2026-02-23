import { useNavigate } from 'react-router-dom';
import { Box, Key, Users, CreditCard, TrendingUp, Clock, ArrowUpRight, Timer, Loader2 } from 'lucide-react';
import CrmCard from '@/components/crm/CrmCard';
import AnimatedCounter from '@/components/crm/AnimatedCounter';
import { motion } from 'framer-motion';
import { useCells } from '@/hooks/useCells';
import { useRentals } from '@/hooks/useRentals';
import { useCustomers } from '@/hooks/useCustomers';
import { differenceInDays, parseISO } from 'date-fns';

const container = {
  animate: {
    transition: { staggerChildren: 0.08 },
  },
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { data: cells = [], isLoading: cellsLoading } = useCells();
  const { data: rentals = [], isLoading: rentalsLoading } = useRentals();
  const { data: customers = [], isLoading: customersLoading } = useCustomers();

  const isLoading = cellsLoading || rentalsLoading || customersLoading;

  // Computed stats
  const totalCells = cells.length;
  const occupiedCells = cells.filter(c => c.status === 'occupied' || c.status === 'reserved').length;
  const freeCells = cells.filter(c => c.status === 'available').length;

  const activeRentals = rentals.filter(r => r.status === 'active');
  const expiringRentals = activeRentals.filter(r => {
    const daysLeft = differenceInDays(parseISO(r.endDate), new Date());
    return daysLeft >= 0 && daysLeft <= 7;
  });

  const totalCustomers = customers.length;
  const recentCustomers = customers.filter(c => {
    if (!c.createdAt) return false;
    return differenceInDays(new Date(), parseISO(c.createdAt)) <= 7;
  });

  const monthlyRevenue = activeRentals.reduce((sum, r) => sum + (r.pricePerMonth || 0), 0);
  const avgCheck = activeRentals.length > 0 ? Math.round(monthlyRevenue / activeRentals.length) : 0;

  const stats = [
    {
      title: 'Всего ячеек',
      value: totalCells,
      description: `${occupiedCells} занято, ${freeCells} свободно`,
      icon: Box,
      color: 'hsl(var(--status-new))',
      link: '/admin/cells',
    },
    {
      title: 'Активных аренд',
      value: activeRentals.length,
      description: `${expiringRentals.length} заканчиваются скоро`,
      icon: Key,
      color: 'hsl(var(--status-active))',
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
      title: 'Доход / мес',
      value: monthlyRevenue,
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
              <AnimatedCounter
                value={stat.value}
                prefix={stat.prefix}
                duration={1 + i * 0.2}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-1">{stat.description}</p>
          </CrmCard>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {/* Expiring Rentals */}
        <CrmCard>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold flex items-center gap-2">
                <Key className="h-5 w-5 text-[hsl(var(--status-pending))]" />
                Истекающие аренды
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">Ближайшие 7 дней</p>
            </div>
            <button
              onClick={() => navigate('/admin/rentals')}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
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

        {/* Free Cells */}
        <CrmCard>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold flex items-center gap-2">
                <Box className="h-5 w-5 text-[hsl(var(--status-new))]" />
                Свободные ячейки
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">{freeCells} доступно</p>
            </div>
            <button
              onClick={() => navigate('/admin/cells')}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Все <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-3">
            {cells.filter(c => c.status === 'available').slice(0, 5).map((cell) => (
              <motion.div
                key={cell.id}
                whileHover={{ x: 3 }}
                onClick={() => navigate('/admin/cells')}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--status-new) / 0.1)' }}>
                    <Box className="h-5 w-5" style={{ color: 'hsl(var(--status-new))' }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Ячейка №{cell.number}</p>
                    <p className="text-sm text-muted-foreground">{cell.area} м²</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{cell.pricePerMonth?.toLocaleString('ru-RU')} ₽</p>
                  <p className="text-xs text-muted-foreground">в месяц</p>
                </div>
              </motion.div>
            ))}
            {freeCells === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">Все ячейки заняты</p>
            )}
          </div>
        </CrmCard>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
