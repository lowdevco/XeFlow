
import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = () => {

  const isAuthenticated = localStorage.getItem("accessToken") !== null;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

export default PublicRoute;
