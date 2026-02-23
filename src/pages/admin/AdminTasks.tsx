import { useState } from 'react';
import { motion } from 'framer-motion';
import CrmCard from '@/components/crm/CrmCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Plus,
  Calendar,
  Clock,
  User,
  Filter,
  Phone,
  Eye,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  description?: string;
  type: 'call' | 'viewing' | 'contract' | 'reminder' | 'other';
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  dueTime?: string;
  client?: string;
  completed: boolean;
}

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Позвонить Ивану Петрову',
    description: 'Уточнить размер ячейки и срок аренды',
    type: 'call',
    priority: 'high',
    dueDate: 'Сегодня',
    dueTime: '14:00',
    client: 'Иван Петров',
    completed: false,
  },
  {
    id: '2',
    title: 'Показ склада — ООО "Логистик"',
    description: 'Показать ячейки A-15, A-16, B-20',
    type: 'viewing',
    priority: 'high',
    dueDate: 'Сегодня',
    dueTime: '16:00',
    client: 'ООО "Логистик"',
    completed: false,
  },
  {
    id: '3',
    title: 'Подготовить договор для ИП Смирнов',
    description: 'Ячейка C-22, 15 м², 12 мес',
    type: 'contract',
    priority: 'medium',
    dueDate: 'Завтра',
    client: 'ИП Смирнов',
    completed: false,
  },
  {
    id: '4',
    title: 'Напомнить об оплате — Мария Иванова',
    description: 'Просрочка 3 дня, ячейка B-05',
    type: 'reminder',
    priority: 'high',
    dueDate: 'Сегодня',
    client: 'Мария Иванова',
    completed: false,
  },
  {
    id: '5',
    title: 'Перезвонить Анне Сидоровой',
    description: 'Была заинтересована в 5 м²',
    type: 'call',
    priority: 'medium',
    dueDate: 'Завтра',
    dueTime: '10:00',
    client: 'Анна Сидорова',
    completed: false,
  },
  {
    id: '6',
    title: 'Проверить оплату — ООО "Техно"',
    type: 'other',
    priority: 'low',
    dueDate: 'Пт, 28 фев',
    client: 'ООО "Техно"',
    completed: true,
  },
];

const typeIcons: Record<string, React.ElementType> = {
  call: Phone,
  viewing: Eye,
  contract: FileText,
  reminder: AlertTriangle,
  other: Calendar,
};

const typeLabels: Record<string, string> = {
  call: 'Звонок',
  viewing: 'Показ',
  contract: 'Договор',
  reminder: 'Напоминание',
  other: 'Другое',
};

const priorityColors: Record<string, string> = {
  high: 'bg-[hsl(var(--status-overdue))] text-white',
  medium: 'bg-[hsl(var(--status-pending))] text-white',
  low: 'bg-muted text-muted-foreground',
};

const priorityLabels: Record<string, string> = {
  high: 'Высокий',
  medium: 'Средний',
  low: 'Низкий',
};

type FilterType = 'all' | 'today' | 'upcoming' | 'completed';

const AdminTasks = () => {
  const [tasks, setTasks] = useState(mockTasks);
  const [filter, setFilter] = useState<FilterType>('all');

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'today') return task.dueDate === 'Сегодня' && !task.completed;
    if (filter === 'upcoming') return task.dueDate !== 'Сегодня' && !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const todayCount = tasks.filter((t) => t.dueDate === 'Сегодня' && !t.completed).length;
  const overdueCount = tasks.filter((t) => t.priority === 'high' && !t.completed).length;

  const filters: { key: FilterType; label: string; count?: number }[] = [
    { key: 'all', label: 'Все', count: tasks.filter((t) => !t.completed).length },
    { key: 'today', label: 'Сегодня', count: todayCount },
    { key: 'upcoming', label: 'Предстоящие' },
    { key: 'completed', label: 'Выполненные', count: tasks.filter((t) => t.completed).length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Задачи</h2>
          <p className="text-base text-muted-foreground mt-1">
            {todayCount} на сегодня · {overdueCount} срочных
          </p>
        </div>
        <Button className="h-10 gap-2">
          <Plus className="h-4 w-4" />
          Новая задача
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        {filters.map((f) => (
          <Button
            key={f.key}
            variant={filter === f.key ? 'default' : 'outline'}
            size="sm"
            className="h-9 gap-1.5 text-sm"
            onClick={() => setFilter(f.key)}
          >
            {f.label}
            {f.count !== undefined && (
              <Badge
                variant="secondary"
                className={cn(
                  'text-xs h-5 min-w-5 justify-center ml-1',
                  filter === f.key && 'bg-primary-foreground/20 text-primary-foreground'
                )}
              >
                {f.count}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Tasks list */}
      <div className="space-y-3">
        {filteredTasks.map((task, i) => {
          const TypeIcon = typeIcons[task.type];
          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <CrmCard hover className="!p-0">
                <div className="flex items-start gap-4 p-5">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                    className="mt-1 h-5 w-5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p
                          className={cn(
                            'text-base font-medium',
                            task.completed && 'line-through text-muted-foreground'
                          )}
                        >
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {task.description}
                          </p>
                        )}
                      </div>
                      <Badge className={cn('text-xs shrink-0', priorityColors[task.priority])}>
                        {priorityLabels[task.priority]}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 mt-3 flex-wrap">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <TypeIcon className="h-4 w-4" />
                        <span>{typeLabels[task.type]}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{task.dueDate}</span>
                      </div>
                      {task.dueTime && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{task.dueTime}</span>
                        </div>
                      )}
                      {task.client && (
                        <div className="flex items-center gap-1.5 text-sm text-primary">
                          <User className="h-4 w-4" />
                          <span>{task.client}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CrmCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminTasks;
