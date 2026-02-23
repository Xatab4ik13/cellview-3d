import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Catalog from "./pages/Catalog";
import Pricing from "./pages/Pricing";
import Contacts from "./pages/Contacts";
import FAQ from "./pages/FAQ";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

// Admin pages
import AdminLogin from "./pages/admin/AdminLogin";
import CrmLayout from "./pages/admin/CrmLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCells from "./pages/admin/AdminCells";
import AdminRentals from "./pages/admin/AdminRentals";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminApplications from "./pages/admin/AdminApplications";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminFunnel from "./pages/admin/AdminFunnel";
import AdminTasks from "./pages/admin/AdminTasks";
import AdminAnalytics from "./pages/admin/AdminAnalytics";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<CrmLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="cells" element={<AdminCells />} />
            <Route path="rentals" element={<AdminRentals />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="applications" element={<AdminApplications />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="funnel" element={<AdminFunnel />} />
            <Route path="tasks" element={<AdminTasks />} />
            <Route path="analytics" element={<AdminAnalytics />} />
          </Route>
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
