import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, Shield, CreditCard, ArrowLeft, CheckCircle2, Lock, MessageCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { RESERVATION_HOURS } from '@/types/storage';

const RESERVATION_SECONDS = RESERVATION_HOURS * 60 * 60;

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(RESERVATION_SECONDS);

  const bookingData = location.state as {
    cellId?: number;
    cellNumber?: number;
    duration?: number;
    totalPrice?: number;
  } | null;

  useEffect(() => {
    if (!bookingData) {
      navigate('/catalog');
      return;
    }

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
  }, [bookingData, navigate]);

  if (!bookingData) return null;

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;
  const isExpired = timeLeft <= 0;
  const isUrgent = timeLeft < 600; // less than 10 min

  const handlePay = () => {
    // Заглушка — здесь будет редирект на ЮKassa/Тинькофф
    alert('Оплата временно недоступна. Платёжная система подключается.');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 pt-40 pb-20">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Back link */}
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Вернуться в каталог
          </Link>

          {/* Timer */}
          <Card className={`mb-6 border-2 ${isExpired ? 'border-destructive/50 bg-destructive/5' : isUrgent ? 'border-orange-400/50 bg-orange-50 dark:bg-orange-950/20' : 'border-primary/20'}`}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isExpired ? 'bg-destructive/10' : 'bg-primary/10'}`}>
                  <Clock className={`w-7 h-7 ${isExpired ? 'text-destructive' : isUrgent ? 'text-orange-500' : 'text-primary'}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground font-medium">
                    {isExpired ? 'Бронь истекла' : 'Ячейка забронирована'}
                  </p>
                  {isExpired ? (
                    <p className="text-lg font-bold text-destructive">Время вышло</p>
                  ) : (
                    <p className={`text-3xl font-extrabold tabular-nums ${isUrgent ? 'text-orange-500' : 'text-foreground'}`}>
                      {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                    </p>
                  )}
                </div>
                {!isExpired && (
                  <Badge variant="outline" className="border-primary/30 text-primary">
                    {RESERVATION_HOURS}ч на оплату
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order summary */}
          <Card className="mb-6 border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Детали заказа</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Ячейка</span>
                <span className="font-bold text-lg">№{bookingData.cellNumber}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Срок аренды</span>
                <span className="font-bold">{bookingData.duration} мес.</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-semibold">К оплате</span>
                <span className="text-3xl font-extrabold text-primary">
                  {bookingData.totalPrice?.toLocaleString('ru-RU')} ₽
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Payment button */}
          <div className="space-y-4">
            <Button
              className="w-full h-16 text-lg font-bold gap-3"
              size="lg"
              disabled={isExpired}
              onClick={handlePay}
            >
              <CreditCard className="w-6 h-6" />
              {isExpired ? 'Бронь истекла' : `Оплатить ${bookingData.totalPrice?.toLocaleString('ru-RU')} ₽`}
            </Button>

            {isExpired && (
              <Button
                variant="outline"
                className="w-full h-12"
                onClick={() => navigate('/catalog')}
              >
                Выбрать ячейку заново
              </Button>
            )}

            {/* Trust signals */}
            <div className="grid grid-cols-3 gap-3 pt-4">
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground">Безопасная оплата</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground">Защита данных</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground">Мгновенный доступ</span>
              </div>
            </div>

            {/* Help */}
            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground mb-2">Нужна помощь с оплатой?</p>
              <a
                href="https://t.me/kladovka78_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <MessageCircle className="w-4 h-4" />
                Написать в поддержку
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
