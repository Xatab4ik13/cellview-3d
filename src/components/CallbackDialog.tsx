import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Send, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.kladovka78.ru';

interface CallbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source?: string;
  showSizeField?: boolean;
}

export function CallbackDialog({ open, onOpenChange, source = 'Кнопка "Заказать звонок"', showSizeField = false }: CallbackDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get('name') || '').trim(),
      phone: String(fd.get('phone') || '').trim(),
      size: String(fd.get('size') || '').trim(),
      message: String(fd.get('message') || '').trim(),
      source,
    };

    if (!payload.name || !payload.phone) {
      toast.error('Укажите имя и телефон');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/leads/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Не удалось отправить');

      setDone(true);
      toast.success('Заявка отправлена! Перезвоним в течение 15 минут');
      setTimeout(() => {
        onOpenChange(false);
        setDone(false);
      }, 2000);
    } catch (err: any) {
      toast.error(err.message || 'Ошибка отправки. Позвоните нам: 8 (911) 810-83-83');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Заказать звонок</DialogTitle>
          <DialogDescription>Оставьте контакты — перезвоним в течение 15 минут</DialogDescription>
        </DialogHeader>

        {done ? (
          <div className="py-8 flex flex-col items-center text-center gap-3">
            <CheckCircle className="w-14 h-14 text-primary" />
            <p className="font-semibold text-lg">Заявка отправлена!</p>
            <p className="text-sm text-muted-foreground">Мы свяжемся с вами в ближайшее время.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="cb-name" className="text-sm font-medium">Имя *</label>
              <Input id="cb-name" name="name" placeholder="Ваше имя" required />
            </div>
            <div className="space-y-2">
              <label htmlFor="cb-phone" className="text-sm font-medium">Телефон *</label>
              <Input id="cb-phone" name="phone" type="tel" placeholder="+7 (___) ___-__-__" required />
            </div>
            {showSizeField && (
              <div className="space-y-2">
                <label htmlFor="cb-size" className="text-sm font-medium">Желаемый размер</label>
                <Input id="cb-size" name="size" placeholder="Например: 2-3 м³" />
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="cb-message" className="text-sm font-medium">Комментарий</label>
              <Textarea id="cb-message" name="message" placeholder="Дополнительные пожелания..." rows={3} />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Отправить заявку
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
