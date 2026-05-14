
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  // Check if the user has an access token in their browser storage
  const isAuthenticated = localStorage.getItem("accessToken") !== null;

  // If they have a token, let them through to the nested routes (<Outlet />).
  // If not, instantly redirect them to the /login page.
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
