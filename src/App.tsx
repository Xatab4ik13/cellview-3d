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
import Docs from "./pages/Docs";
import Privacy from "./pages/Privacy";
import Consent from "./pages/Consent";

// Admin pages
import AdminLogin from "./pages/admin/AdminLogin";
import CrmLayout from "./pages/admin/CrmLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCells from "./pages/admin/AdminCells";
import AdminRentals from "./pages/admin/AdminRentals";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminFunnel from "./pages/admin/AdminFunnel";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminCameras from "./pages/admin/AdminCameras";
import AdminDocuments from "./pages/admin/AdminDocuments";
import AdminSite from "./pages/admin/AdminSite";

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
          <Route path="/docs" element={<Docs />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/consent" element={<Consent />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<CrmLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="cells" element={<AdminCells />} />
            <Route path="rentals" element={<AdminRentals />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="funnel" element={<AdminFunnel />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="cameras" element={<AdminCameras />} />
            <Route path="documents" element={<AdminDocuments />} />
            <Route path="site" element={<AdminSite />} />
          </Route>
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
