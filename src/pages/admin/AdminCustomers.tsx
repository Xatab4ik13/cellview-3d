import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CrmCard from '@/components/crm/CrmCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
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
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Phone,
  Mail,
  Building,
  User,
  Plus,
  X,
  ArrowLeft,
  Key,
  CreditCard,
  MessageSquare,
  Tag,
  Calendar,
  MapPin,
  Clock,
  Send,
} from 'lucide-react';

// ========== Data ==========

interface Customer {
  id: string;
  name: string;
  type: 'company' | 'individual';
  phone: string;
  email: string;
  address?: string;
  rentals: number;
  totalSpent: string;
  totalSpentNum: number;
  registeredAt: string;
  status: 'active' | 'inactive' | 'vip' | 'debtor';
  tags: string[];
  notes: Note[];
  rentalHistory: RentalRecord[];
  paymentHistory: PaymentRecord[];
}

interface Note {
  id: string;
  text: string;
  author: string;
  date: string;
}

interface RentalRecord {
  id: string;
  cell: string;
  size: string;
  startDate: string;
  endDate: string;
  amount: string;
  status: 'active' | 'completed' | 'overdue';
}

interface PaymentRecord {
  id: string;
  date: string;
  amount: string;
  method: string;
  status: 'paid' | 'pending' | 'overdue';
  description: string;
}

const mockCustomers: Customer[] = [
  {
    id: 'C-001',
    name: 'ООО "ТехноСервис"',
    type: 'company',
    phone: '+7 (999) 123-45-67',
    email: 'info@technoservice.ru',
    address: 'г. Санкт-Петербург, ул. Ленина 42',
    rentals: 2,
    totalSpent: '₽ 156 000',
    totalSpentNum: 156000,
    registeredAt: '15.01.2024',
    status: 'vip',
    tags: ['VIP', 'Юр. лицо', 'Долгосрочная аренда'],
    notes: [
      { id: 'n1', text: 'Планируют расширение — интересуются ещё 2 ячейками на 3 этаже', author: 'Менеджер', date: '20.02.2026' },
      { id: 'n2', text: 'Оплата всегда вовремя, лояльный клиент', author: 'Бухгалтер', date: '15.01.2026' },
    ],
    rentalHistory: [
      { id: 'r1', cell: 'A-12', size: '10 м²', startDate: '15.01.2024', endDate: '15.01.2025', amount: '₽ 15 000/мес', status: 'completed' },
      { id: 'r2', cell: 'A-14', size: '12 м²', startDate: '01.02.2025', endDate: '01.02.2026', amount: '₽ 18 000/мес', status: 'active' },
    ],
    paymentHistory: [
      { id: 'p1', date: '01.02.2026', amount: '₽ 18 000', method: 'Безналичный', status: 'paid', description: 'Аренда A-14, февраль' },
      { id: 'p2', date: '01.01.2026', amount: '₽ 18 000', method: 'Безналичный', status: 'paid', description: 'Аренда A-14, январь' },
      { id: 'p3', date: '01.12.2025', amount: '₽ 18 000', method: 'Безналичный', status: 'paid', description: 'Аренда A-14, декабрь' },
    ],
  },
  {
    id: 'C-002',
    name: 'Иванов Петр Сергеевич',
    type: 'individual',
    phone: '+7 (999) 234-56-78',
    email: 'petrov@gmail.com',
    rentals: 1,
    totalSpent: '₽ 42 000',
    totalSpentNum: 42000,
    registeredAt: '01.02.2024',
    status: 'active',
    tags: ['Физ. лицо'],
    notes: [],
    rentalHistory: [
      { id: 'r3', cell: 'B-05', size: '3 м²', startDate: '01.02.2024', endDate: '01.08.2026', amount: '₽ 4 500/мес', status: 'active' },
    ],
    paymentHistory: [
      { id: 'p4', date: '01.02.2026', amount: '₽ 4 500', method: 'Карта', status: 'paid', description: 'Аренда B-05, февраль' },
      { id: 'p5', date: '01.01.2026', amount: '₽ 4 500', method: 'Карта', status: 'paid', description: 'Аренда B-05, январь' },
    ],
  },
  {
    id: 'C-003',
    name: 'ИП Смирнова А.В.',
    type: 'company',
    phone: '+7 (999) 345-67-89',
    email: 'smirnova@mail.ru',
    rentals: 1,
    totalSpent: '₽ 72 000',
    totalSpentNum: 72000,
    registeredAt: '10.12.2023',
    status: 'active',
    tags: ['ИП', 'Сезонная'],
    notes: [
      { id: 'n3', text: 'Хранит сезонный товар, активность с марта по октябрь', author: 'Менеджер', date: '10.03.2025' },
    ],
    rentalHistory: [
      { id: 'r4', cell: 'C-08', size: '6 м²', startDate: '01.03.2025', endDate: '01.10.2025', amount: '₽ 9 000/мес', status: 'completed' },
      { id: 'r5', cell: 'C-10', size: '8 м²', startDate: '01.03.2026', endDate: '01.10.2026', amount: '₽ 12 000/мес', status: 'active' },
    ],
    paymentHistory: [
      { id: 'p6', date: '01.03.2026', amount: '₽ 12 000', method: 'Безналичный', status: 'pending', description: 'Аренда C-10, март' },
    ],
  },
  {
    id: 'C-004',
    name: 'Козлов Андрей',
    type: 'individual',
    phone: '+7 (999) 456-78-90',
    email: '',
    rentals: 0,
    totalSpent: '₽ 18 000',
    totalSpentNum: 18000,
    registeredAt: '20.11.2023',
    status: 'debtor',
    tags: ['Должник', 'Физ. лицо'],
    notes: [
      { id: 'n4', text: 'Задолженность 2 месяца, не выходит на связь', author: 'Менеджер', date: '15.02.2026' },
    ],
    rentalHistory: [
      { id: 'r6', cell: 'D-02', size: '2 м²', startDate: '20.11.2023', endDate: '20.05.2024', amount: '₽ 3 000/мес', status: 'overdue' },
    ],
    paymentHistory: [
      { id: 'p7', date: '20.03.2024', amount: '₽ 3 000', method: 'Наличные', status: 'overdue', description: 'Аренда D-02, март — не оплачено' },
      { id: 'p8', date: '20.02.2024', amount: '₽ 3 000', method: 'Наличные', status: 'overdue', description: 'Аренда D-02, февраль — не оплачено' },
    ],
  },
];

