import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, MoreHorizontal, Phone, CheckCircle, XCircle, Clock } from 'lucide-react';

const mockApplications = [
  {
    id: 'Z-001',
    name: 'Иван Петров',
    phone: '+7 (999) 123-45-67',
    email: 'ivan@email.com',
    cellSize: '3-5 м²',
    message: 'Интересует ячейка для хранения сезонных вещей',
    source: 'Сайт',
    date: '15.03.2024 14:32',
    status: 'new',
  },
  {
    id: 'Z-002',
    name: 'Анна Сидорова',
    phone: '+7 (999) 234-56-78',
    email: 'anna@company.ru',
    cellSize: '10-15 м²',
    message: 'Нужна ячейка для архива документов компании',
    source: 'Звонок',
    date: '15.03.2024 11:15',
    status: 'processing',
  },
  {
    id: 'Z-003',
    name: 'ООО "Логистика"',
    phone: '+7 (999) 345-67-89',
    email: 'info@logistics.ru',
    cellSize: '20+ м²',
    message: 'Ищем склад для хранения товаров',
    source: 'Сайт',
    date: '14.03.2024 16:45',
    status: 'completed',
  },
  {
    id: 'Z-004',
    name: 'Петр Козлов',
    phone: '+7 (999) 456-78-90',
    email: '',
    cellSize: '5-10 м²',
    message: '',
    source: 'Заказ звонка',
    date: '14.03.2024 09:20',
    status: 'rejected',
  },
];

const statusConfig = {
  new: { label: 'Новая', className: 'bg-blue-500/10 text-blue-600', icon: Clock },
  processing: { label: 'В работе', className: 'bg-amber-500/10 text-amber-600', icon: Clock },
  completed: { label: 'Завершена', className: 'bg-green-500/10 text-green-600', icon: CheckCircle },
  rejected: { label: 'Отклонена', className: 'bg-red-500/10 text-red-600', icon: XCircle },
};

const AdminApplications = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredApplications = mockApplications.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.phone.includes(searchQuery) ||
      app.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Заявки</h2>
        <p className="text-muted-foreground">
          Новых: {mockApplications.filter((a) => a.status === 'new').length} | 
          В работе: {mockApplications.filter((a) => a.status === 'processing').length}
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по имени или телефону..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
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
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Клиент</TableHead>
                <TableHead>Размер</TableHead>
                <TableHead>Сообщение</TableHead>
                <TableHead>Источник</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.map((app) => {
                const StatusIcon = statusConfig[app.status as keyof typeof statusConfig].icon;
                return (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{app.name}</p>
                        <p className="text-sm text-muted-foreground">{app.phone}</p>
                        {app.email && (
                          <p className="text-sm text-muted-foreground">{app.email}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{app.cellSize}</TableCell>
                    <TableCell className="max-w-[200px]">
                      <p className="truncate text-sm text-muted-foreground">
                        {app.message || '—'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{app.source}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{app.date}</TableCell>
                    <TableCell>
                      <Badge className={statusConfig[app.status as keyof typeof statusConfig].className}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig[app.status as keyof typeof statusConfig].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Phone className="h-4 w-4 mr-2" />
                            Позвонить
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Взять в работу
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-green-600">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Завершить
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <XCircle className="h-4 w-4 mr-2" />
                            Отклонить
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminApplications;
