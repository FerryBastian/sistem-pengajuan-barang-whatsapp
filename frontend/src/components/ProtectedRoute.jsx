import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-4">Memuat...</div>;
  if (!user) return <Navigate to="/login" replace />;

  if (role && user.role !== role) {
    // Jika role tidak cocok, arahkan ke dashboard sesuai role user
    return <Navigate to={user.role === "admin" ? "/admin" : "/user"} replace />;
  }

  return children;
}
