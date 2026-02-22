import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "registrator" | "voting_agent" | "reporter" | "admin";
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, isInitializing } = useAuth();
  console.log("ProtectedRoute rendered, user:", user, "requiredRole:", requiredRole);

  if (isInitializing) return null;
  if (!user) return <Navigate to="/login" replace />;

  if (requiredRole && !user.roles.includes(requiredRole)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
