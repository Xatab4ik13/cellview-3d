import { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Phone, Eye, FileText, Key, GripVertical, MoreHorizontal } from 'lucide-react';

interface FunnelItem {
  id: string;
  name: string;
  phone: string;
  cellSize: string;
  amount: string;
  date: string;
  source?: string;
}

interface FunnelColumn {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  items: FunnelItem[];
}

const initialColumns: FunnelColumn[] = [
  {
    id: 'lead',
    title: 'Заявка',
    icon: Plus,
    color: 'var(--status-new)',
    items: [
      { id: 'l1', name: 'Иван Петров', phone: '+7 999 123-45-67', cellSize: '3 м²', amount: '₽ 4 500', date: '15 мин назад', source: 'Сайт' },
      { id: 'l2', name: 'Анна Сидорова', phone: '+7 999 234-56-78', cellSize: '5 м²', amount: '₽ 7 500', date: '2 часа назад', source: 'Телефон' },
      { id: 'l3', name: 'Дмитрий Волков', phone: '+7 999 876-54-32', cellSize: '2 м²', amount: '₽ 3 000', date: 'Вчера', source: 'Авито' },
    ],
  },
  {
    id: 'call',
    title: 'Звонок',
    icon: Phone,
    color: 'var(--status-pending)',
    items: [
      { id: 'c1', name: 'Мария Иванова', phone: '+7 999 345-67-89', cellSize: '10 м²', amount: '₽ 15 000', date: 'Сегодня 14:00' },
      { id: 'c2', name: 'ООО "Логистик"', phone: '+7 999 456-78-90', cellSize: '20 м²', amount: '₽ 30 000', date: 'Завтра 10:00' },
    ],
  },
  {
    id: 'viewing',
    title: 'Показ',
    icon: Eye,
    color: '220 65% 50%',
    items: [
      { id: 'v1', name: 'Петр Козлов', phone: '+7 999 567-89-01', cellSize: '8 м²', amount: '₽ 12 000', date: 'Пт, 14:00' },
    ],
  },
  {
    id: 'contract',
    title: 'Договор',
    icon: FileText,
    color: '268 60% 55%',
    items: [
      { id: 'd1', name: 'ИП Смирнов', phone: '+7 999 678-90-12', cellSize: '15 м²', amount: '₽ 22 500', date: 'Подписание завтра' },
    ],
  },
  {
    id: 'rent',
    title: 'Аренда',
    icon: Key,
    color: 'var(--status-active)',
    items: [
      { id: 'r1', name: 'ООО "Техно"', phone: '+7 999 789-01-23', cellSize: '12 м²', amount: '₽ 18 000', date: 'Заселение сегодня' },
    ],
  },
];

const AdminFunnel = () => {
  const [columns] = useState(initialColumns);

  const totalAmount = columns.reduce(
    (sum, col) => sum + col.items.reduce((s, item) => s + parseInt(item.amount.replace(/\D/g, '')), 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Воронка продаж</h2>
          <p className="text-base text-muted-foreground mt-1">
            {columns.reduce((s, c) => s + c.items.length, 0)} сделок · ₽{' '}
            {totalAmount.toLocaleString('ru-RU')}/мес
          </p>
        </div>
        <Button className="h-10 gap-2">
          <Plus className="h-4 w-4" />
          Новая сделка
        </Button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6">
        {columns.map((column, colIdx) => (
          <motion.div
            key={column.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: colIdx * 0.08 }}
            className="flex-shrink-0 w-[300px]"
          >
            {/* Column header */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <div
                  className="h-9 w-9 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: `hsl(${column.color} / 0.12)`,
                    color: `hsl(${column.color})`,
                  }}
                >
                  <column.icon className="h-4.5 w-4.5" />
                </div>
                <span className="text-sm font-semibold">{column.title}</span>
                <Badge variant="secondary" className="text-xs h-6 min-w-6 justify-center">
                  {column.items.length}
                </Badge>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>

            {/* Column body */}
            <div
              className="rounded-xl p-2.5 min-h-[400px] space-y-2.5"
              style={{ backgroundColor: 'hsl(var(--muted) / 0.5)' }}
            >
              {column.items.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: colIdx * 0.08 + i * 0.05 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-card rounded-lg border border-border p-4 cursor-pointer"
                  style={{ boxShadow: 'var(--shadow-card)' }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground/30 shrink-0" />
                      <p className="text-sm font-semibold">{item.name}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">{item.phone}</p>
                  <div className="flex items-center justify-between mt-3 ml-6">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {item.cellSize}
                      </Badge>
                      {item.source && (
                        <Badge variant="secondary" className="text-xs">
                          {item.source}
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-primary">{item.amount}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 ml-6">{item.date}</p>
                </motion.div>
              ))}

              <button className="w-full p-3 rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-card/50 transition-all flex items-center justify-center gap-2">
                <Plus className="h-4 w-4" />
                Добавить
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminFunnel;
