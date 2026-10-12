import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";
import {
  Users, Landmark, ArrowLeftRight, Ban, LogOut, CheckCircle, XCircle,
  Search, ShieldAlert, UserPlus, Edit3, Trash2, Save, Key, RefreshCw,
  User, Phone, MapPin, Check, Plus, AlertCircle, TrendingUp, Menu, Eye
} from "lucide-react";
import Logo from "./Logo";

export default function AdminDashboard({ user, token, onLogout, onProfileUpdate }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // États des données
  const [usersList, setUsersList] = useState([]);
  const [accountsList, setAccountsList] = useState([]);
  const [transactionsList, setTransactionsList] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Filtres et recherche
  const [accountSearch, setAccountSearch] = useState("");
  const [accountStatusFilter, setAccountStatusFilter] = useState("all");
  const [accountSortBy, setAccountSortBy] = useState("name");

  // Modals / Formulaires
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "Casablanca",
    role: "Utilisateur",
    active: true
  });

  const [selectedViewAccount, setSelectedViewAccount] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  // Profil administrateur
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
    password: ""
  });

  // Instance Axios avec le token
  const api = axios.create({
    baseURL: "http://localhost:8000/api",
    headers: { Authorization: `Bearer ${token}` }
  });

  // Récupération des données
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersRes, accountsRes, txRes] = await Promise.all([
        api.get("/admin/users"),
        api.get("/admin/accounts"),
        api.get("/admin/transactions")  // ✅ Correction : au lieu de "/transactions"
      ]);

      setUsersList(Array.isArray(usersRes.data) ? usersRes.data : []);
      setAccountsList(Array.isArray(accountsRes.data) ? accountsRes.data : []);
      setTransactionsList(Array.isArray(txRes.data) ? txRes.data : []);
    } catch (err) {
      console.error("Erreur fetchData:", err);
      setError(err.response?.data?.message || err.message || "Impossible de charger les données.");
      setUsersList([]);
      setAccountsList([]);
      setTransactionsList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  // --- Gestion des utilisateurs ---
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const url = editingUser ? `/admin/users/${editingUser.id}` : "/admin/users";
    const method = editingUser ? "put" : "post";

    try {
      await api({ method, url, data: userForm });
      setSuccessMsg(editingUser ? "Utilisateur mis à jour." : "Utilisateur créé.");
      setShowUserModal(false);
      setEditingUser(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const handleToggleUserStatus = async (targetUser) => {
    try {
      await api.put(`/admin/users/${targetUser.id}`, { active: !targetUser.active });
      setSuccessMsg(`Statut de ${targetUser.name} modifié.`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Supprimer définitivement cet utilisateur ?")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setSuccessMsg("Utilisateur supprimé.");
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  // --- Gestion des comptes ---
  const handleValidateAccount = async (accountNo, action) => {
    try {
      await api.post(`/admin/accounts/${accountNo}/validate-registration`, { action });
      setSuccessMsg(action === "accept" ? "Compte validé." : "Demande refusée.");
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const handleToggleAccount = async (accountNo) => {
    try {
      await api.post(`/admin/accounts/${accountNo}/toggle`);
      setSuccessMsg("Statut du compte mis à jour.");
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  // --- Gestion des transactions ---
  const handleValidateTx = async (txId, action) => {
    try {
      await api.post(`/admin/transactions/${txId}/validate`, { action });
      setSuccessMsg(action === "validate" ? "Opération validée." : "Opération rejetée.");
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  // --- Profil administrateur ---
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await api.put("/user/profile", profileForm);
      setSuccessMsg("Profil mis à jour.");
      if (onProfileUpdate) onProfileUpdate(res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  // --- Calculs et filtres (avec protections) ---
  const totalUsers = Array.isArray(usersList) ? usersList.filter(u => u.role === "Utilisateur").length : 0;
  const totalAccounts = Array.isArray(accountsList) ? accountsList.filter(a => !a.pending_validation).length : 0;
  const totalTransactions = Array.isArray(transactionsList) ? transactionsList.length : 0;
  const deactivatedAccounts = Array.isArray(accountsList) ? accountsList.filter(a => a.status === "Désactivé" && !a.pending_validation).length : 0;
  const pendingTransactions = Array.isArray(transactionsList) ? transactionsList.filter(t => t.status === "En attente") : [];

  // Fusion des comptes avec les utilisateurs
  const mergedAccounts = Array.isArray(accountsList) && Array.isArray(usersList)
    ? accountsList
        .filter(acc => {
          const usr = usersList.find(u => u.id === acc.owner_id);
          if (!usr || usr.role === "Administrateur") return false;
          if (acc.pending_validation) return false;
          return true;
        })
        .map(acc => {
          const usr = usersList.find(u => u.id === acc.owner_id);
          return {
            ...acc,
            email: usr?.email || "",
            phone: usr?.phone || "",
            address: usr?.address || "",
            userActive: usr?.active || false
          };
        })
    : [];

  // Filtrage et tri
  const filteredAndSortedAccounts = mergedAccounts
    .filter(item => {
      const searchLower = accountSearch.toLowerCase();
      const matchesSearch =
        item.owner_name?.toLowerCase().includes(searchLower) ||
        item.account_no?.toLowerCase().includes(searchLower) ||
        item.email?.toLowerCase().includes(searchLower);
      if (accountStatusFilter === "all") return matchesSearch;
      return matchesSearch && item.status === accountStatusFilter;
    })
    .sort((a, b) => {
      if (accountSortBy === "name") return (a.owner_name || "").localeCompare(b.owner_name || "");
      if (accountSortBy === "balance") return (b.balance || 0) - (a.balance || 0);
      if (accountSortBy === "createdAt") return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      return 0;
    });

  // Comptes en attente de validation
  const pendingAccounts = Array.isArray(accountsList) && Array.isArray(usersList)
    ? accountsList
        .filter(acc => acc.pending_validation)
        .map(acc => {
          const usr = usersList.find(u => u.id === acc.owner_id);
          return {
            ...acc,
            email: usr?.email || "",
            phone: usr?.phone || "",
            address: usr?.address || ""
          };
        })
    : [];

  // Vérification de l'utilisateur
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#1E88E5] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------
  // RENDU PRINCIPAL (identique à la version précédente, mais avec les corrections)
  // -----------------------------------------------------------------
  return (
    <div className="h-screen w-full flex flex-col md:flex-row bg-[#F5F7FA] font-sans text-gray-800 overflow-hidden">
      
      {/* Backdrop mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 md:z-auto w-64 bg-white border-r border-gray-200 flex flex-col h-full shrink-0 transform md:transform-none md:relative transition-transform duration-300 ease-out ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}>
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <Logo className="h-5 w-5" />
          <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-mono font-bold uppercase border border-red-100">Admin</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <button onClick={() => { setActiveTab("dashboard"); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${activeTab === "dashboard" ? "bg-[#E3F2FD] text-[#1E88E5] font-semibold" : "text-gray-500 hover:bg-gray-50"}`}>
            <Landmark size={18} /><span>Tableau de bord</span>
            {pendingTransactions.length > 0 && <span className="ml-auto bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">{pendingTransactions.length}</span>}
          </button>
          <button onClick={() => { setActiveTab("accounts"); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${activeTab === "accounts" ? "bg-[#E3F2FD] text-[#1E88E5] font-semibold" : "text-gray-500 hover:bg-gray-50"}`}>
            <Users size={18} /><span>Comptes</span>
          </button>
          <button onClick={() => { setActiveTab("account-validation"); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${activeTab === "account-validation" ? "bg-[#E3F2FD] text-[#1E88E5] font-semibold" : "text-gray-500 hover:bg-gray-50"}`}>
            <UserPlus size={18} /><span>Validation des comptes</span>
            {pendingAccounts.length > 0 && <span className="ml-auto bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">{pendingAccounts.length}</span>}
          </button>
          <button onClick={() => { setActiveTab("validation"); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${activeTab === "validation" ? "bg-[#E3F2FD] text-[#1E88E5] font-semibold" : "text-gray-500 hover:bg-gray-50"}`}>
            <ShieldAlert size={18} /><span>Validation des opérations</span>
            {pendingTransactions.length > 0 && <span className="ml-auto bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{pendingTransactions.length}</span>}
          </button>
          <button onClick={() => { setActiveTab("transactions"); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${activeTab === "transactions" ? "bg-[#E3F2FD] text-[#1E88E5] font-semibold" : "text-gray-500 hover:bg-gray-50"}`}>
            <ArrowLeftRight size={18} /><span>Historique des Opérations</span>
          </button>
          <button onClick={() => { setActiveTab("profile"); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${activeTab === "profile" ? "bg-[#E3F2FD] text-[#1E88E5] font-semibold" : "text-gray-500 hover:bg-gray-50"}`}>
            <User size={18} /><span>Mon Profil</span>
          </button>
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button onClick={() => { onLogout(); setSidebarOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
            <LogOut size={18} /><span>Se déconnecter</span>
          </button>
        </div>
      </aside>

      {/* CONTENU PRINCIPAL */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 -ml-2 text-gray-500 hover:text-gray-900 rounded-lg md:hidden hover:bg-gray-50 focus:outline-none cursor-pointer">
              <Menu size={24} />
            </button>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-800 capitalize">
                {activeTab === "dashboard" && "Tableau de Bord Admin"}
                {activeTab === "accounts" && "Gestion des Comptes"}
                {activeTab === "account-validation" && "Validation des Inscriptions"}
                {activeTab === "transactions" && "Historique des Opérations"}
                {activeTab === "validation" && "Contrôle & Validation"}
                {activeTab === "profile" && "Mon Profil Administrateur"}
              </h2>
              <p className="text-xs text-gray-500 hidden sm:block">Supervision Bank M3ak • Espace Administrateur</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold text-gray-800">{user?.name}</div>
                <div className="text-xs text-red-500 font-bold uppercase tracking-wider">Super Admin</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-red-50 border-2 border-white overflow-hidden flex items-center justify-center text-red-600 font-bold shadow-sm">
                {user?.name?.split(" ").map(n => n[0]).join("") || "A"}
              </div>
            </div>
          </div>
        </header>

        <main className="p-8 flex-1 overflow-y-auto space-y-6">
        
        {/* Messages */}
        <AnimatePresence>
          {successMsg && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl text-sm font-medium flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-emerald-500" />
                <span>{successMsg}</span>
              </div>
              <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-emerald-600 text-xs font-bold">✕</button>
            </motion.div>
          )}
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl text-sm font-medium flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <XCircle size={18} className="text-red-500" />
                <span>{error}</span>
              </div>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 text-xs font-bold">✕</button>
            </motion.div>
          )}
        </AnimatePresence>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-10 h-10 border-4 border-[#1E88E5] border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-500 font-medium">Chargement...</span>
          </div>
        )}

        {!loading && (
          <>
            {/* TAB 1 : DASHBOARD */}
            {activeTab === "dashboard" && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="font-display font-bold text-3xl text-gray-900">Tableau de bord Administrateur</h1>
                    <p className="text-sm text-gray-500 mt-1 font-medium">Vue d'ensemble et contrôle global.</p>
                  </div>
                  <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">
                    <RefreshCw size={16} /> Actualiser
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div><span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Membres inscrits</span><span className="text-3xl font-bold text-gray-900 mt-2 block">{totalUsers}</span></div>
                    <div className="p-4 bg-blue-50 text-[#1E88E5] rounded-xl"><Users size={24} /></div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div><span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Comptes bancaires</span><span className="text-3xl font-bold text-gray-900 mt-2 block">{totalAccounts}</span></div>
                    <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl"><Landmark size={24} /></div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div><span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Opérations totales</span><span className="text-3xl font-bold text-gray-900 mt-2 block">{totalTransactions}</span></div>
                    <div className="p-4 bg-purple-50 text-purple-600 rounded-xl"><ArrowLeftRight size={24} /></div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div><span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Comptes désactivés</span><span className="text-3xl font-bold text-gray-900 mt-2 block">{deactivatedAccounts}</span></div>
                    <div className="p-4 bg-red-50 text-red-600 rounded-xl"><Ban size={24} /></div>
                  </div>
                </div>

                {pendingTransactions.length > 0 ? (
                  <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-amber-500 text-white rounded-xl"><AlertCircle size={20} /></div>
                      <div><h3 className="font-display font-bold text-gray-800">Opérations en attente</h3><p className="text-xs text-gray-500 font-medium">Ces transactions nécessitent votre validation.</p></div>
                    </div>
                    <div className="bg-white rounded-2xl overflow-hidden border border-amber-100 shadow-sm">
                      <div className="overflow-x-auto w-full">
                        <table className="w-full text-left border-collapse text-sm min-w-[750px] lg:min-w-full">
                          <thead><tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold">
                            <th className="p-4 pl-6">N° Compte</th><th className="p-4">Type</th><th className="p-4 text-right">Montant</th><th className="p-4 pl-8">Description</th><th className="p-4 text-center pr-6">Actions</th>
                          </tr></thead>
                          <tbody className="divide-y divide-gray-100">
                            {pendingTransactions.map(tx => (
                              <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="p-4 pl-6 font-mono font-bold text-gray-700">{tx.account_no}</td>
                                <td className="p-4"><span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">{tx.type}</span></td>
                                <td className="p-4 text-right font-bold text-gray-900 text-base">{tx.amount?.toLocaleString("fr-FR") || 0} DH</td>
                                <td className="p-4 pl-8 text-gray-500 font-medium">{tx.description}</td>
                                <td className="p-4 pr-6">
                                  <div className="flex items-center justify-center gap-2">
                                    <button onClick={() => handleValidateTx(tx.id, "validate")} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer">Valider</button>
                                    <button onClick={() => handleValidateTx(tx.id, "reject")} className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-bold transition-colors cursor-pointer">Rejeter</button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
                    <CheckCircle className="mx-auto text-emerald-500 mb-3" size={36} />
                    <h3 className="font-display font-bold text-gray-800 text-lg">Aucune opération en attente</h3>
                    <p className="text-sm text-gray-400 mt-1 font-medium">Toutes les transactions sont à jour.</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2 : COMPTES */}
            {activeTab === "accounts" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div><h1 className="font-display font-bold text-3xl text-gray-900">Gestion des Comptes</h1><p className="text-sm text-gray-500 mt-1 font-medium">Liste complète des comptes clients.</p></div>
                  <button onClick={() => { setEditingUser(null); setUserForm({ name: "", email: "", phone: "", address: "Casablanca", role: "Utilisateur", active: true }); setShowUserModal(true); }} className="inline-flex items-center gap-2 bg-[#1E88E5] hover:bg-[#1976D2] text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-blue-500/10 transition-colors cursor-pointer">
                    <UserPlus size={16} /><span>Nouveau Compte Client</span>
                  </button>
                </div>

                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="relative w-full md:max-w-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400"><Search size={16} /></div>
                    <input type="text" placeholder="Rechercher..." value={accountSearch} onChange={(e) => setAccountSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1E88E5] focus:bg-white transition-all font-medium text-gray-800" />
                  </div>
                  <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-end">
                    <div className="flex items-center gap-2"><span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Statut:</span>
                      <select value={accountStatusFilter} onChange={(e) => setAccountStatusFilter(e.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:border-[#1E88E5] transition-all cursor-pointer">
                        <option value="all">Tous</option><option value="Actif">Actif</option><option value="Désactivé">Désactivé</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2"><span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Trier par:</span>
                      <select value={accountSortBy} onChange={(e) => setAccountSortBy(e.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:border-[#1E88E5] transition-all cursor-pointer">
                        <option value="name">Nom</option><option value="balance">Solde</option><option value="createdAt">Date</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse text-sm min-w-[900px] lg:min-w-full">
                      <thead><tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold">
                        <th className="p-4 pl-6">N° Compte</th><th className="p-4">Titulaire</th><th className="p-4 text-right">Solde (DH)</th><th className="p-4 pl-8">Date création</th><th className="p-4 text-center">Statut</th><th className="p-4 text-center pr-6">Actions</th>
                      </tr></thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredAndSortedAccounts.length > 0 ? filteredAndSortedAccounts.map(acc => (
                          <tr key={acc.account_no} className="hover:bg-gray-50/50 transition-colors">
                            <td className="p-4 pl-6 font-mono font-bold text-[#1E88E5]">{acc.account_no}</td>
                            <td className="p-4"><div className="font-semibold text-gray-800">{acc.owner_name}</div><div className="text-xs text-gray-400 font-medium">{acc.email}</div></td>
                            <td className="p-4 text-right font-bold text-gray-900 text-base">{acc.balance?.toLocaleString("fr-FR") || 0} DH</td>
                            <td className="p-4 pl-8 text-gray-500 font-medium">{new Date(acc.created_at).toLocaleDateString("fr-FR")}</td>
                            <td className="p-4 text-center"><span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${acc.status === "Actif" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"}`}>{acc.status}</span></td>
                            <td className="p-4 pr-6">
                              <div className="flex items-center justify-center gap-2">
                                <button onClick={() => { setSelectedViewAccount(acc); setShowViewModal(true); }} className="p-1.5 bg-gray-50 text-gray-500 hover:text-[#1E88E5] rounded-lg border border-gray-100 hover:bg-white hover:border-gray-200 transition-all cursor-pointer" title="Afficher"><Eye size={15} /></button>
                                <button onClick={() => { const usr = usersList.find(u => u.id === acc.owner_id); if (usr) { setEditingUser(usr); setUserForm({ name: usr.name, email: usr.email, phone: usr.phone, address: usr.address, role: usr.role, active: usr.active }); setShowUserModal(true); } }} className="p-1.5 bg-gray-50 text-gray-500 hover:text-amber-600 rounded-lg border border-gray-100 hover:bg-white hover:border-gray-200 transition-all cursor-pointer" title="Modifier"><Edit3 size={15} /></button>
                                <button onClick={() => handleDeleteUser(acc.owner_id)} className="p-1.5 bg-gray-50 text-gray-400 hover:text-red-600 rounded-lg border border-gray-100 hover:bg-white hover:border-gray-200 transition-all cursor-pointer" title="Supprimer"><Trash2 size={15} /></button>
                              </div>
                            </td>
                          </tr>
                        )) : <tr><td colSpan={6} className="p-8 text-center text-gray-400 font-medium">Aucun compte trouvé.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3 : VALIDATION DES COMPTES */}
            {activeTab === "account-validation" && (
              <div className="space-y-6">
                <div><h1 className="font-display font-bold text-3xl text-gray-900">Validation des Comptes</h1><p className="text-sm text-gray-500 mt-1 font-medium">Validez ou refusez les demandes d'inscription.</p></div>
                {pendingAccounts.length > 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto w-full">
                      <table className="w-full text-left border-collapse text-sm min-w-[850px] lg:min-w-full">
                        <thead><tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold">
                          <th className="p-4 pl-6">N° Provisoire</th><th className="p-4">Titulaire</th><th className="p-4">Email</th><th className="p-4">Téléphone</th><th className="p-4">Ville</th><th className="p-4 text-center pr-6">Actions</th>
                        </tr></thead>
                        <tbody className="divide-y divide-gray-100">
                          {pendingAccounts.map(acc => (
                            <tr key={acc.account_no} className="hover:bg-gray-50/50">
                              <td className="p-4 pl-6 font-mono font-bold text-gray-400">{acc.account_no}</td>
                              <td className="p-4 font-semibold text-gray-800">{acc.owner_name}</td>
                              <td className="p-4 text-gray-500 font-medium">{acc.email}</td>
                              <td className="p-4 font-mono text-gray-600 font-bold">{acc.phone}</td>
                              <td className="p-4 text-gray-600 font-medium">{acc.address}</td>
                              <td className="p-4 pr-6">
                                <div className="flex items-center justify-center gap-2">
                                  <button onClick={() => handleValidateAccount(acc.account_no, "accept")} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer">✅ Accepter</button>
                                  <button onClick={() => handleValidateAccount(acc.account_no, "reject")} className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-bold transition-colors cursor-pointer">❌ Refuser</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                    <CheckCircle className="mx-auto text-emerald-500 mb-3" size={40} />
                    <h3 className="font-display font-bold text-gray-800 text-lg">Aucune demande en attente</h3>
                    <p className="text-sm text-gray-400 mt-1 font-medium">Toutes les inscriptions sont traitées.</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4 : HISTORIQUE DES OPÉRATIONS */}
            {activeTab === "transactions" && (
              <div className="space-y-6">
                <div><h1 className="font-display font-bold text-3xl text-gray-900">Historique des Transactions</h1><p className="text-sm text-gray-500 mt-1 font-medium">Toutes les opérations effectuées.</p></div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse text-sm min-w-[900px] lg:min-w-full">
                      <thead><tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold">
                        <th className="p-4 pl-6">Réf.</th><th className="p-4">N° Compte</th><th className="p-4">Date & Heure</th><th className="p-4">Type</th><th className="p-4 text-right">Montant</th><th className="p-4 pl-8">Description</th><th className="p-4 text-center pr-6">Statut</th>
                      </tr></thead>
                      <tbody className="divide-y divide-gray-100">
                        {transactionsList.length > 0 ? transactionsList.map(tx => (
                          <tr key={tx.id} className="hover:bg-gray-50/50">
                            <td className="p-4 pl-6 font-mono font-bold text-gray-400 text-xs">{tx.id}</td>
                            <td className="p-4 font-mono text-gray-700 font-semibold">{tx.account_no}</td>
                            <td className="p-4 text-gray-500 font-medium">{new Date(tx.date).toLocaleDateString("fr-FR")} à {new Date(tx.date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</td>
                            <td className="p-4"><span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${tx.type === "Dépôt" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : tx.type === "Retrait" ? "bg-red-50 text-red-700 border-red-100" : "bg-blue-50 text-blue-700 border-blue-100"}`}>{tx.type}</span></td>
                            <td className="p-4 text-right font-bold text-gray-900 text-base">{tx.amount?.toLocaleString("fr-FR") || 0} DH</td>
                            <td className="p-4 pl-8 text-gray-600 font-medium">{tx.description}</td>
                            <td className="p-4 text-center pr-6"><span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${tx.status === "Validé" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : tx.status === "En attente" ? "bg-amber-50 text-amber-700 border-amber-100 animate-pulse" : "bg-gray-50 text-gray-400 border-gray-100"}`}>{tx.status}</span></td>
                          </tr>
                        )) : <tr><td colSpan={7} className="p-8 text-center text-gray-400 font-medium">Aucune donnée.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5 : VALIDATION DES OPÉRATIONS */}
            {activeTab === "validation" && (
              <div className="space-y-6">
                <div><h1 className="font-display font-bold text-3xl text-gray-900">Validation des Opérations</h1><p className="text-sm text-gray-500 mt-1 font-medium">Autorisez ou rejetez les transactions sensibles.</p></div>
                {pendingTransactions.length > 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto w-full">
                      <table className="w-full text-left border-collapse text-sm min-w-[850px] lg:min-w-full">
                        <thead><tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold">
                          <th className="p-4 pl-6">Réf</th><th className="p-4">N° Compte</th><th className="p-4">Type</th><th className="p-4 text-right">Montant</th><th className="p-4 pl-8">Description</th><th className="p-4 text-center pr-6">Actions</th>
                        </tr></thead>
                        <tbody className="divide-y divide-gray-100">
                          {pendingTransactions.map(tx => (
                            <tr key={tx.id} className="hover:bg-gray-50/50">
                              <td className="p-4 pl-6 font-mono font-bold text-gray-400 text-xs">{tx.id}</td>
                              <td className="p-4 font-mono font-semibold text-gray-700">{tx.account_no}</td>
                              <td className="p-4"><span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">{tx.type}</span></td>
                              <td className="p-4 text-right font-bold text-gray-900 text-base">{tx.amount?.toLocaleString("fr-FR") || 0} DH</td>
                              <td className="p-4 pl-8 text-gray-500 font-medium">{tx.description}</td>
                              <td className="p-4 text-center pr-6">
                                <div className="flex items-center justify-center gap-2">
                                  <button onClick={() => handleValidateTx(tx.id, "validate")} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer">Valider</button>
                                  <button onClick={() => handleValidateTx(tx.id, "reject")} className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-bold transition-colors cursor-pointer">Rejeter</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-sm">
                    <CheckCircle className="mx-auto text-emerald-500 mb-3" size={44} />
                    <h3 className="font-display font-bold text-gray-800 text-lg">Aucune opération en attente</h3>
                    <p className="text-sm text-gray-400 mt-1 font-medium">Toutes les opérations sont validées.</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 6 : PROFIL */}
            {activeTab === "profile" && (
              <div className="space-y-6 max-w-2xl">
                <div><h1 className="font-display font-bold text-3xl text-gray-900">Mon Profil</h1><p className="text-sm text-gray-500 mt-1 font-medium">Modifiez vos informations personnelles.</p></div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
                  <form onSubmit={handleProfileSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div><label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Nom</label><div className="relative"><div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400"><User size={16} /></div><input type="text" required value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1E88E5] focus:bg-white transition-all font-semibold text-gray-800" /></div></div>
                      <div><label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Téléphone</label><div className="relative"><div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400"><Phone size={16} /></div><input type="text" required value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1E88E5] focus:bg-white transition-all font-mono font-semibold text-gray-800" /></div></div>
                    </div>
                    <div><label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Adresse</label><div className="relative"><div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400"><MapPin size={16} /></div><input type="text" required value={profileForm.address} onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1E88E5] focus:bg-white transition-all text-gray-800" /></div></div>
                    <div><label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Nouveau mot de passe (optionnel)</label><div className="relative"><div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400"><Key size={16} /></div><input type="password" placeholder="Laisser vide" value={profileForm.password} onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1E88E5] focus:bg-white transition-all text-gray-800" /></div></div>
                    <button type="submit" className="px-5 py-3 bg-[#1E88E5] hover:bg-[#1976D2] text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-blue-500/15 cursor-pointer flex items-center gap-2"><Save size={16} /><span>Enregistrer</span></button>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
        </main>
      </div>

      {/* MODAL CRÉATION/MODIFICATION UTILISATEUR */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="font-display font-bold text-lg text-gray-900">{editingUser ? `Modifier ${editingUser.name}` : "Ajouter un utilisateur"}</h2>
              <button onClick={() => setShowUserModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
            </div>
            <form onSubmit={handleUserSubmit} className="p-6 space-y-5">
              <div><label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Nom</label><input type="text" required value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1E88E5] focus:bg-white transition-all text-gray-800" /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email</label><input type="email" required value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1E88E5] focus:bg-white transition-all text-gray-800" /></div>
                <div><label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Téléphone</label><input type="tel" required value={userForm.phone} onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1E88E5] focus:bg-white transition-all text-gray-800 font-mono" /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Ville</label><input type="text" required value={userForm.address} onChange={(e) => setUserForm({ ...userForm, address: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1E88E5] focus:bg-white transition-all text-gray-800" /></div>
                <div><label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Rôle</label>
                  <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1E88E5] focus:bg-white transition-all text-gray-800 font-medium">
                    <option value="Utilisateur">Utilisateur</option><option value="Administrateur">Administrateur</option>
                  </select>
                </div>
              </div>
              <div><label className="flex items-center gap-2 mt-2 cursor-pointer"><input type="checkbox" checked={userForm.active} onChange={(e) => setUserForm({ ...userForm, active: e.target.checked })} className="h-4.5 w-4.5 text-[#1E88E5] rounded border-gray-300 focus:ring-[#1E88E5] cursor-pointer" /><span className="text-sm font-medium text-gray-700">Compte Actif</span></label></div>
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setShowUserModal(false)} className="px-4 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-semibold cursor-pointer transition-colors">Annuler</button>
                <button type="submit" className="px-5 py-2.5 bg-[#1E88E5] hover:bg-[#1976D2] text-white rounded-xl text-sm font-semibold cursor-pointer transition-colors">Sauvegarder</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL AFFICHAGE DÉTAILS COMPTE */}
      {showViewModal && selectedViewAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#E3F2FD] text-[#1E88E5] flex items-center justify-center font-bold">{selectedViewAccount.owner_name?.split(" ").map(n => n[0]).join("") || "U"}</div>
                <div><h2 className="font-display font-bold text-lg text-gray-900">{selectedViewAccount.owner_name}</h2><p className="text-xs text-gray-500 font-mono">{selectedViewAccount.account_no}</p></div>
              </div>
              <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div><span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Solde</span><span className="text-2xl font-bold text-[#1E88E5] mt-1 block">{selectedViewAccount.balance?.toLocaleString("fr-FR") || 0} DH</span></div>
                <div><span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Statut</span><div><span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold mt-2 border ${selectedViewAccount.status === "Actif" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"}`}><span className={`w-1.5 h-1.5 rounded-full ${selectedViewAccount.status === "Actif" ? "bg-emerald-500" : "bg-red-500"}`} />{selectedViewAccount.status}</span></div></div>
              </div>
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-2">Informations client</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><span className="text-xs text-gray-400 font-medium block">Email</span><span className="text-sm font-semibold text-gray-800 break-all">{selectedViewAccount.email}</span></div>
                  <div><span className="text-xs text-gray-400 font-medium block">Téléphone</span><span className="text-sm font-mono font-bold text-gray-800">{selectedViewAccount.phone}</span></div>
                  <div><span className="text-xs text-gray-400 font-medium block">Adresse</span><span className="text-sm font-semibold text-gray-800">{selectedViewAccount.address}</span></div>
                  <div><span className="text-xs text-gray-400 font-medium block">Date création</span><span className="text-sm font-semibold text-gray-800">{new Date(selectedViewAccount.created_at).toLocaleDateString("fr-FR")}</span></div>
                </div>
              </div>
            </div>
            <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-end">
              <button onClick={() => setShowViewModal(false)} className="px-5 py-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded-xl text-sm font-semibold cursor-pointer transition-colors">Fermer</button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}