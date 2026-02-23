import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

// Only Index is eagerly loaded for fast first paint
import Index from "./pages/Index";

// Lazy-loaded pages
const Catalog = lazy(() => import("./pages/Catalog"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Contacts = lazy(() => import("./pages/Contacts"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Checkout = lazy(() => import("./pages/Checkout"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Docs = lazy(() => import("./pages/Docs"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Consent = lazy(() => import("./pages/Consent"));

// Admin pages — lazy
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const CrmLayout = lazy(() => import("./pages/admin/CrmLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminCells = lazy(() => import("./pages/admin/AdminCells"));
const AdminRentals = lazy(() => import("./pages/admin/AdminRentals"));
const AdminCustomers = lazy(() => import("./pages/admin/AdminCustomers"));
const AdminPayments = lazy(() => import("./pages/admin/AdminPayments"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminCameras = lazy(() => import("./pages/admin/AdminCameras"));
const AdminDocuments = lazy(() => import("./pages/admin/AdminDocuments"));
const AdminSite = lazy(() => import("./pages/admin/AdminSite"));

const queryClient = new QueryClient();

const Loading = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
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
            <Route path="/checkout" element={<Checkout />} />
            
            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<CrmLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="cells" element={<AdminCells />} />
              <Route path="rentals" element={<AdminRentals />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="cameras" element={<AdminCameras />} />
              <Route path="documents" element={<AdminDocuments />} />
              <Route path="site" element={<AdminSite />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
