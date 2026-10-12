import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role, user, token }) => {
  // Si pas de token ou user, rediriger
  if (!token || !user) {
    return <Navigate to="/login" />;
  }

  // Vérifier le rôle
  if (role && user.role !== role) {
    return <Navigate to="/login" />;
  }

  // Rendre les enfants (le dashboard)
  return children;
};

export default ProtectedRoute;