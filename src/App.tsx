import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Index from "./pages/Index";
import FamilyDashboard from "./pages/FamilyDashboard";
import Reports from "./pages/Reports";
import Alerts from "./pages/Alerts";
import DoctorConnect from "./pages/DoctorConnect";
import Emergency from "./pages/Emergency";
import DietPlan from "./pages/DietPlan";
import AlertDiets from "./pages/AlertDiets";
import EmergencyContacts from "./pages/EmergencyContacts";
import Medications from "./pages/Medications";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import ProfileSetup from "./pages/ProfileSetup";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/profile-setup" element={<ProfileSetup />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/family" element={<FamilyDashboard />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/doctor" element={<DoctorConnect />} />
            <Route path="/emergency" element={<Emergency />} />
            <Route path="/diet" element={<DietPlan />} />
            <Route path="/alert-diets" element={<AlertDiets />} />
            <Route path="/emergency-contacts" element={<EmergencyContacts />} />
            <Route path="/medications" element={<Medications />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
