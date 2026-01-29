import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { Search, MoreHorizontal, Eye, Edit, Phone, Mail, Building, User } from 'lucide-react';

const mockCustomers = [
  {
    id: 'C-001',
    name: 'ООО "ТехноСервис"',
    type: 'company',
    phone: '+7 (999) 123-45-67',
    email: 'info@technoservice.ru',
    rentals: 2,
    totalSpent: '₽ 156 000',
    registeredAt: '15.01.2024',
    status: 'active',
  },
  {
    id: 'C-002',
    name: 'Иванов Петр Сергеевич',
    type: 'individual',
    phone: '+7 (999) 234-56-78',
    email: 'petrov@gmail.com',
    rentals: 1,
    totalSpent: '₽ 42 000',
    registeredAt: '01.02.2024',
    status: 'active',
  },
  {
    id: 'C-003',
    name: 'ИП Смирнова А.В.',
    type: 'company',
    phone: '+7 (999) 345-67-89',
    email: 'smirnova@mail.ru',
    rentals: 1,
    totalSpent: '₽ 72 000',
    registeredAt: '10.12.2023',
    status: 'active',
  },
  {
    id: 'C-004',
    name: 'Козлов Андрей',
    type: 'individual',
    phone: '+7 (999) 456-78-90',
    email: '',
    rentals: 0,
    totalSpent: '₽ 18 000',
    registeredAt: '20.11.2023',
    status: 'inactive',
  },
];

const AdminCustomers = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = mockCustomers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Клиенты</h2>
        <p className="text-muted-foreground">
          Всего: {mockCustomers.length} | 
          Активных: {mockCustomers.filter((c) => c.status === 'active').length}
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по имени, телефону или email..."
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
                <TableHead>Клиент</TableHead>
                <TableHead>Контакты</TableHead>
                <TableHead>Аренд</TableHead>
                <TableHead>Оборот</TableHead>
                <TableHead>Регистрация</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(customer.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          {customer.type === 'company' ? (
                            <>
                              <Building className="h-3 w-3" />
                              Юр. лицо
                            </>
                          ) : (
                            <>
                              <User className="h-3 w-3" />
                              Физ. лицо
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {customer.phone}
                      </div>
                      {customer.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          {customer.email}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{customer.rentals}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{customer.totalSpent}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {customer.registeredAt}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        customer.status === 'active'
                          ? 'bg-green-500/10 text-green-600'
                          : 'bg-muted text-muted-foreground'
                      }
                    >
                      {customer.status === 'active' ? 'Активен' : 'Неактивен'}
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
                          Профиль
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Редактировать
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Phone className="h-4 w-4 mr-2" />
                          Позвонить
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

export default AdminCustomers;
