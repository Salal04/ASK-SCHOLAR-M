import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Wraps a page and only renders it if the current session matches
 * `role`. Otherwise redirects to the appropriate login page.
 */
export default function ProtectedRoute({ role, children }) {
  const { isAuthenticated, role: currentRole } = useAuth();

  if (!isAuthenticated || currentRole !== role) {
    const loginPath = role === "ADMIN" ? "/admin/login" : "/login";
    return <Navigate to={loginPath} replace />;
  }

  return children;
}
