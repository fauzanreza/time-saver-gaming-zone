
import React, { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { ThemeProvider } from "next-themes";
import { fetchData } from "@/lib/data";
import CustomerDashboard from "./pages/CustomerDashboard";
import Devices from "./pages/Devices";
import Sessions from "./pages/Sessions";
import SavedTime from "./pages/SavedTime";
import History from "./pages/History";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

document.title = "Time Machines GamingSpace";

const queryClient = new QueryClient();

const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    const init = async () => {
      // Initialize with customer mode by default
      if (!localStorage.getItem("userMode")) {
        localStorage.setItem("userMode", "customer");
        localStorage.setItem("isCustomer", "true");
      }
      
      // Load initial data before showing any UI
      await fetchData();
      setIsLoaded(true);
    };
    
    init();
  }, []);
  
  if (!isLoaded) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/welcome" element={<Index />} />
              
              <Route path="/" element={<CustomerDashboard />} />
              <Route path="/customer-dashboard" element={<CustomerDashboard />} />
              
              <Route path="/dashboard" element={<ProtectedAdminRoute><Dashboard /></ProtectedAdminRoute>} />
              <Route path="/devices" element={<ProtectedAdminRoute><Devices /></ProtectedAdminRoute>} />
              <Route path="/sessions" element={<ProtectedAdminRoute><Sessions /></ProtectedAdminRoute>} />
              <Route path="/saved-time" element={<ProtectedAdminRoute><SavedTime /></ProtectedAdminRoute>} />
              <Route path="/history" element={<ProtectedAdminRoute><History /></ProtectedAdminRoute>} />
              <Route path="/reports" element={<ProtectedAdminRoute><Reports /></ProtectedAdminRoute>} />
              <Route path="/settings" element={<ProtectedAdminRoute><Settings /></ProtectedAdminRoute>} />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
