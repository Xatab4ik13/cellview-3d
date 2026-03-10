import { useState, useMemo } from 'react';
import { differenceInDays, parseISO } from 'date-fns';
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
  Send, UserPlus, Trash2, Building2, UserRound, FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from '@/hooks/useCustomers';
import { useRentals } from '@/hooks/useRentals';
import { CustomerData, RentalData } from '@/lib/api';

// ========== Data ==========

interface Customer {
  id: string;
  name: string;
  type: 'company' | 'individual';
  phone: string;
  email: string;
  telegram?: string;
  address?: string;
  passportSeries?: string;
  passportNumber?: string;
  companyName?: string;
  inn?: string;
  ogrn?: string;
  contactPerson?: string;
  rentals: number;
  totalSpent: string;
  totalSpentNum: number;
  registeredAt: string;
  status: 'active' | 'inactive' | 'vip' | 'debtor';
  tags: string[];
  notes: Note[];
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
  startDate: string;
  endDate: string;
  amount: string;
  status: 'active' | 'expired' | 'cancelled';
}

// No hardcoded data — all from API
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
  expired: { label: 'Завершена', className: 'bg-muted text-muted-foreground' },
  cancelled: { label: 'Отменена', className: 'bg-[hsl(var(--status-overdue))]/10 text-[hsl(var(--status-overdue))]' },
};


