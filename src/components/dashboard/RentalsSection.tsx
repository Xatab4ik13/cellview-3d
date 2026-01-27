import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Key, Calendar, MapPin, FileText, Copy, Check, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

// Mock data
const mockRentals = [
  {
    id: 1,
    cellNumber: 'A-12',
    size: '2×2×2.5 м',
    volume: '10 м³',
    location: 'Санкт-Петербург, ул. Примерная, 15',
    startDate: '2025-01-15',
    endDate: '2025-02-15',
    status: 'active',
    pinCode: '4521',
    monthlyPrice: 4500,
    contractUrl: '#',
  },
];

const RentalsSection = () => {
  const { toast } = useToast();
  const [copiedPin, setCopiedPin] = useState<number | null>(null);

  const copyPinCode = (id: number, pin: string) => {
    navigator.clipboard.writeText(pin);
    setCopiedPin(id);
    toast({
      title: "Скопировано",
      description: "PIN-код скопирован в буфер обмена",
    });
    setTimeout(() => setCopiedPin(null), 2000);
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
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (mockRentals.length === 0) {
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
      {mockRentals.map((rental) => {
        const daysLeft = getDaysLeft(rental.endDate);
        
        return (
          <Card key={rental.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-3">
                    Ячейка {rental.cellNumber}
                    <Badge 
                      variant={rental.status === 'active' ? 'default' : 'secondary'}
                      className="ml-2"
                    >
                      {rental.status === 'active' ? 'Активна' : 'Завершена'}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-2">
                    <MapPin className="w-4 h-4" />
                    {rental.location}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">
                    {rental.monthlyPrice.toLocaleString()} ₽
                  </p>
                  <p className="text-sm text-muted-foreground">в месяц</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Cell info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Размер</p>
                  <p className="font-semibold">{rental.size}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Объем</p>
                  <p className="font-semibold">{rental.volume}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Начало</p>
                  <p className="font-semibold">{formatDate(rental.startDate)}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Окончание</p>
                  <p className="font-semibold">{formatDate(rental.endDate)}</p>
                </div>
              </div>

              {/* Days left warning */}
              {daysLeft <= 7 && daysLeft > 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                    ⚠️ До окончания аренды осталось {daysLeft} {daysLeft === 1 ? 'день' : 'дней'}
                  </p>
                </div>
              )}

              {/* PIN code */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">PIN-код доступа</p>
                    <p className="text-3xl font-mono font-bold tracking-widest">
                      {rental.pinCode}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => copyPinCode(rental.id, rental.pinCode)}
                  >
                    {copiedPin === rental.id ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" className="gap-2">
                  <FileText className="w-4 h-4" />
                  Скачать договор
                </Button>
                <Button variant="outline" className="gap-2">
                  <Calendar className="w-4 h-4" />
                  Продлить аренду
                </Button>
                <Button variant="ghost" className="gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Как добраться
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
