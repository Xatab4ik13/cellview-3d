import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2, Plus, ChevronLeft } from 'lucide-react';
import { useCells } from '@/hooks/useCells';
import { useCustomers, useCreateCustomer } from '@/hooks/useCustomers';
import { RentalData, CustomerData } from '@/lib/api';

interface RentalFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmitCreate: (data: {
    cellId: string;
    customerId: string;
    startDate: string;
    endDate: string;
    months: number;
    pricePerMonth: number;
    totalAmount: number;
    autoRenew: boolean;
    notes?: string;
  }) => void;
  onSubmitEdit?: (id: string, data: { startDate?: string; endDate?: string; totalAmount?: number; pricePerMonth?: number; notes?: string }) => void;
  editRental?: RentalData | null;
  isSubmitting?: boolean;
}

export default function RentalFormDialog({ open, onClose, onSubmitCreate, onSubmitEdit, editRental, isSubmitting }: RentalFormDialogProps) {
  const isEdit = !!editRental;
  const { data: cells = [] } = useCells();
  const { data: customers = [] } = useCustomers();
  const createCustomerMutation = useCreateCustomer();

  const [cellId, setCellId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pricePerMonth, setPricePerMonth] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [autoRenew, setAutoRenew] = useState(false);
  const [notes, setNotes] = useState('');

  // Inline new customer form
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const availableCells = cells.filter(c => c.status === 'available' || c.status === 'reserved');

  useEffect(() => {
    if (editRental) {
      setCellId(editRental.cellId);
      setCustomerId(editRental.customerId);
      setStartDate(editRental.startDate?.split('T')[0] || '');
      setEndDate(editRental.endDate?.split('T')[0] || '');
      setPricePerMonth(String(editRental.pricePerMonth || ''));
      setTotalAmount(String(editRental.totalAmount || ''));
      setAutoRenew(editRental.autoRenew);
      setNotes(editRental.notes || '');
    } else {
      setCellId('');
      setCustomerId('');
      setStartDate(new Date().toISOString().split('T')[0]);
      setEndDate('');
      setPricePerMonth('');
      setTotalAmount('');
      setAutoRenew(false);
      setNotes('');
    }
    setShowNewCustomer(false);
    setNewName('');
    setNewPhone('');
    setNewEmail('');
  }, [editRental, open]);

  // Auto-select price when cell is picked (create mode)
  useEffect(() => {
    if (!isEdit && cellId) {
      const cell = cells.find(c => c.id === cellId);
      if (cell) setPricePerMonth(String(cell.pricePerMonth));
    }
  }, [cellId, isEdit, cells]);

  const handleCreateCustomer = async () => {
    if (!newName.trim() || !newPhone.trim()) return;
    try {
      const result = await createCustomerMutation.mutateAsync({
        name: newName.trim(),
        phone: newPhone.trim(),
        email: newEmail.trim() || undefined,
        type: 'individual',
      });
      setCustomerId(result.id);
      setShowNewCustomer(false);
      setNewName('');
      setNewPhone('');
      setNewEmail('');
    } catch {}
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit && onSubmitEdit && editRental) {
      onSubmitEdit(editRental.id, {
        startDate,
        endDate,
        pricePerMonth: Number(pricePerMonth),
        totalAmount: Number(totalAmount),
        notes: notes || undefined,
      });
    } else {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffMonths = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30)));
      onSubmitCreate({
        cellId,
        customerId,
        startDate,
        endDate,
        months: diffMonths,
        pricePerMonth: Number(pricePerMonth),
        totalAmount: Number(totalAmount) || Number(pricePerMonth) * diffMonths,
        autoRenew,
        notes: notes || undefined,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Редактировать аренду' : 'Новая аренда'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEdit && (
            <>
              <div className="space-y-2">
                <Label>Ячейка</Label>
                <Select value={cellId} onValueChange={setCellId} required>
                  <SelectTrigger><SelectValue placeholder="Выберите ячейку" /></SelectTrigger>
                  <SelectContent>
                    {availableCells.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        №{c.number} — {c.pricePerMonth?.toLocaleString('ru-RU')} ₽/мес ({c.width}×{c.depth}×{c.height})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Клиент</Label>
                  {!showNewCustomer && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1 text-primary"
                      onClick={() => setShowNewCustomer(true)}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Новый клиент
                    </Button>
                  )}
                </div>

                {showNewCustomer ? (
                  <div className="space-y-3 rounded-lg border border-border p-3 bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setShowNewCustomer(false)}>
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-sm font-medium">Новый клиент</span>
                    </div>
                    <Input placeholder="ФИО *" value={newName} onChange={e => setNewName(e.target.value)} />
                    <Input placeholder="Телефон *" value={newPhone} onChange={e => setNewPhone(e.target.value)} />
                    <Input placeholder="Email (необязательно)" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
                    <Button
                      type="button"
                      size="sm"
                      className="w-full"
                      disabled={!newName.trim() || !newPhone.trim() || createCustomerMutation.isPending}
                      onClick={handleCreateCustomer}
                    >
                      {createCustomerMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Создать клиента
                    </Button>
                  </div>
                ) : (
                  <Select value={customerId} onValueChange={setCustomerId} required>
                    <SelectTrigger><SelectValue placeholder="Выберите клиента" /></SelectTrigger>
                    <SelectContent>
                      {customers.map(c => (
                        <SelectItem key={c.id} value={c.id!}>
                          {c.name} — {c.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </>
          )}

          {isEdit && (
            <div className="text-sm text-muted-foreground">
              Ячейка №{editRental?.cellNumber} · {editRental?.customerName}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Дата начала</Label>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Дата окончания</Label>
              <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Цена/мес, ₽</Label>
              <Input type="number" value={pricePerMonth} onChange={e => setPricePerMonth(e.target.value)} placeholder="5000" required />
            </div>
            <div className="space-y-2">
              <Label>Итого, ₽</Label>
              <Input type="number" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} placeholder="Авто" />
            </div>
          </div>

          {!isEdit && (
            <div className="flex items-center gap-3">
              <Switch checked={autoRenew} onCheckedChange={setAutoRenew} />
              <Label>Автопродление</Label>
            </div>
          )}

          <div className="space-y-2">
            <Label>Заметки</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Наличная оплата и т.д." rows={2} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Отмена</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEdit ? 'Сохранить' : 'Создать'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
