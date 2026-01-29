import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Box, Key, Users, CreditCard, TrendingUp, AlertCircle } from 'lucide-react';

const stats = [
  {
    title: 'Всего ячеек',
    value: '42',
    description: '38 занято, 4 свободно',
    icon: Box,
    trend: '+2 за месяц',
    trendUp: true,
  },
  {
    title: 'Активных аренд',
    value: '38',
    description: '5 заканчиваются в этом месяце',
    icon: Key,
    trend: '+12% к прошлому месяцу',
    trendUp: true,
  },
  {
    title: 'Клиентов',
    value: '35',
    description: '3 новых за неделю',
    icon: Users,
    trend: '+8% к прошлому месяцу',
    trendUp: true,
  },
  {
    title: 'Доход за месяц',
    value: '₽ 285 000',
    description: 'Средний чек: ₽ 7 500',
    icon: CreditCard,
    trend: '+15% к прошлому месяцу',
    trendUp: true,
  },
];

const recentApplications = [
  { id: 1, name: 'Иван Петров', phone: '+7 (999) 123-45-67', cellSize: '3 м²', date: '15 мин назад', status: 'new' },
  { id: 2, name: 'Анна Сидорова', phone: '+7 (999) 234-56-78', cellSize: '5 м²', date: '2 часа назад', status: 'new' },
  { id: 3, name: 'Петр Козлов', phone: '+7 (999) 345-67-89', cellSize: '10 м²', date: 'Вчера', status: 'processing' },
];

const expiringRentals = [
  { id: 1, customer: 'ООО "Техно"', cell: 'A-12', expiresIn: '3 дня', amount: '₽ 8 500' },
  { id: 2, customer: 'Мария Иванова', cell: 'B-05', expiresIn: '5 дней', amount: '₽ 4 200' },
  { id: 3, customer: 'ИП Смирнов', cell: 'C-22', expiresIn: '7 дней', amount: '₽ 12 000' },
];

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Дашборд</h2>
        <p className="text-muted-foreground">Обзор текущего состояния склада</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className={`h-3 w-3 ${stat.trendUp ? 'text-green-500' : 'text-red-500'}`} />
                <span className={`text-xs ${stat.trendUp ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.trend}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              Новые заявки
            </CardTitle>
            <CardDescription>Заявки, требующие обработки</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentApplications.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="font-medium">{app.name}</p>
                    <p className="text-sm text-muted-foreground">{app.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{app.cellSize}</p>
                    <p className="text-xs text-muted-foreground">{app.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Expiring Rentals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-accent" />
              Заканчивающиеся аренды
            </CardTitle>
            <CardDescription>Аренды, истекающие в ближайшие 7 дней</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expiringRentals.map((rental) => (
                <div
                  key={rental.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="font-medium">{rental.customer}</p>
                    <p className="text-sm text-muted-foreground">Ячейка {rental.cell}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-accent">{rental.expiresIn}</p>
                    <p className="text-xs text-muted-foreground">{rental.amount}/мес</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
