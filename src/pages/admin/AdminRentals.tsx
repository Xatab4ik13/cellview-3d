import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, MoreHorizontal, Eye, Edit, Ban, RefreshCw, Key, Plus } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const mockRentals = [
  { id: 'R-001', customer: 'ООО "ТехноСервис"', phone: '+7 (999) 123-45-67', cell: 'A-12', area: '10 м²', startDate: '15.01.2024', endDate: '15.04.2024', amount: 8500, status: 'active', autoRenew: true },
  { id: 'R-002', customer: 'Иванов Петр Сергеевич', phone: '+7 (999) 234-56-78', cell: 'B-05', area: '5 м²', startDate: '01.02.2024', endDate: '01.05.2024', amount: 4200, status: 'active', autoRenew: false },
  { id: 'R-003', customer: 'ИП Смирнова А.В.', phone: '+7 (999) 345-67-89', cell: 'C-22', area: '15 м²', startDate: '10.12.2023', endDate: '10.03.2024', amount: 12000, status: 'expiring', autoRenew: true },
  { id: 'R-004', customer: 'Козлов Андрей', phone: '+7 (999) 456-78-90', cell: 'A-08', area: '3 м²', startDate: '20.11.2023', endDate: '20.02.2024', amount: 3000, status: 'expired', autoRenew: false },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: 'Активна', color: 'var(--status-active)' },
  expiring: { label: 'Заканчивается', color: 'var(--status-pending)' },
  expired: { label: 'Истекла', color: 'var(--status-overdue)' },
};

const AdminRentals = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tab, setTab] = useState('all');

  const filtered = mockRentals.filter(r => {
    const matchSearch = r.customer.toLowerCase().includes(searchQuery.toLowerCase()) || r.cell.toLowerCase().includes(searchQuery.toLowerCase());
    if (tab === 'all') return matchSearch;
    return matchSearch && r.status === tab;
  });

  const counts = {
    all: mockRentals.length,
    active: mockRentals.filter(r => r.status === 'active').length,
    expiring: mockRentals.filter(r => r.status === 'expiring').length,
    expired: mockRentals.filter(r => r.status === 'expired').length,
  };

  const handleAction = (action: string, rental: string) => {
    toast.info(`${action}: ${rental} — будет доступно после подключения базы данных`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">Аренды</h2>
          <p className="text-base text-muted-foreground mt-1">Управление договорами аренды</p>
        </div>
        <Button className="gap-2 h-11 text-base" onClick={() => toast.info('Создание аренды будет доступно после подключения базы данных')}>
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
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">ID</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Клиент</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Ячейка</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Период</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Сумма</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Автопродление</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Статус</th>
                <th className="text-right p-4 text-sm font-semibold text-muted-foreground">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((rental, i) => {
                const sc = statusConfig[rental.status];
                return (
                  <motion.tr
                    key={rental.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-4 font-medium text-sm">{rental.id}</td>
                    <td className="p-4">
                      <p className="font-medium text-sm">{rental.customer}</p>
                      <p className="text-xs text-muted-foreground">{rental.phone}</p>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="font-mono text-xs">{rental.cell}</Badge>
                      <p className="text-xs text-muted-foreground mt-0.5">{rental.area}</p>
                    </td>
                    <td className="p-4 text-sm">
                      <p>{rental.startDate}</p>
                      <p className="text-muted-foreground">→ {rental.endDate}</p>
                    </td>
                    <td className="p-4 font-semibold text-sm">{rental.amount.toLocaleString('ru-RU')} ₽</td>
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
                          <DropdownMenuItem onClick={() => handleAction('Подробнее', rental.customer)}>
                            <Eye className="h-4 w-4 mr-2" />Подробнее
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction('Редактировать', rental.customer)}>
                            <Edit className="h-4 w-4 mr-2" />Редактировать
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction('Продлить', rental.customer)}>
                            <RefreshCw className="h-4 w-4 mr-2" />Продлить
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleAction('Завершить', rental.customer)}>
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
