import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Lock,
  Mail,
  Phone,
  MapPin,
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import axios from "axios";
import Logo from "./Logo";

const MOROCCAN_CITIES = [
  "Casablanca",
  "Rabat",
  "Marrakech",
  "Fès",
  "Tanger",
  "Agadir",
  "Oujda",
  "Meknès",
  "Kénitra",
  "Tétouan",
  "Safi",
  "Laâyoune",
  "Nador",
  "El Jadida",
  "Mohammédia",
];

// URL de base de votre API Laravel (à adapter selon votre environnement)
const API_BASE_URL = "http://localhost:8000/api";

export default function AuthPage({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Champs du formulaire
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState(MOROCCAN_CITIES[0]);
  const [customCity, setCustomCity] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Réinitialisation des champs d'inscription
  const resetSignupFields = () => {
    setName("");
    setPhone("");
    setAddress(MOROCCAN_CITIES[0]);
    setCustomCity("");
    setPassword("");
    setConfirmPassword("");
  };

  // Validation du téléphone (10 chiffres)
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(value);
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (isLogin) {
        // Connexion
        const response = await axios.post(`${API_BASE_URL}/auth/login`, {
          email,
          password,
        });

        // Si la réponse est 200, on récupère les données
        const { token, user, account } = response.data;
        onLoginSuccess(token, user, account);
      } else {
        // Inscription
        // Validation du téléphone
        if (phone.length !== 10) {
          throw new Error("Le numéro de téléphone doit comporter exactement 10 chiffres (ex: 0612345678).");
        }

        // Validation de la ville
        if (address === "Autre" && !customCity.trim()) {
          throw new Error("Veuillez saisir le nom de votre ville.");
        }

        // Vérification des mots de passe
        if (password !== confirmPassword) {
          throw new Error("Les mots de passe ne correspondent pas.");
        }

        const finalAddress = address === "Autre" ? customCity.trim() : address;

        // Appel API d'inscription
        await axios.post(`${API_BASE_URL}/auth/register`, {
          name,
          email,
          phone,
          address: finalAddress,
          password,
          password_confirmation: confirmPassword,
        });

        // Succès : on bascule vers la connexion avec l'email pré-rempli
        setSuccess("Compte créé avec succès ! Connectez-vous maintenant.");
        setIsLogin(true);
        const keepEmail = email;
        resetSignupFields();
        setEmail(keepEmail);
      }
    } catch (err) {
      // Gestion des erreurs
      if (err.response) {
        // La requête a été faite et le serveur a répondu avec un code d'erreur
        const status = err.response.status;
        const data = err.response.data;

        if (status === 403) {
          setError("Votre compte est en attente de validation par un administrateur. Vous pourrez vous connecter dès que votre demande sera approuvée.");
        } else if (status === 401) {
          setError("Adresse e-mail ou mot de passe incorrect.");
        } else if (status === 409 || status === 422) {
          setError("Cette adresse e-mail est déjà utilisée. Essayez de vous connecter.");
        } else {
          // Message d'erreur renvoyé par le backend (ex: validations)
          setError(data.message || "Une erreur est survenue. Veuillez réessayer.");
        }
      } else if (err.request) {
        // La requête a été faite mais pas de réponse
        setError("Impossible de contacter le serveur. Vérifiez votre connexion.");
      } else {
        // Autre erreur (ex: configuration)
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-sky-50 via-white to-indigo-50 px-4 py-12 relative overflow-hidden">
      {/* Éléments décoratifs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 md:p-10 relative z-10">
          {/* En-tête */}
          <div className="flex flex-col items-center mb-8">
            <Logo className="h-12 w-12" />
            <h1 className="mt-4 text-center font-display font-bold text-2xl text-gray-900 tracking-tight">
              {isLogin ? "Bienvenue" : "Rejoignez Bank M3ak"}
            </h1>
            <p className="text-sm text-gray-600 mt-1.5 text-center font-medium">
              {isLogin
                ? "Connectez-vous pour gérer vos comptes en toute sécurité"
                : "Créez votre compte et profitez de services 100% en ligne"}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-100/80 p-1 rounded-2xl mb-8">
            <button
              onClick={() => {
                setIsLogin(true);
                setError(null);
                setSuccess(null);
              }}
              className={`flex-1 py-2.5 text-center rounded-xl text-sm font-bold transition-all duration-300 ${
                isLogin
                  ? "bg-white text-[#1E88E5] shadow-lg shadow-blue-500/10"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Connexion
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError(null);
                setSuccess(null);
              }}
              className={`flex-1 py-2.5 text-center rounded-xl text-sm font-bold transition-all duration-300 ${
                !isLogin
                  ? "bg-white text-[#1E88E5] shadow-lg shadow-blue-500/10"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Inscription
            </button>
          </div>

          {/* Messages d'erreur / succès */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-red-50/80 border border-red-200/60 text-red-700 flex items-start gap-3 text-sm font-medium"
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-emerald-50/80 border border-emerald-200/60 text-emerald-700 flex items-start gap-3 text-sm font-medium"
            >
              <CheckCircle className="w-5 h-5 shrink-0 mt-0.5 text-emerald-500" />
              <span>{success}</span>
            </motion.div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <>
                {/* Nom complet */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Nom complet
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Ahmed Alaoui"
                      className="w-full pl-11 pr-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E88E5]/50 focus:border-[#1E88E5] focus:bg-white transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Téléphone */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Téléphone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={handlePhoneChange}
                      placeholder="Ex: 0612345678"
                      className="w-full pl-11 pr-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E88E5]/50 focus:border-[#1E88E5] focus:bg-white transition-all duration-200 font-mono"
                    />
                  </div>
                  {phone && phone.length !== 10 && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1.5 text-xs text-red-500 font-medium"
                    >
                      {phone.length}/10 chiffres
                    </motion.p>
                  )}
                </div>

                {/* Ville */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Ville
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1E88E5]/50 focus:border-[#1E88E5] focus:bg-white transition-all duration-200 appearance-none cursor-pointer"
                    >
                      {MOROCCAN_CITIES.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                      <option value="Autre">Autre (saisir)</option>
                    </select>
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">
                      ▼
                    </span>
                  </div>
                </div>

                {/* Ville personnalisée */}
                {address === "Autre" && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1"
                  >
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Saisissez votre ville
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        required
                        value={customCity}
                        onChange={(e) => setCustomCity(e.target.value)}
                        placeholder="Ex: Errachidia"
                        className="w-full pl-11 pr-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E88E5]/50 focus:border-[#1E88E5] focus:bg-white transition-all duration-200"
                      />
                    </div>
                  </motion.div>
                )}
              </>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Adresse e-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ex: ahmed@gmail.com"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E88E5]/50 focus:border-[#1E88E5] focus:bg-white transition-all duration-200"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E88E5]/50 focus:border-[#1E88E5] focus:bg-white transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirmation mot de passe (inscription) */}
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E88E5]/50 focus:border-[#1E88E5] focus:bg-white transition-all duration-200"
                  />
                </div>
              </div>
            )}

            {/* Bouton de soumission */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#1E88E5] hover:bg-[#1976D2] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-all duration-200 shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 mt-6 group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isLogin ? "Se connecter" : "Créer un compte"}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Pied de page */}
          <p className="text-center text-xs text-gray-400 mt-6">
            {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setSuccess(null);
              }}
              className="ml-1 text-[#1E88E5] font-semibold hover:underline focus:outline-none"
            >
              {isLogin ? "Inscrivez-vous" : "Connectez-vous"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}