const formatToday = () => {
  const d = new Date();
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// ========== Customer Detail Panel ==========

const CustomerDetail = ({
  customer,
  customerRentals,
  onClose,
  onUpdate,
  onEdit,
}: {
  customer: Customer;
  customerRentals: RentalData[];
  onClose: () => void;
  onUpdate: (updated: Customer) => void;
  onEdit: () => void;
}) => {
  const [newNote, setNewNote] = useState('');
  const s = statusConfig[customer.status];

  const totalRevenue = customerRentals.reduce((sum, r) => sum + (r.totalAmount || 0), 0);

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

  const formatDate = (d: string) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('ru-RU');
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
          </div>
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

      {/* Passport / Company info */}
      {(customer.passportSeries || customer.passportNumber || customer.inn || customer.ogrn || customer.contactPerson) && (
        <CrmCard hover={false} className="!p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{customer.type === 'company' ? 'Реквизиты' : 'Документы'}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            {customer.passportSeries && (
              <div>
                <span className="text-muted-foreground">Серия паспорта:</span>
                <p className="font-medium">{customer.passportSeries}</p>
              </div>
            )}
            {customer.passportNumber && (
              <div>
                <span className="text-muted-foreground">Номер паспорта:</span>
                <p className="font-medium">{customer.passportNumber}</p>
              </div>
            )}
            {customer.inn && (
              <div>
                <span className="text-muted-foreground">ИНН:</span>
                <p className="font-medium">{customer.inn}</p>
              </div>
            )}
            {customer.ogrn && (
              <div>
                <span className="text-muted-foreground">ОГРН:</span>
                <p className="font-medium">{customer.ogrn}</p>
              </div>
            )}
            {customer.contactPerson && (
              <div>
                <span className="text-muted-foreground">Контактное лицо:</span>
                <p className="font-medium">{customer.contactPerson}</p>
              </div>
            )}
          </div>
        </CrmCard>
      )}

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
          <p className="text-2xl font-bold mt-1">{customerRentals.length}</p>
        </CrmCard>
        <CrmCard hover={false} className="!p-4 text-center">
          <p className="text-sm text-muted-foreground">Оборот</p>
          <p className="text-2xl font-bold mt-1">₽ {totalRevenue.toLocaleString('ru-RU')}</p>
        </CrmCard>
        <CrmCard hover={false} className="!p-4 text-center">
          <p className="text-sm text-muted-foreground">С нами с</p>
          <p className="text-2xl font-bold mt-1">{customer.registeredAt}</p>
        </CrmCard>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="rentals" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="rentals" className="gap-2">
            <Key className="h-4 w-4" /> Аренды
          </TabsTrigger>
          <TabsTrigger value="notes" className="gap-2">
            <MessageSquare className="h-4 w-4" /> Заметки ({customer.notes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rentals" className="mt-4">
          <CrmCard hover={false}>
            {customerRentals.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ячейка</TableHead>
                    <TableHead>Период</TableHead>
                    <TableHead>Сумма/мес</TableHead>
                    <TableHead>Итого</TableHead>
                    <TableHead>Статус</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerRentals.map((r) => {
                    const rs = rentalStatusConfig[r.status] || { label: r.status, className: 'bg-muted text-muted-foreground' };
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">№{r.cellNumber}</TableCell>
                        <TableCell className="text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            {formatDate(r.startDate)} — {formatDate(r.endDate)}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{r.pricePerMonth?.toLocaleString('ru-RU')} ₽</TableCell>
                        <TableCell className="font-medium">{r.totalAmount?.toLocaleString('ru-RU')} ₽</TableCell>
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

        <TabsContent value="notes" className="mt-4 space-y-4">
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
  telegram: string;
  passportSeries: string;
  passportNumber: string;
  companyName: string;
  inn: string;
  ogrn: string;
  contactPerson: string;
  address: string;
  status: 'active' | 'inactive' | 'vip' | 'debtor';
}

const emptyForm: CustomerFormData = {
  name: '', type: 'individual', phone: '', email: '', telegram: '',
  passportSeries: '', passportNumber: '', companyName: '', inn: '', ogrn: '',
  contactPerson: '', address: '', status: 'active',
};

// ========== Main Component ==========

const AdminCustomers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: apiCustomers = [], isLoading } = useCustomers();
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const deleteMutation = useDeleteCustomer();

  const { data: allRentals = [] } = useRentals();

  // Map API data to local Customer interface
  const customers: Customer[] = apiCustomers.map((c: CustomerData) => {
    const cRentals = allRentals.filter(r => r.customerId === c.id);
    const totalSpentNum = cRentals.reduce((sum, r) => sum + (r.totalAmount || 0), 0);
    const activeRentals = cRentals.filter(r => {
      const daysLeft = differenceInDays(parseISO(r.endDate), new Date());
      return r.status === 'active' && daysLeft >= 0;
    });
    const expiredRentals = cRentals.filter(r => {
      const daysLeft = differenceInDays(parseISO(r.endDate), new Date());
      return r.status === 'active' && daysLeft < 0;
    });

    let status: 'active' | 'inactive' | 'vip' | 'debtor' = 'inactive';
    if (activeRentals.length > 0) {
      status = 'active';
    } else if (expiredRentals.length > 0) {
      status = 'debtor';
    }

    return {
      id: c.id || '',
      name: c.name,
      type: c.type,
      phone: c.phone,
      email: c.email || '',
      telegram: c.telegram,
      passportSeries: c.passportSeries,
      passportNumber: c.passportNumber,
      companyName: c.companyName,
      inn: c.inn,
      ogrn: c.ogrn,
      contactPerson: c.contactPerson,
      address: undefined,
      rentals: activeRentals.length,
      totalSpent: `₽ ${totalSpentNum.toLocaleString('ru-RU')}`,
      totalSpentNum,
      registeredAt: c.createdAt ? new Date(c.createdAt).toLocaleDateString('ru-RU') : '',
      status,
      tags: [c.type === 'company' ? 'Юр. лицо' : 'Физ. лицо'],
      notes: [],
    };
  });

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
      telegram: customer.telegram || '',
      passportSeries: customer.passportSeries || '',
      passportNumber: customer.passportNumber || '',
      companyName: customer.companyName || '',
      inn: customer.inn || '',
      ogrn: customer.ogrn || '',
      contactPerson: customer.contactPerson || '',
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
          telegram: formData.telegram.trim() || undefined,
          passportSeries: formData.passportSeries.trim() || undefined,
          passportNumber: formData.passportNumber.trim() || undefined,
          companyName: formData.companyName.trim() || undefined,
          inn: formData.inn.trim() || undefined,
          ogrn: formData.ogrn.trim() || undefined,
          contactPerson: formData.contactPerson.trim() || undefined,
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
        telegram: formData.telegram.trim() || undefined,
        passportSeries: formData.passportSeries.trim() || undefined,
        passportNumber: formData.passportNumber.trim() || undefined,
        companyName: formData.companyName.trim() || undefined,
        inn: formData.inn.trim() || undefined,
        ogrn: formData.ogrn.trim() || undefined,
        contactPerson: formData.contactPerson.trim() || undefined,
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
            customerRentals={allRentals.filter(r => r.customerId === selectedCustomer.id)}
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

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Telegram</Label>
                <Input placeholder="@username" value={formData.telegram}
                  onChange={(e) => setFormData(p => ({ ...p, telegram: e.target.value }))}
                  className="h-11" />
              </div>
              <div className="grid gap-2">
                <Label>Адрес</Label>
                <Input placeholder="г. Город, ул. Улица" value={formData.address}
                  onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))}
                  className="h-11" />
              </div>
            </div>

            {formData.type === 'individual' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Серия паспорта</Label>
                  <Input placeholder="0000" value={formData.passportSeries}
                    onChange={(e) => setFormData(p => ({ ...p, passportSeries: e.target.value }))}
                    className="h-11" />
                </div>
                <div className="grid gap-2">
                  <Label>Номер паспорта</Label>
                  <Input placeholder="000000" value={formData.passportNumber}
                    onChange={(e) => setFormData(p => ({ ...p, passportNumber: e.target.value }))}
                    className="h-11" />
                </div>
              </div>
            )}

            {formData.type === 'company' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>ИНН</Label>
                    <Input placeholder="1234567890" value={formData.inn}
                      onChange={(e) => setFormData(p => ({ ...p, inn: e.target.value }))}
                      className="h-11" />
                  </div>
                  <div className="grid gap-2">
                    <Label>ОГРН</Label>
                    <Input placeholder="1234567890123" value={formData.ogrn}
                      onChange={(e) => setFormData(p => ({ ...p, ogrn: e.target.value }))}
                      className="h-11" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Контактное лицо</Label>
                  <Input placeholder="ФИО контактного лица" value={formData.contactPerson}
                    onChange={(e) => setFormData(p => ({ ...p, contactPerson: e.target.value }))}
                    className="h-11" />
                </div>
              </>
            )}
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
