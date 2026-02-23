import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Plus, Search, Edit, Trash2, Box, Upload, X, Image,
  UserPlus, Eye, Key, Phone, Mail, Calendar, Clock,
  RefreshCw, DoorOpen, History, ArrowLeft, User, ChevronRight,
  MoreHorizontal, Percent, Building2, UserRound,
} from 'lucide-react';
import { storageCells as initialCells } from '@/data/storageCells';
import { calculatePrice, StorageCell } from '@/types/storage';
import CellProjectionPreview from '@/components/admin/CellProjectionPreview';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';

// ========== Types ==========

interface CellRental {
  id: string;
  cellId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerType: 'company' | 'individual';
  startDate: string;
  endDate: string;
  months: number;
  discount: number;
  pricePerMonth: number;
  totalAmount: number;
  autoRenew: boolean;
  status: 'active' | 'expiring' | 'expired';
  notes: string;
}

interface CellRentalHistory {
  id: string;
  cellId: string;
  customerName: string;
  customerPhone: string;
  startDate: string;
  endDate: string;
  months: number;
  pricePerMonth: number;
}

interface SimpleCustomer {
  id: string;
  name: string;
  phone: string;
  email: string;
  type: 'company' | 'individual';
}

// ========== Mock Data ==========

const initialCustomers: SimpleCustomer[] = [
  { id: 'C-001', name: 'ООО "ТехноСервис"', phone: '+7 (999) 123-45-67', email: 'info@technoservice.ru', type: 'company' },
  { id: 'C-002', name: 'Иванов Петр Сергеевич', phone: '+7 (999) 234-56-78', email: 'petrov@gmail.com', type: 'individual' },
  { id: 'C-003', name: 'ИП Смирнова А.В.', phone: '+7 (999) 345-67-89', email: 'smirnova@mail.ru', type: 'company' },
  { id: 'C-004', name: 'Козлов Андрей', phone: '+7 (999) 456-78-90', email: '', type: 'individual' },
  { id: 'C-005', name: 'ООО "Логистик Плюс"', phone: '+7 (999) 567-89-01', email: 'info@logistic-plus.ru', type: 'company' },
];

const initialRentals: CellRental[] = [
  {
    id: 'R-001', cellId: 'cell-1', customerId: 'C-001',
    customerName: 'ООО "ТехноСервис"', customerPhone: '+7 (999) 123-45-67',
    customerEmail: 'info@technoservice.ru', customerType: 'company',
    startDate: '2025-01-15', endDate: '2026-01-15',
    months: 12, discount: 15, pricePerMonth: 2550, totalAmount: 30600,
    autoRenew: true, status: 'active', notes: 'Долгосрочная аренда, VIP клиент',
  },
];

const initialHistory: CellRentalHistory[] = [
  {
    id: 'H-001', cellId: 'cell-1', customerName: 'Козлов Андрей',
    customerPhone: '+7 (999) 456-78-90',
    startDate: '2024-03-01', endDate: '2024-12-31',
    months: 10, pricePerMonth: 3000,
  },
  {
    id: 'H-002', cellId: 'cell-3', customerName: 'ИП Смирнова А.В.',
    customerPhone: '+7 (999) 345-67-89',
    startDate: '2024-06-01', endDate: '2024-12-01',
    months: 6, pricePerMonth: 2850,
  },
];

// ========== Discount logic ==========

const DISCOUNT_MAP: Record<number, number> = {
  1: 0, 2: 0, 3: 5, 4: 5, 5: 5,
  6: 10, 7: 10, 8: 10, 9: 10, 10: 10, 11: 10,
  12: 15,
};

