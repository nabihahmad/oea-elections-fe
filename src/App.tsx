import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Login from "./pages/Login";
import SearchPage from "./pages/SearchPage";
import VotePage from "./pages/VotePage";
import ReportsPage from "./pages/ReportsPage";
import AdminPage from "./pages/AdminPage";
import PortalLayout from "./components/PortalLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const DefaultRedirect = () => {
  console.log("DefaultRedirect rendered");
  const { user, isInitializing } = useAuth();
  console.log("User roles on default redirect:", user?.roles);
  if (isInitializing) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.roles.indexOf("registrator") !== -1) return <Navigate to="/search" replace />;
  if (user.roles.indexOf("voting_agent") !== -1) return <Navigate to="/vote" replace />;
  if (user.roles.indexOf("reporter") !== -1) return <Navigate to="/reporting" replace />;
  if (user.roles.indexOf("admin") !== -1) return <Navigate to="/admin" replace />;
  return <Navigate to="/login" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<DefaultRedirect />} />
            <Route
              path="/search"
              element={
                <ProtectedRoute requiredRole="registrator">
                  <PortalLayout><SearchPage /></PortalLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/vote"
              element={
                <ProtectedRoute requiredRole="voting_agent">
                  <PortalLayout><VotePage /></PortalLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reporting"
              element={
                <ProtectedRoute requiredRole="reporter">
                  <PortalLayout><ReportsPage /></PortalLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <PortalLayout><AdminPage /></PortalLayout>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
