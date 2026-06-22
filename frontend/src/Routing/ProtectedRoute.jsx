
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  // Wait for auth check to complete before deciding
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-xeflow-bg">
        <div className="w-8 h-8 border-2 border-xeflow-brand/30 border-t-xeflow-brand rounded-full animate-spin" />
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
