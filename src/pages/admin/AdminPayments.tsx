import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, CheckCircle, Clock, XCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { motion } from 'framer-motion';
import AnimatedCounter from '@/components/crm/AnimatedCounter';

const mockPayments = [
  { id: 'P-001', customer: 'ООО "ТехноСервис"', type: 'income' as const, amount: 8500, description: 'Аренда ячейки A-12 (март)', method: 'Карта', date: '01.03.2024', status: 'completed' },
  { id: 'P-002', customer: 'Иванов Петр', type: 'income' as const, amount: 4200, description: 'Аренда ячейки B-05 (март)', method: 'СБП', date: '01.03.2024', status: 'completed' },
  { id: 'P-003', customer: 'ИП Смирнова А.В.', type: 'income' as const, amount: 12000, description: 'Аренда ячейки C-22 (март)', method: 'Счёт', date: '28.02.2024', status: 'pending' },
  { id: 'P-004', customer: 'Козлов Андрей', type: 'refund' as const, amount: 1500, description: 'Возврат за неиспользованные дни', method: 'Карта', date: '25.02.2024', status: 'completed' },
  { id: 'P-005', customer: 'ООО "Логистика"', type: 'income' as const, amount: 25000, description: 'Аренда ячейки D-01 (март)', method: 'Счёт', date: '20.02.2024', status: 'failed' },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  completed: { label: 'Проведён', color: 'var(--status-active)', icon: CheckCircle },
  pending: { label: 'Ожидание', color: 'var(--status-pending)', icon: Clock },
  failed: { label: 'Ошибка', color: 'var(--status-overdue)', icon: XCircle },
};

const AdminPayments = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = mockPayments.filter(p => {
    const matchSearch = p.customer.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalIncome = mockPayments.filter(p => p.type === 'income' && p.status === 'completed').reduce((s, p) => s + p.amount, 0);
  const totalRefunds = mockPayments.filter(p => p.type === 'refund' && p.status === 'completed').reduce((s, p) => s + p.amount, 0);
  const totalPending = mockPayments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Платежи</h2>
        <p className="text-base text-muted-foreground mt-1">Финансовые операции и история</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Приход', value: totalIncome, color: 'var(--status-active)' },
          { label: 'Ожидание', value: totalPending, color: 'var(--status-pending)' },
          { label: 'Возвраты', value: totalRefunds, color: 'var(--status-overdue)' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card border border-border rounded-xl p-4"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: `hsl(${s.color})` }}>
              <AnimatedCounter value={s.value} prefix="₽ " duration={0.8} />
            </p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative max-w-[300px] w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Поиск по клиенту или ID..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 h-11" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] h-11"><SelectValue placeholder="Все статусы" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="completed">Проведённые</SelectItem>
            <SelectItem value="pending">Ожидающие</SelectItem>
            <SelectItem value="failed">С ошибкой</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">ID</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Клиент</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Сумма</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Описание</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Способ</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Дата</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Статус</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const sc = statusConfig[p.status];
                const StatusIcon = sc.icon;
                return (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-4 font-medium text-sm">{p.id}</td>
                    <td className="p-4 text-sm">{p.customer}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        {p.type === 'income' ? (
                          <ArrowUpRight className="h-4 w-4 text-[hsl(var(--status-active))]" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-[hsl(var(--status-overdue))]" />
                        )}
                        <span className={`font-semibold text-sm ${p.type === 'refund' ? 'text-[hsl(var(--status-overdue))]' : ''}`}>
                          {p.type === 'refund' ? '-' : ''}{p.amount.toLocaleString('ru-RU')} ₽
                        </span>
                      </div>
                    </td>
                    <td className="p-4 max-w-[200px]">
                      <p className="truncate text-sm text-muted-foreground">{p.description}</p>
                    </td>
                    <td className="p-4"><Badge variant="outline" className="text-xs">{p.method}</Badge></td>
                    <td className="p-4 text-sm text-muted-foreground">{p.date}</td>
                    <td className="p-4">
                      <Badge variant="outline" className="gap-1.5" style={{ borderColor: `hsl(${sc.color} / 0.3)`, color: `hsl(${sc.color})`, backgroundColor: `hsl(${sc.color} / 0.1)` }}>
                        <StatusIcon className="w-3.5 h-3.5" />{sc.label}
                      </Badge>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPayments;
