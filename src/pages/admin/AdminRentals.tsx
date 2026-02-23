import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, MoreHorizontal, Eye, Edit, Ban, RefreshCw, Plus, Loader2 } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useRentals, useExtendRental, useReleaseRental } from '@/hooks/useRentals';
import { format, differenceInDays, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: 'Активна', color: 'var(--status-active)' },
  expiring: { label: 'Заканчивается', color: 'var(--status-pending)' },
  expired: { label: 'Истекла', color: 'var(--status-overdue)' },
  cancelled: { label: 'Отменена', color: 'var(--status-overdue)' },
};

function getRentalDisplayStatus(rental: { status: string; endDate: string }) {
  if (rental.status === 'cancelled') return 'cancelled';
  if (rental.status === 'expired') return 'expired';
  const daysLeft = differenceInDays(parseISO(rental.endDate), new Date());
  if (daysLeft <= 7 && daysLeft >= 0) return 'expiring';
  if (daysLeft < 0) return 'expired';
  return 'active';
}

function formatDate(dateStr: string) {
  try {
    return format(parseISO(dateStr), 'dd.MM.yyyy', { locale: ru });
  } catch {
    return dateStr;
  }
}

const AdminRentals = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tab, setTab] = useState('all');
  const { data: rentals = [], isLoading, error } = useRentals();
  const extendMutation = useExtendRental();
  const releaseMutation = useReleaseRental();

  // Enrich with display status
  const enriched = rentals.map(r => ({
    ...r,
    displayStatus: getRentalDisplayStatus(r),
  }));

  const filtered = enriched.filter(r => {
    const matchSearch =
      (r.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.customerPhone || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(r.cellNumber || '').includes(searchQuery);
    if (tab === 'all') return matchSearch;
    return matchSearch && r.displayStatus === tab;
  });

  const counts = {
    all: enriched.length,
    active: enriched.filter(r => r.displayStatus === 'active').length,
    expiring: enriched.filter(r => r.displayStatus === 'expiring').length,
    expired: enriched.filter(r => r.displayStatus === 'expired' || r.displayStatus === 'cancelled').length,
  };

  const handleExtend = (id: string, name: string) => {
    extendMutation.mutate({ id, months: 1 });
  };

  const handleRelease = (id: string, name: string) => {
    if (confirm(`Завершить аренду для ${name}?`)) {
      releaseMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Загрузка аренд...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-destructive font-medium">Ошибка загрузки: {(error as Error).message}</p>
        <p className="text-sm text-muted-foreground mt-2">Проверьте подключение к серверу</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">Аренды</h2>
          <p className="text-base text-muted-foreground mt-1">Управление договорами аренды</p>
        </div>
        <Button className="gap-2 h-11 text-base" onClick={() => toast.info('Используйте страницу "Ячейки" для оформления новой аренды')}>
          <Plus className="w-5 h-5" />
          Новая аренда
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Активных', value: counts.active, color: 'var(--status-active)' },
          { label: 'Заканчиваются', value: counts.expiring, color: 'var(--status-pending)' },
          { label: 'Истекших', value: counts.expired, color: 'var(--status-overdue)' },
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
            <p className="text-2xl font-bold mt-1" style={{ color: `hsl(${s.color})` }}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="h-11">
            <TabsTrigger value="all" className="text-sm px-4">Все ({counts.all})</TabsTrigger>
            <TabsTrigger value="active" className="text-sm px-4">Активные ({counts.active})</TabsTrigger>
            <TabsTrigger value="expiring" className="text-sm px-4">Заканчиваются ({counts.expiring})</TabsTrigger>
            <TabsTrigger value="expired" className="text-sm px-4">Истекшие ({counts.expired})</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative max-w-[280px] w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Поиск..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 h-11" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Ячейка</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Клиент</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Период</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Сумма/мес</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Итого</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Автопродление</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Статус</th>
                <th className="text-right p-4 text-sm font-semibold text-muted-foreground">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground">
                    {searchQuery ? 'Ничего не найдено' : 'Нет аренд'}
                  </td>
                </tr>
              ) : filtered.map((rental, i) => {
                const sc = statusConfig[rental.displayStatus] || statusConfig.active;
                return (
                  <motion.tr
                    key={rental.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-4">
                      <Badge variant="outline" className="font-mono text-xs">
                        №{rental.cellNumber || '—'}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-sm">{rental.customerName}</p>
                      <p className="text-xs text-muted-foreground">{rental.customerPhone}</p>
                    </td>
                    <td className="p-4 text-sm">
                      <p>{formatDate(rental.startDate)}</p>
                      <p className="text-muted-foreground">→ {formatDate(rental.endDate)}</p>
                    </td>
                    <td className="p-4 text-sm">{rental.pricePerMonth?.toLocaleString('ru-RU')} ₽</td>
                    <td className="p-4 font-semibold text-sm">{rental.totalAmount?.toLocaleString('ru-RU')} ₽</td>
                    <td className="p-4">
                      <Badge variant="outline" style={rental.autoRenew ? { borderColor: 'hsl(var(--status-active) / 0.3)', color: 'hsl(var(--status-active))' } : {}}>
                        {rental.autoRenew ? 'Да' : 'Нет'}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" style={{ borderColor: `hsl(${sc.color} / 0.3)`, color: `hsl(${sc.color})`, backgroundColor: `hsl(${sc.color} / 0.1)` }}>
                        {sc.label}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleExtend(rental.id, rental.customerName)}>
                            <RefreshCw className="h-4 w-4 mr-2" />Продлить на 1 мес
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleRelease(rental.id, rental.customerName)}>
                            <Ban className="h-4 w-4 mr-2" />Завершить
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

export default AdminRentals;
