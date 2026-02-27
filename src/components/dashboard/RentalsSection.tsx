import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Key, Calendar, MapPin, FileText, Copy, Check, Phone, Loader2, Clock, CreditCard, AlertTriangle, User } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { fetchRentals, fetchCustomer, type RentalData } from '@/lib/api';
import { RESERVATION_HOURS } from '@/types/storage';
import type { BookingState } from '@/pages/Dashboard';

interface RentalsSectionProps {
  pendingBooking?: BookingState | null;
  onClearBooking?: () => void;
  onGoToProfile?: () => void;
}

const RESERVATION_SECONDS = RESERVATION_HOURS * 60 * 60;

const RentalsSection = ({ pendingBooking, onClearBooking, onGoToProfile }: RentalsSectionProps) => {
  const { toast } = useToast();
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const [rentals, setRentals] = useState<RentalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(RESERVATION_SECONDS);
  const [profileComplete, setProfileComplete] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(false);

  // Check if profile has required fields (ФИО + паспорт)
  const checkProfile = useCallback(async () => {
    const stored = localStorage.getItem('kladovka78_customer');
    if (!stored) return;
    setCheckingProfile(true);
    try {
      const customer = JSON.parse(stored);
      const data = await fetchCustomer(customer.id);
      const nameParts = (data.name || '').trim().split(' ').filter(Boolean);
      const hasName = nameParts.length >= 2; // At least last + first name
      const hasPassport = !!(data.passportSeries && data.passportNumber);
      setProfileComplete(hasName && hasPassport);
    } catch {
      setProfileComplete(false);
    } finally {
      setCheckingProfile(false);
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('kladovka78_customer');
    if (!stored) return;

    const customer = JSON.parse(stored);
    fetchRentals({ customer_id: customer.id, status: 'active' })
      .then(setRentals)
      .catch(() => {
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить аренды',
          variant: 'destructive',
        });
      })
      .finally(() => setLoading(false));
  }, [toast]);

  // Check profile when there's a pending booking
  useEffect(() => {
    if (pendingBooking) {
      checkProfile();
    }
  }, [pendingBooking, checkProfile]);

  // Timer for pending booking
  useEffect(() => {
    if (!pendingBooking) return;
    setTimeLeft(RESERVATION_SECONDS);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [pendingBooking]);

  const copyAccessPhone = (id: string, phone: string) => {
    navigator.clipboard.writeText(phone.replace(/[\s\-]/g, ''));
    setCopiedPhone(id);
    toast({ title: 'Скопировано', description: 'Номер телефона скопирован' });
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getDaysLeft = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const handlePay = () => {
    alert('Оплата временно недоступна. Платёжная система подключается.');
  };

  const handleCancelBooking = () => {
    onClearBooking?.();
    toast({ title: 'Бронь отменена', description: 'Вы можете выбрать другую ячейку в каталоге' });
  };

  if (loading) {
    return (
      <Card className="border-border/50 shadow-lg">
        <CardContent className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;
  const isExpired = timeLeft <= 0;
  const isUrgent = timeLeft < 600;

  return (
    <div className="space-y-6">
      {/* Pending Booking Card */}
      {pendingBooking && (
        <Card className={`border-2 overflow-hidden ${isExpired ? 'border-destructive/50' : 'border-primary/30'}`}>
          <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border/50">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-3 text-xl font-bold">
                  Ячейка №{pendingBooking.cellNumber}
                  <Badge className="bg-[hsl(var(--status-new))] text-white">
                    В брони
                  </Badge>
                </CardTitle>
                <CardDescription className="mt-1">
                  Ожидает оплаты
                </CardDescription>
              </div>
              <div className="text-right">
                <p className="text-2xl font-extrabold text-primary">
                  {pendingBooking.totalPrice?.toLocaleString('ru-RU')} ₽
                </p>
                <p className="text-sm text-muted-foreground">за {pendingBooking.duration} мес.</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-5 pt-5">
            {/* Timer */}
            <div className={`flex items-center gap-4 p-4 rounded-xl border ${isExpired ? 'bg-destructive/5 border-destructive/30' : isUrgent ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-400/30' : 'bg-muted/50 border-border'}`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isExpired ? 'bg-destructive/10' : 'bg-primary/10'}`}>
                <Clock className={`w-6 h-6 ${isExpired ? 'text-destructive' : isUrgent ? 'text-orange-500' : 'text-primary'}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground font-medium">
                  {isExpired ? 'Бронь истекла' : 'Осталось времени на оплату'}
                </p>
                {isExpired ? (
                  <p className="text-lg font-bold text-destructive">Время вышло</p>
                ) : (
                  <p className={`text-2xl font-extrabold tabular-nums ${isUrgent ? 'text-orange-500' : 'text-foreground'}`}>
                    {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                  </p>
                )}
              </div>
            </div>

            {/* Order details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-muted/50 rounded-xl p-3 border border-border/50">
                <p className="text-xs text-muted-foreground">Срок</p>
                <p className="font-bold">{pendingBooking.duration} мес.</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-3 border border-border/50">
                <p className="text-xs text-muted-foreground">В месяц</p>
                <p className="font-bold">{pendingBooking.pricePerMonth?.toLocaleString('ru-RU')} ₽</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-3 border border-border/50 col-span-2">
                <p className="text-xs text-muted-foreground">Итого к оплате</p>
                <p className="font-bold text-lg text-primary">{pendingBooking.totalPrice?.toLocaleString('ru-RU')} ₽</p>
              </div>
            </div>

            {/* Profile warning */}
            {!profileComplete && !checkingProfile && !isExpired && (
              <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-300/50 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Заполните данные профиля</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Для оплаты необходимо указать ФИО и паспортные данные. После оплаты бот пришлёт вам договор.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3 gap-2 border-amber-400/50 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                    onClick={onGoToProfile}
                  >
                    <User className="w-4 h-4" />
                    Заполнить профиль
                  </Button>
                </div>
              </div>
            )}

            {checkingProfile && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center py-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Проверяем данные профиля...
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <Button
                className="flex-1 h-14 text-base font-bold gap-2"
                size="lg"
                disabled={isExpired || !profileComplete || checkingProfile}
                onClick={handlePay}
              >
                <CreditCard className="w-5 h-5" />
                {isExpired
                  ? 'Бронь истекла'
                  : !profileComplete
                    ? 'Заполните профиль для оплаты'
                    : `Оплатить ${pendingBooking.totalPrice?.toLocaleString('ru-RU')} ₽`
                }
              </Button>
              <Button
                variant="outline"
                className="h-14"
                onClick={handleCancelBooking}
              >
                Отменить
              </Button>
            </div>

            {profileComplete && !isExpired && (
              <p className="text-xs text-center text-muted-foreground">
                После оплаты бот отправит вам договор аренды с вашими данными
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Existing active rentals */}
      {rentals.map((rental) => {
        const daysLeft = getDaysLeft(rental.endDate);
        const accessPhone = '8 (911) 810-83-83';

        return (
          <Card key={rental.id} className="border-border/50 shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b border-border/50">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-3 text-xl font-bold">
                    Ячейка №{rental.cellNumber || '—'}
                    <Badge 
                      variant={rental.status === 'active' ? 'default' : 'secondary'}
                      className={rental.status === 'active' ? 'bg-accent text-accent-foreground' : ''}
                    >
                      {rental.status === 'active' ? 'Активна' : rental.status === 'expired' ? 'Истекла' : 'Отменена'}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-2">
                    <MapPin className="w-4 h-4" />
                    Санкт-Петербург
                  </CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-extrabold text-primary">
                    {rental.pricePerMonth?.toLocaleString()} ₽
                  </p>
                  <p className="text-sm text-muted-foreground">в месяц</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-secondary rounded-xl p-4 border border-border/50">
                  <p className="text-sm text-muted-foreground font-medium">Срок</p>
                  <p className="font-bold text-lg">{rental.months} мес.</p>
                </div>
                <div className="bg-secondary rounded-xl p-4 border border-border/50">
                  <p className="text-sm text-muted-foreground font-medium">Итого</p>
                  <p className="font-bold text-lg">{rental.totalAmount?.toLocaleString()} ₽</p>
                </div>
                <div className="bg-secondary rounded-xl p-4 border border-border/50">
                  <p className="text-sm text-muted-foreground font-medium">Начало</p>
                  <p className="font-bold text-lg">{formatDate(rental.startDate)}</p>
                </div>
                <div className="bg-secondary rounded-xl p-4 border border-border/50">
                  <p className="text-sm text-muted-foreground font-medium">Окончание</p>
                  <p className="font-bold text-lg">{formatDate(rental.endDate)}</p>
                </div>
              </div>

              {daysLeft <= 7 && daysLeft > 0 && (
                <div className="bg-accent/10 border border-accent/30 rounded-xl p-4">
                  <p className="text-sm font-semibold text-accent-foreground">
                    ⚠️ До окончания аренды осталось {daysLeft} дн.
                  </p>
                </div>
              )}

              <div className="border-2 border-accent/30 rounded-2xl p-5 bg-gradient-to-r from-accent/5 to-primary/5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1 font-medium">Доступ по звонку</p>
                    <div className="flex items-center gap-3">
                      <Phone className="w-6 h-6 text-accent" />
                      <p className="text-2xl font-extrabold text-primary">{accessPhone}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Позвоните — дверь откроется автоматически</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="icon" className="border-primary/30" onClick={() => copyAccessPhone(rental.id, accessPhone)}>
                      {copiedPhone === rental.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                    <Button size="icon" className="bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
                      <a href={`tel:${accessPhone.replace(/[\s\-]/g, '')}`}><Phone className="w-4 h-4" /></a>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button variant="outline" className="gap-2 font-semibold border-primary/30 hover:border-primary hover:bg-primary/5">
                  <FileText className="w-4 h-4" />
                  Скачать договор
                </Button>
                <Button className="gap-2 font-semibold bg-primary hover:bg-primary/90">
                  <Calendar className="w-4 h-4" />
                  Продлить аренду
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Empty state - only show if no rentals AND no pending booking */}
      {rentals.length === 0 && !pendingBooking && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
              <Key className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Нет активной аренды</h3>
            <p className="text-muted-foreground text-center mb-6">
              Вы пока не арендовали кладовку. Выберите подходящую ячейку в каталоге.
            </p>
            <Button asChild>
              <a href="/catalog">Перейти в каталог</a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RentalsSection;
