import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { RefreshCw, XCircle, CreditCard, Calendar, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SubscriptionSection = () => {
  const { toast } = useToast();
  const [autoRenewal, setAutoRenewal] = useState(true);
  
  // Mock subscription data
  const subscription = {
    cellNumber: 'A-12',
    plan: 'Месячная подписка',
    price: 4500,
    nextPayment: '2025-02-15',
    paymentMethod: '**** 4242',
    status: 'active',
  };

  const handleAutoRenewalChange = (checked: boolean) => {
    setAutoRenewal(checked);
    toast({
      title: checked ? "Автопродление включено" : "Автопродление отключено",
      description: checked 
        ? "Аренда будет автоматически продлена в день окончания" 
        : "Аренда завершится в указанную дату",
    });
  };

  const handleCancelSubscription = () => {
    toast({
      title: "Запрос на завершение аренды отправлен",
      description: "Мы свяжемся с вами для подтверждения",
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Current subscription */}
      <Card className="border-border/50 shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b border-border/50">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl font-bold">Текущая подписка</CardTitle>
              <CardDescription>
                Управление автопродлением и способами оплаты
              </CardDescription>
            </div>
            <Badge 
              variant={subscription.status === 'active' ? 'default' : 'secondary'}
              className={subscription.status === 'active' ? 'bg-accent text-accent-foreground font-semibold' : ''}
            >
              {subscription.status === 'active' ? 'Активна' : 'Неактивна'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Subscription details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-secondary rounded-xl p-4 border border-border/50">
              <p className="text-sm text-muted-foreground font-medium mb-1">Ячейка</p>
              <p className="font-bold text-lg">{subscription.cellNumber}</p>
            </div>
            <div className="bg-secondary rounded-xl p-4 border border-border/50">
              <p className="text-sm text-muted-foreground font-medium mb-1">Тариф</p>
              <p className="font-bold text-lg">{subscription.plan}</p>
            </div>
            <div className="bg-secondary rounded-xl p-4 border border-border/50">
              <p className="text-sm text-muted-foreground font-medium mb-1">Стоимость</p>
              <p className="font-bold text-lg text-primary">{subscription.price.toLocaleString()} ₽</p>
            </div>
          </div>

          {/* Next payment */}
          <div className="flex items-center justify-between p-5 border-2 border-primary/20 rounded-2xl bg-gradient-to-r from-primary/5 to-transparent">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                <Calendar className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Следующее списание</p>
                <p className="font-bold text-lg">{formatDate(subscription.nextPayment)}</p>
              </div>
            </div>
            <p className="text-2xl font-extrabold text-primary">{subscription.price.toLocaleString()} ₽</p>
          </div>

          {/* Payment method */}
          <div className="flex items-center justify-between p-5 border border-border/50 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center border border-border/50">
                <CreditCard className="w-7 h-7 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Способ оплаты</p>
                <p className="font-bold">Visa {subscription.paymentMethod}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="font-semibold border-primary/30 hover:border-primary hover:bg-primary/5">
              Изменить
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Auto renewal */}
      <Card className="border-border/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <RefreshCw className="w-5 h-5 text-primary" />
            Автопродление
          </CardTitle>
          <CardDescription>
            Автоматическое продление аренды в день окончания текущего периода
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-5 border border-border/50 rounded-2xl">
            <div>
              <p className="font-semibold">Автоматическое продление</p>
              <p className="text-sm text-muted-foreground">
                {autoRenewal 
                  ? 'Аренда будет продлена автоматически' 
                  : 'Аренда завершится в день окончания'
                }
              </p>
            </div>
            <Switch 
              checked={autoRenewal} 
              onCheckedChange={handleAutoRenewalChange}
            />
          </div>

          {!autoRenewal && (
            <div className="mt-4 p-4 bg-accent/10 border border-accent/30 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-accent mt-0.5" />
              <div>
                <p className="font-semibold text-accent-foreground">
                  Автопродление отключено
                </p>
                <p className="text-sm text-muted-foreground">
                  Ваша аренда завершится {formatDate(subscription.nextPayment)}. 
                  Не забудьте забрать вещи или продлить аренду вручную.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cancel subscription */}
      <Card className="border-destructive/30 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-bold text-destructive">
            <XCircle className="w-5 h-5" />
            Досрочное завершение
          </CardTitle>
          <CardDescription>
            Завершение аренды до окончания оплаченного периода
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-secondary rounded-xl mb-4 border border-border/50">
            <p className="text-sm text-muted-foreground">
              При досрочном завершении аренды возврат средств за неиспользованный период 
              осуществляется согласно условиям договора. Пожалуйста, освободите ячейку 
              до указанной даты завершения.
            </p>
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2 font-semibold">
                <XCircle className="w-4 h-4" />
                Завершить аренду досрочно
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                <AlertDialogDescription>
                  Вы собираетесь досрочно завершить аренду ячейки {subscription.cellNumber}. 
                  Это действие нельзя отменить. Наш менеджер свяжется с вами для 
                  уточнения деталей и расчета возврата средств.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleCancelSubscription}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Подтвердить
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionSection;
