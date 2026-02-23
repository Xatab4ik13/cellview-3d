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
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Search, MoreHorizontal, Eye, Edit, Phone, Mail, Building, User, Plus, X,
  ArrowLeft, Key, CreditCard, MessageSquare, Tag, Calendar, MapPin, Clock,
  Send, UserPlus, Trash2, Building2, UserRound,
} from 'lucide-react';
import { toast } from 'sonner';
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from '@/hooks/useCustomers';
import { CustomerData } from '@/lib/api';

// ========== Data ==========

interface Customer {
  id: string;
  name: string;
  type: 'company' | 'individual';
  phone: string;
  email: string;
  telegram?: string;
  address?: string;
  rentals: number;
  totalSpent: string;
  totalSpentNum: number;
  registeredAt: string;
  status: 'active' | 'inactive' | 'vip' | 'debtor';
  tags: string[];
  telegramNotifications?: {
    enabled: boolean;
    types: ('payment' | 'rental' | 'documents')[];
  };
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

const initialCustomers: Customer[] = [
  {
    id: 'C-001', name: 'ООО "ТехноСервис"', type: 'company',
    phone: '+7 (999) 123-45-67', email: 'info@technoservice.ru',
    telegram: '@technoservice',
    address: 'г. Санкт-Петербург, ул. Ленина 42',
    rentals: 2, totalSpent: '₽ 156 000', totalSpentNum: 156000,
    registeredAt: '15.01.2024', status: 'vip',
    tags: ['VIP', 'Юр. лицо', 'Долгосрочная аренда'],
    telegramNotifications: { enabled: true, types: ['payment', 'rental', 'documents'] },
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
    id: 'C-002', name: 'Иванов Петр Сергеевич', type: 'individual',
    phone: '+7 (999) 234-56-78', email: 'petrov@gmail.com',
    telegram: '@petrov_ps',
    rentals: 1, totalSpent: '₽ 42 000', totalSpentNum: 42000,
    registeredAt: '01.02.2024', status: 'active',
    tags: ['Физ. лицо'],
    telegramNotifications: { enabled: true, types: ['payment', 'rental'] },
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
    id: 'C-003', name: 'ИП Смирнова А.В.', type: 'company',
    phone: '+7 (999) 345-67-89', email: 'smirnova@mail.ru',
    rentals: 1, totalSpent: '₽ 72 000', totalSpentNum: 72000,
    registeredAt: '10.12.2023', status: 'active',
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
    id: 'C-004', name: 'Козлов Андрей', type: 'individual',
    phone: '+7 (999) 456-78-90', email: '',
    rentals: 0, totalSpent: '₽ 18 000', totalSpentNum: 18000,
    registeredAt: '20.11.2023', status: 'debtor',
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

const formatToday = () => {
  const d = new Date();
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// ========== Customer Detail Panel ==========

const CustomerDetail = ({
  customer,
  onClose,
  onUpdate,
  onEdit,
}: {
  customer: Customer;
  onClose: () => void;
  onUpdate: (updated: Customer) => void;
  onEdit: () => void;
}) => {
  const [newNote, setNewNote] = useState('');
  const s = statusConfig[customer.status];

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const note: Note = {
      id: `n-${Date.now()}`,
      text: newNote.trim(),
      author: 'Администратор',
      date: formatToday(),
    };
    onUpdate({ ...customer, notes: [note, ...customer.notes] });
    setNewNote('');
    toast.success('Заметка добавлена');
  };

  const handleDeleteNote = (noteId: string) => {
    onUpdate({ ...customer, notes: customer.notes.filter(n => n.id !== noteId) });
    toast.success('Заметка удалена');
  };

  const handleCall = () => {
    window.open(`tel:${customer.phone.replace(/\D/g, '')}`, '_self');
    toast.info(`Звонок: ${customer.name}`);
  };

  const handleEmail = () => {
    if (customer.email) {
      window.open(`mailto:${customer.email}`, '_blank');
    }
  };

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
            <button onClick={handleCall} className="flex items-center gap-1.5 hover:text-primary transition-colors">
              <Phone className="h-4 w-4" /> {customer.phone}
            </button>
            {customer.email && (
              <button onClick={handleEmail} className="flex items-center gap-1.5 hover:text-primary transition-colors">
                <Mail className="h-4 w-4" /> {customer.email}
              </button>
            )}
            {customer.telegram && (
              <a href={`https://t.me/${customer.telegram.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-primary transition-colors">
                <MessageSquare className="h-4 w-4" /> {customer.telegram}
              </a>
            )}
            {customer.address && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> {customer.address}
              </span>
            )}
          </div>
          {/* Telegram notifications indicator */}
          {customer.telegramNotifications?.enabled && (
            <div className="flex items-center gap-2 mt-2 text-xs">
              <Badge variant="outline" className="gap-1 text-xs" style={{
                borderColor: 'hsl(var(--status-active) / 0.3)',
                color: 'hsl(var(--status-active))',
                backgroundColor: 'hsl(var(--status-active) / 0.1)',
              }}>
                <MessageSquare className="h-3 w-3" />
                TG-уведомления
              </Badge>
              {customer.telegramNotifications.types.map(t => (
                <span key={t} className="text-muted-foreground">
                  {t === 'payment' ? '💳 Оплата' : t === 'rental' ? '📦 Аренда' : '📄 Документы'}
                </span>
              ))}
            </div>
          )}
          <div className="flex gap-2 mt-3 flex-wrap">
            {customer.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                <Tag className="h-3 w-3 mr-1" /> {tag}
              </Badge>
            ))}
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 shrink-0" onClick={onEdit}>
          <Edit className="h-4 w-4" /> Редактировать
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" size="sm" className="gap-1.5" onClick={handleCall}>
          <Phone className="h-4 w-4" /> Позвонить
        </Button>
        {customer.email && (
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleEmail}>
            <Mail className="h-4 w-4" /> Написать
          </Button>
        )}
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
            <MessageSquare className="h-4 w-4" /> Заметки ({customer.notes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rentals" className="mt-4">
          <CrmCard hover={false}>
            {customer.rentalHistory.length > 0 ? (
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
            ) : (
              <p className="text-center text-muted-foreground py-8">Нет истории аренд</p>
            )}
          </CrmCard>
        </TabsContent>

        <TabsContent value="payments" className="mt-4">
          <CrmCard hover={false}>
            {customer.paymentHistory.length > 0 ? (
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
            ) : (
              <p className="text-center text-muted-foreground py-8">Нет истории платежей</p>
            )}
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAddNote();
                }}
              />
              <Button
                size="icon"
                className="shrink-0 h-10 w-10 self-end"
                onClick={handleAddNote}
                disabled={!newNote.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Ctrl+Enter для отправки</p>
          </CrmCard>

          {/* Notes list */}
          {customer.notes.map((note) => (
            <CrmCard key={note.id} hover={false}>
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm flex-1">{note.text}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDeleteNote(note.id)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
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

// ========== Customer Form ==========

interface CustomerFormData {
  name: string;
  type: 'company' | 'individual';
  phone: string;
  email: string;
  address: string;
  status: 'active' | 'inactive' | 'vip' | 'debtor';
}

const emptyForm: CustomerFormData = {
  name: '', type: 'individual', phone: '', email: '', address: '', status: 'active',
};

// ========== Main Component ==========

const AdminCustomers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: apiCustomers = [], isLoading } = useCustomers();
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const deleteMutation = useDeleteCustomer();

  // Map API data to local Customer interface for UI compatibility
  const customers: Customer[] = apiCustomers.map((c: CustomerData) => ({
    id: c.id || '',
    name: c.name,
    type: c.type,
    phone: c.phone,
    email: c.email || '',
    telegram: c.telegram,
    address: undefined,
    rentals: 0,
    totalSpent: '₽ 0',
    totalSpentNum: 0,
    registeredAt: c.createdAt ? new Date(c.createdAt).toLocaleDateString('ru-RU') : '',
    status: 'active' as const,
    tags: [c.type === 'company' ? 'Юр. лицо' : 'Физ. лицо'],
    telegramNotifications: undefined,
    notes: [],
    rentalHistory: [],
    paymentHistory: [],
  }));

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Create/Edit dialog
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<CustomerFormData>(emptyForm);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusFilters = [
    { key: 'all', label: 'Все', count: customers.length },
    { key: 'active', label: 'Активные', count: customers.filter((c) => c.status === 'active' || c.status === 'vip').length },
    { key: 'vip', label: 'VIP', count: customers.filter((c) => c.status === 'vip').length },
    { key: 'debtor', label: 'Должники', count: customers.filter((c) => c.status === 'debtor').length },
  ];

  // ========== Handlers ==========

  const openCreateDialog = () => {
    setEditingCustomer(null);
    setFormData(emptyForm);
    setIsFormOpen(true);
  };

  const openEditDialog = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      type: customer.type,
      phone: customer.phone,
      email: customer.email,
      address: customer.address || '',
      status: customer.status,
    });
    setIsFormOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error('Заполните имя и телефон');
      return;
    }

    if (editingCustomer) {
      updateMutation.mutate({
        id: editingCustomer.id,
        data: {
          name: formData.name.trim(),
          type: formData.type,
          phone: formData.phone.trim(),
          email: formData.email.trim() || undefined,
        }
      }, {
        onSuccess: () => {
          setIsFormOpen(false);
          setSelectedCustomer(null);
        }
      });
    } else {
      createMutation.mutate({
        type: formData.type,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
      }, {
        onSuccess: () => setIsFormOpen(false)
      });
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        if (selectedCustomer?.id === deleteTarget.id) setSelectedCustomer(null);
        setDeleteTarget(null);
      }
    });
  };

  const handleCall = (phone: string, name: string) => {
    window.open(`tel:${phone.replace(/\D/g, '')}`, '_self');
    toast.info(`Звонок: ${name}`);
  };

  const handleUpdateCustomer = (updated: Customer) => {
    // For local UI updates (notes etc) — will be persisted via API later
    setSelectedCustomer(updated);
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {selectedCustomer ? (
          <CustomerDetail
            key="detail"
            customer={selectedCustomer}
            onClose={() => setSelectedCustomer(null)}
            onUpdate={handleUpdateCustomer}
            onEdit={() => openEditDialog(selectedCustomer)}
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
                  Всего: {customers.length} · Активных: {customers.filter((c) => c.status === 'active' || c.status === 'vip').length}
                </p>
              </div>
              <Button className="h-10 gap-2" onClick={openCreateDialog}>
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
                            {customer.telegram && (
                              <div className="flex items-center gap-1.5">
                                <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                                {customer.telegram}
                                {customer.telegramNotifications?.enabled && (
                                  <span className="text-xs" style={{ color: 'hsl(var(--status-active))' }}>✓ TG</span>
                                )}
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
                              <DropdownMenuItem onClick={() => openEditDialog(customer)}>
                                <Edit className="h-4 w-4 mr-2" /> Редактировать
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleCall(customer.phone, customer.name)}>
                                <Phone className="h-4 w-4 mr-2" /> Позвонить
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setDeleteTarget(customer)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" /> Удалить
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

      {/* ========== Create/Edit Customer Dialog ========== */}
      <Dialog modal open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingCustomer ? <Edit className="h-5 w-5 text-primary" /> : <UserPlus className="h-5 w-5 text-primary" />}
              {editingCustomer ? `Редактировать: ${editingCustomer.name}` : 'Новый клиент'}
            </DialogTitle>
            <DialogDescription>
              {editingCustomer ? 'Измените данные клиента' : 'Заполните информацию о новом клиенте'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {/* Type toggle */}
            <div className="flex gap-2">
              <Button type="button" size="sm"
                variant={formData.type === 'individual' ? 'default' : 'outline'}
                className="flex-1 gap-1.5 h-10"
                onClick={() => setFormData(p => ({ ...p, type: 'individual' }))}
              >
                <UserRound className="h-4 w-4" /> Физ. лицо
              </Button>
              <Button type="button" size="sm"
                variant={formData.type === 'company' ? 'default' : 'outline'}
                className="flex-1 gap-1.5 h-10"
                onClick={() => setFormData(p => ({ ...p, type: 'company' }))}
              >
                <Building2 className="h-4 w-4" /> Компания / ИП
              </Button>
            </div>

            <div className="grid gap-2">
              <Label>{formData.type === 'company' ? 'Название компании *' : 'ФИО *'}</Label>
              <Input
                placeholder={formData.type === 'company' ? 'ООО "Компания"' : 'Иванов Иван Иванович'}
                value={formData.name}
                onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                className="h-11"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Телефон *</Label>
                <Input placeholder="+7 (___) ___-__-__" value={formData.phone}
                  onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                  className="h-11" />
              </div>
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input placeholder="email@example.com" value={formData.email}
                  onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                  className="h-11" />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Адрес</Label>
              <Input placeholder="г. Город, ул. Улица, д. 1" value={formData.address}
                onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))}
                className="h-11" />
            </div>

            <div className="grid gap-2">
              <Label>Статус</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData(p => ({ ...p, status: v as any }))}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Активен</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="inactive">Неактивен</SelectItem>
                  <SelectItem value="debtor">Должник</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>Отмена</Button>
            <Button onClick={handleSave} disabled={!formData.name.trim() || !formData.phone.trim()}>
              {editingCustomer ? 'Сохранить' : 'Создать клиента'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========== Delete Confirmation ========== */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить клиента?</AlertDialogTitle>
            <AlertDialogDescription>
              Клиент <strong>{deleteTarget?.name}</strong> будет удалён вместе со всей историей. Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AdminCustomers;
