import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  Landmark,
  ArrowLeftRight,
  LogOut,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownLeft,
  User,
  Phone,
  MapPin,
  Key,
  Save,
  RefreshCw,
  CreditCard,
  ChevronRight,
  AlertTriangle,
  HelpCircle,
  Menu,
} from "lucide-react";
import Logo from "./Logo";

// URL de base de votre API (à adapter)
const API_BASE_URL = "http://localhost:8000/api";

export default function UserDashboard({
  user,
  initialAccount,
  token,
  onLogout,
  onProfileUpdate,
}) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [account, setAccount] = useState(initialAccount);
  const [transactionsList, setTransactionsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Form Fields
  const [depositAmount, setDepositAmount] = useState("");
  const [depositDesc, setDepositDesc] = useState("");

  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawDesc, setWithdrawDesc] = useState("");

  const [transferDest, setTransferDest] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferDesc, setTransferDesc] = useState("");

  // Self Profile Form
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
    password: "",
  });

  // Instance Axios avec le token
  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { Authorization: `Bearer ${token}` },
  });

  // Fetch client data
  const fetchClientData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Récupérer le profil et le compte
      const meRes = await api.get("/auth/me");
      setAccount(meRes.data.account);

      // Récupérer les transactions
      const txRes = await api.get("/transactions");
      setTransactionsList(Array.isArray(txRes.data) ? txRes.data : []);
    } catch (err) {
      console.error("Erreur fetchClientData:", err);
      setError(
        err.response?.data?.message || err.message || "Erreur de communication avec le serveur."
      );
      setTransactionsList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchClientData();
    }
  }, [token]);

  // Handle Deposit
  const handleDeposit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await api.post("/user/deposit", {
        amount: depositAmount,
        description: depositDesc,
      });
      setSuccessMsg(res.data.message);
      setDepositAmount("");
      setDepositDesc("");
      fetchClientData();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  // Handle Withdraw
  const handleWithdraw = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await api.post("/user/withdraw", {
        amount: withdrawAmount,
        description: withdrawDesc,
      });
      setSuccessMsg(res.data.message);
      setWithdrawAmount("");
      setWithdrawDesc("");
      fetchClientData();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  // Handle Transfer
  const handleTransfer = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await api.post("/user/transfer", {
        destinationAccountNo: transferDest,
        amount: transferAmount,
        description: transferDesc,
      });
      setSuccessMsg(res.data.message);
      setTransferDest("");
      setTransferAmount("");
      setTransferDesc("");
      fetchClientData();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  // Handle Profile Update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await api.put("/user/profile", profileForm);
      setSuccessMsg("Votre profil a été mis à jour.");
      if (onProfileUpdate) onProfileUpdate(res.data.user);
      fetchClientData();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  // Metrics
  const currentBalance = account ? account.balance : 0;
  const totalTxsCount = transactionsList.length;
  const lastTx = transactionsList[0] || null;

  // Si l'utilisateur n'est pas chargé
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
      <aside
        className={`fixed inset-y-0 left-0 z-50 md:z-auto w-64 bg-white border-r border-gray-200 flex flex-col h-full shrink-0 transform md:transform-none md:relative transition-transform duration-300 ease-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <Logo className="h-5 w-5" />
          <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-mono font-semibold tracking-wider uppercase border border-blue-100">
            Client
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <button
            onClick={() => {
              setActiveTab("dashboard");
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center text-left gap-3 px-4 py-3 rounded-lg text-sm transition-colors cursor-pointer ${
              activeTab === "dashboard"
                ? "bg-[#E3F2FD] text-[#1E88E5] font-semibold"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <Landmark size={18} />
            <span className="text-left">Tableau de bord</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("account");
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center text-left gap-3 px-4 py-3 rounded-lg text-sm transition-colors cursor-pointer ${
              activeTab === "account"
                ? "bg-[#E3F2FD] text-[#1E88E5] font-semibold"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <CreditCard size={18} />
            <span className="text-left">Mon compte</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("deposit");
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center text-left gap-3 px-4 py-3 rounded-lg text-sm transition-colors cursor-pointer ${
              activeTab === "deposit"
                ? "bg-[#E3F2FD] text-[#1E88E5] font-semibold"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <ArrowDownLeft size={18} />
            <span className="text-left">Dépôt</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("withdraw");
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center text-left gap-3 px-4 py-3 rounded-lg text-sm transition-colors cursor-pointer ${
              activeTab === "withdraw"
                ? "bg-[#E3F2FD] text-[#1E88E5] font-semibold"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <ArrowUpRight size={18} />
            <span className="text-left">Retrait</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("transfer");
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center text-left gap-3 px-4 py-3 rounded-lg text-sm transition-colors cursor-pointer ${
              activeTab === "transfer"
                ? "bg-[#E3F2FD] text-[#1E88E5] font-semibold"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <ArrowLeftRight size={18} />
            <span className="text-left">Virement</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("history");
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center text-left gap-3 px-4 py-3 rounded-lg text-sm transition-colors cursor-pointer ${
              activeTab === "history"
                ? "bg-[#E3F2FD] text-[#1E88E5] font-semibold"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <ArrowLeftRight size={18} />
            <span className="text-left">Historique</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("profile");
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center text-left gap-3 px-4 py-3 rounded-lg text-sm transition-colors cursor-pointer ${
              activeTab === "profile"
                ? "bg-[#E3F2FD] text-[#1E88E5] font-semibold"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <User size={18} />
            <span className="text-left">Profil</span>
          </button>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => {
              onLogout();
              setSidebarOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <LogOut size={18} />
            <span>Se déconnecter</span>
          </button>
        </div>
      </aside>

      {/* CONTENT WINDOW */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* HEADER */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 -ml-2 text-gray-500 hover:text-gray-900 rounded-lg md:hidden hover:bg-gray-50 focus:outline-none cursor-pointer"
              aria-label="Menu"
            >
              <Menu size={24} />
            </button>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-800 capitalize">
                {activeTab === "dashboard" && "Tableau de Bord"}
                {activeTab === "account" && "Détails du Compte"}
                {activeTab === "deposit" && "Faire un Dépôt"}
                {activeTab === "withdraw" && "Demande de Retrait"}
                {activeTab === "transfer" && "Faire un Virement"}
                {activeTab === "history" && "Historique des Transactions"}
                {activeTab === "profile" && "Mon Profil Client"}
              </h2>
              <p className="text-xs text-gray-500 hidden sm:block">
                Espace client sécurisé • Bank M3ak Maroc
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold text-gray-800">{user.name}</div>
                <div className="text-xs text-gray-500">Client Particulier</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-50 border-2 border-white overflow-hidden flex items-center justify-center text-[#1E88E5] font-bold shadow-sm">
                {user.name.split(" ").map((n) => n[0]).join("")}
              </div>
            </div>
          </div>
        </header>

        {/* SCROLLABLE BODY */}
        <main className="p-8 flex-1 overflow-y-auto space-y-6">
          {/* Messages */}
          <AnimatePresence>
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl text-sm font-medium flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle size={18} className="text-emerald-500" />
                  <span>{successMsg}</span>
                </div>
                <button
                  onClick={() => setSuccessMsg(null)}
                  className="text-emerald-400 hover:text-emerald-600 text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl text-sm font-medium flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <XCircle size={18} className="text-red-500" />
                  <span>{error}</span>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-600 text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* LOADING OVERLAY */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-10 h-10 border-4 border-[#1E88E5] border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-500 font-medium">Chargement...</span>
            </div>
          )}

          {!loading && (
            <>
              {/* TAB 1: DASHBOARD */}
              {activeTab === "dashboard" && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="font-display font-bold text-3xl text-gray-900">
                        Bienvenue, {user.name}
                      </h1>
                      <p className="text-sm text-gray-500 mt-1 font-medium">
                        Gérez vos fonds et suivez vos transactions en temps réel.
                      </p>
                    </div>
                  </div>

                  {account?.status === "Désactivé" && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm font-medium flex items-center gap-3">
                      <AlertTriangle className="text-red-500 shrink-0" size={20} />
                      <div>
                        <p className="font-semibold">
                          Votre compte bancaire est temporairement inactif
                        </p>
                        <p className="text-xs text-red-600 mt-0.5">
                          Toutes les transactions sortantes sont bloquées. Veuillez
                          contacter l'administrateur.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Bento cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between min-h-[160px]">
                      <div>
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                          Solde Disponible
                        </span>
                        <div className="flex items-baseline gap-1 mt-3">
                          <span className="text-3xl font-display font-bold text-[#1E88E5]">
                            {currentBalance.toLocaleString("fr-FR")}
                          </span>
                          <span className="text-sm font-semibold text-gray-400">DH</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4 text-xs text-gray-400 font-medium">
                        <span className="font-mono bg-gray-50 px-2.5 py-1 rounded border border-gray-100">
                          {account ? account.account_no : "BM-XXXXXXX"}
                        </span>
                        <span className="bg-[#E3F2FD] text-[#1E88E5] px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold">
                          Morocco
                        </span>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between min-h-[160px]">
                      <div>
                        <span className="text-xs font-semibold text-gray-400 tracking-wider uppercase block">
                          Dernière transaction
                        </span>
                        {lastTx ? (
                          <div className="mt-3">
                            <span
                              className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                                lastTx.type === "Dépôt"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-red-50 text-red-700"
                              }`}
                            >
                              {lastTx.type === "Dépôt" ? "+" : "-"}{" "}
                              {lastTx.amount.toLocaleString("fr-FR")} DH
                            </span>
                            <p className="text-sm font-semibold text-gray-700 mt-2 line-clamp-1">
                              {lastTx.description}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400 mt-4">
                            Aucune opération récente
                          </p>
                        )}
                      </div>
                      {lastTx && (
                        <span className="text-xs text-gray-400 font-mono block mt-2">
                          {new Date(lastTx.date).toLocaleDateString("fr-FR")}
                        </span>
                      )}
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between min-h-[160px]">
                      <div>
                        <span className="text-xs font-semibold text-gray-400 tracking-wider uppercase block">
                          Total Opérations
                        </span>
                        <span className="text-4xl font-bold text-gray-800 block mt-3">
                          {totalTxsCount}
                        </span>
                      </div>
                      <button
                        onClick={() => setActiveTab("history")}
                        className="text-xs text-[#1E88E5] hover:text-[#1976D2] font-semibold flex items-center gap-1 mt-2 cursor-pointer transition-colors"
                      >
                        <span>Voir l'historique</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Règles de sécurité */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
                    <div className="lg:col-span-1 space-y-4">
                      <h3 className="font-display font-semibold text-gray-700 text-sm uppercase tracking-wider">
                        Ma Carte Virtuelle
                      </h3>
                      <div className="relative w-full aspect-[1.586/1] rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-900 text-white p-6 overflow-hidden shadow-md flex flex-col justify-between border border-slate-700">
                        <div className="absolute top-0 right-0 w-44 h-44 bg-blue-500/10 rounded-full blur-2xl"></div>
                        <div className="flex items-start justify-between relative z-10">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-medium">
                              Bank M3ak
                            </span>
                            <span className="text-xs text-blue-400 block mt-0.5">
                              Morocco Gold Premium
                            </span>
                          </div>
                          <div className="w-10 h-8 bg-amber-400/20 rounded-md border border-amber-400/30 flex items-center justify-center font-mono text-[9px] text-amber-200 uppercase">
                            Chip
                          </div>
                        </div>

                        <div className="my-auto relative z-10">
                          <span className="text-lg md:text-xl font-mono tracking-widest block">
                            {account
                              ? `4000 7800 1200 ${account.account_no?.split("-")[1] || "0000"}`
                              : "4000 0000 0000 0000"}
                          </span>
                        </div>

                        <div className="flex items-end justify-between relative z-10">
                          <div>
                            <span className="text-[8px] text-slate-500 uppercase block">
                              Titulaire
                            </span>
                            <span className="text-xs font-semibold uppercase tracking-wider block">
                              {user.name}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[8px] text-slate-500 uppercase block">
                              Exp.
                            </span>
                            <span className="text-xs font-mono block">12/29</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-2 space-y-4">
                      <h3 className="font-display font-semibold text-gray-700 text-sm uppercase tracking-wider">
                        Règles de sécurité Bank M3ak
                      </h3>
                      <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-emerald-600 uppercase block">
                            Dépôts libres
                          </span>
                          <p className="text-sm text-gray-800 font-bold">
                            Jusqu'à 10 000 DH
                          </p>
                          <p className="text-xs text-gray-400 leading-relaxed mt-1">
                            Dépôts plus élevés validés par l'administration.
                          </p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-red-500 uppercase block">
                            Retraits immédiats
                          </span>
                          <p className="text-sm text-gray-800 font-bold">
                            Moins de 5 000 DH
                          </p>
                          <p className="text-xs text-gray-400 leading-relaxed mt-1">
                            Retraits plus élevés soumis à validation pour sécurité.
                          </p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-blue-600 uppercase block">
                            Virements Maroc
                          </span>
                          <p className="text-sm text-gray-800 font-bold">
                            Seulement vers Bank M3ak
                          </p>
                          <p className="text-xs text-gray-400 leading-relaxed mt-1">
                            Transferts {'>'} 3 000 DH validés manuellement.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ACCOUNT DETAILS */}
              {activeTab === "account" && (
                <div className="space-y-6 max-w-3xl">
                  <div>
                    <h1 className="font-display font-bold text-3xl text-gray-900">
                      Détails de mon Compte
                    </h1>
                    <p className="text-sm text-gray-500 mt-1 font-medium">
                      Informations officielles sur votre affiliation Bank M3ak.
                    </p>
                  </div>

                  {account ? (
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-6 border-b border-gray-100">
                        <div>
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest block">
                            Numéro de Compte
                          </span>
                          <span className="text-2xl font-mono font-bold text-[#1E88E5] mt-1 block">
                            {account.account_no}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest block text-left sm:text-right">
                            Statut du Compte
                          </span>
                          <span
                            className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold mt-1.5 border ${
                              account.status === "Actif"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                : "bg-red-50 text-red-700 border-red-100"
                            }`}
                          >
                            {account.status}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <span className="text-xs text-gray-400 uppercase font-semibold block">
                            Titulaire officiel
                          </span>
                          <span className="text-base text-gray-800 font-semibold mt-1 block">
                            {account.owner_name}
                          </span>
                        </div>

                        <div>
                          <span className="text-xs text-gray-400 uppercase font-semibold block">
                            Date d'ouverture
                          </span>
                          <span className="text-base text-gray-800 font-semibold mt-1 block">
                            {new Date(account.created_at).toLocaleDateString("fr-FR")} à{" "}
                            {new Date(account.created_at).toLocaleTimeString("fr-FR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <div>
                          <span className="text-xs text-gray-400 uppercase font-semibold block">
                            Banque Émettrice
                          </span>
                          <span className="text-base text-gray-800 font-semibold mt-1 block">
                            Bank M3ak - Succursale Centrale Casablanca
                          </span>
                        </div>

                        <div>
                          <span className="text-xs text-gray-400 uppercase font-semibold block">
                            Devise Officielle
                          </span>
                          <span className="text-base text-gray-800 font-semibold mt-1 block">
                            Dirham Marocain (DH)
                          </span>
                        </div>
                      </div>

                      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold text-gray-400 uppercase block">
                            Solde Réel Garanti
                          </span>
                          <span className="text-3xl font-display font-bold text-gray-900 mt-1 block">
                            {account.balance.toLocaleString()} DH
                          </span>
                        </div>
                        <div className="p-4 bg-white rounded-xl border border-gray-100 font-semibold text-sm text-gray-600 shadow-xs">
                          💳 Visa Gold
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
                      <p className="text-gray-500 font-medium">
                        Aucun compte bancaire associé à ce compte d'utilisateur.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: DEPOSIT */}
              {activeTab === "deposit" && (
                <div className="space-y-6 max-w-xl">
                  <div>
                    <h1 className="font-display font-bold text-3xl text-gray-900">
                      Effectuer un Dépôt
                    </h1>
                    <p className="text-sm text-gray-500 mt-1 font-medium">
                      Alimentez instantanément votre compte bancaire en ligne.
                    </p>
                  </div>

                  <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm">
                    <form onSubmit={handleDeposit} className="space-y-5">
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                          Montant du dépôt (DH)
                        </label>
                        <input
                          type="number"
                          required
                          min="10"
                          placeholder="Ex: 1500"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1E88E5] focus:bg-white transition-all font-semibold text-gray-800"
                        />
                        {parseFloat(depositAmount) >= 10000 && (
                          <span className="text-xs text-amber-600 font-semibold mt-2 flex items-center gap-1.5">
                            ⚠️ Les dépôts de 10 000 DH et plus requièrent une validation
                            administrative manuelle.
                          </span>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                          Description / Motif du dépôt
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Versement d'espèces"
                          value={depositDesc}
                          onChange={(e) => setDepositDesc(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1E88E5] focus:bg-white transition-all text-gray-800"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 bg-[#1E88E5] hover:bg-[#1976D2] text-white font-semibold rounded-xl text-sm shadow-md shadow-blue-500/10 transition-colors cursor-pointer"
                      >
                        Effectuer le dépôt
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 4: WITHDRAW */}
              {activeTab === "withdraw" && (
                <div className="space-y-6 max-w-xl">
                  <div>
                    <h1 className="font-display font-bold text-3xl text-gray-900">
                      Effectuer un Retrait
                    </h1>
                    <p className="text-sm text-gray-500 mt-1 font-medium">
                      Retirez des fonds virtuellement de votre compte.
                    </p>
                  </div>

                  <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm">
                    <form onSubmit={handleWithdraw} className="space-y-5">
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                          Montant du retrait (DH)
                        </label>
                        <input
                          type="number"
                          required
                          min="10"
                          placeholder="Ex: 500"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1E88E5] focus:bg-white transition-all font-semibold text-gray-800"
                        />
                        {parseFloat(withdrawAmount) >= 5000 && (
                          <span className="text-xs text-amber-600 font-semibold mt-2 flex items-center gap-1.5">
                            ⚠️ Les retraits de 5 000 DH et plus requièrent une validation
                            administrative par sécurité.
                          </span>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                          Description / Motif du retrait
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Retrait guichet automatique"
                          value={withdrawDesc}
                          onChange={(e) => setWithdrawDesc(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1E88E5] focus:bg-white transition-all text-gray-800"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 bg-[#1E88E5] hover:bg-[#1976D2] text-white font-semibold rounded-xl text-sm shadow-md shadow-blue-500/10 transition-colors cursor-pointer"
                      >
                        Effectuer le retrait
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 5: TRANSFER */}
              {activeTab === "transfer" && (
                <div className="space-y-6 max-w-xl">
                  <div>
                    <h1 className="font-display font-bold text-3xl text-gray-900">
                      Effectuer un Virement
                    </h1>
                    <p className="text-sm text-gray-500 mt-1 font-medium">
                      Transférez des fonds à n'importe quel autre compte de Bank M3ak au
                      Maroc.
                    </p>
                  </div>

                  <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm">
                    <form onSubmit={handleTransfer} className="space-y-5">
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                          Numéro de compte destinataire
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="BM-XXXXXXX"
                          value={transferDest}
                          onChange={(e) => setTransferDest(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1E88E5] focus:bg-white transition-all font-mono uppercase font-bold text-gray-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                          Montant (DH)
                        </label>
                        <input
                          type="number"
                          required
                          min="10"
                          placeholder="Ex: 1000"
                          value={transferAmount}
                          onChange={(e) => setTransferAmount(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1E88E5] focus:bg-white transition-all font-semibold text-gray-800"
                        />
                        {parseFloat(transferAmount) >= 3000 && (
                          <span className="text-xs text-amber-600 font-semibold mt-2 flex items-center gap-1.5">
                            ⚠️ Les virements de 3 000 DH et plus requièrent l'accord d'un
                            administrateur par mesure anti-fraude.
                          </span>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                          Description
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Remboursement ami"
                          value={transferDesc}
                          onChange={(e) => setTransferDesc(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1E88E5] focus:bg-white transition-all text-gray-800"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 bg-[#1E88E5] hover:bg-[#1976D2] text-white font-semibold rounded-xl text-sm shadow-md shadow-blue-500/10 transition-colors cursor-pointer"
                      >
                        Valider
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 6: HISTORY */}
              {activeTab === "history" && (
                <div className="space-y-6">
                  <div>
                    <h1 className="font-display font-bold text-3xl text-gray-900">
                      Mon Historique
                    </h1>
                    <p className="text-sm text-gray-500 mt-1 font-medium">
                      Relevé de compte en temps réel de vos opérations bancaires.
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto w-full">
                      <table className="w-full text-left border-collapse text-sm min-w-[750px] lg:min-w-full">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold">
                            <th className="p-4 pl-6">Référence</th>
                            <th className="p-4">Date de valeur</th>
                            <th className="p-4">Type</th>
                            <th className="p-4 text-right">Montant</th>
                            <th className="p-4 pl-8">Description</th>
                            <th className="p-4 pr-6 text-center">Statut</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {transactionsList.map((tx) => (
                            <tr
                              key={tx.id}
                              className="hover:bg-gray-50/50 transition-colors"
                            >
                              <td className="p-4 pl-6 font-mono text-gray-400 text-xs font-bold">
                                {tx.id}
                              </td>
                              <td className="p-4 text-gray-500 font-medium">
                                {new Date(tx.date).toLocaleDateString("fr-FR")} à{" "}
                                {new Date(tx.date).toLocaleTimeString("fr-FR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </td>
                              <td className="p-4">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                    tx.type === "Dépôt"
                                      ? "bg-emerald-50 text-emerald-700"
                                      : "bg-red-50 text-red-700"
                                  }`}
                                >
                                  {tx.type}
                                </span>
                              </td>
                              <td
                                className={`p-4 text-right font-bold text-base ${
                                  tx.type === "Dépôt" ? "text-emerald-600" : "text-gray-800"
                                }`}
                              >
                                {tx.type === "Dépôt" ? "+" : "-"}{" "}
                                {tx.amount.toLocaleString("fr-FR")} DH
                              </td>
                              <td className="p-4 pl-8 text-gray-600 font-medium">
                                {tx.description}
                              </td>
                              <td className="p-4 pr-6 text-center">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                                    tx.status === "Validé"
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                      : tx.status === "En attente"
                                      ? "bg-amber-50 text-amber-700 border-amber-100 animate-pulse"
                                      : "bg-red-50 text-red-600 border-red-100"
                                  }`}
                                >
                                  {tx.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                          {transactionsList.length === 0 && (
                            <tr>
                              <td colSpan={6} className="p-8 text-center text-gray-400 font-medium">
                                Aucune donnée disponible.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: PROFILE */}
              {activeTab === "profile" && (
                <div className="space-y-6 max-w-xl">
                  <div>
                    <h1 className="font-display font-bold text-3xl text-gray-900">
                      Modifier mon Profil
                    </h1>
                    <p className="text-sm text-gray-500 mt-1 font-medium">
                      Ajustez vos informations d'affiliation personnelle.
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
                    <form onSubmit={handleProfileSubmit} className="space-y-5">
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                          Nom Complet
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                            <User size={16} />
                          </div>
                          <input
                            type="text"
                            required
                            value={profileForm.name}
                            onChange={(e) =>
                              setProfileForm({ ...profileForm, name: e.target.value })
                            }
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1E88E5] focus:bg-white transition-all font-semibold text-gray-800"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                          Téléphone
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                            <Phone size={16} />
                          </div>
                          <input
                            type="text"
                            required
                            value={profileForm.phone}
                            onChange={(e) =>
                              setProfileForm({ ...profileForm, phone: e.target.value })
                            }
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1E88E5] focus:bg-white transition-all font-mono text-gray-800"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                          Adresse
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                            <MapPin size={16} />
                          </div>
                          <input
                            type="text"
                            required
                            value={profileForm.address}
                            onChange={(e) =>
                              setProfileForm({ ...profileForm, address: e.target.value })
                            }
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1E88E5] focus:bg-white transition-all text-gray-800"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                          Nouveau Mot de passe (optionnel)
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                            <Key size={16} />
                          </div>
                          <input
                            type="password"
                            placeholder="Laisser vide pour ne pas modifier"
                            value={profileForm.password}
                            onChange={(e) =>
                              setProfileForm({ ...profileForm, password: e.target.value })
                            }
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1E88E5] focus:bg-white transition-all text-gray-800"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 bg-[#1E88E5] hover:bg-[#1976D2] text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-blue-500/15 cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Save size={16} />
                        <span>Enregistrer les modifications</span>
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}