import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Key, CreditCard, Bell, FileText, LogOut, Video } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProfileSection from '@/components/dashboard/ProfileSection';
import RentalsSection from '@/components/dashboard/RentalsSection';
import SubscriptionSection from '@/components/dashboard/SubscriptionSection';
import PaymentsSection from '@/components/dashboard/PaymentsSection';
import NotificationsSection from '@/components/dashboard/NotificationsSection';
import InfoSection from '@/components/dashboard/InfoSection';
import SurveillanceSection from '@/components/dashboard/SurveillanceSection';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    // Check if user is authenticated
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/auth');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const tabs = [
    { id: 'profile', label: 'Профиль', icon: User },
    { id: 'rentals', label: 'Моя аренда', icon: Key },
    { id: 'surveillance', label: 'Камеры', icon: Video },
    { id: 'subscription', label: 'Подписка', icon: CreditCard },
    { id: 'payments', label: 'Платежи', icon: CreditCard },
    { id: 'notifications', label: 'Уведомления', icon: Bell },
    { id: 'info', label: 'Информация', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 pt-40 pb-20">
        <div className="container mx-auto px-4">
          {/* Header with accent gradient */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Личный кабинет</h1>
              <p className="text-muted-foreground mt-1">Управление арендой и настройками</p>
            </div>
            <Button variant="outline" onClick={handleLogout} className="gap-2 border-primary/30 hover:border-primary hover:bg-primary/5">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Выйти</span>
            </Button>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            {/* Desktop tabs */}
            <TabsList className="hidden lg:flex h-auto p-1.5 bg-secondary rounded-2xl gap-1 border border-border">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-primary"
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {/* Mobile tabs */}
            <div className="lg:hidden">
              <TabsList className="flex flex-wrap h-auto p-1.5 bg-secondary rounded-2xl gap-1 border border-border">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex-1 min-w-[calc(33%-4px)] flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl text-xs font-semibold transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-primary"
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value="profile" className="mt-6">
              <ProfileSection />
            </TabsContent>
            
            <TabsContent value="rentals" className="mt-6">
              <RentalsSection />
            </TabsContent>
            
            <TabsContent value="surveillance" className="mt-6">
              <SurveillanceSection />
            </TabsContent>
            
            <TabsContent value="subscription" className="mt-6">
              <SubscriptionSection />
            </TabsContent>
            
            <TabsContent value="payments" className="mt-6">
              <PaymentsSection />
            </TabsContent>
            
            <TabsContent value="notifications" className="mt-6">
              <NotificationsSection />
            </TabsContent>
            
            <TabsContent value="info" className="mt-6">
              <InfoSection />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
