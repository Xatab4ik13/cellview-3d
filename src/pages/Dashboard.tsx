import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Key, CreditCard, Bell, FileText, LogOut } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProfileSection from '@/components/dashboard/ProfileSection';
import RentalsSection from '@/components/dashboard/RentalsSection';
import SubscriptionSection from '@/components/dashboard/SubscriptionSection';
import PaymentsSection from '@/components/dashboard/PaymentsSection';
import NotificationsSection from '@/components/dashboard/NotificationsSection';
import InfoSection from '@/components/dashboard/InfoSection';
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
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Личный кабинет</h1>
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              Выйти
            </Button>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            {/* Desktop tabs */}
            <TabsList className="hidden lg:flex h-auto p-1 bg-muted/50 rounded-xl gap-1">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {/* Mobile tabs */}
            <div className="lg:hidden">
              <TabsList className="flex flex-wrap h-auto p-1 bg-muted/50 rounded-xl gap-1">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex-1 min-w-[calc(33%-4px)] flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    <tab.icon className="w-4 h-4" />
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
