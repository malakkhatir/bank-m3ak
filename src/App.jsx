import React, { useState, useEffect } from "react";
import AuthPage from "./components/AuthPage";
import AdminDashboard from "./components/AdminDashboard";
import UserDashboard from "./components/UserDashboard";
import { Landmark } from "lucide-react";
import { safeFetchJson } from "../bank-m3ak-react/src/utils";

export default function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("bank_m3ak_token");
    if (!savedToken) {
      setLoading(false);
      return;
    }

    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${savedToken}` }
        });
        const data = await safeFetchJson(res);

        setToken(savedToken);
        setUser(data.user);
        setAccount(data.account);
      } catch (err) {
        console.error("Session restoration failed:", err);
        localStorage.removeItem("bank_m3ak_token");
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const handleLoginSuccess = (newToken, loggedUser, loggedAccount) => {
    localStorage.setItem("bank_m3ak_token", newToken);
    setToken(newToken);
    setUser(loggedUser);
    setAccount(loggedAccount);
  };

  const handleLogout = () => {
    localStorage.removeItem("bank_m3ak_token");
    setToken(null);
    setUser(null);
    setAccount(null);
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="bg-blue-600 p-4 rounded-3xl text-white shadow-xl shadow-blue-500/20 animate-bounce">
            <Landmark size={36} />
          </div>
          <span className="font-display font-bold text-2xl text-slate-800 tracking-tight">
            Bank <span className="text-blue-600">M3ak</span>
          </span>
          <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
            <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span>Sécurisation de la connexion...</span>
          </div>
        </div>
      </div>
    );
  }

  // Not logged in -> Auth Page (Login / Register)
  if (!token || !user) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Logged in -> Routing depending on Role
  if (user.role === "Administrateur") {
    return (
      <AdminDashboard 
        user={user} 
        token={token} 
        onLogout={handleLogout} 
        onProfileUpdate={handleProfileUpdate} 
      />
    );
  }

  return (
    <UserDashboard 
      user={user} 
      initialAccount={account} 
      token={token} 
      onLogout={handleLogout} 
      onProfileUpdate={handleProfileUpdate} 
    />
  );
}
