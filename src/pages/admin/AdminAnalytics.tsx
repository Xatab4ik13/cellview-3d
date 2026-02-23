import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import CrmCard from '@/components/crm/CrmCard';
import AnimatedCounter from '@/components/crm/AnimatedCounter';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Box,
  Users,
  ArrowUpRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';

// ========== Data ==========

const revenueData = [
  { month: 'Сен', revenue: 245000, expenses: 85000 },
  { month: 'Окт', revenue: 262000, expenses: 88000 },
  { month: 'Ноя', revenue: 251000, expenses: 82000 },
  { month: 'Дек', revenue: 270000, expenses: 90000 },
  { month: 'Янв', revenue: 275000, expenses: 87000 },
  { month: 'Фев', revenue: 285000, expenses: 92000 },
];

const occupancyData = [
  { month: 'Сен', occupied: 34, total: 42 },
  { month: 'Окт', occupied: 35, total: 42 },
  { month: 'Ноя', occupied: 36, total: 42 },
  { month: 'Дек', occupied: 37, total: 42 },
  { month: 'Янв', occupied: 37, total: 42 },
  { month: 'Фев', occupied: 38, total: 42 },
];


const cellSizeDistribution = [
  { name: '1-3 м²', value: 12, color: 'hsl(210, 80%, 55%)' },
  { name: '3-6 м²', value: 15, color: 'hsl(152, 70%, 40%)' },
  { name: '6-10 м²', value: 8, color: 'hsl(38, 95%, 50%)' },
  { name: '10-20 м²', value: 5, color: 'hsl(268, 60%, 55%)' },
  { name: '20+ м²', value: 2, color: 'hsl(0, 75%, 55%)' },
];

const topClients = [
  { name: 'ООО "ТехноСервис"', revenue: '₽ 216 000', cells: 2, growth: '+12%' },
  { name: 'ООО "Логистик"', revenue: '₽ 180 000', cells: 1, growth: '+8%' },
  { name: 'ИП Смирнова А.В.', revenue: '₽ 108 000', cells: 1, growth: '+5%' },
  { name: 'Иванов П.С.', revenue: '₽ 54 000', cells: 1, growth: '0%' },
];

// ========== Component ==========

