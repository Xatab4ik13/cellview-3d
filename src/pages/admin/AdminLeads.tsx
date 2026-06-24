import { useState } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import CrmCard from '@/components/crm/CrmCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Phone, MessageSquare, Trash2, Inbox } from 'lucide-react';
import { useLeads, useUpdateLead, useDeleteLead, Lead, LeadStatus } from '@/hooks/useLeads';

const STATUS_LABEL: Record<LeadStatus, string> = {
  new: 'Новая',
  in_progress: 'В работе',
  done: 'Обработана',
  cancelled: 'Отменена',
};

const STATUS_VARIANT: Record<LeadStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  new: 'default',
  in_progress: 'secondary',
  done: 'outline',
  cancelled: 'destructive',
};

const AdminLeads = () => {
  const [tab, setTab] = useState<LeadStatus | 'all'>('new');
  const { data: leads = [], isLoading } = useLeads(tab);
  const updateMut = useUpdateLead();
  const deleteMut = useDeleteLead();
  const [selected, setSelected] = useState<Lead | null>(null);
  const [notes, setNotes] = useState('');

  const openLead = (l: Lead) => {
    setSelected(l);
    setNotes(l.notes || '');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Заявки с сайта</h1>
          <p className="text-sm text-muted-foreground">
            Обратные звонки и заявки из форм на сайте
          </p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <TabsList>
          <TabsTrigger value="new">Новые</TabsTrigger>
          <TabsTrigger value="in_progress">В работе</TabsTrigger>
          <TabsTrigger value="done">Обработанные</TabsTrigger>
          <TabsTrigger value="cancelled">Отменённые</TabsTrigger>
          <TabsTrigger value="all">Все</TabsTrigger>
        </TabsList>
      </Tabs>

      <CrmCard>
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Загрузка…</div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-3">
            <Inbox className="w-10 h-10 opacity-40" />
            <p>Заявок пока нет</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Когда</TableHead>
                <TableHead>Имя</TableHead>
                <TableHead>Телефон</TableHead>
                <TableHead>Источник</TableHead>
                <TableHead>Размер</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((l) => (
                <TableRow
                  key={l.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => openLead(l)}
                >
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {format(new Date(l.createdAt), 'd MMM, HH:mm', { locale: ru })}
                  </TableCell>
                  <TableCell className="font-medium">{l.name}</TableCell>
                  <TableCell>
                    <a
                      href={`tel:${l.phone}`}
                      className="text-primary hover:underline inline-flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {l.phone}
                    </a>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{l.source || '—'}</TableCell>
                  <TableCell className="text-sm">{l.size || '—'}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[l.status]}>{STATUS_LABEL[l.status]}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Удалить заявку?')) deleteMut.mutate(l.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CrmCard>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Заявка от {selected?.name}</DialogTitle>
            <DialogDescription>
              {selected && format(new Date(selected.createdAt), 'd MMMM yyyy, HH:mm', { locale: ru })}
              {selected?.source ? ` · ${selected.source}` : ''}
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Телефон</p>
                  <a href={`tel:${selected.phone}`} className="text-primary font-semibold inline-flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {selected.phone}
                  </a>
                </div>
                {selected.size && (
                  <div>
                    <p className="text-muted-foreground text-xs">Желаемый размер</p>
                    <p className="font-medium">{selected.size}</p>
                  </div>
                )}
              </div>

              {selected.message && (
                <div>
                  <p className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" /> Комментарий клиента
                  </p>
                  <div className="p-3 bg-muted/50 rounded-md text-sm whitespace-pre-wrap">
                    {selected.message}
                  </div>
                </div>
              )}

              <div>
                <p className="text-muted-foreground text-xs mb-1">Статус</p>
                <Select
                  value={selected.status}
                  onValueChange={(v) => updateMut.mutate({ id: selected.id, status: v as LeadStatus })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(STATUS_LABEL) as LeadStatus[]).map((s) => (
                      <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <p className="text-muted-foreground text-xs mb-1">Внутренняя заметка</p>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Например: перезвонил, договорились на завтра"
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>Закрыть</Button>
            <Button
              onClick={() => {
                if (!selected) return;
                updateMut.mutate(
                  { id: selected.id, notes },
                  { onSuccess: () => setSelected(null) }
                );
              }}
              disabled={updateMut.isPending}
            >
              Сохранить заметку
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminLeads;
