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
import { Search, MoreHorizontal, Eye, Edit, Ban, RefreshCw } from 'lucide-react';

const mockRentals = [
  {
    id: 'R-001',
    customer: 'ООО "ТехноСервис"',
    phone: '+7 (999) 123-45-67',
    cell: 'A-12',
    area: '10 м²',
    startDate: '15.01.2024',
    endDate: '15.04.2024',
    amount: '₽ 8 500',
    status: 'active',
    autoRenew: true,
  },
  {
    id: 'R-002',
    customer: 'Иванов Петр Сергеевич',
    phone: '+7 (999) 234-56-78',
    cell: 'B-05',
    area: '5 м²',
    startDate: '01.02.2024',
    endDate: '01.05.2024',
    amount: '₽ 4 200',
    status: 'active',
    autoRenew: false,
  },
  {
    id: 'R-003',
    customer: 'ИП Смирнова А.В.',
    phone: '+7 (999) 345-67-89',
    cell: 'C-22',
    area: '15 м²',
    startDate: '10.12.2023',
    endDate: '10.03.2024',
    amount: '₽ 12 000',
    status: 'expiring',
    autoRenew: true,
  },
  {
    id: 'R-004',
    customer: 'Козлов Андрей',
    phone: '+7 (999) 456-78-90',
    cell: 'A-08',
    area: '3 м²',
    startDate: '20.11.2023',
    endDate: '20.02.2024',
    amount: '₽ 3 000',
    status: 'expired',
    autoRenew: false,
  },
];

const statusConfig = {
  active: { label: 'Активна', className: 'bg-green-500/10 text-green-600' },
  expiring: { label: 'Заканчивается', className: 'bg-amber-500/10 text-amber-600' },
  expired: { label: 'Истекла', className: 'bg-red-500/10 text-red-600' },
};

const AdminRentals = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRentals = mockRentals.filter(
    (rental) =>
      rental.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rental.cell.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rental.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Управление арендами</h2>
        <p className="text-muted-foreground">
          Активных: {mockRentals.filter((r) => r.status === 'active').length} | 
          Заканчивается: {mockRentals.filter((r) => r.status === 'expiring').length} | 
          Истекло: {mockRentals.filter((r) => r.status === 'expired').length}
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по клиенту, ячейке или ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Клиент</TableHead>
                <TableHead>Ячейка</TableHead>
                <TableHead>Период</TableHead>
                <TableHead>Сумма</TableHead>
                <TableHead>Автопродление</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRentals.map((rental) => (
                <TableRow key={rental.id}>
                  <TableCell className="font-medium">{rental.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{rental.customer}</p>
                      <p className="text-sm text-muted-foreground">{rental.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{rental.cell}</p>
                      <p className="text-sm text-muted-foreground">{rental.area}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{rental.startDate}</p>
                      <p className="text-muted-foreground">→ {rental.endDate}</p>
                    </div>
                  </TableCell>
                  <TableCell>{rental.amount}/мес</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={rental.autoRenew ? 'text-green-600' : ''}>
                      {rental.autoRenew ? 'Да' : 'Нет'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusConfig[rental.status as keyof typeof statusConfig].className}>
                      {statusConfig[rental.status as keyof typeof statusConfig].label}
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
                          <Eye className="h-4 w-4 mr-2" />
                          Подробнее
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Редактировать
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Продлить
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Ban className="h-4 w-4 mr-2" />
                          Завершить
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminRentals;