const AdminAnalytics = () => {
  const navigate = useNavigate();
  const totalRevenue = revenueData.reduce((s, d) => s + d.revenue, 0);
  const avgOccupancy = Math.round(
    (occupancyData.reduce((s, d) => s + d.occupied, 0) / occupancyData.length / 42) * 100
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Аналитика</h2>
          <p className="text-base text-muted-foreground mt-1">Финансы и статистика за 6 месяцев</p>
        </div>
        <Select defaultValue="6m">
          <SelectTrigger className="w-[180px] h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1m">За месяц</SelectItem>
            <SelectItem value="3m">За 3 месяца</SelectItem>
            <SelectItem value="6m">За 6 месяцев</SelectItem>
            <SelectItem value="1y">За год</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-5 md:grid-cols-4">
        <CrmCard>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Доход</span>
            <div className="h-10 w-10 rounded-lg bg-[hsl(var(--status-active))]/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-[hsl(var(--status-active))]" />
            </div>
          </div>
          <div className="text-3xl font-bold">
            <AnimatedCounter value={totalRevenue} prefix="₽ " />
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <TrendingUp className="h-4 w-4 text-[hsl(var(--status-active))]" />
            <span className="text-sm font-medium text-[hsl(var(--status-active))]">+18% к пред. периоду</span>
          </div>
        </CrmCard>

        <CrmCard>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Загрузка</span>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Box className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="text-3xl font-bold">
            <AnimatedCounter value={avgOccupancy} suffix="%" />
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <TrendingUp className="h-4 w-4 text-[hsl(var(--status-active))]" />
            <span className="text-sm font-medium text-[hsl(var(--status-active))]">+5% за полгода</span>
          </div>
        </CrmCard>

        <CrmCard>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Ср. чек</span>
            <div className="h-10 w-10 rounded-lg bg-[hsl(var(--status-pending))]/10 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-[hsl(var(--status-pending))]" />
            </div>
          </div>
          <div className="text-3xl font-bold">
            <AnimatedCounter value={7500} prefix="₽ " />
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <TrendingUp className="h-4 w-4 text-[hsl(var(--status-active))]" />
            <span className="text-sm font-medium text-[hsl(var(--status-active))]">+3%</span>
          </div>
        </CrmCard>

        <CrmCard>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Конверсия</span>
            <div className="h-10 w-10 rounded-lg bg-[hsl(var(--status-new))]/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-[hsl(var(--status-new))]" />
            </div>
          </div>
          <div className="text-3xl font-bold">
            <AnimatedCounter value={21} suffix="%" />
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <TrendingDown className="h-4 w-4 text-[hsl(var(--status-overdue))]" />
            <span className="text-sm font-medium text-[hsl(var(--status-overdue))]">-2%</span>
          </div>
        </CrmCard>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Revenue Chart */}
        <CrmCard>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold">Доходы и расходы</h3>
              <p className="text-sm text-muted-foreground mt-0.5">По месяцам</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={revenueData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 15% 88%)" />
              <XAxis dataKey="month" tick={{ fontSize: 13 }} stroke="hsl(215 10% 45%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(215 10% 45%)" tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid hsl(215 15% 88%)',
                  boxShadow: '0 4px 12px hsl(215 20% 50% / 0.1)',
                  fontSize: '13px',
                }}
                formatter={(value: number) => [`₽ ${value.toLocaleString('ru-RU')}`, '']}
              />
              <Bar dataKey="revenue" fill="hsl(220, 65%, 50%)" radius={[4, 4, 0, 0]} name="Доходы" />
              <Bar dataKey="expenses" fill="hsl(215, 15%, 75%)" radius={[4, 4, 0, 0]} name="Расходы" />
            </BarChart>
          </ResponsiveContainer>
        </CrmCard>

        {/* Occupancy Chart */}
        <CrmCard>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold">Загрузка склада</h3>
              <p className="text-sm text-muted-foreground mt-0.5">Занято из 42 ячеек</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={occupancyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 15% 88%)" />
              <XAxis dataKey="month" tick={{ fontSize: 13 }} stroke="hsl(215 10% 45%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(215 10% 45%)" domain={[0, 42]} />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid hsl(215 15% 88%)',
                  boxShadow: '0 4px 12px hsl(215 20% 50% / 0.1)',
                  fontSize: '13px',
                }}
              />
              <Area
                type="monotone"
                dataKey="occupied"
                stroke="hsl(152, 70%, 40%)"
                fill="hsl(152, 70%, 40%, 0.15)"
                strokeWidth={2}
                name="Занято"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CrmCard>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Cell Size Distribution */}
        <CrmCard>
          <h3 className="text-base font-semibold mb-1">Распределение по размеру</h3>
          <p className="text-sm text-muted-foreground mb-4">Популярность ячеек</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={cellSizeDistribution}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {cellSizeDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid hsl(215 15% 88%)',
                  fontSize: '13px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {cellSizeDistribution.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5 text-xs">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                {item.name}
              </div>
            ))}
          </div>
        </CrmCard>

        {/* Top Clients */}
        <CrmCard>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-base font-semibold">Топ клиенты</h3>
            <button
              onClick={() => navigate('/admin/customers')}
              className="text-sm text-primary hover:underline flex items-center gap-0.5"
            >
              Все <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground mb-4">По обороту</p>
          <div className="space-y-3">
            {topClients.map((client, i) => (
              <motion.div
                key={client.name}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-muted-foreground w-5">{i + 1}</span>
                  <div>
                    <p className="text-sm font-medium">{client.name}</p>
                    <p className="text-xs text-muted-foreground">{client.cells} ячеек</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{client.revenue}</p>
                  <p className="text-xs text-[hsl(var(--status-active))]">{client.growth}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </CrmCard>
      </div>
    </div>
  );
};

export default AdminAnalytics;
