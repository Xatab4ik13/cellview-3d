import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Key, Calendar, MapPin, FileText, Copy, Check, Phone, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { fetchRentals, type RentalData } from '@/lib/api';

const RentalsSection = () => {
  const { toast } = useToast();
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const [rentals, setRentals] = useState<RentalData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('kladovka78_customer');
    if (!stored) return;

    const customer = JSON.parse(stored);
    fetchRentals({ customer_id: customer.id, status: 'active' })
      .then(setRentals)
      .catch(() => {
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить аренды',
          variant: 'destructive',
        });
      })
      .finally(() => setLoading(false));
  }, [toast]);

  const copyAccessPhone = (id: string, phone: string) => {
    navigator.clipboard.writeText(phone.replace(/[\s\-]/g, ''));
    setCopiedPhone(id);
    toast({ title: 'Скопировано', description: 'Номер телефона скопирован' });
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getDaysLeft = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <Card className="border-border/50 shadow-lg">
        <CardContent className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (rentals.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
            <Key className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Нет активной аренды</h3>
          <p className="text-muted-foreground text-center mb-6">
            Вы пока не арендовали кладовку. Выберите подходящую ячейку в каталоге.
          </p>
          <Button asChild>
            <a href="/catalog">Перейти в каталог</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {rentals.map((rental) => {
        const daysLeft = getDaysLeft(rental.endDate);
        const accessPhone = '+7 812 123-45-67'; // TODO: real access phone from cell data

        return (
          <Card key={rental.id} className="border-border/50 shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b border-border/50">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-3 text-xl font-bold">
                    Ячейка №{rental.cellNumber || '—'}
                    <Badge 
                      variant={rental.status === 'active' ? 'default' : 'secondary'}
                      className={rental.status === 'active' ? 'bg-accent text-accent-foreground' : ''}
                    >
                      {rental.status === 'active' ? 'Активна' : rental.status === 'expired' ? 'Истекла' : 'Отменена'}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-2">
                    <MapPin className="w-4 h-4" />
                    Санкт-Петербург
                  </CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-extrabold text-primary">
                    {rental.pricePerMonth?.toLocaleString()} ₽
                  </p>
                  <p className="text-sm text-muted-foreground">в месяц</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-secondary rounded-xl p-4 border border-border/50">
                  <p className="text-sm text-muted-foreground font-medium">Срок</p>
                  <p className="font-bold text-lg">{rental.months} мес.</p>
                </div>
                <div className="bg-secondary rounded-xl p-4 border border-border/50">
                  <p className="text-sm text-muted-foreground font-medium">Итого</p>
                  <p className="font-bold text-lg">{rental.totalAmount?.toLocaleString()} ₽</p>
                </div>
                <div className="bg-secondary rounded-xl p-4 border border-border/50">
                  <p className="text-sm text-muted-foreground font-medium">Начало</p>
                  <p className="font-bold text-lg">{formatDate(rental.startDate)}</p>
                </div>
                <div className="bg-secondary rounded-xl p-4 border border-border/50">
                  <p className="text-sm text-muted-foreground font-medium">Окончание</p>
                  <p className="font-bold text-lg">{formatDate(rental.endDate)}</p>
                </div>
              </div>

              {daysLeft <= 7 && daysLeft > 0 && (
                <div className="bg-accent/10 border border-accent/30 rounded-xl p-4">
                  <p className="text-sm font-semibold text-accent-foreground">
                    ⚠️ До окончания аренды осталось {daysLeft} дн.
                  </p>
                </div>
              )}

              {/* Access by phone */}
              <div className="border-2 border-accent/30 rounded-2xl p-5 bg-gradient-to-r from-accent/5 to-primary/5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1 font-medium">Доступ по звонку</p>
                    <div className="flex items-center gap-3">
                      <Phone className="w-6 h-6 text-accent" />
                      <p className="text-2xl font-extrabold text-primary">{accessPhone}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Позвоните — дверь откроется автоматически</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="icon" className="border-primary/30" onClick={() => copyAccessPhone(rental.id, accessPhone)}>
                      {copiedPhone === rental.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                    <Button size="icon" className="bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
                      <a href={`tel:${accessPhone.replace(/[\s\-]/g, '')}`}><Phone className="w-4 h-4" /></a>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button variant="outline" className="gap-2 font-semibold border-primary/30 hover:border-primary hover:bg-primary/5">
                  <FileText className="w-4 h-4" />
                  Скачать договор
                </Button>
                <Button className="gap-2 font-semibold bg-primary hover:bg-primary/90">
                  <Calendar className="w-4 h-4" />
                  Продлить аренду
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default RentalsSection;
