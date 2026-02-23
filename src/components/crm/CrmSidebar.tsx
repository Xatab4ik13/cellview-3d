import { useLocation, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { NavLink } from '@/components/NavLink';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  Kanban,
  CalendarCheck,
  Box,
  Key,
  FileText,
  CreditCard,
  BarChart3,
  Settings,
  Globe,
  LogOut,
  ChevronDown,
  Video,
  FolderOpen,
} from 'lucide-react';
import logo from '@/assets/logo.png';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface NavGroup {
  label: string;
  items: {
    title: string;
    url: string;
    icon: React.ElementType;
  }[];
}

const navGroups: NavGroup[] = [
  {
    label: 'CRM',
    items: [
      { title: 'Дашборд', url: '/admin', icon: LayoutDashboard },
      { title: 'Клиенты', url: '/admin/customers', icon: Users },
      { title: 'Воронка', url: '/admin/funnel', icon: Kanban },
      { title: 'Задачи', url: '/admin/tasks', icon: CalendarCheck },
      { title: 'Заявки', url: '/admin/applications', icon: FileText },
    ],
  },
  {
    label: 'Склад',
    items: [
      { title: 'Ячейки', url: '/admin/cells', icon: Box },
      { title: 'Аренды', url: '/admin/rentals', icon: Key },
      { title: 'Камеры', url: '/admin/cameras', icon: Video },
    ],
  },
  {
    label: 'Финансы',
    items: [
      { title: 'Платежи', url: '/admin/payments', icon: CreditCard },
      { title: 'Аналитика', url: '/admin/analytics', icon: BarChart3 },
      { title: 'Документы', url: '/admin/documents', icon: FolderOpen },
    ],
  },
  {
    label: 'Настройки',
    items: [
      { title: 'Общие', url: '/admin/settings', icon: Settings },
      { title: 'Сайт', url: '/admin/site', icon: Globe },
    ],
  },
];

const CrmSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    CRM: true,
    Склад: true,
    Финансы: true,
    Настройки: true,
  });

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    navigate('/admin/login');
  };

  const isActive = (url: string) => {
    if (url === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(url);
  };

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-sidebar">
      <SidebarHeader className="p-3 border-b border-border">
        <div className="flex items-center justify-center">
          <img
            src={logo}
            alt="Кладовка78"
            className={cn(
              'object-contain transition-all duration-200',
              isCollapsed ? 'h-10 w-10' : 'h-14 w-full'
            )}
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="py-3">
        {navGroups.map((group) => (
          <Collapsible
            key={group.label}
            open={isCollapsed || openGroups[group.label]}
            onOpenChange={() => !isCollapsed && toggleGroup(group.label)}
          >
            <SidebarGroup>
              {!isCollapsed && (
                <CollapsibleTrigger asChild>
                  <SidebarGroupLabel className="cursor-pointer select-none flex items-center justify-between pr-3 text-xs uppercase tracking-wider text-muted-foreground/70 hover:text-muted-foreground transition-colors">
                    {group.label}
                    <ChevronDown
                      className={cn(
                        'h-3.5 w-3.5 transition-transform duration-200',
                        openGroups[group.label] ? 'rotate-0' : '-rotate-90'
                      )}
                    />
                  </SidebarGroupLabel>
                </CollapsibleTrigger>
              )}
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive(item.url)}
                          tooltip={item.title}
                          className={cn(
                            'transition-all duration-150 h-10',
                            isActive(item.url)
                              ? 'bg-primary/10 text-primary font-medium shadow-sm'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                          )}
                        >
                          <NavLink
                            to={item.url}
                            end={item.url === '/admin'}
                            className="flex items-center gap-3"
                          >
                            <item.icon className="h-5 w-5 shrink-0" />
                            <span className="text-sm">{item.title}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive text-sm h-10"
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span>Выйти</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default CrmSidebar;
