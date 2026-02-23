import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Shield, Lock, Bell, FileText, Loader2, CheckCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { verifyAuthToken } from '@/lib/api';

const TELEGRAM_BOT_USERNAME = 'kladovka78_bot';

const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bookingData = location.state as { 
    cellId?: number; 
    cellNumber?: number; 
    duration?: number; 
    totalPrice?: number; 
  } | null;

  // Auto-verify token from URL
  useEffect(() => {
    if (!token) return;

    setVerifying(true);
    setError(null);

    verifyAuthToken(token)
      .then((customer) => {
        // Save session
        localStorage.setItem('kladovka78_customer', JSON.stringify(customer));
        localStorage.setItem('kladovka78_customer_id', customer.id);
        setVerified(true);

        // Redirect to dashboard after short delay
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 1500);
      })
      .catch((err) => {
        setError(err.message || 'Токен недействителен или истёк');
        setVerifying(false);
      });
  }, [token, navigate]);

  // Check if already logged in
  useEffect(() => {
    const existingCustomer = localStorage.getItem('kladovka78_customer');
    if (existingCustomer && !token) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate, token]);

  const telegramDeepLink = bookingData
    ? `https://t.me/${TELEGRAM_BOT_USERNAME}?start=book_${bookingData.cellId}_${bookingData.duration}`
    : `https://t.me/${TELEGRAM_BOT_USERNAME}?start=login`;

  const features = [
    { icon: Shield, text: 'Безопасная авторизация через Telegram' },
    { icon: Lock, text: 'Управление арендой и доступом' },
    { icon: Bell, text: 'Уведомления о статусе аренды' },
    { icon: FileText, text: 'Электронные договоры и акты' },
  ];

  // Token verification screen
  if (token) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 pt-40 pb-20">
          <Card className="w-full max-w-md border-2 border-primary/20">
            <CardContent className="pt-8 pb-8 text-center space-y-4">
              {verifying && !verified && !error && (
                <>
                  <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
                  <p className="text-lg font-medium">Входим в систему...</p>
                  <p className="text-sm text-muted-foreground">Проверяем данные</p>
                </>
              )}
              {verified && (
                <>
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                  <p className="text-lg font-medium">Вход выполнен!</p>
                  <p className="text-sm text-muted-foreground">Перенаправляем в личный кабинет...</p>
                </>
              )}
              {error && (
                <>
                  <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <p className="text-lg font-medium">Ошибка входа</p>
                  <p className="text-sm text-muted-foreground">{error}</p>
                  <a href={telegramDeepLink} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full mt-4 gap-2 bg-[#2AABEE] hover:bg-[#229ED9] text-white">
                      <MessageCircle className="w-5 h-5" />
                      Получить новую ссылку
                    </Button>
                  </a>
                </>
              )}
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center px-4 pt-40 pb-20">
        <div className="w-full max-w-md space-y-6">
          <Card className="border-2 border-primary/20">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-20 h-20 bg-[#2AABEE]/10 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="w-10 h-10 text-[#2AABEE]" />
              </div>
              <CardTitle className="text-2xl">
                {bookingData ? 'Вход для бронирования' : 'Личный кабинет'}
              </CardTitle>
              <CardDescription className="text-base">
                {bookingData 
                  ? `Войдите через Telegram для бронирования ячейки №${bookingData.cellNumber}`
                  : 'Войдите через Telegram-бот для доступа к личному кабинету'
                }
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {bookingData && (
                <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-muted-foreground">Ячейка</span>
                    <span className="font-bold">№{bookingData.cellNumber}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-muted-foreground">Срок</span>
                    <span className="font-bold">{bookingData.duration} мес.</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-primary/10">
                    <span className="text-muted-foreground">Итого</span>
                    <span className="text-xl font-extrabold text-primary">
                      {bookingData.totalPrice?.toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                </div>
              )}

              <a href={telegramDeepLink} target="_blank" rel="noopener noreferrer">
                <Button 
                  className="w-full h-14 text-lg font-bold gap-3 bg-[#2AABEE] hover:bg-[#229ED9] text-white"
                  size="lg"
                >
                  <MessageCircle className="w-6 h-6" />
                  Войти через Telegram
                </Button>
              </a>

              <p className="text-xs text-center text-muted-foreground">
                Нажмите кнопку «Старт» в боте и поделитесь номером телефона.
                <br />
                Ваши данные надёжно защищены.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4 text-center">Что доступно в личном кабинете</h3>
              <div className="space-y-3">
                {features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <feature.icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm">{feature.text}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Auth;
