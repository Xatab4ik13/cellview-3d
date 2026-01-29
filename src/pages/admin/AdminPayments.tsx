import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, CheckCircle, Clock, XCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const mockPayments = [
  {
    id: 'P-001',
    customer: 'ООО "ТехноСервис"',
    type: 'income',
    amount: '₽ 8 500',
    description: 'Аренда ячейки A-12 (март)',
    method: 'Карта',
    date: '01.03.2024',
    status: 'completed',
  },
  {
    id: 'P-002',
    customer: 'Иванов Петр',
    type: 'income',
    amount: '₽ 4 200',
    description: 'Аренда ячейки B-05 (март)',
    method: 'СБП',
    date: '01.03.2024',
    status: 'completed',
  },
  {
    id: 'P-003',
    customer: 'ИП Смирнова А.В.',
    type: 'income',
    amount: '₽ 12 000',
    description: 'Аренда ячейки C-22 (март)',
    method: 'Счёт',
    date: '28.02.2024',
    status: 'pending',
  },
  {
    id: 'P-004',
    customer: 'Козлов Андрей',
    type: 'refund',
    amount: '₽ 1 500',
    description: 'Возврат за неиспользованные дни',
    method: 'Карта',
    date: '25.02.2024',
    status: 'completed',
  },
  {
    id: 'P-005',
    customer: 'ООО "Логистика"',
    type: 'income',
    amount: '₽ 25 000',
    description: 'Аренда ячейки D-01 (март)',
    method: 'Счёт',
    date: '20.02.2024',
    status: 'failed',
  },
];

const statusConfig = {
  completed: { label: 'Проведён', className: 'bg-green-500/10 text-green-600', icon: CheckCircle },
  pending: { label: 'Ожидание', className: 'bg-amber-500/10 text-amber-600', icon: Clock },
  failed: { label: 'Ошибка', className: 'bg-red-500/10 text-red-600', icon: XCircle },
};

const AdminPayments = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredPayments = mockPayments.filter((payment) => {
    const matchesSearch =
      payment.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalIncome = mockPayments
    .filter((p) => p.type === 'income' && p.status === 'completed')
    .reduce((sum, p) => sum + parseInt(p.amount.replace(/\D/g, '')), 0);

  const totalRefunds = mockPayments
    .filter((p) => p.type === 'refund' && p.status === 'completed')
    .reduce((sum, p) => sum + parseInt(p.amount.replace(/\D/g, '')), 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Платежи</h2>
        <p className="text-muted-foreground">
          Приход: ₽ {totalIncome.toLocaleString()} | 
          Возвраты: ₽ {totalRefunds.toLocaleString()}
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по клиенту или ID..."
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
                <SelectItem value="completed">Проведённые</SelectItem>
                <SelectItem value="pending">Ожидающие</SelectItem>
                <SelectItem value="failed">С ошибкой</SelectItem>
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
                <TableHead>Сумма</TableHead>
                <TableHead>Описание</TableHead>
                <TableHead>Способ</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead>Статус</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => {
                const StatusIcon = statusConfig[payment.status as keyof typeof statusConfig].icon;
                return (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.id}</TableCell>
                    <TableCell>{payment.customer}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {payment.type === 'income' ? (
                          <ArrowUpRight className="h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-500" />
                        )}
                        <span className={payment.type === 'refund' ? 'text-red-500' : ''}>
                          {payment.type === 'refund' ? '-' : ''}
                          {payment.amount}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <p className="truncate text-sm text-muted-foreground">
                        {payment.description}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{payment.method}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{payment.date}</TableCell>
                    <TableCell>
                      <Badge className={statusConfig[payment.status as keyof typeof statusConfig].className}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig[payment.status as keyof typeof statusConfig].label}
                      </Badge>
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

export default AdminPayments;