const getDiscount = (months: number): number => {
  if (months >= 12) return 15;
  return DISCOUNT_MAP[months] || 0;
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const addMonths = (dateStr: string, months: number): string => {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split('T')[0];
};

// ========== Cell Detail Panel ==========

const CellDetailPanel = ({
  cell,
  rental,
  history,
  onClose,
  onRelease,
  onExtend,
}: {
  cell: StorageCell;
  rental: CellRental | undefined;
  history: CellRentalHistory[];
  onClose: () => void;
  onRelease: () => void;
  onExtend: (months: number) => void;
}) => {
  const [extendMonths, setExtendMonths] = useState(1);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">Ячейка №{cell.number}</h2>
            <Badge
              variant="outline"
              style={cell.isAvailable ? {
                borderColor: 'hsl(var(--status-active) / 0.3)',
                color: 'hsl(var(--status-active))',
                backgroundColor: 'hsl(var(--status-active) / 0.1)',
              } : {
                borderColor: 'hsl(var(--status-pending) / 0.3)',
                color: 'hsl(var(--status-pending))',
                backgroundColor: 'hsl(var(--status-pending) / 0.1)',
              }}
            >
              {cell.isAvailable ? 'Свободна' : 'Занята'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {cell.width}×{cell.depth}×{cell.height} м · {cell.volume} м³ · Ярус {cell.tier}
          </p>
        </div>
      </div>

      {/* Cell info cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-xl p-3" style={{ boxShadow: 'var(--shadow-card)' }}>
          <p className="text-xs text-muted-foreground">Площадь</p>
          <p className="text-lg font-bold">{cell.area} м²</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3" style={{ boxShadow: 'var(--shadow-card)' }}>
          <p className="text-xs text-muted-foreground">Объём</p>
          <p className="text-lg font-bold">{cell.volume} м³</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3" style={{ boxShadow: 'var(--shadow-card)' }}>
          <p className="text-xs text-muted-foreground">Цена</p>
          <p className="text-lg font-bold text-primary">{cell.pricePerMonth.toLocaleString('ru-RU')} ₽</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3" style={{ boxShadow: 'var(--shadow-card)' }}>
          <p className="text-xs text-muted-foreground">Опции</p>
          <p className="text-lg font-bold">
            {cell.hasSocket && '⚡'}{cell.hasShelves && '📦'}{!cell.hasSocket && !cell.hasShelves && '—'}
          </p>
        </div>
      </div>

      {/* Photos */}
      {cell.photos.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Фотографии</h3>
          <div className="grid grid-cols-4 gap-3">
            {cell.photos.map((photo, i) => (
              <img key={i} src={photo} alt={`Фото ${i + 1}`} className="w-full aspect-square object-cover rounded-lg border" />
            ))}
          </div>
        </div>
      )}

      {/* Current tenant */}
      {rental && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Текущий арендатор</h3>
          <div className="bg-card border border-border rounded-xl p-5 space-y-4" style={{ boxShadow: 'var(--shadow-card)' }}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                  {rental.customerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold">{rental.customerName}</p>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{rental.customerPhone}</span>
                    {rental.customerEmail && (
                      <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{rental.customerEmail}</span>
                    )}
                  </div>
                </div>
              </div>
              <Badge
                variant="outline"
                style={{
                  borderColor: rental.status === 'active' ? 'hsl(var(--status-active) / 0.3)' : 'hsl(var(--status-pending) / 0.3)',
                  color: rental.status === 'active' ? 'hsl(var(--status-active))' : 'hsl(var(--status-pending))',
                  backgroundColor: rental.status === 'active' ? 'hsl(var(--status-active) / 0.1)' : 'hsl(var(--status-pending) / 0.1)',
                }}
              >
                {rental.status === 'active' ? 'Активна' : rental.status === 'expiring' ? 'Заканчивается' : 'Истекла'}
              </Badge>
            </div>

            <Separator />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Начало</p>
                <p className="font-medium flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatDate(rental.startDate)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Окончание</p>
                <p className="font-medium flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatDate(rental.endDate)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Цена/мес</p>
                <p className="font-medium text-primary">{rental.pricePerMonth.toLocaleString('ru-RU')} ₽</p>
                {rental.discount > 0 && (
                  <p className="text-xs text-muted-foreground flex items-center gap-0.5"><Percent className="h-3 w-3" />скидка {rental.discount}%</p>
                )}
              </div>
              <div>
                <p className="text-muted-foreground">Автопродление</p>
                <p className="font-medium">{rental.autoRenew ? '✅ Да' : '❌ Нет'}</p>
              </div>
            </div>

            {rental.notes && (
              <>
                <Separator />
                <p className="text-sm text-muted-foreground italic">📝 {rental.notes}</p>
              </>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2 flex-wrap">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <Select value={String(extendMonths)} onValueChange={(v) => setExtendMonths(Number(v))}>
                  <SelectTrigger className="w-auto h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 6, 12].map(m => (
                      <SelectItem key={m} value={String(m)}>
                        {m} мес{m === 1 ? '.' : m < 5 ? '.' : '.'}
                        {getDiscount(m) > 0 && ` (−${getDiscount(m)}%)`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" className="gap-2 h-9" onClick={() => onExtend(extendMonths)}>
                  <RefreshCw className="h-4 w-4" />
                  Продлить
                </Button>
              </div>
              <Button variant="destructive" className="gap-2 h-9" onClick={onRelease}>
                <DoorOpen className="h-4 w-4" />
                Освободить
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Rental history */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <History className="h-4 w-4" /> История аренды
        </h3>
        {history.length > 0 ? (
          <div className="space-y-2">
            {history.map(h => (
              <div
                key={h.id}
                className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-4"
                style={{ boxShadow: 'var(--shadow-card)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{h.customerName}</p>
                    <p className="text-xs text-muted-foreground">{h.customerPhone}</p>
                  </div>
                </div>
                <div className="text-right text-sm">
                  <p>{formatDate(h.startDate)} — {formatDate(h.endDate)}</p>
                  <p className="text-muted-foreground">{h.months} мес · {h.pricePerMonth.toLocaleString('ru-RU')} ₽/мес</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-4 text-center">Нет предыдущих аренд</p>
        )}
      </div>
    </motion.div>
  );
};

// ========== Main Component ==========

const AdminCells = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'occupied'>('all');
  const [cells, setCells] = useState<StorageCell[]>(initialCells);
  const [customers, setCustomers] = useState<SimpleCustomer[]>(initialCustomers);
  const [rentals, setRentals] = useState<CellRental[]>(initialRentals);
  const [rentalHistory, setRentalHistory] = useState<CellRentalHistory[]>(initialHistory);
  const [selectedCell, setSelectedCell] = useState<StorageCell | null>(null);

  // Add cell dialog
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCell, setEditingCell] = useState<StorageCell | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Assign dialog
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [assigningCell, setAssigningCell] = useState<StorageCell | null>(null);
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({
    name: '', phone: '', email: '', type: 'individual' as 'company' | 'individual',
  });
  const [assignForm, setAssignForm] = useState({
    customerId: '',
    months: 1,
    autoRenew: false,
    notes: '',
    startDate: new Date().toISOString().split('T')[0],
  });

  // Release confirmation
  const [isReleaseDialogOpen, setIsReleaseDialogOpen] = useState(false);
  const [releasingCellId, setReleasingCellId] = useState<string | null>(null);

  // Form states
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    number: '', width: '', depth: '', height: '',
    floor: '1', tier: '1', hasSocket: false, hasShelves: false,
  });
  const [editFormData, setEditFormData] = useState({
    number: '', width: '', depth: '', height: '',
    floor: '1', tier: '1', hasSocket: false, hasShelves: false, isAvailable: true,
  });
  const [editPhotoPreviews, setEditPhotoPreviews] = useState<string[]>([]);

  // Computed
  const getRental = (cellId: string) => rentals.find(r => r.cellId === cellId);
  const getCellHistory = (cellId: string) => rentalHistory.filter(h => h.cellId === cellId);

  const filteredCells = cells.filter((cell) => {
    const matchSearch = cell.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${cell.width} × ${cell.depth} × ${cell.height}`.includes(searchQuery);
    if (statusFilter === 'available') return matchSearch && cell.isAvailable;
    if (statusFilter === 'occupied') return matchSearch && !cell.isAvailable;
    return matchSearch;
  });

  const availableCount = cells.filter(c => c.isAvailable).length;
  const occupiedCount = cells.filter(c => !c.isAvailable).length;

  const volume = (parseFloat(formData.width) || 0) * (parseFloat(formData.depth) || 0) * (parseFloat(formData.height) || 0);
  const calculatedPrice = volume > 0 ? calculatePrice(volume) : 0;
  const editVolume = (parseFloat(editFormData.width) || 0) * (parseFloat(editFormData.depth) || 0) * (parseFloat(editFormData.height) || 0);
  const editCalculatedPrice = editVolume > 0 ? calculatePrice(editVolume) : 0;

  const nextNumber = cells.length > 0 ? Math.max(...cells.map(c => c.number)) + 1 : 1;

  // Assign computed
  const assignCustomer = customers.find(c => c.id === assignForm.customerId);
  const assignDiscount = getDiscount(assignForm.months);
  const assignBasePrice = assigningCell?.pricePerMonth || 0;
  const assignFinalPrice = Math.round(assignBasePrice * (1 - assignDiscount / 100));
  const assignTotal = assignFinalPrice * assignForm.months;

  // ========== Handlers ==========

  const openAssignDialog = (cell: StorageCell) => {
    setAssigningCell(cell);
    setAssignForm({
      customerId: '',
      months: 1,
      autoRenew: false,
      notes: '',
      startDate: new Date().toISOString().split('T')[0],
    });
    setIsCreatingCustomer(false);
    setNewCustomerForm({ name: '', phone: '', email: '', type: 'individual' });
    setIsAssignDialogOpen(true);
  };

  const handleCreateInlineCustomer = () => {
    if (!newCustomerForm.name.trim() || !newCustomerForm.phone.trim()) {
      toast.error('Укажите имя и телефон клиента');
      return;
    }
    const newId = `C-${Date.now()}`;
    const newCustomer: SimpleCustomer = {
      id: newId,
      name: newCustomerForm.name.trim(),
      phone: newCustomerForm.phone.trim(),
      email: newCustomerForm.email.trim(),
      type: newCustomerForm.type,
    };
    setCustomers(prev => [...prev, newCustomer]);
    setAssignForm(prev => ({ ...prev, customerId: newId }));
    setIsCreatingCustomer(false);
    setNewCustomerForm({ name: '', phone: '', email: '', type: 'individual' });
    toast.success(`Клиент "${newCustomer.name}" создан`);
  };

  const handleAssign = () => {
    if (!assigningCell || !assignCustomer) return;

    const newRental: CellRental = {
      id: `R-${Date.now()}`,
      cellId: assigningCell.id,
      customerId: assignCustomer.id,
      customerName: assignCustomer.name,
      customerPhone: assignCustomer.phone,
      customerEmail: assignCustomer.email,
      customerType: assignCustomer.type,
      startDate: assignForm.startDate,
      endDate: addMonths(assignForm.startDate, assignForm.months),
      months: assignForm.months,
      discount: assignDiscount,
      pricePerMonth: assignFinalPrice,
      totalAmount: assignTotal,
      autoRenew: assignForm.autoRenew,
      status: 'active',
      notes: assignForm.notes,
    };

    setRentals(prev => [...prev, newRental]);
    setCells(prev => prev.map(c => c.id === assigningCell.id ? { ...c, isAvailable: false } : c));
    setIsAssignDialogOpen(false);
    toast.success(`Ячейка №${assigningCell.number} сдана клиенту ${assignCustomer.name}`);
  };

  const handleRelease = (cellId: string) => {
    setReleasingCellId(cellId);
    setIsReleaseDialogOpen(true);
  };

  const confirmRelease = () => {
    if (!releasingCellId) return;
    const rental = getRental(releasingCellId);
    if (rental) {
      // Move to history
      setRentalHistory(prev => [...prev, {
        id: `H-${Date.now()}`,
        cellId: rental.cellId,
        customerName: rental.customerName,
        customerPhone: rental.customerPhone,
        startDate: rental.startDate,
        endDate: new Date().toISOString().split('T')[0],
        months: rental.months,
        pricePerMonth: rental.pricePerMonth,
      }]);
      setRentals(prev => prev.filter(r => r.cellId !== releasingCellId));
    }
    setCells(prev => prev.map(c => c.id === releasingCellId ? { ...c, isAvailable: true } : c));
    setIsReleaseDialogOpen(false);
    setReleasingCellId(null);
    if (selectedCell?.id === releasingCellId) {
      setSelectedCell(prev => prev ? { ...prev, isAvailable: true } : null);
    }
    toast.success('Ячейка освобождена');
  };

  const handleExtend = (cellId: string, months: number) => {
    setRentals(prev => prev.map(r => {
      if (r.cellId !== cellId) return r;
      const newEnd = addMonths(r.endDate, months);
      const newDiscount = getDiscount(months);
      const basePrice = cells.find(c => c.id === cellId)?.pricePerMonth || r.pricePerMonth;
      const newPrice = Math.round(basePrice * (1 - newDiscount / 100));
      return { ...r, endDate: newEnd, months: r.months + months };
    }));
    toast.success(`Аренда продлена на ${months} мес.`);
  };

  // Photo handlers
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files);
    setPhotos(prev => [...prev, ...newFiles]);
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreviews(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (i: number) => {
    setPhotos(prev => prev.filter((_, idx) => idx !== i));
    setPhotoPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const resetForm = () => {
    setFormData({ number: '', width: '', depth: '', height: '', floor: '1', tier: '1', hasSocket: false, hasShelves: false });
    setPhotos([]);
    setPhotoPreviews([]);
  };

  const handleAddCell = () => {
    console.log('Adding cell:', { ...formData, photos, calculatedPrice });
    resetForm();
    setIsAddDialogOpen(false);
    toast.success('Ячейка добавлена');
  };

  const openEditDialog = (cell: StorageCell) => {
    setEditingCell(cell);
    setEditFormData({
      number: String(cell.number), width: String(cell.width), depth: String(cell.depth),
      height: String(cell.height), floor: String(cell.floor), tier: String(cell.tier),
      hasSocket: cell.hasSocket, hasShelves: cell.hasShelves, isAvailable: cell.isAvailable,
    });
    setEditPhotoPreviews(cell.photos || []);
    setIsEditDialogOpen(true);
  };

  const handleEditPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setEditPhotoPreviews(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const handleSaveEdit = () => {
    if (!editingCell) return;
    const w = parseFloat(editFormData.width) || editingCell.width;
    const d = parseFloat(editFormData.depth) || editingCell.depth;
    const h = parseFloat(editFormData.height) || editingCell.height;
    const area = parseFloat((w * d).toFixed(2));
    const vol = parseFloat((w * d * h).toFixed(2));
    const updatedCell: StorageCell = {
      ...editingCell,
      number: parseInt(editFormData.number) || editingCell.number,
      width: w,
      depth: d,
      height: h,
      area,
      volume: vol,
      floor: parseInt(editFormData.floor) || 1,
      tier: parseInt(editFormData.tier) || 1,
      pricePerMonth: calculatePrice(vol),
      hasSocket: editFormData.hasSocket,
      hasShelves: editFormData.hasShelves,
      photos: editPhotoPreviews,
    };
    setCells(prev => prev.map(c => c.id === editingCell.id ? updatedCell : c));
    if (selectedCell?.id === editingCell.id) {
      setSelectedCell(updatedCell);
    }
    setIsEditDialogOpen(false);
    setEditingCell(null);
    toast.success(`Ячейка №${updatedCell.number} обновлена`);
  };

  const getDimensions = (cell: StorageCell) => `${cell.width} × ${cell.depth} × ${cell.height} м`;

  // ========== Detail View ==========
  if (selectedCell) {
    const updatedCell = cells.find(c => c.id === selectedCell.id) || selectedCell;
    return (
      <>
        <AnimatePresence mode="wait">
          <CellDetailPanel
            key={updatedCell.id}
            cell={updatedCell}
            rental={getRental(updatedCell.id)}
            history={getCellHistory(updatedCell.id)}
            onClose={() => setSelectedCell(null)}
            onRelease={() => handleRelease(updatedCell.id)}
            onExtend={(months) => handleExtend(updatedCell.id, months)}
          />
        </AnimatePresence>

        {/* Release Confirmation (detail view) */}
        <AlertDialog open={isReleaseDialogOpen} onOpenChange={setIsReleaseDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Освободить ячейку?</AlertDialogTitle>
              <AlertDialogDescription>
                {releasingCellId && getRental(releasingCellId) && (
                  <>
                    Текущий арендатор: <strong>{getRental(releasingCellId)!.customerName}</strong><br />
                    Аренда до: <strong>{formatDate(getRental(releasingCellId)!.endDate)}</strong><br /><br />
                    Аренда будет завершена и перенесена в историю. Это действие нельзя отменить.
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Отмена</AlertDialogCancel>
              <AlertDialogAction onClick={confirmRelease} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Освободить
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  // ========== List View ==========
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">Ячейки</h2>
          <p className="text-base text-muted-foreground mt-1">
            Всего: {cells.length} · Свободно: {availableCount} · Занято: {occupiedCount}
          </p>
        </div>
        <Dialog modal open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2 h-11 text-base">
              <Plus className="h-5 w-5" />
              Добавить ячейку
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Добавить новую ячейку</DialogTitle>
              <DialogDescription>Заполните информацию о новой ячейке хранения</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Превью проекции</Label>
                <CellProjectionPreview width={parseFloat(formData.width) || 0} height={parseFloat(formData.height) || 0} depth={parseFloat(formData.depth) || 0} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="number">Номер ячейки</Label>
                  <Input id="number" type="number" placeholder={String(nextNumber)} value={formData.number}
                    onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))} />
                  <p className="text-xs text-muted-foreground">Следующий: {nextNumber}</p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tier">Ярус</Label>
                  <Input id="tier" type="number" min="1" placeholder="1" value={formData.tier}
                    onChange={(e) => setFormData(prev => ({ ...prev, tier: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>Ширина (м)</Label>
                  <Input type="number" step="0.1" placeholder="2.0" value={formData.width}
                    onChange={(e) => setFormData(prev => ({ ...prev, width: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label>Глубина (м)</Label>
                  <Input type="number" step="0.1" placeholder="2.5" value={formData.depth}
                    onChange={(e) => setFormData(prev => ({ ...prev, depth: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label>Высота (м)</Label>
                  <Input type="number" step="0.1" placeholder="2.5" value={formData.height}
                    onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))} />
                </div>
              </div>
              {volume > 0 && (
                <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Объём:</span>
                    <span className="font-medium">{volume.toFixed(2)} м³</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Площадь:</span>
                    <span className="font-medium">{((parseFloat(formData.width) || 0) * (parseFloat(formData.depth) || 0)).toFixed(2)} м²</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Цена (1500₽/м³):</span>
                    <span className="font-bold text-primary">₽ {calculatedPrice.toLocaleString()}/мес</span>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch checked={formData.hasSocket} onCheckedChange={(c) => setFormData(prev => ({ ...prev, hasSocket: c }))} />
                  <Label>Розетка</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={formData.hasShelves} onCheckedChange={(c) => setFormData(prev => ({ ...prev, hasShelves: c }))} />
                  <Label>Стеллажи</Label>
                </div>
              </div>
              <div className="space-y-3">
                <Label>Фотографии ячейки</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Нажмите для загрузки</p>
                </div>
                {photoPreviews.length > 0 && (
                  <div className="grid grid-cols-4 gap-3">
                    {photoPreviews.map((preview, i) => (
                      <div key={i} className="relative group aspect-square">
                        <img src={preview} alt="" className="w-full h-full object-cover rounded-lg border" />
                        <button onClick={() => removePhoto(i)}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Отмена</Button>
              <Button onClick={handleAddCell} disabled={volume === 0}>Добавить</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
          <p className="text-sm text-muted-foreground">Всего ячеек</p>
          <p className="text-2xl font-bold mt-1 text-primary">{cells.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
          <p className="text-sm text-muted-foreground">Свободно</p>
          <p className="text-2xl font-bold mt-1" style={{ color: 'hsl(var(--status-active))' }}>{availableCount}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
          <p className="text-sm text-muted-foreground">Занято</p>
          <p className="text-2xl font-bold mt-1" style={{ color: 'hsl(var(--status-pending))' }}>{occupiedCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
          <TabsList className="h-11">
            <TabsTrigger value="all" className="text-sm px-4">Все ({cells.length})</TabsTrigger>
            <TabsTrigger value="available" className="text-sm px-4">Свободные ({availableCount})</TabsTrigger>
            <TabsTrigger value="occupied" className="text-sm px-4">Занятые ({occupiedCount})</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Поиск по ID или размерам..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 h-11" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">ID</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Размеры</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Объём</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Цена/мес</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Арендатор</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Статус</th>
                <th className="text-right p-4 text-sm font-semibold text-muted-foreground">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredCells.map((cell) => {
                const rental = getRental(cell.id);
                return (
                  <tr key={cell.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedCell(cell)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Box className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm">{cell.id}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm">{getDimensions(cell)}</td>
                    <td className="p-4 text-sm">{cell.volume} м³</td>
                    <td className="p-4 font-semibold text-sm">
                      {rental ? (
                        <span>
                          {rental.pricePerMonth.toLocaleString('ru-RU')} ₽
                          {rental.discount > 0 && (
                            <span className="text-xs text-muted-foreground ml-1">(-{rental.discount}%)</span>
                          )}
                        </span>
                      ) : (
                        <>{cell.pricePerMonth.toLocaleString('ru-RU')} ₽</>
                      )}
                    </td>
                    <td className="p-4">
                      {rental ? (
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                            {rental.customerName[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate max-w-[150px]">{rental.customerName}</p>
                            <p className="text-xs text-muted-foreground">до {formatDate(rental.endDate)}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      <Badge
                        variant="outline"
                        style={cell.isAvailable ? {
                          borderColor: 'hsl(var(--status-active) / 0.3)',
                          color: 'hsl(var(--status-active))',
                          backgroundColor: 'hsl(var(--status-active) / 0.1)',
                        } : {
                          borderColor: 'hsl(var(--status-pending) / 0.3)',
                          color: 'hsl(var(--status-pending))',
                          backgroundColor: 'hsl(var(--status-pending) / 0.1)',
                        }}
                      >
                        {cell.isAvailable ? 'Свободна' : 'Занята'}
                      </Badge>
                    </td>
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedCell(cell)}>
                            <Eye className="h-4 w-4 mr-2" />Подробнее
                          </DropdownMenuItem>
                          {cell.isAvailable ? (
                            <DropdownMenuItem onClick={() => openAssignDialog(cell)}>
                              <UserPlus className="h-4 w-4 mr-2" />Сдать ячейку
                            </DropdownMenuItem>
                          ) : (
                            <>
                              <DropdownMenuItem onClick={() => {
                                setSelectedCell(cell);
                              }}>
                                <Key className="h-4 w-4 mr-2" />Просмотр аренды
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={() => handleRelease(cell.id)}>
                                <DoorOpen className="h-4 w-4 mr-2" />Освободить
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openEditDialog(cell)}>
                            <Edit className="h-4 w-4 mr-2" />Редактировать
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========== Assign Cell Dialog ========== */}
      <Dialog modal open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Сдать ячейку №{assigningCell?.number}
            </DialogTitle>
            <DialogDescription>
              {assigningCell && `${getDimensions(assigningCell)} · ${assigningCell.volume} м³ · ${assigningCell.pricePerMonth.toLocaleString()} ₽/мес`}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {/* Customer select or create */}
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>Клиент</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1 text-primary"
                  onClick={() => {
                    setIsCreatingCustomer(!isCreatingCustomer);
                    if (!isCreatingCustomer) {
                      setAssignForm(prev => ({ ...prev, customerId: '' }));
                    }
                  }}
                >
                  {isCreatingCustomer ? (
                    <><ArrowLeft className="h-3 w-3" />Выбрать из списка</>
                  ) : (
                    <><Plus className="h-3 w-3" />Новый клиент</>
                  )}
                </Button>
              </div>

              {isCreatingCustomer ? (
                <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-3">
                  {/* Type toggle */}
                  <div className="flex gap-2">
                    <Button type="button" size="sm" variant={newCustomerForm.type === 'individual' ? 'default' : 'outline'}
                      className="flex-1 gap-1.5 h-9" onClick={() => setNewCustomerForm(p => ({ ...p, type: 'individual' }))}>
                      <UserRound className="h-3.5 w-3.5" />Физ. лицо
                    </Button>
                    <Button type="button" size="sm" variant={newCustomerForm.type === 'company' ? 'default' : 'outline'}
                      className="flex-1 gap-1.5 h-9" onClick={() => setNewCustomerForm(p => ({ ...p, type: 'company' }))}>
                      <Building2 className="h-3.5 w-3.5" />Компания
                    </Button>
                  </div>
                  <Input placeholder={newCustomerForm.type === 'company' ? 'Название компании *' : 'ФИО *'}
                    value={newCustomerForm.name}
                    onChange={(e) => setNewCustomerForm(p => ({ ...p, name: e.target.value }))}
                    className="h-10" />
                  <Input placeholder="Телефон *" value={newCustomerForm.phone}
                    onChange={(e) => setNewCustomerForm(p => ({ ...p, phone: e.target.value }))}
                    className="h-10" />
                  <Input placeholder="Email (необязательно)" value={newCustomerForm.email}
                    onChange={(e) => setNewCustomerForm(p => ({ ...p, email: e.target.value }))}
                    className="h-10" />
                  <Button type="button" onClick={handleCreateInlineCustomer}
                    disabled={!newCustomerForm.name.trim() || !newCustomerForm.phone.trim()}
                    className="w-full h-9 gap-1.5">
                    <UserPlus className="h-4 w-4" />
                    Создать и выбрать
                  </Button>
                </div>
              ) : (
                <Select value={assignForm.customerId} onValueChange={(v) => setAssignForm(prev => ({ ...prev, customerId: v }))}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Выберите клиента..." />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        <div className="flex items-center gap-2">
                          <span>{c.name}</span>
                          <span className="text-xs text-muted-foreground">· {c.phone}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Start date */}
            <div className="grid gap-2">
              <Label>Дата начала</Label>
              <Input type="date" value={assignForm.startDate}
                onChange={(e) => setAssignForm(prev => ({ ...prev, startDate: e.target.value }))} className="h-11" />
            </div>

            {/* Duration */}
            <div className="grid gap-2">
              <Label>Срок аренды</Label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 3, 6, 12].map(m => (
                  <Button key={m} type="button"
                    variant={assignForm.months === m ? 'default' : 'outline'}
                    className="h-11 flex-col gap-0.5"
                    onClick={() => setAssignForm(prev => ({ ...prev, months: m }))}
                  >
                    <span className="text-sm font-semibold">{m} мес</span>
                    {getDiscount(m) > 0 && <span className="text-xs opacity-80">−{getDiscount(m)}%</span>}
                  </Button>
                ))}
              </div>
            </div>

            {/* Price calculation */}
            <div className="rounded-lg bg-muted/50 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Базовая цена:</span>
                <span>{assignBasePrice.toLocaleString()} ₽/мес</span>
              </div>
              {assignDiscount > 0 && (
                <div className="flex justify-between text-sm" style={{ color: 'hsl(var(--status-active))' }}>
                  <span>Скидка ({assignDiscount}%):</span>
                  <span>−{(assignBasePrice - assignFinalPrice).toLocaleString()} ₽</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Итого/мес:</span>
                <span className="text-primary">{assignFinalPrice.toLocaleString()} ₽</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Общая сумма ({assignForm.months} мес):</span>
                <span className="font-medium">{assignTotal.toLocaleString()} ₽</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Период:</span>
                <span>{formatDate(assignForm.startDate)} — {formatDate(addMonths(assignForm.startDate, assignForm.months))}</span>
              </div>
            </div>

            {/* Auto-renew */}
            <div className="flex items-center gap-3">
              <Switch checked={assignForm.autoRenew}
                onCheckedChange={(c) => setAssignForm(prev => ({ ...prev, autoRenew: c }))} />
              <Label>Автопродление</Label>
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label>Заметки</Label>
              <Textarea placeholder="Особые условия, комментарии..." value={assignForm.notes}
                onChange={(e) => setAssignForm(prev => ({ ...prev, notes: e.target.value }))}
                className="min-h-[80px]" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleAssign} disabled={!assignForm.customerId} className="gap-2">
              <Key className="h-4 w-4" />
              Оформить аренду
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========== Release Confirmation ========== */}
      <AlertDialog open={isReleaseDialogOpen} onOpenChange={setIsReleaseDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Освободить ячейку?</AlertDialogTitle>
            <AlertDialogDescription>
              {releasingCellId && getRental(releasingCellId) && (
                <>
                  Текущий арендатор: <strong>{getRental(releasingCellId)!.customerName}</strong><br />
                  Аренда до: <strong>{formatDate(getRental(releasingCellId)!.endDate)}</strong><br /><br />
                  Аренда будет завершена и перенесена в историю. Это действие нельзя отменить.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRelease} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Освободить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ========== Edit Dialog ========== */}
      <Dialog modal open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактировать ячейку №{editingCell?.number}</DialogTitle>
            <DialogDescription>Измените параметры ячейки хранения</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Превью проекции</Label>
              <CellProjectionPreview width={parseFloat(editFormData.width) || 0} height={parseFloat(editFormData.height) || 0} depth={parseFloat(editFormData.depth) || 0} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Номер ячейки</Label>
                <Input type="number" value={editFormData.number}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, number: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Ярус</Label>
                <Input type="number" min="1" value={editFormData.tier}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, tier: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>Ширина (м)</Label>
                <Input type="number" step="0.1" value={editFormData.width}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, width: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Глубина (м)</Label>
                <Input type="number" step="0.1" value={editFormData.depth}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, depth: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Высота (м)</Label>
                <Input type="number" step="0.1" value={editFormData.height}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, height: e.target.value }))} />
              </div>
            </div>
            {editVolume > 0 && (
              <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Объём:</span>
                  <span className="font-medium">{editVolume.toFixed(2)} м³</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Цена (1500₽/м³):</span>
                  <span className="font-bold text-primary">₽ {editCalculatedPrice.toLocaleString()}/мес</span>
                </div>
              </div>
            )}
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <Switch checked={editFormData.hasSocket} onCheckedChange={(c) => setEditFormData(prev => ({ ...prev, hasSocket: c }))} />
                <Label>Розетка</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={editFormData.hasShelves} onCheckedChange={(c) => setEditFormData(prev => ({ ...prev, hasShelves: c }))} />
                <Label>Стеллажи</Label>
              </div>
            </div>
            <div className="space-y-3">
              <Label>Фотографии ячейки</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => editFileInputRef.current?.click()}>
                <input ref={editFileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleEditPhotoUpload} />
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Нажмите для загрузки</p>
              </div>
              {editPhotoPreviews.length > 0 && (
                <div className="grid grid-cols-4 gap-3">
                  {editPhotoPreviews.map((preview, i) => (
                    <div key={i} className="relative group aspect-square">
                      <img src={preview} alt="" className="w-full h-full object-cover rounded-lg border" />
                      <button onClick={() => setEditPhotoPreviews(prev => prev.filter((_, idx) => idx !== i))}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleSaveEdit}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCells;
