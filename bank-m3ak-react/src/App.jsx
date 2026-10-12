import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import AuthPage from "./components/AuthPage";
import AdminDashboard from "./components/AdminDashboard";
import UserDashboard from "./components/UserDashboard";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  const navigate = useNavigate();

  // État pour stocker l'utilisateur et le token
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Charger les données depuis localStorage au démarrage
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Fonction appelée après une connexion réussie
  const handleLoginSuccess = (newToken, newUser, account) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);

    // Redirection selon le rôle
    if (newUser.role === "Administrateur") {
      navigate("/admin");
    } else if (newUser.role === "Utilisateur") {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  // Fonction de déconnexion
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    navigate("/login");
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />

      <Route
        path="/login"
        element={<AuthPage onLoginSuccess={handleLoginSuccess} />}
      />

      {/* Admin Dashboard – passe user, token, onLogout, onProfileUpdate */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="Administrateur" user={user} token={token}>
            <AdminDashboard
              user={user}
              token={token}
              onLogout={handleLogout}
              onProfileUpdate={(updatedUser) => {
                setUser(updatedUser);
                localStorage.setItem("user", JSON.stringify(updatedUser));
              }}
            />
          </ProtectedRoute>
        }
      />

      {/* User Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute role="Utilisateur" user={user} token={token}>
            <UserDashboard
              user={user}
              token={token}
              onLogout={handleLogout}
            />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;