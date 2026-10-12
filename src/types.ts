export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: "Administrateur" | "Utilisateur";
  active: boolean;
  createdAt: string;
}

export interface BankAccount {
  accountNo: string;
  ownerId: number;
  ownerName: string;
  balance: number;
  createdAt: string;
  status: "Actif" | "Désactivé";
  pendingValidation?: boolean;
}

export interface Transaction {
  id: string;
  accountNo: string;
  date: string;
  type: "Dépôt" | "Retrait" | "Virement";
  amount: number;
  description: string;
  status: "Validé" | "En attente" | "Rejeté";
}
