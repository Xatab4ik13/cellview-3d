import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Info } from 'lucide-react';

const PaymentsSection = () => {
  return (
    <div className="space-y-6">
      <Card className="border-border/50 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg border-b border-border/50">
          <CardTitle className="text-xl font-bold">История платежей</CardTitle>
          <CardDescription>Все транзакции по вашим арендам</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
            <CreditCard className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Скоро здесь появятся платежи</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Мы подключаем систему онлайн-оплаты. После подключения здесь будет история ваших платежей, счета и чеки.
          </p>
          <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-start gap-3 max-w-md">
            <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">
              Для оплаты свяжитесь с менеджером через Telegram-бот или по телефону.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentsSection;
