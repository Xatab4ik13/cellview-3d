import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Mail, MessageSquare, Smartphone, Bell, AlertCircle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const NotificationsSection = () => {
  const { toast } = useToast();
  
  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    telegram: false,
    push: true,
    // Types
    paymentReminders: true,
    expiryAlerts: true,
    promotions: false,
    news: false,
  });

  const handleChange = (key: keyof typeof notifications, value: boolean) => {
    // Prevent disabling all channels for critical notifications
    if (['email', 'sms', 'telegram', 'push'].includes(key)) {
      const channels = { ...notifications, [key]: value };
      const activeChannels = [channels.email, channels.sms, channels.telegram, channels.push].filter(Boolean);
      
      if (activeChannels.length === 0) {
        toast({
          title: "Невозможно отключить",
          description: "Должен быть активен хотя бы один канал уведомлений",
          variant: "destructive",
        });
        return;
      }
    }
    
    setNotifications(prev => ({ ...prev, [key]: value }));
    toast({
      title: value ? "Включено" : "Отключено",
      description: "Настройки уведомлений обновлены",
    });
  };

  const channels = [
    { 
      key: 'email' as const, 
      label: 'Email', 
      icon: Mail, 
      description: 'Уведомления на электронную почту' 
    },
    { 
      key: 'sms' as const, 
      label: 'SMS', 
      icon: Smartphone, 
      description: 'SMS-сообщения на телефон' 
    },
    { 
      key: 'telegram' as const, 
      label: 'Telegram', 
      icon: MessageSquare, 
      description: 'Сообщения в Telegram-бот' 
    },
    { 
      key: 'push' as const, 
      label: 'Push', 
      icon: Bell, 
      description: 'Push-уведомления в браузере' 
    },
  ];

  const notificationTypes = [
    { 
      key: 'paymentReminders' as const, 
      label: 'Напоминания об оплате', 
      description: 'За 3 дня и за 1 день до списания',
      required: true,
    },
    { 
      key: 'expiryAlerts' as const, 
      label: 'Окончание аренды', 
      description: 'За 7 дней и за 24 часа до окончания',
      required: true,
    },
    { 
      key: 'promotions' as const, 
      label: 'Акции и скидки', 
      description: 'Специальные предложения для клиентов',
      required: false,
    },
    { 
      key: 'news' as const, 
      label: 'Новости компании', 
      description: 'Новые услуги и обновления',
      required: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Important notice */}
      <div className="p-5 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-2xl flex items-start gap-4">
        <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <Info className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-primary">Обязательные уведомления</p>
          <p className="text-sm text-muted-foreground">
            За 24 часа до окончания аренды вы получите уведомление по всем активным каналам. 
            Это обязательное уведомление для защиты ваших интересов.
          </p>
        </div>
      </div>

      {/* Notification channels */}
      <Card className="border-border/50 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg border-b border-border/50">
          <CardTitle className="text-xl font-bold">Каналы уведомлений</CardTitle>
          <CardDescription>
            Выберите, как вы хотите получать уведомления
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          {channels.map((channel) => {
            const IconComponent = channel.icon;
            return (
            <div 
              key={channel.key} 
              className="flex items-center justify-between p-4 border border-border/50 rounded-xl hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  notifications[channel.key] ? 'bg-primary/10' : 'bg-secondary'
                }`}>
                  <IconComponent className={`w-5 h-5 ${
                    notifications[channel.key] ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                </div>
                <div>
                  <p className="font-semibold">{channel.label}</p>
                  <p className="text-sm text-muted-foreground">{channel.description}</p>
                </div>
              </div>
              <Switch
                checked={notifications[channel.key]}
                onCheckedChange={(checked) => handleChange(channel.key, checked)}
              />
            </div>
            );
          })}
          {!notifications.telegram && (
            <div className="ml-14">
              <a 
                href="https://t.me/kladovka78_bot" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                Подключить Telegram-бот →
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification types */}
      <Card className="border-border/50 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg border-b border-border/50">
          <CardTitle className="text-xl font-bold">Типы уведомлений</CardTitle>
          <CardDescription>
            Настройте, какие уведомления вы хотите получать
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          {notificationTypes.map((type) => (
            <div 
              key={type.key} 
              className="flex items-center justify-between p-4 border border-border/50 rounded-xl hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  type.required ? 'bg-accent/10' : 'bg-secondary'
                }`}>
                  {type.required ? (
                    <AlertCircle className="w-5 h-5 text-accent" />
                  ) : (
                    <Bell className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{type.label}</p>
                    {type.required && (
                      <Badge variant="secondary" className="text-xs bg-accent/10 text-accent-foreground font-semibold">
                        Обязательно
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                </div>
              </div>
              <Switch
                checked={notifications[type.key]}
                onCheckedChange={(checked) => handleChange(type.key, checked)}
                disabled={type.required}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsSection;
