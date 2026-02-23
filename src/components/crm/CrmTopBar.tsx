import { SidebarTrigger } from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Bell, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'react-router-dom';

const routeTitles: Record<string, string> = {
  '/admin': 'Дашборд',
  '/admin/customers': 'Клиенты',
  '/admin/funnel': 'Воронка продаж',
  '/admin/tasks': 'Задачи',
  '/admin/applications': 'Заявки',
  '/admin/cells': 'Ячейки',
  '/admin/rentals': 'Аренды',
  '/admin/payments': 'Платежи',
  '/admin/analytics': 'Аналитика',
  '/admin/settings': 'Настройки',
  '/admin/site': 'Управление сайтом',
};

const CrmTopBar = () => {
  const location = useLocation();
  const title = routeTitles[location.pathname] || 'CRM';

  return (
    <header
      className="h-14 border-b border-border bg-card flex items-center px-4 gap-4 sticky top-0 z-10"
      style={{ boxShadow: 'var(--shadow-top-bar)' }}
    >
      <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />
      
      <h1 className="text-[15px] font-semibold text-foreground mr-auto">{title}</h1>

      {/* Search */}
      <div className="hidden md:flex items-center relative max-w-[280px] w-full">
        <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Поиск клиентов, ячеек..."
          className="pl-8 h-8 text-[13px] bg-muted/40 border-transparent focus:border-border focus:bg-card transition-all"
        />
      </div>

      {/* Quick action */}
      <Button size="sm" className="h-8 gap-1.5 text-[13px] shadow-sm">
        <Plus className="h-3.5 w-3.5" />
        <span className="hidden lg:inline">Новая заявка</span>
      </Button>

      {/* Notifications */}
      <Button variant="ghost" size="icon" className="relative h-8 w-8 text-muted-foreground hover:text-foreground">
        <Bell className="h-4 w-4" />
        <Badge className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 text-[10px] bg-[hsl(var(--status-overdue))] text-white border-0">
          3
        </Badge>
      </Button>

      {/* Profile avatar */}
      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[13px] font-semibold cursor-pointer hover:bg-primary/20 transition-colors">
        А
      </div>
    </header>
  );
};

export default CrmTopBar;
