import { useNavigate } from 'react-router-dom';
import { Box, Key, Users, CreditCard, TrendingUp, Clock, ArrowUpRight, Timer } from 'lucide-react';
import CrmCard from '@/components/crm/CrmCard';
import AnimatedCounter from '@/components/crm/AnimatedCounter';
import { motion } from 'framer-motion';

const stats = [
  {
    title: 'Всего ячеек',
    value: 42,
    description: '38 занято, 4 свободно',
    icon: Box,
    trend: '+2 за месяц',
    trendUp: true,
    color: 'hsl(var(--status-new))',
    link: '/admin/cells',
  },
  {
    title: 'Активных аренд',
    value: 38,
    description: '5 заканчиваются скоро',
    icon: Key,
    trend: '+12%',
    trendUp: true,
    color: 'hsl(var(--status-active))',
    link: '/admin/rentals',
  },
  {
    title: 'Клиентов',
    value: 35,
    description: '3 новых за неделю',
    icon: Users,
    trend: '+8%',
    trendUp: true,
    color: 'hsl(var(--primary))',
    link: '/admin/customers',
  },
  {
    title: 'Доход / мес',
    value: 285000,
    prefix: '₽ ',
    description: 'Средний чек: ₽ 7 500',
    icon: CreditCard,
    trend: '+15%',
    trendUp: true,
    color: 'hsl(var(--status-active))',
    link: '/admin/payments',
  },
];

const recentReservations = [
  { id: 1, cellNumber: 3, size: '1.88 м²', timeLeft: '1ч 45м', price: '3 000 ₽/мес' },
  { id: 2, cellNumber: 10, size: '2.02 м²', timeLeft: '0ч 32м', price: '3 200 ₽/мес' },
];

const expiringRentals = [
  { id: 1, customer: 'ООО "Техно"', cell: 'A-12', expiresIn: '3 дня', amount: '₽ 8 500' },
  { id: 2, customer: 'Мария Иванова', cell: 'B-05', expiresIn: '5 дней', amount: '₽ 4 200' },
  { id: 3, customer: 'ИП Смирнов', cell: 'C-22', expiresIn: '7 дней', amount: '₽ 12 000' },
];

const container = {
  animate: {
    transition: { staggerChildren: 0.08 },
  },
};

const AdminDashboard = () => {
  const navigate = useNavigate();

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
            <div className="flex items-center gap-1.5 mt-3">
              <TrendingUp className={`h-4 w-4 ${stat.trendUp ? 'text-[hsl(var(--status-active))]' : 'text-[hsl(var(--status-overdue))]'}`} />
              <span className={`text-sm font-medium ${stat.trendUp ? 'text-[hsl(var(--status-active))]' : 'text-[hsl(var(--status-overdue))]'}`}>
                {stat.trend}
              </span>
            </div>
          </CrmCard>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {/* Active Reservations */}
        <CrmCard>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold flex items-center gap-2">
                <Timer className="h-5 w-5 text-[hsl(var(--status-new))]" />
                Активные брони
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">Ожидают оплаты (2ч)</p>
            </div>
            <button
              onClick={() => navigate('/admin/cells')}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Все <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-3">
            {recentReservations.length > 0 ? recentReservations.map((res) => (
              <motion.div
                key={res.id}
                whileHover={{ x: 3 }}
                onClick={() => navigate('/admin/cells')}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--status-new) / 0.1)' }}>
                    <Box className="h-5 w-5" style={{ color: 'hsl(var(--status-new))' }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Ячейка №{res.cellNumber}</p>
                    <p className="text-sm text-muted-foreground">{res.size}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold flex items-center gap-1" style={{ color: 'hsl(var(--status-new))' }}>
                    <Clock className="h-3.5 w-3.5" />
                    {res.timeLeft}
                  </p>
                  <p className="text-xs text-muted-foreground">{res.price}</p>
                </div>
              </motion.div>
            )) : (
              <p className="text-sm text-muted-foreground text-center py-6">Нет активных броней</p>
            )}
          </div>
        </CrmCard>

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
            {expiringRentals.map((rental) => (
              <motion.div
                key={rental.id}
                whileHover={{ x: 3 }}
                onClick={() => navigate('/admin/rentals')}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors cursor-pointer"
              >
                <div>
                  <p className="text-sm font-medium">{rental.customer}</p>
                  <p className="text-sm text-muted-foreground">Ячейка {rental.cell}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[hsl(var(--status-pending))]">{rental.expiresIn}</p>
                  <p className="text-xs text-muted-foreground">{rental.amount}/мес</p>
                </div>
              </motion.div>
            ))}
          </div>
        </CrmCard>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
