import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Phone, ArrowLeft, Shield } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Auth = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 1) return digits;
    if (digits.length <= 4) return `+7 (${digits.slice(1)}`;
    if (digits.length <= 7) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4)}`;
    if (digits.length <= 9) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (!value.startsWith('+7') && value.length > 0) {
      value = '+7' + value.replace(/\D/g, '');
    }
    const formatted = formatPhone(value);
    setPhone(formatted);
  };

  const handleSendCode = async () => {
    setIsLoading(true);
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    setStep('code');
  };

  const handleVerifyCode = async () => {
    setIsLoading(true);
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Save mock user to localStorage
    localStorage.setItem('user', JSON.stringify({
      phone: phone,
      isAuthenticated: true,
    }));
    setIsLoading(false);
    navigate('/dashboard');
  };

  const isPhoneValid = phone.replace(/\D/g, '').length === 11;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center px-4 pt-40 pb-20">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              {step === 'phone' ? (
                <Phone className="w-8 h-8 text-primary" />
              ) : (
                <Shield className="w-8 h-8 text-primary" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {step === 'phone' ? 'Вход в личный кабинет' : 'Введите код'}
            </CardTitle>
            <CardDescription>
              {step === 'phone' 
                ? 'Введите номер телефона для входа или регистрации' 
                : `Мы отправили SMS с кодом на номер ${phone}`
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {step === 'phone' ? (
              <>
                <div className="space-y-2">
                  <Input
                    type="tel"
                    placeholder="+7 (___) ___-__-__"
                    value={phone}
                    onChange={handlePhoneChange}
                    className="text-center text-lg h-14"
                    maxLength={18}
                  />
                </div>
                
                <Button 
                  className="w-full h-12" 
                  onClick={handleSendCode}
                  disabled={!isPhoneValid || isLoading}
                >
                  {isLoading ? 'Отправка...' : 'Получить код'}
                </Button>
                
                <p className="text-xs text-center text-muted-foreground">
                  Нажимая кнопку, вы соглашаетесь с{' '}
                  <a href="/docs" className="text-primary hover:underline">
                    условиями использования
                  </a>{' '}
                  и{' '}
                  <a href="/docs" className="text-primary hover:underline">
                    политикой конфиденциальности
                  </a>
                </p>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setStep('phone')}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Изменить номер
                </button>
                
                <div className="flex justify-center">
                  <InputOTP 
                    maxLength={4} 
                    value={code} 
                    onChange={setCode}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className="w-14 h-14 text-2xl" />
                      <InputOTPSlot index={1} className="w-14 h-14 text-2xl" />
                      <InputOTPSlot index={2} className="w-14 h-14 text-2xl" />
                      <InputOTPSlot index={3} className="w-14 h-14 text-2xl" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                
                <Button 
                  className="w-full h-12" 
                  onClick={handleVerifyCode}
                  disabled={code.length !== 4 || isLoading}
                >
                  {isLoading ? 'Проверка...' : 'Войти'}
                </Button>
                
                <div className="text-center">
                  <button 
                    className="text-sm text-primary hover:underline"
                    onClick={handleSendCode}
                  >
                    Отправить код повторно
                  </button>
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

export default Auth;
