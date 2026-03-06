import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { OrgProvider } from "@/contexts/OrgContext";
import { RequireAuth, RedirectIfAuth } from "@/components/RouteGuard";
import { AppLayout } from "@/components/AppLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Schedules from "./pages/Schedules";
import ScheduleDetails from "./pages/ScheduleDetails";
import Organization from "./pages/Organization";
import Members from "./pages/Members";
import ApiKeys from "./pages/ApiKeys";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <OrgProvider>
            <Routes>
              <Route path="/login" element={<RedirectIfAuth><Login /></RedirectIfAuth>} />
              <Route path="/register" element={<RedirectIfAuth><Register /></RedirectIfAuth>} />
              <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/schedules" element={<Schedules />} />
                <Route path="/schedules/:id" element={<ScheduleDetails />} />
                <Route path="/organization" element={<Organization />} />
                <Route path="/members" element={<Members />} />
                <Route path="/api-keys" element={<ApiKeys />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </OrgProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
