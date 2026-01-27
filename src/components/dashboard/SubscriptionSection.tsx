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
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Текущая подписка</CardTitle>
              <CardDescription>
                Управление автопродлением и способами оплаты
              </CardDescription>
            </div>
            <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
              {subscription.status === 'active' ? 'Активна' : 'Неактивна'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Subscription details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Ячейка</p>
              <p className="font-semibold text-lg">{subscription.cellNumber}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Тариф</p>
              <p className="font-semibold text-lg">{subscription.plan}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Стоимость</p>
              <p className="font-semibold text-lg text-primary">{subscription.price.toLocaleString()} ₽</p>
            </div>
          </div>

          {/* Next payment */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Следующее списание</p>
                <p className="font-semibold">{formatDate(subscription.nextPayment)}</p>
              </div>
            </div>
            <p className="text-xl font-bold">{subscription.price.toLocaleString()} ₽</p>
          </div>

          {/* Payment method */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Способ оплаты</p>
                <p className="font-semibold">Visa {subscription.paymentMethod}</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Изменить
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Auto renewal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Автопродление
          </CardTitle>
          <CardDescription>
            Автоматическое продление аренды в день окончания текущего периода
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Автоматическое продление</p>
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
            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-700 dark:text-yellow-400">
                  Автопродление отключено
                </p>
                <p className="text-sm text-yellow-600 dark:text-yellow-500">
                  Ваша аренда завершится {formatDate(subscription.nextPayment)}. 
                  Не забудьте забрать вещи или продлить аренду вручную.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cancel subscription */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <XCircle className="w-5 h-5" />
            Досрочное завершение
          </CardTitle>
          <CardDescription>
            Завершение аренды до окончания оплаченного периода
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-muted/50 rounded-lg mb-4">
            <p className="text-sm text-muted-foreground">
              При досрочном завершении аренды возврат средств за неиспользованный период 
              осуществляется согласно условиям договора. Пожалуйста, освободите ячейку 
              до указанной даты завершения.
            </p>
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
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
