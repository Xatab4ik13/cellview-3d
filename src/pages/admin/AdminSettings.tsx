import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Save, Lock, Bell, CreditCard, Percent } from 'lucide-react';

const AdminSettings = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Настройки</h2>
        <p className="text-muted-foreground">Управление параметрами системы</p>
      </div>

      {/* Pricing Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5" />
            Ценообразование
          </CardTitle>
          <CardDescription>
            Настройка скидок за длительную аренду
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>1 месяц</Label>
              <div className="flex items-center gap-2">
                <Input type="number" defaultValue="0" className="w-20" />
                <span className="text-muted-foreground">%</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>3 месяца</Label>
              <div className="flex items-center gap-2">
                <Input type="number" defaultValue="5" className="w-20" />
                <span className="text-muted-foreground">%</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>6 месяцев</Label>
              <div className="flex items-center gap-2">
                <Input type="number" defaultValue="10" className="w-20" />
                <span className="text-muted-foreground">%</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>12 месяцев</Label>
              <div className="flex items-center gap-2">
                <Input type="number" defaultValue="15" className="w-20" />
                <span className="text-muted-foreground">%</span>
              </div>
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>Цена за м³ (базовая)</Label>
            <div className="flex items-center gap-2">
              <Input type="number" defaultValue="1500" className="w-32" />
              <span className="text-muted-foreground">₽/мес</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Формула: объём × 1500₽, округление до 10₽ вверх
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Payment Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Платежи
          </CardTitle>
          <CardDescription>
            Настройка платёжных систем
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">ЮKassa</p>
              <p className="text-sm text-muted-foreground">Приём онлайн-платежей</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">СБП</p>
              <p className="text-sm text-muted-foreground">Система быстрых платежей</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Оплата по счёту</p>
              <p className="text-sm text-muted-foreground">Для юридических лиц</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Уведомления
          </CardTitle>
          <CardDescription>
            Настройка оповещений
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Новые заявки</p>
              <p className="text-sm text-muted-foreground">Email и Telegram</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Окончание аренды</p>
              <p className="text-sm text-muted-foreground">За 7, 3 и 1 день до окончания</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Просроченные платежи</p>
              <p className="text-sm text-muted-foreground">При неоплате в срок</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Безопасность
          </CardTitle>
          <CardDescription>
            Управление доступом к админ-панели
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Текущий пароль</Label>
            <Input type="password" />
          </div>
          <div className="space-y-2">
            <Label>Новый пароль</Label>
            <Input type="password" />
          </div>
          <div className="space-y-2">
            <Label>Подтверждение пароля</Label>
            <Input type="password" />
          </div>
          <Button className="gap-2">
            <Lock className="h-4 w-4" />
            Сменить пароль
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button size="lg" className="gap-2">
          <Save className="h-4 w-4" />
          Сохранить все настройки
        </Button>
      </div>
    </div>
  );
};

export default AdminSettings;
