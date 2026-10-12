<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Account;
use App\Models\Transaction;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    /**
     * Get transactions on user's own account
     */
    public function getTransactions(Request $request)
    {
        try {
            $user = $request->user();
            $account = Account::where('owner_id', $user->id)->first();
            
            if (!$account) {
                return response()->json([]); // Tableau vide
            }

            $transactions = Transaction::where('account_no', $account->account_no)
                ->orderBy('date', 'desc')
                ->get();

            return response()->json($transactions);
        } catch (\Exception $e) {
            Log::error('Erreur getTransactions: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur serveur.'], 500);
        }
    }

    /**
     * Look up other client name by account number (for transfer form)
     */
    public function lookupAccount($accountNo)
    {
        $account = Account::where('account_no', $accountNo)->first();
        if (!$account) {
            return response()->json(['error' => 'Compte non trouvé'], 404);
        }

        return response()->json([
            'accountNo' => $account->account_no,
            'ownerName' => $account->owner_name,
            'status' => $account->status
        ]);
    }

    /**
     * Edit own client profile
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();
        
        $fields = $request->validate([
            'name' => 'string|max:255',
            'phone' => 'string',
            'address' => 'string',
            'password' => 'string|min:6|nullable'
        ]);

        if (isset($fields['name'])) $user->name = $fields['name'];
        if (isset($fields['phone'])) $user->phone = $fields['phone'];
        if (isset($fields['address'])) $user->address = $fields['address'];
        if (!empty($fields['password'])) $user->password = bcrypt($fields['password']);

        $user->save();

        // Sync name into Account cache
        $account = Account::where('owner_id', $user->id)->first();
        if ($account && isset($fields['name'])) {
            $account->owner_name = $fields['name'];
            $account->save();
        }

        return response()->json([
            'message' => 'Profil mis à jour avec succès.',
            'user' => $user
        ]);
    }

    /**
     * Client Online Deposit
     */
    public function deposit(Request $request)
    {
        try {
            $user = $request->user();
            $account = Account::where('owner_id', $user->id)->firstOrFail();

            if ($account->status === 'Désactivé') {
                return response()->json(['error' => 'Votre compte est inactif.'], 403);
            }

            $fields = $request->validate([
                'amount' => 'required|numeric|min:10',
                'description' => 'string|nullable'
            ]);

            $amount = floatval($fields['amount']);
            $requireValidation = $amount >= 10000;
            
            $tx = Transaction::create([
                'id' => 'TX-' . mt_rand(10000, 99999),
                'account_no' => $account->account_no,
                'date' => now(),
                'type' => 'Dépôt',
                'amount' => $amount,
                'description' => $fields['description'] ?? 'Dépôt en ligne',
                'status' => $requireValidation ? 'En attente' : 'Validé'
            ]);

            if (!$requireValidation) {
                $account->balance += $amount;
                $account->save();
            }

            return response()->json([
                'message' => $requireValidation 
                    ? "Dépôt en attente de validation."
                    : "Dépôt effectué avec succès.",
                'transaction' => $tx,
                'account' => $account
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur deposit: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur serveur.'], 500);
        }
    }

    /**
     * Client Online Withdrawal
     */
    public function withdraw(Request $request)
    {
        try {
            $user = $request->user();
            $account = Account::where('owner_id', $user->id)->firstOrFail();

            if ($account->status === 'Désactivé') {
                return response()->json(['error' => 'Votre compte est inactif.'], 403);
            }

            $fields = $request->validate([
                'amount' => 'required|numeric|min:10',
                'description' => 'string|nullable'
            ]);

            $amount = floatval($fields['amount']);

            if ($account->balance < $amount) {
                return response()->json(['error' => 'Solde insuffisant.'], 400);
            }

            $requireValidation = $amount >= 5000;
            
            $tx = Transaction::create([
                'id' => 'TX-' . mt_rand(10000, 99999),
                'account_no' => $account->account_no,
                'date' => now(),
                'type' => 'Retrait',
                'amount' => $amount,
                'description' => $fields['description'] ?? 'Retrait en ligne',
                'status' => $requireValidation ? 'En attente' : 'Validé'
            ]);

            if (!$requireValidation) {
                $account->balance -= $amount;
                $account->save();
            }

            return response()->json([
                'message' => $requireValidation 
                    ? "Retrait en attente de validation."
                    : "Retrait effectué avec succès.",
                'transaction' => $tx,
                'account' => $account
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur withdraw: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur serveur.'], 500);
        }
    }

    /**
     * Client Online Transfer
     */
    public function transfer(Request $request)
    {
        try {
            $user = $request->user();
            $account = Account::where('owner_id', $user->id)->firstOrFail();

            if ($account->status === 'Désactivé') {
                return response()->json(['error' => 'Votre compte est inactif.'], 403);
            }

            $fields = $request->validate([
                'destinationAccountNo' => 'required|string|exists:accounts,account_no',
                'amount' => 'required|numeric|min:10',
                'description' => 'string|nullable'
            ]);

            $amount = floatval($fields['amount']);
            $destAccountNo = $fields['destinationAccountNo'];

            if ($destAccountNo === $account->account_no) {
                return response()->json(['error' => 'Virement vers votre propre compte impossible.'], 400);
            }

            $destAccount = Account::where('account_no', $destAccountNo)->firstOrFail();
            if ($destAccount->status === 'Désactivé') {
                return response()->json(['error' => 'Le compte destinataire est inactif.'], 400);
            }

            if ($account->balance < $amount) {
                return response()->json(['error' => 'Solde insuffisant.'], 400);
            }

            $requireValidation = $amount >= 3000;
            
            $tx = Transaction::create([
                'id' => 'TX-' . mt_rand(10000, 99999),
                'account_no' => $account->account_no,
                'date' => now(),
                'type' => 'Virement',
                'amount' => $amount,
                'description' => $fields['description'] 
                    ? $fields['description'] . " (vers " . $destAccountNo . ")" 
                    : "Virement vers " . $destAccountNo,
                'status' => $requireValidation ? 'En attente' : 'Validé'
            ]);

            if (!$requireValidation) {
                // Déduire de l'expéditeur
                $account->balance -= $amount;
                $account->save();

                // Ajouter au destinataire
                $destAccount->balance += $amount;
                $destAccount->save();

                // Créer une transaction de dépôt pour le destinataire
                Transaction::create([
                    'id' => 'TX-' . mt_rand(10000, 99999),
                    'account_no' => $destAccount->account_no,
                    'date' => now(),
                    'type' => 'Dépôt',
                    'amount' => $amount,
                    'description' => "Virement reçu de " . $account->owner_name,
                    'status' => 'Validé'
                ]);
            }

            return response()->json([
                'message' => $requireValidation 
                    ? "Virement en attente de validation."
                    : "Virement effectué avec succès.",
                'transaction' => $tx,
                'account' => $account
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur transfer: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur serveur.'], 500);
        }
    }
}