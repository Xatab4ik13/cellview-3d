import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AnimatePresence } from 'framer-motion';
import CrmSidebar from '@/components/crm/CrmSidebar';
import CrmTopBar from '@/components/crm/CrmTopBar';
import CrmPageTransition from '@/components/crm/CrmPageTransition';

const CrmLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const isAuth = localStorage.getItem('adminAuth');
    if (!isAuth) {
      navigate('/admin/login');
    }
  }, [navigate]);

  return (
    <SidebarProvider>
      <div className="crm-zone min-h-screen flex w-full bg-background">
        <CrmSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <CrmTopBar />
          <main className="flex-1 p-6">
            <AnimatePresence mode="wait">
              <CrmPageTransition key={location.pathname}>
                <Outlet />
              </CrmPageTransition>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default CrmLayout;
