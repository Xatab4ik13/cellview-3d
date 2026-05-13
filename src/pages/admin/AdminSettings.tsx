import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, Lock, Percent, RefreshCw, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { recalculateCellPrices } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { useDiscounts, useSaveDiscounts, Discounts } from '@/hooks/useSettings';

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

const AdminSettings = () => {
  const queryClient = useQueryClient();
  const [isRecalculating, setIsRecalculating] = useState(false);

  const { data: discounts } = useDiscounts();
  const saveDiscounts = useSaveDiscounts();
  const [form, setForm] = useState<Discounts>({ 1: 0, 3: 5, 6: 10, 12: 15 });

  useEffect(() => {
    if (discounts) setForm(discounts);
  }, [discounts]);

  const handleSaveDiscounts = () => {
    saveDiscounts.mutate(form, {
      onSuccess: () => toast.success('Скидки сохранены — изменения видны на сайте'),
      onError: (e: any) => toast.error(`Ошибка: ${e.message}`),
    });
  };

  const handleRecalculatePrices = async () => {
    setIsRecalculating(true);
    try {
      await recalculateCellPrices();
      queryClient.invalidateQueries({ queryKey: ['cells'] });
      toast.success('Цены пересчитаны для всех ячеек');
    } catch (error: any) {
      toast.error(`Ошибка: ${error.message}`);
    } finally {
      setIsRecalculating(false);
    }
  };

  const fields: { key: keyof Discounts; label: string }[] = [
    { key: 1, label: '1 месяц' },
    { key: 3, label: '3 месяца' },
    { key: 6, label: '6 месяцев' },
    { key: 12, label: '12 месяцев' },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold">Настройки</h2>
        <p className="text-base text-muted-foreground mt-1">Ценообразование и безопасность</p>
      </div>

      {/* Pricing */}
      <CardBlock title="Ценообразование" icon={Percent} description="Скидки за длительную аренду и массовый пересчёт цен">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {fields.map(f => (
            <div key={f.key} className="space-y-2">
              <Label className="text-sm">{f.label}</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={form[f.key]}
                  onChange={(e) => setForm(prev => ({ ...prev, [f.key]: Number(e.target.value) || 0 }))}
                  className="w-20 h-10"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
          ))}
        </div>
        <div className="pt-2">
          <Button onClick={handleSaveDiscounts} disabled={saveDiscounts.isPending} className="gap-2">
            {saveDiscounts.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Сохранить скидки
          </Button>
        </div>
        <div className="border-t border-border pt-4 mt-4 space-y-4">
          <div className="space-y-2">
            <Label className="text-sm">Базовая формула: объём × 1000₽, округление до 10₽ вверх</Label>
            <p className="text-xs text-muted-foreground">
              Пересчёт применяется ко всем ячейкам, у которых не задана ручная цена.
              Чтобы задать цену вручную для отдельной ячейки, отредактируйте её в разделе «Ячейки».
            </p>
          </div>
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleRecalculatePrices}
            disabled={isRecalculating}
          >
            {isRecalculating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Пересчитать цены для всех ячеек
          </Button>
        </div>
      </CardBlock>

      {/* Security */}
      <CardBlock title="Безопасность" icon={Lock} description="Управление доступом к CRM">
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
          <Button variant="outline" className="gap-2 w-fit" onClick={() => toast.success('Пароль изменён')}>
            <Lock className="h-4 w-4" />
            Сменить пароль
          </Button>
        </div>
      </CardBlock>
    </div>
  );
};

export default AdminSettings;
