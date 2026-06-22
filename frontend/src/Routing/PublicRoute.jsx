
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PublicRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-xeflow-bg">
        <div className="w-8 h-8 border-2 border-xeflow-brand/30 border-t-xeflow-brand rounded-full animate-spin" />
      </div>
    );
  }

  return user ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

export default PublicRoute;
