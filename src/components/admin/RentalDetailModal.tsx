import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Key, User, Calendar, CreditCard, RefreshCw, Ban, Trash2, Phone, Mail, Box, Clock, Banknote } from 'lucide-react';
import { RentalData, PaymentData } from '@/lib/api';
import { format, parseISO, differenceInDays } from 'date-fns';
import { ru } from 'date-fns/locale';

interface RentalDetailModalProps {
  open: boolean;
  onClose: () => void;
  rental: RentalData | null;
  payments: PaymentData[];
  onExtend: (id: string) => void;
  onRelease: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (rental: RentalData) => void;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: 'Активна', color: 'var(--status-active)' },
  expiring: { label: 'Заканчивается', color: 'var(--status-pending)' },
  expired: { label: 'Просрочена', color: 'var(--status-overdue)' },
  cancelled: { label: 'Отменена', color: 'var(--status-overdue)' },
};

const paymentStatusConfig: Record<string, { label: string; color: string }> = {
  paid: { label: 'Оплачен', color: 'var(--status-active)' },
  pending: { label: 'Ожидание', color: 'var(--status-pending)' },
  created: { label: 'Создан', color: 'var(--status-pending)' },
  failed: { label: 'Ошибка', color: 'var(--status-overdue)' },
  refunded: { label: 'Возврат', color: 'var(--status-overdue)' },
  expired: { label: 'Истёк', color: 'var(--status-overdue)' },
};

function getDisplayStatus(rental: RentalData) {
  if (rental.status === 'cancelled') return 'cancelled';
  if (rental.status === 'expired') return 'expired';
  const daysLeft = differenceInDays(parseISO(rental.endDate), new Date());
  if (daysLeft < 0) return 'expired';
  if (daysLeft <= 7) return 'expiring';
  return 'active';
}

function formatDate(dateStr: string) {
  try { return format(parseISO(dateStr), 'dd MMMM yyyy', { locale: ru }); }
  catch { return dateStr; }
}

export default function RentalDetailModal({ open, onClose, rental, payments, onExtend, onRelease, onDelete, onEdit }: RentalDetailModalProps) {
  if (!rental) return null;

  const displayStatus = getDisplayStatus(rental);
  const sc = statusConfig[displayStatus] || statusConfig.active;
  const daysLeft = differenceInDays(parseISO(rental.endDate), new Date());
  const linkedPayments = payments.filter(p => p.rentalId === rental.id || (p.customerId === rental.customerId && p.cellId === rental.cellId));
  const isActive = displayStatus === 'active' || displayStatus === 'expiring';

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `hsl(${sc.color} / 0.1)` }}>
              <Key className="h-5 w-5" style={{ color: `hsl(${sc.color})` }} />
            </div>
            <div>
              <span>Аренда · Ячейка №{rental.cellNumber || '—'}</span>
              <Badge variant="outline" className="ml-3 text-xs" style={{ borderColor: `hsl(${sc.color} / 0.3)`, color: `hsl(${sc.color})`, backgroundColor: `hsl(${sc.color} / 0.1)` }}>
                {sc.label}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Client info */}
        <div className="rounded-lg border border-border p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <User className="h-4 w-4 text-muted-foreground" />
            {rental.customerName}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{rental.customerPhone}</span>
            {rental.customerEmail && <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{rental.customerEmail}</span>}
          </div>
        </div>

        {/* Rental details */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />Начало</p>
            <p className="text-sm font-medium mt-1">{formatDate(rental.startDate)}</p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />Окончание</p>
            <p className="text-sm font-medium mt-1">{formatDate(rental.endDate)}</p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground flex items-center gap-1"><Banknote className="h-3 w-3" />Цена/мес</p>
            <p className="text-sm font-medium mt-1">{rental.pricePerMonth?.toLocaleString('ru-RU')} ₽</p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground flex items-center gap-1"><CreditCard className="h-3 w-3" />Итого</p>
            <p className="text-sm font-medium mt-1">{rental.totalAmount?.toLocaleString('ru-RU')} ₽</p>
          </div>
        </div>

        {isActive && (
          <div className="rounded-lg p-3 text-sm" style={{ backgroundColor: `hsl(${sc.color} / 0.05)`, border: `1px solid hsl(${sc.color} / 0.2)` }}>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" style={{ color: `hsl(${sc.color})` }} />
              <span style={{ color: `hsl(${sc.color})` }} className="font-medium">
                {daysLeft === 0 ? 'Заканчивается сегодня' : daysLeft === 1 ? 'Остался 1 день' : `Осталось ${daysLeft} дн.`}
              </span>
            </div>
          </div>
        )}

        {rental.notes && (
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground mb-1">Заметки</p>
            <p className="text-sm">{rental.notes}</p>
          </div>
        )}

        {/* Linked Payments */}
        <Separator />
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            Платежи ({linkedPayments.length})
          </h4>
          {linkedPayments.length > 0 ? (
            <div className="space-y-2">
              {linkedPayments.map(p => {
                const ps = paymentStatusConfig[p.status] || paymentStatusConfig.pending;
                return (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
                    <div>
                      <p className="text-sm font-medium">{p.amount?.toLocaleString('ru-RU')} ₽</p>
                      <p className="text-xs text-muted-foreground">
                        {p.paymentMethod === 'CASH' ? 'Наличные' : p.paymentMethod || 'Онлайн'} · {p.createdAt ? new Date(p.createdAt).toLocaleDateString('ru-RU') : ''}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs" style={{ borderColor: `hsl(${ps.color} / 0.3)`, color: `hsl(${ps.color})` }}>
                      {ps.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">Нет привязанных платежей</p>
          )}
        </div>

        {/* Actions */}
        <Separator />
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { onClose(); onEdit(rental); }}>
            <Key className="h-3.5 w-3.5" />Редактировать
          </Button>
          {isActive && (
            <>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { onClose(); onExtend(rental.id); }}>
                <RefreshCw className="h-3.5 w-3.5" />Продлить на 1 мес
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive" onClick={() => {
                if (confirm(`Завершить аренду для ${rental.customerName}?`)) { onClose(); onRelease(rental.id); }
              }}>
                <Ban className="h-3.5 w-3.5" />Завершить
              </Button>
            </>
          )}
          <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive ml-auto" onClick={() => {
            if (confirm(`Удалить аренду? Это действие необратимо.`)) { onClose(); onDelete(rental.id); }
          }}>
            <Trash2 className="h-3.5 w-3.5" />Удалить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
