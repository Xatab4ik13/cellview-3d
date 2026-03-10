import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Loader2, Receipt } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchPayments, type PaymentData } from '@/lib/api';

const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  paid: { label: 'Оплачено', variant: 'default' },
  pending: { label: 'В обработке', variant: 'secondary' },
  created: { label: 'Создан', variant: 'outline' },
  failed: { label: 'Ошибка', variant: 'destructive' },
  refunded: { label: 'Возврат', variant: 'destructive' },
  expired: { label: 'Истёк', variant: 'secondary' },
};

const methodMap: Record<string, string> = {
  CASH: 'Наличные',
  CARD: 'Банковская карта',
  VISA: 'Visa',
  MASTERCARD: 'MasterCard',
  MIR: 'МИР',
};

const PaymentsSection = () => {
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('kladovka78_customer');
    if (!stored) { setLoading(false); return; }

    const customer = JSON.parse(stored);
    fetchPayments({ customer_id: customer.id })
      .then(setPayments)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card className="border-border/50 shadow-lg">
        <CardContent className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (payments.length === 0) {
    return (
      <Card className="border-border/50 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg border-b border-border/50">
          <CardTitle className="text-xl font-bold">История платежей</CardTitle>
          <CardDescription>Все транзакции по вашим арендам</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
            <CreditCard className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Нет платежей</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Здесь будет отображаться история ваших платежей после оформления аренды.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/50 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg border-b border-border/50">
          <CardTitle className="text-xl font-bold">История платежей</CardTitle>
          <CardDescription>{payments.length} {payments.length === 1 ? 'платёж' : payments.length < 5 ? 'платежа' : 'платежей'}</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border/50">
          {payments.map((p) => {
            const st = statusMap[p.status] || { label: p.status, variant: 'outline' as const };
            const method = p.paymentMethod ? (methodMap[p.paymentMethod] || p.paymentMethod) : '—';
            const date = p.paidAt
              ? new Date(p.paidAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
              : new Date(p.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

            return (
              <div key={p.id} className="flex items-center justify-between py-4 first:pt-6 last:pb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${p.status === 'paid' ? 'bg-green-100 dark:bg-green-950/30' : 'bg-muted'}`}>
                    <Receipt className={`w-5 h-5 ${p.status === 'paid' ? 'text-green-600' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{p.description || 'Платёж'}</p>
                    <p className="text-xs text-muted-foreground">{date} · {method}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg">{p.amount?.toLocaleString('ru-RU')} ₽</span>
                  <Badge variant={st.variant}>{st.label}</Badge>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentsSection;
