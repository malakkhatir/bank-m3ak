# Bank M3ak

Bank M3ak est une application web bancaire destinée aux utilisateurs et aux administrateurs. Cette partie du projet est le **frontend** : elle fournit les écrans de connexion, l’espace client et l’espace d’administration, et communique avec une API backend.

> L’interface est configurée pour appeler l’API à `http://localhost:8000/api`. Le backend doit être démarré séparément pour utiliser les fonctions qui nécessitent des données ou des opérations bancaires.

## Fonctionnalités

### Accès et inscription

- Connexion par adresse e-mail et mot de passe.
- Création d’un compte avec nom, e-mail, téléphone, ville et mot de passe.
- Sélection d’une ville marocaine proposée ou saisie d’une autre ville.
- Vérification côté interface du numéro de téléphone (10 chiffres) et de la confirmation du mot de passe.
- Affichage des erreurs et confirmations retournées lors des échanges avec l’API.
- Les inscriptions peuvent nécessiter une validation administrative avant la connexion.
- Conservation de la session dans le stockage local du navigateur et déconnexion.
- Redirection vers l’espace adapté au rôle : administrateur ou utilisateur.

### Espace client

- **Tableau de bord** : solde, numéro de compte, dernière transaction, nombre d’opérations et aperçu de la carte virtuelle.
- **Détails du compte** : titulaire, numéro et statut du compte, date d’ouverture, solde et informations de la banque.
- **Dépôt** : soumission d’un montant et d’un motif. L’interface signale les dépôts de 10 000 DH ou plus comme nécessitant une validation administrative.
- **Retrait** : soumission d’un montant et d’un motif. L’interface signale les retraits de 5 000 DH ou plus comme nécessitant une validation administrative.
- **Virement** : transfert vers un numéro de compte Bank M3ak, avec montant et description. L’interface signale les virements de 3 000 DH ou plus comme nécessitant une validation administrative.
- **Historique** : consultation des transactions du client.
- **Profil** : modification du nom, du téléphone, de l’adresse et éventuellement du mot de passe.
- Avertissement en cas de compte désactivé, notamment sur le blocage des opérations sortantes.

### Espace administrateur

- **Tableau de bord** : indicateurs sur les utilisateurs, comptes, transactions, comptes désactivés et opérations en attente.
- **Gestion des comptes** : recherche et filtrage par statut, tri par titulaire, solde ou date de création, affichage des détails.
- **Gestion des utilisateurs** : création, modification, activation/désactivation et suppression.
- **Validation des inscriptions** : acceptation ou refus des demandes de création de compte.
- **Validation des opérations** : validation ou rejet des transactions en attente.
- **Historique des opérations** : consultation de la liste des transactions.
- **Profil administrateur** : modification des informations personnelles et du mot de passe.

Les validations, règles métier et mises à jour des soldes sont gérées par le backend. Les seuils mentionnés ci-dessus sont des avertissements affichés dans l’interface et ne remplacent pas les contrôles serveur.

## Technologies

- React 19 et React Router
- Vite
- Tailwind CSS
- Axios pour les appels HTTP
- Motion pour les animations
- Lucide React pour les icônes

## Installation et démarrage

Prérequis : Node.js et npm.

```bash
npm install
npm run dev
```

Vite affiche ensuite l’adresse locale à ouvrir dans le navigateur (généralement `http://localhost:5173`).

Pour compiler l’application :

```bash
npm run build
```

Pour vérifier le code avec Oxlint :

```bash
npm run lint
```

Pour prévisualiser le build :

```bash
npm run preview
```

## Connexion au backend

L’URL de base de l’API est actuellement définie dans les composants d’authentification et les tableaux de bord :

```text
http://localhost:8000/api
```

Pour utiliser une autre instance, adaptez cette URL dans `src/components/AuthPage.jsx`, `src/components/UserDashboard.jsx` et `src/components/AdminDashboard.jsx`. Les appels aux routes protégées transmettent le jeton de session dans l’en-tête `Authorization`.

### Routes API consommées

| Méthode | Route | Usage |
|---|---|---|
| `POST` | `/auth/login` | Connexion |
| `POST` | `/auth/register` | Inscription |
| `GET` | `/auth/me` | Chargement du compte du client |
| `GET` | `/transactions` | Historique du client |
| `POST` | `/user/deposit` | Dépôt |
| `POST` | `/user/withdraw` | Retrait |
| `POST` | `/user/transfer` | Virement |
| `PUT` | `/user/profile` | Mise à jour du profil |
| `GET` | `/admin/users` | Liste des utilisateurs |
| `POST`, `PUT`, `DELETE` | `/admin/users` et `/admin/users/{id}` | Gestion des utilisateurs |
| `GET` | `/admin/accounts` | Liste des comptes |
| `POST` | `/admin/accounts/{accountNo}/validate-registration` | Validation d’une inscription |
| `POST` | `/admin/accounts/{accountNo}/toggle` | Activation ou désactivation d’un compte |
| `GET` | `/admin/transactions` | Liste des transactions |
| `POST` | `/admin/transactions/{id}/validate` | Validation ou rejet d’une transaction |

## Structure du projet

```text
src/
├── components/
│   ├── AdminDashboard.jsx   # Espace et outils d’administration
│   ├── AuthPage.jsx         # Connexion et inscription
│   ├── Logo.jsx             # Logo de l’application
│   └── UserDashboard.jsx    # Espace client et opérations bancaires
├── routes/
│   └── ProtectedRoute.jsx   # Protection des routes selon la session et le rôle
├── App.jsx                  # Routes et gestion de la session
├── index.css                # Styles globaux
└── main.jsx                 # Point d’entrée React
```