// ========== Helpers ==========

const getInitials = (name: string) =>
  name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

const statusConfig: Record<string, { label: string; className: string }> = {
  active: { label: 'Активен', className: 'bg-[hsl(var(--status-active))]/10 text-[hsl(var(--status-active))]' },
  vip: { label: 'VIP', className: 'bg-[hsl(var(--status-new))]/10 text-[hsl(var(--status-new))]' },
  inactive: { label: 'Неактивен', className: 'bg-muted text-muted-foreground' },
  debtor: { label: 'Должник', className: 'bg-[hsl(var(--status-overdue))]/10 text-[hsl(var(--status-overdue))]' },
};

const rentalStatusConfig: Record<string, { label: string; className: string }> = {
  active: { label: 'Активна', className: 'bg-[hsl(var(--status-active))]/10 text-[hsl(var(--status-active))]' },
  completed: { label: 'Завершена', className: 'bg-muted text-muted-foreground' },
  overdue: { label: 'Просрочена', className: 'bg-[hsl(var(--status-overdue))]/10 text-[hsl(var(--status-overdue))]' },
};

const paymentStatusConfig: Record<string, { label: string; className: string }> = {
  paid: { label: 'Оплачено', className: 'bg-[hsl(var(--status-active))]/10 text-[hsl(var(--status-active))]' },
  pending: { label: 'Ожидание', className: 'bg-[hsl(var(--status-pending))]/10 text-[hsl(var(--status-pending))]' },
  overdue: { label: 'Просрочено', className: 'bg-[hsl(var(--status-overdue))]/10 text-[hsl(var(--status-overdue))]' },
};

// ========== Customer Detail Panel ==========

