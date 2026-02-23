import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Shield, Lock, Bell, FileText, Loader2, CheckCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { verifyAuthToken, createAuthSession, pollAuthSession } from '@/lib/api';

const TELEGRAM_BOT_USERNAME = 'kladovka78_bot';

interface BookingData {
  cellId?: number;
  cellNumber?: number;
  duration?: number;
  totalPrice?: number;
}

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const bookingData = location.state as BookingData | null;

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bookingRef = useRef(bookingData);

  const saveAndRedirect = useCallback((customer: any) => {
    localStorage.setItem('kladovka78_customer', JSON.stringify(customer));
    localStorage.setItem('kladovka78_customer_id', customer.id);
    setVerified(true);

    const booking = bookingRef.current;
    setTimeout(() => {
      if (booking?.cellId) {
        navigate('/checkout', { state: booking, replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }, 1200);
  }, [navigate]);

  // Check if already logged in
  useEffect(() => {
    const existing = localStorage.getItem('kladovka78_customer');
    if (existing && !token) {
      if (bookingData?.cellId) {
        navigate('/checkout', { state: bookingData, replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [navigate, token, bookingData]);

  // Legacy: verify token from URL (old links)
  useEffect(() => {
    if (!token) return;
    setVerifying(true);
    setError(null);
    verifyAuthToken(token)
      .then(saveAndRedirect)
      .catch((err) => {
        setError(err.message || 'Токен недействителен или истёк');
        setVerifying(false);
      });
  }, [token, saveAndRedirect]);

  // Create polling session on mount (if no token)
  useEffect(() => {
    if (token) return;
    createAuthSession()
      .then((data) => setSessionId(data.sessionId))
      .catch(() => setError('Не удалось создать сессию. Проверьте соединение.'));
  }, [token]);

  // Start polling when sessionId is ready
  useEffect(() => {
    if (!sessionId) return;
    setPolling(true);

    pollingRef.current = setInterval(async () => {
      try {
        const result = await pollAuthSession(sessionId);
        if (result.status === 'confirmed' && result.customer) {
          if (pollingRef.current) clearInterval(pollingRef.current);
          setPolling(false);
          saveAndRedirect(result.customer);
        } else if (result.status === 'expired') {
          if (pollingRef.current) clearInterval(pollingRef.current);
          setPolling(false);
          setError('Сессия истекла. Обновите страницу и попробуйте снова.');
        }
      } catch {
        // Ignore transient errors during polling
      }
    }, 2500);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [sessionId, saveAndRedirect]);

  const telegramDeepLink = sessionId
    ? `https://t.me/${TELEGRAM_BOT_USERNAME}?start=login_${sessionId}`
    : `https://t.me/${TELEGRAM_BOT_USERNAME}?start=login`;

  const features = [
    { icon: Shield, text: 'Безопасная авторизация через Telegram' },
    { icon: Lock, text: 'Управление арендой и доступом' },
    { icon: Bell, text: 'Уведомления о статусе аренды' },
    { icon: FileText, text: 'Электронные договоры и акты' },
  ];

  // Token verification screen (legacy)
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
                </>
              )}
              {verified && (
                <>
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                  <p className="text-lg font-medium">Вход выполнен!</p>
                  <p className="text-sm text-muted-foreground">Перенаправляем...</p>
                </>
              )}
              {error && (
                <>
                  <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <p className="text-lg font-medium">Ошибка входа</p>
                  <p className="text-sm text-muted-foreground">{error}</p>
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
                {verified ? (
                  <CheckCircle className="w-10 h-10 text-green-500" />
                ) : polling ? (
                  <Loader2 className="w-10 h-10 text-[#2AABEE] animate-spin" />
                ) : (
                  <MessageCircle className="w-10 h-10 text-[#2AABEE]" />
                )}
              </div>
              <CardTitle className="text-2xl">
                {verified
                  ? 'Вход выполнен!'
                  : polling
                    ? 'Ожидаем вход...'
                    : bookingData
                      ? 'Вход для бронирования'
                      : 'Личный кабинет'
                }
              </CardTitle>
              <CardDescription className="text-base">
                {verified
                  ? bookingData ? 'Перенаправляем на оплату...' : 'Перенаправляем в личный кабинет...'
                  : polling
                    ? 'Нажмите «Старт» в Telegram-боте. Сайт автоматически войдёт в ваш аккаунт.'
                    : bookingData
                      ? `Войдите через Telegram для бронирования ячейки №${bookingData.cellNumber}`
                      : 'Войдите через Telegram-бот для доступа к личному кабинету'
                }
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {error && (
                <div className="p-4 bg-destructive/5 rounded-xl border border-destructive/20 text-center">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {bookingData && !verified && (
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

              {!verified && (
                <>
                  <a href={telegramDeepLink} target="_blank" rel="noopener noreferrer">
                    <Button 
                      className="w-full h-14 text-lg font-bold gap-3 bg-[#2AABEE] hover:bg-[#229ED9] text-white"
                      size="lg"
                    >
                      <MessageCircle className="w-6 h-6" />
                      {polling ? 'Открыть Telegram-бот' : 'Войти через Telegram'}
                    </Button>
                  </a>

                  {polling && (
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Ожидаем подтверждение из бота...</span>
                    </div>
                  )}

                  <p className="text-xs text-center text-muted-foreground">
                    Нажмите кнопку «Старт» в боте — сайт автоматически {bookingData ? 'перейдёт к оплате' : 'откроет ваш ЛК'}.
                    <br />
                    Ваши данные надёжно защищены.
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {!verified && !polling && !bookingData && (
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
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Auth;
