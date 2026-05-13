import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Bell, FileText, Loader2, CheckCircle, Mail, User, Phone, Eye, EyeOff } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { authLogin, authRegister, authForgotPassword } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface BookingData {
  cellId?: number;
  cellNumber?: number;
  duration?: number;
  totalPrice?: number;
}

type AuthMode = 'login' | 'register' | 'forgot';

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const bookingData = location.state as BookingData | null;

  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('kladovka78_token');
    if (token) {
      if (bookingData?.cellId) {
        navigate('/dashboard', { state: { booking: bookingData }, replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [navigate, bookingData]);

  const saveAndRedirect = (token: string, customer: any) => {
    localStorage.setItem('kladovka78_token', token);
    localStorage.setItem('kladovka78_customer', JSON.stringify(customer));
    localStorage.setItem('kladovka78_customer_id', customer.id);
    setVerified(true);

    setTimeout(() => {
      if (bookingData?.cellId) {
        navigate('/dashboard', { state: { booking: bookingData }, replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'forgot') {
        await authForgotPassword(email);
        setForgotSent(true);
        toast({ title: 'Письмо отправлено', description: 'Проверьте вашу почту для сброса пароля' });
      } else if (mode === 'login') {
        const { token, customer } = await authLogin({ email, password });
        saveAndRedirect(token, customer);
      } else {
        if (password.length < 6) {
          toast({ title: 'Ошибка', description: 'Пароль должен быть не менее 6 символов', variant: 'destructive' });
          setLoading(false);
          return;
        }
        const { token, customer } = await authRegister({ name, email, phone, password });
        saveAndRedirect(token, customer);
      }
    } catch (err: any) {
      toast({ title: 'Ошибка', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Shield, text: 'Безопасный вход по email и паролю' },
    { icon: Lock, text: 'Управление арендой и доступом' },
    { icon: Bell, text: 'Уведомления о статусе аренды' },
    { icon: FileText, text: 'Электронные договоры и акты' },
  ];

  const titles: Record<AuthMode, string> = {
    login: bookingData ? 'Вход для бронирования' : 'Личный кабинет',
    register: 'Регистрация',
    forgot: 'Сброс пароля',
  };

  const descriptions: Record<AuthMode, string> = {
    login: bookingData
      ? `Войдите для бронирования ячейки №${bookingData.cellNumber}`
      : 'Войдите для доступа к личному кабинету',
    register: 'Создайте аккаунт для управления арендой',
    forgot: 'Введите email, и мы отправим ссылку для сброса пароля',
  };

  if (verified) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 pt-40 pb-20">
          <Card className="w-full max-w-md border-2 border-primary/20">
            <CardContent className="pt-8 pb-8 text-center space-y-4">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
              <p className="text-lg font-medium">Вход выполнен!</p>
              <p className="text-sm text-muted-foreground">Перенаправляем...</p>
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
              <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-10 h-10 text-primary" />
              </div>
              <CardTitle className="text-2xl">{titles[mode]}</CardTitle>
              <CardDescription className="text-base">{descriptions[mode]}</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {bookingData && mode !== 'forgot' && (
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

              {mode === 'forgot' && forgotSent ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                    <Mail className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="font-medium">Письмо отправлено!</p>
                  <p className="text-sm text-muted-foreground">
                    Проверьте почту <strong>{email}</strong> и перейдите по ссылке для сброса пароля.
                  </p>
                  <Button variant="outline" className="w-full" onClick={() => { setMode('login'); setForgotSent(false); }}>
                    Вернуться к входу
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === 'register' && (
                    <>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Ваше имя"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="pl-10 h-12"
                          required
                        />
                      </div>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Телефон"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="pl-10 h-12"
                          required
                        />
                      </div>
                    </>
                  )}

                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12"
                      required
                    />
                  </div>

                  {mode !== 'forgot' && (
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 h-12"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  )}

                  <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={loading}>
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : mode === 'login' ? (
                      'Войти'
                    ) : mode === 'register' ? (
                      'Создать аккаунт'
                    ) : (
                      'Отправить ссылку'
                    )}
                  </Button>

                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="w-full text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      Забыли пароль?
                    </button>
                  )}
                </form>
              )}

              <div className="border-t border-border pt-4 text-center">
                {mode === 'login' ? (
                  <p className="text-sm text-muted-foreground">
                    Нет аккаунта?{' '}
                    <button onClick={() => setMode('register')} className="text-primary font-medium hover:underline">
                      Зарегистрироваться
                    </button>
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Уже есть аккаунт?{' '}
                    <button onClick={() => { setMode('login'); setForgotSent(false); }} className="text-primary font-medium hover:underline">
                      Войти
                    </button>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {mode === 'login' && !bookingData && (
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
