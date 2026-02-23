import { Box, Key, Users, CreditCard, TrendingUp, AlertCircle, ArrowUpRight } from 'lucide-react';
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
  },
  {
    title: 'Активных аренд',
    value: 38,
    description: '5 заканчиваются скоро',
    icon: Key,
    trend: '+12%',
    trendUp: true,
    color: 'hsl(var(--status-active))',
  },
  {
    title: 'Клиентов',
    value: 35,
    description: '3 новых за неделю',
    icon: Users,
    trend: '+8%',
    trendUp: true,
    color: 'hsl(var(--primary))',
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
  },
];

const recentApplications = [
  { id: 1, name: 'Иван Петров', phone: '+7 (999) 123-45-67', cellSize: '3 м²', date: '15 мин назад', status: 'new' },
  { id: 2, name: 'Анна Сидорова', phone: '+7 (999) 234-56-78', cellSize: '5 м²', date: '2 часа назад', status: 'new' },
  { id: 3, name: 'Петр Козлов', phone: '+7 (999) 345-67-89', cellSize: '10 м²', date: 'Вчера', status: 'processing' },
];

const expiringRentals = [
  { id: 1, customer: 'ООО "Техно"', cell: 'A-12', expiresIn: '3 дня', amount: '₽ 8 500' },
  { id: 2, customer: 'Мария Иванова', cell: 'B-05', expiresIn: '5 дней', amount: '₽ 4 200' },
  { id: 3, customer: 'ИП Смирнов', cell: 'C-22', expiresIn: '7 дней', amount: '₽ 12 000' },
];

const statusDot = (status: string) => {
  const colors: Record<string, string> = {
    new: 'bg-[hsl(var(--status-new))]',
    processing: 'bg-[hsl(var(--status-pending))]',
  };
  return <span className={`inline-block h-2 w-2 rounded-full ${colors[status] || 'bg-muted-foreground'}`} />;
};

const container = {
  animate: {
    transition: { staggerChildren: 0.08 },
  },
};

const AdminDashboard = () => {
  return (
    <motion.div className="space-y-6" variants={container} initial="initial" animate="animate">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Дашборд</h2>
        <p className="text-sm text-muted-foreground">Обзор текущего состояния склада</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <CrmCard key={stat.title}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[13px] font-medium text-muted-foreground">{stat.title}</span>
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
              >
                <stat.icon className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-bold">
              <AnimatedCounter
                value={stat.value}
                prefix={stat.prefix}
                duration={1 + i * 0.2}
              />
            </div>
            <p className="text-[12px] text-muted-foreground mt-1">{stat.description}</p>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className={`h-3 w-3 ${stat.trendUp ? 'text-[hsl(var(--status-active))]' : 'text-[hsl(var(--status-overdue))]'}`} />
              <span className={`text-[12px] font-medium ${stat.trendUp ? 'text-[hsl(var(--status-active))]' : 'text-[hsl(var(--status-overdue))]'}`}>
                {stat.trend}
              </span>
            </div>
          </CrmCard>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Applications */}
        <CrmCard>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[15px] font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-[hsl(var(--status-new))]" />
                Новые заявки
              </h3>
              <p className="text-[12px] text-muted-foreground">Требуют обработки</p>
            </div>
            <button className="text-[12px] text-primary hover:underline flex items-center gap-0.5">
              Все <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-2">
            {recentApplications.map((app) => (
              <motion.div
                key={app.id}
                whileHover={{ x: 2 }}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  {statusDot(app.status)}
                  <div>
                    <p className="text-[13px] font-medium">{app.name}</p>
                    <p className="text-[12px] text-muted-foreground">{app.phone}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-medium">{app.cellSize}</p>
                  <p className="text-[11px] text-muted-foreground">{app.date}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </CrmCard>

        {/* Expiring Rentals */}
        <CrmCard>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[15px] font-semibold flex items-center gap-2">
                <Key className="h-4 w-4 text-[hsl(var(--status-pending))]" />
                Истекающие аренды
              </h3>
              <p className="text-[12px] text-muted-foreground">Ближайшие 7 дней</p>
            </div>
            <button className="text-[12px] text-primary hover:underline flex items-center gap-0.5">
              Все <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-2">
            {expiringRentals.map((rental) => (
              <motion.div
                key={rental.id}
                whileHover={{ x: 2 }}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors cursor-pointer"
              >
                <div>
                  <p className="text-[13px] font-medium">{rental.customer}</p>
                  <p className="text-[12px] text-muted-foreground">Ячейка {rental.cell}</p>
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-semibold text-[hsl(var(--status-pending))]">{rental.expiresIn}</p>
                  <p className="text-[11px] text-muted-foreground">{rental.amount}/мес</p>
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