const CustomerDetail = ({ customer, onClose }: { customer: Customer; onClose: () => void }) => {
  const [newNote, setNewNote] = useState('');
  const s = statusConfig[customer.status];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0 mt-1">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Avatar className="h-14 w-14 shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
            {getInitials(customer.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl font-bold">{customer.name}</h2>
            <Badge className={s.className}>{s.label}</Badge>
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1.5">
              <Phone className="h-4 w-4" /> {customer.phone}
            </span>
            {customer.email && (
              <span className="flex items-center gap-1.5">
                <Mail className="h-4 w-4" /> {customer.email}
              </span>
            )}
            {customer.address && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> {customer.address}
              </span>
            )}
          </div>
          <div className="flex gap-2 mt-3 flex-wrap">
            {customer.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                <Tag className="h-3 w-3 mr-1" /> {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <CrmCard hover={false} className="!p-4 text-center">
          <p className="text-sm text-muted-foreground">Аренд</p>
          <p className="text-2xl font-bold mt-1">{customer.rentals}</p>
        </CrmCard>
        <CrmCard hover={false} className="!p-4 text-center">
          <p className="text-sm text-muted-foreground">Оборот</p>
          <p className="text-2xl font-bold mt-1">{customer.totalSpent}</p>
        </CrmCard>
        <CrmCard hover={false} className="!p-4 text-center">
          <p className="text-sm text-muted-foreground">С нами с</p>
          <p className="text-2xl font-bold mt-1">{customer.registeredAt}</p>
        </CrmCard>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="rentals" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rentals" className="gap-2">
            <Key className="h-4 w-4" /> Аренды
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-2">
            <CreditCard className="h-4 w-4" /> Платежи
          </TabsTrigger>
          <TabsTrigger value="notes" className="gap-2">
            <MessageSquare className="h-4 w-4" /> Заметки
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rentals" className="mt-4">
          <CrmCard hover={false}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ячейка</TableHead>
                  <TableHead>Размер</TableHead>
                  <TableHead>Период</TableHead>
                  <TableHead>Стоимость</TableHead>
                  <TableHead>Статус</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customer.rentalHistory.map((r) => {
                  const rs = rentalStatusConfig[r.status];
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.cell}</TableCell>
                      <TableCell>{r.size}</TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          {r.startDate} — {r.endDate}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{r.amount}</TableCell>
                      <TableCell>
                        <Badge className={rs.className}>{rs.label}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CrmCard>
        </TabsContent>

        <TabsContent value="payments" className="mt-4">
          <CrmCard hover={false}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Дата</TableHead>
                  <TableHead>Описание</TableHead>
                  <TableHead>Способ</TableHead>
                  <TableHead>Сумма</TableHead>
                  <TableHead>Статус</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customer.paymentHistory.map((p) => {
                  const ps = paymentStatusConfig[p.status];
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="text-sm">{p.date}</TableCell>
                      <TableCell className="text-sm">{p.description}</TableCell>
                      <TableCell className="text-sm">{p.method}</TableCell>
                      <TableCell className="font-medium">{p.amount}</TableCell>
                      <TableCell>
                        <Badge className={ps.className}>{ps.label}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CrmCard>
        </TabsContent>

        <TabsContent value="notes" className="mt-4 space-y-4">
          {/* Add note */}
          <CrmCard hover={false}>
            <div className="flex gap-3">
              <Textarea
                placeholder="Добавить заметку..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="min-h-[80px] text-sm"
              />
              <Button size="icon" className="shrink-0 h-10 w-10 self-end">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CrmCard>

          {/* Notes list */}
          {customer.notes.map((note) => (
            <CrmCard key={note.id} hover={false}>
              <p className="text-sm">{note.text}</p>
              <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" /> {note.author}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {note.date}
                </span>
              </div>
            </CrmCard>
          ))}

          {customer.notes.length === 0 && (
            <p className="text-center text-muted-foreground py-8">Заметок пока нет</p>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

// ========== Main Component ==========

const AdminCustomers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredCustomers = mockCustomers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusFilters = [
    { key: 'all', label: 'Все', count: mockCustomers.length },
    { key: 'active', label: 'Активные', count: mockCustomers.filter((c) => c.status === 'active').length },
    { key: 'vip', label: 'VIP', count: mockCustomers.filter((c) => c.status === 'vip').length },
    { key: 'debtor', label: 'Должники', count: mockCustomers.filter((c) => c.status === 'debtor').length },
  ];

  return (
    <AnimatePresence mode="wait">
      {selectedCustomer ? (
        <CustomerDetail
          key="detail"
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      ) : (
        <motion.div
          key="list"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Клиенты</h2>
              <p className="text-base text-muted-foreground mt-1">
                Всего: {mockCustomers.length} · Активных:{' '}
                {mockCustomers.filter((c) => c.status === 'active' || c.status === 'vip').length}
              </p>
            </div>
            <Button className="h-10 gap-2">
              <Plus className="h-4 w-4" />
              Новый клиент
            </Button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            {statusFilters.map((f) => (
              <Button
                key={f.key}
                variant={statusFilter === f.key ? 'default' : 'outline'}
                size="sm"
                className="h-9 gap-1.5 text-sm"
                onClick={() => setStatusFilter(f.key)}
              >
                {f.label}
                <Badge
                  variant="secondary"
                  className={`text-xs h-5 min-w-5 justify-center ml-1 ${
                    statusFilter === f.key ? 'bg-primary-foreground/20 text-primary-foreground' : ''
                  }`}
                >
                  {f.count}
                </Badge>
              </Button>
            ))}

            <div className="ml-auto relative max-w-[280px] w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск клиентов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          </div>

          {/* Table */}
          <CrmCard hover={false}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Клиент</TableHead>
                  <TableHead>Контакты</TableHead>
                  <TableHead>Аренд</TableHead>
                  <TableHead>Оборот</TableHead>
                  <TableHead>С нами с</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer, i) => {
                  const s = statusConfig[customer.status];
                  return (
                    <motion.tr
                      key={customer.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="border-b border-border hover:bg-muted/40 transition-colors cursor-pointer"
                      onClick={() => setSelectedCustomer(customer)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                              {getInitials(customer.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-semibold">{customer.name}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                              {customer.type === 'company' ? (
                                <><Building className="h-3 w-3" /> Юр. лицо</>
                              ) : (
                                <><User className="h-3 w-3" /> Физ. лицо</>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                            {customer.phone}
                          </div>
                          {customer.email && (
                            <div className="flex items-center gap-1.5">
                              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                              {customer.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-sm">{customer.rentals}</Badge>
                      </TableCell>
                      <TableCell className="text-sm font-semibold">{customer.totalSpent}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{customer.registeredAt}</TableCell>
                      <TableCell>
                        <Badge className={s.className}>{s.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedCustomer(customer)}>
                              <Eye className="h-4 w-4 mr-2" /> Профиль
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" /> Редактировать
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Phone className="h-4 w-4 mr-2" /> Позвонить
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </TableBody>
            </Table>
          </CrmCard>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AdminCustomers;
