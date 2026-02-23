import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, MoreHorizontal, Phone, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { motion } from 'framer-motion';

const mockApplications = [
  { id: 'Z-001', name: 'Иван Петров', phone: '+7 (999) 123-45-67', email: 'ivan@email.com', cellSize: '3-5 м²', message: 'Интересует ячейка для хранения сезонных вещей', source: 'Сайт', date: '15.03.2024 14:32', status: 'new' },
  { id: 'Z-002', name: 'Анна Сидорова', phone: '+7 (999) 234-56-78', email: 'anna@company.ru', cellSize: '10-15 м²', message: 'Нужна ячейка для архива документов компании', source: 'Звонок', date: '15.03.2024 11:15', status: 'processing' },
  { id: 'Z-003', name: 'ООО "Логистика"', phone: '+7 (999) 345-67-89', email: 'info@logistics.ru', cellSize: '20+ м²', message: 'Ищем склад для хранения товаров', source: 'Сайт', date: '14.03.2024 16:45', status: 'completed' },
  { id: 'Z-004', name: 'Петр Козлов', phone: '+7 (999) 456-78-90', email: '', cellSize: '5-10 м²', message: '', source: 'Заказ звонка', date: '14.03.2024 09:20', status: 'rejected' },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  new: { label: 'Новая', color: 'var(--status-new)', icon: Clock },
  processing: { label: 'В работе', color: 'var(--status-pending)', icon: Clock },
  completed: { label: 'Завершена', color: 'var(--status-active)', icon: CheckCircle },
  rejected: { label: 'Отклонена', color: 'var(--status-overdue)', icon: XCircle },
};

const AdminApplications = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = mockApplications.filter(app => {
    const matchSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) || app.phone.includes(searchQuery);
    const matchStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">Заявки</h2>
          <p className="text-base text-muted-foreground mt-1">
            Новых: {mockApplications.filter(a => a.status === 'new').length} · В работе: {mockApplications.filter(a => a.status === 'processing').length}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(statusConfig).map(([key, cfg], i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card border border-border rounded-xl p-4"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            <p className="text-sm text-muted-foreground">{cfg.label}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: `hsl(${cfg.color})` }}>
              {mockApplications.filter(a => a.status === key).length}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative max-w-[300px] w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Поиск по имени или телефону..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 h-11" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] h-11">
            <SelectValue placeholder="Все статусы" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="new">Новые</SelectItem>
            <SelectItem value="processing">В работе</SelectItem>
            <SelectItem value="completed">Завершённые</SelectItem>
            <SelectItem value="rejected">Отклонённые</SelectItem>
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
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Размер</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Сообщение</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Источник</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Дата</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Статус</th>
                <th className="text-right p-4 text-sm font-semibold text-muted-foreground">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((app, i) => {
                const sc = statusConfig[app.status];
                const StatusIcon = sc.icon;
                return (
                  <motion.tr
                    key={app.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-4 font-medium text-sm">{app.id}</td>
                    <td className="p-4">
                      <p className="font-medium text-sm">{app.name}</p>
                      <p className="text-xs text-muted-foreground">{app.phone}</p>
                      {app.email && <p className="text-xs text-muted-foreground">{app.email}</p>}
                    </td>
                    <td className="p-4 text-sm">{app.cellSize}</td>
                    <td className="p-4 max-w-[200px]">
                      <p className="truncate text-sm text-muted-foreground">{app.message || '—'}</p>
                    </td>
                    <td className="p-4"><Badge variant="outline" className="text-xs">{app.source}</Badge></td>
                    <td className="p-4 text-sm text-muted-foreground">{app.date}</td>
                    <td className="p-4">
                      <Badge variant="outline" className="gap-1.5" style={{ borderColor: `hsl(${sc.color} / 0.3)`, color: `hsl(${sc.color})`, backgroundColor: `hsl(${sc.color} / 0.1)` }}>
                        <StatusIcon className="w-3.5 h-3.5" />{sc.label}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontal className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Phone className="h-4 w-4 mr-2" />Позвонить</DropdownMenuItem>
                          <DropdownMenuItem><CheckCircle className="h-4 w-4 mr-2" />Взять в работу</DropdownMenuItem>
                          <DropdownMenuItem className="text-[hsl(var(--status-active))]"><CheckCircle className="h-4 w-4 mr-2" />Завершить</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive"><XCircle className="h-4 w-4 mr-2" />Отклонить</DropdownMenuItem>
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

export default AdminApplications;
