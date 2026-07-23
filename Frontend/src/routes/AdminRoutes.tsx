import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../context/auth"
import FullScreenLoader from "../components/FullScreenLoader/FullScreenLoader"

function AdminRoutes() {
  const { isAuthenticated, loading, userData } = useAuth();

  if (loading) {
    return <FullScreenLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!userData?.admin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default AdminRoutes;