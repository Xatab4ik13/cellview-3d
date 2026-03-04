import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, CheckCircle, Clock, XCircle, ArrowUpRight, ArrowDownRight, Loader2, AlertCircle } from 'lucide-react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { motion } from 'framer-motion';
import AnimatedCounter from '@/components/crm/AnimatedCounter';
import { fetchPayments, PaymentData } from '@/lib/api';

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  paid: { label: 'Оплачен', color: 'var(--status-active)', icon: CheckCircle },
  pending: { label: 'Ожидание', color: 'var(--status-pending)', icon: Clock },
  created: { label: 'Создан', color: 'var(--status-pending)', icon: Clock },
  failed: { label: 'Ошибка', color: 'var(--status-overdue)', icon: XCircle },
  refunded: { label: 'Возврат', color: 'var(--status-overdue)', icon: ArrowDownRight },
  expired: { label: 'Истёк', color: 'var(--status-overdue)', icon: XCircle },
};

const AdminPayments = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: payments = [], isLoading, error } = useQuery({
    queryKey: ['payments'],
    queryFn: () => fetchPayments(),
  });

  const filtered = payments.filter(p => {
    const matchSearch =
      (p.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPaid = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const totalPending = payments.filter(p => p.status === 'pending' || p.status === 'created').reduce((s, p) => s + p.amount, 0);
  const totalRefunded = payments.filter(p => p.status === 'refunded').reduce((s, p) => s + p.amount, 0);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('ru-RU');
    } catch { return dateStr; }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Платежи</h2>
        <p className="text-base text-muted-foreground mt-1">Финансовые операции и история</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Приход', value: totalPaid, color: 'var(--status-active)' },
          { label: 'Ожидание', value: totalPending, color: 'var(--status-pending)' },
          { label: 'Возвраты', value: totalRefunded, color: 'var(--status-overdue)' },
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
            <SelectItem value="paid">Оплаченные</SelectItem>
            <SelectItem value="pending">Ожидающие</SelectItem>
            <SelectItem value="failed">С ошибкой</SelectItem>
            <SelectItem value="refunded">Возвраты</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading / Error */}
      {isLoading && (
        <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Загрузка платежей...</span>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center py-12 text-destructive gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>Ошибка загрузки: {(error as Error).message}</span>
        </div>
      )}

      {/* Table */}
      {!isLoading && !error && (
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
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      {payments.length === 0 ? 'Платежей пока нет' : 'Ничего не найдено'}
                    </td>
                  </tr>
                ) : filtered.map((p, i) => {
                  const sc = statusConfig[p.status] || statusConfig.pending;
                  const StatusIcon = sc.icon;
                  const isRefund = p.status === 'refunded';
                  return (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-4 font-medium text-sm font-mono">{p.id.slice(0, 8)}</td>
                      <td className="p-4 text-sm">{p.customerName || '—'}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          {isRefund ? (
                            <ArrowDownRight className="h-4 w-4 text-[hsl(var(--status-overdue))]" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4 text-[hsl(var(--status-active))]" />
                          )}
                          <span className={`font-semibold text-sm ${isRefund ? 'text-[hsl(var(--status-overdue))]' : ''}`}>
                            {isRefund ? '-' : ''}{p.amount.toLocaleString('ru-RU')} ₽
                          </span>
                        </div>
                      </td>
                      <td className="p-4 max-w-[200px]">
                        <p className="truncate text-sm text-muted-foreground">{p.description || '—'}</p>
                      </td>
                      <td className="p-4">
                        {p.paymentMethod ? (
                          <Badge variant="outline" className="text-xs">{p.paymentMethod}</Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{formatDate(p.createdAt)}</td>
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
      )}
    </div>
  );
};

export default AdminPayments;
