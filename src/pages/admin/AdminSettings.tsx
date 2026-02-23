import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Save, Lock, Bell, CreditCard, Percent } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const CardBlock = ({ title, icon: Icon, description, children }: { title: string; icon: React.ElementType; description: string; children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-card border border-border rounded-xl p-6"
    style={{ boxShadow: 'var(--shadow-card)' }}
  >
    <div className="flex items-center gap-3 mb-5">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
    <div className="space-y-4">{children}</div>
  </motion.div>
);

const SettingRow = ({ title, desc, defaultChecked = true }: { title: string; desc: string; defaultChecked?: boolean }) => (
  <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
    <div>
      <p className="font-medium text-sm">{title}</p>
      <p className="text-xs text-muted-foreground">{desc}</p>
    </div>
    <Switch defaultChecked={defaultChecked} />
  </div>
);

const AdminSettings = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Настройки</h2>
          <p className="text-base text-muted-foreground mt-1">Управление параметрами системы</p>
        </div>
        <Button onClick={() => toast.success('Настройки сохранены')} className="gap-2 h-11 text-base">
          <Save className="w-5 h-5" />
          Сохранить
        </Button>
      </div>

      {/* Pricing */}
      <CardBlock title="Ценообразование" icon={Percent} description="Скидки за длительную аренду">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: '1 месяц', value: '0' },
            { label: '3 месяца', value: '5' },
            { label: '6 месяцев', value: '10' },
            { label: '12 месяцев', value: '15' },
          ].map(d => (
            <div key={d.label} className="space-y-2">
              <Label className="text-sm">{d.label}</Label>
              <div className="flex items-center gap-2">
                <Input type="number" defaultValue={d.value} className="w-20 h-10" />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-border pt-4 mt-4 space-y-2">
          <Label className="text-sm">Цена за м³ (базовая)</Label>
          <div className="flex items-center gap-2">
            <Input type="number" defaultValue="1500" className="w-32 h-10" />
            <span className="text-sm text-muted-foreground">₽/мес</span>
          </div>
          <p className="text-xs text-muted-foreground">Формула: объём × 1500₽, округление до 10₽ вверх</p>
        </div>
      </CardBlock>

      {/* Payments */}
      <CardBlock title="Платежи" icon={CreditCard} description="Настройка платёжных систем">
        <SettingRow title="ЮKassa" desc="Приём онлайн-платежей" />
        <SettingRow title="СБП" desc="Система быстрых платежей" />
        <SettingRow title="Оплата по счёту" desc="Для юридических лиц" />
      </CardBlock>

      {/* Notifications */}
      <CardBlock title="Уведомления" icon={Bell} description="Настройка оповещений">
        <SettingRow title="Новые заявки" desc="Email и Telegram" />
        <SettingRow title="Окончание аренды" desc="За 7, 3 и 1 день до окончания" />
        <SettingRow title="Просроченные платежи" desc="При неоплате в срок" />
      </CardBlock>

      {/* Security */}
      <CardBlock title="Безопасность" icon={Lock} description="Управление доступом">
        <div className="grid gap-4 max-w-md">
          <div className="space-y-2">
            <Label className="text-sm">Текущий пароль</Label>
            <Input type="password" className="h-10" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Новый пароль</Label>
            <Input type="password" className="h-10" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Подтверждение пароля</Label>
            <Input type="password" className="h-10" />
          </div>
          <Button variant="outline" className="gap-2 w-fit">
            <Lock className="h-4 w-4" />
            Сменить пароль
          </Button>
        </div>
      </CardBlock>
    </div>
  );
};

export default AdminSettings;
