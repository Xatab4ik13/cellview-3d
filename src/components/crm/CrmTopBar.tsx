import { useState } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

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
  '/admin/cameras': 'Видеонаблюдение',
  '/admin/documents': 'Документы',
};

const CrmTopBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const title = routeTitles[location.pathname] || 'CRM';
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      // Navigate to customers page with search
      navigate(`/admin/customers`);
      toast.info(`Поиск: "${searchQuery.trim()}" — перейдите на нужную страницу`);
      setSearchQuery('');
    }
  };

  return (
    <header
      className="h-14 md:h-16 border-b border-border bg-card flex items-center px-3 md:px-6 gap-2 md:gap-5 sticky top-0 z-10"
      style={{ boxShadow: 'var(--shadow-top-bar)' }}
    >
      <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors shrink-0" />
      
      <h1 className="text-sm md:text-lg font-semibold text-foreground mr-auto truncate">{title}</h1>

      {/* Search */}
      <div className="hidden md:flex items-center relative max-w-[320px] w-full">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Поиск клиентов, ячеек..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearch}
          className="pl-9 h-10 text-sm bg-muted/40 border-transparent focus:border-border focus:bg-card transition-all"
        />
      </div>


      {/* Notifications */}
      <Button
        variant="ghost"
        size="icon"
        className="relative h-9 w-9 md:h-10 md:w-10 text-muted-foreground hover:text-foreground shrink-0"
        onClick={() => toast.info('Уведомления будут доступны после подключения базы данных')}
      >
        <Bell className="h-5 w-5" />
        <Badge className="absolute -top-0.5 -right-0.5 h-5 min-w-5 px-1.5 text-xs bg-[hsl(var(--status-overdue))] text-white border-0">
          3
        </Badge>
      </Button>

      {/* Profile avatar */}
      <div
        onClick={() => navigate('/admin/settings')}
        className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold cursor-pointer hover:bg-primary/20 transition-colors shrink-0"
      >
        А
      </div>
    </header>
  );
};

export default CrmTopBar;
