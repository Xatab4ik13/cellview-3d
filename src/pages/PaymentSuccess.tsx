import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { checkPaymentStatus } from '@/lib/api';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('paymentId');
  const [status, setStatus] = useState<'loading' | 'paid' | 'pending' | 'failed'>('loading');
  const [paymentData, setPaymentData] = useState<any>(null);

  useEffect(() => {
    if (!paymentId) { setStatus('failed'); return; }

    let attempts = 0;
    const check = async () => {
      try {
        const data = await checkPaymentStatus(paymentId);
        setPaymentData(data);
        if (data.status === 'paid') {
          setStatus('paid');
        } else if (data.status === 'failed') {
          setStatus('failed');
        } else if (attempts < 10) {
          attempts++;
          setTimeout(check, 3000);
        } else {
          setStatus('pending');
        }
      } catch {
        setStatus('failed');
      }
    };
    check();
  }, [paymentId]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pt-40 pb-20 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-8 pb-8 text-center space-y-6">
            {status === 'loading' && (
              <>
                <Loader2 className="w-16 h-16 text-primary mx-auto animate-spin" />
                <h2 className="text-xl font-bold">Проверяем оплату...</h2>
                <p className="text-muted-foreground">Подождите, идёт подтверждение платежа</p>
              </>
            )}
            {status === 'paid' && (
              <>
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
                <h2 className="text-xl font-bold text-green-700">Оплата прошла успешно!</h2>
                <p className="text-muted-foreground">
                  {paymentData?.amount && `Сумма: ${paymentData.amount.toLocaleString('ru-RU')} ₽`}
                </p>
                <div className="space-y-3 pt-4">
                  <Button asChild className="w-full">
                    <Link to="/dashboard">Перейти в личный кабинет</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/">На главную</Link>
                  </Button>
                </div>
              </>
            )}
            {status === 'pending' && (
              <>
                <Loader2 className="w-16 h-16 text-orange-500 mx-auto" />
                <h2 className="text-xl font-bold">Платёж обрабатывается</h2>
                <p className="text-muted-foreground">Статус обновится в течение нескольких минут</p>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/dashboard">Перейти в личный кабинет</Link>
                </Button>
              </>
            )}
            {status === 'failed' && (
              <>
                <XCircle className="w-16 h-16 text-destructive mx-auto" />
                <h2 className="text-xl font-bold text-destructive">Ошибка оплаты</h2>
                <p className="text-muted-foreground">Платёж не был завершён. Попробуйте снова.</p>
                <div className="space-y-3 pt-4">
                  <Button asChild className="w-full">
                    <Link to="/catalog">Вернуться в каталог</Link>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
