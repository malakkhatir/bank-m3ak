<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Account;
use App\Models\Transaction;

class AdminController extends Controller
{
    /**
     * Get all users (Clients + Admins)
     */
    public function getUsers()
    {
        return response()->json(User::all());
    }

    /**
     * Create user profile manually
     */
    public function createUser(Request $request)
    {
        $fields = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users,email',
            'phone' => 'required|string',
            'address' => 'required|string',
            'role' => 'string',
            'active' => 'boolean'
        ]);

        $user = User::create([
            'name' => $fields['name'],
            'email' => $fields['email'],
            'password' => bcrypt('password'), // default password
            'phone' => $fields['phone'],
            'address' => $fields['address'],
            'role' => $fields['role'] ?? 'Utilisateur',
            'active' => $fields['active'] ?? true
        ]);

        // Create banking account if they are basic client
        if ($user->role === 'Utilisateur') {
            $randNo = mt_rand(1000000, 9999999);
            Account::create([
                'account_no' => "BM-0" . $randNo,
                'owner_id' => $user->id,
                'owner_name' => $user->name,
                'balance' => 0.00,
                'status' => 'Actif'
            ]);
        }

        return response()->json($user, 201);
    }

    /**
     * Update user details
     */
    public function updateUser(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $fields = $request->all();
        $user->update($fields);

        // Update connected bank status if deactivated
        if (isset($fields['active'])) {
            $account = Account::where('owner_id', $user->id)->first();
            if ($account) {
                $account->update(['status' => $fields['active'] ? 'Actif' : 'Désactivé']);
            }
        }

        return response()->json($user);
    }

    /**
     * Delete user profile
     */
    public function deleteUser($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['success' => true, 'message' => 'Utilisateur supprimé avec succès.']);
    }

    /**
     * Get all bank accounts
     */
    public function getAccounts()
    {
        return response()->json(Account::all());
    }

    /**
     * Open manual banking account for client
     */
    public function createAccount(Request $request)
    {
        $fields = $request->validate([
            'owner_id' => 'required|exists:users,id',
            'balance' => 'numeric',
            'status' => 'string'
        ]);

        $user = User::findOrFail($fields['owner_id']);

        $existing = Account::where('owner_id', $user->id)->first();
        if ($existing) {
            return response()->json(['error' => 'Cet utilisateur possède déjà un compte bancaire.'], 400);
        }

        $randNo = mt_rand(1000000, 9999999);
        $account = Account::create([
            'account_no' => "BM-0" . $randNo,
            'owner_id' => $user->id,
            'owner_name' => $user->name,
            'balance' => $fields['balance'] ?? 0.00,
            'status' => $fields['status'] ?? 'Actif'
        ]);

        return response()->json($account, 201);
    }

    /**
     * Activate or Deactivate bank accounts
     */
    public function toggleAccountStatus($accountNo)
    {
        $account = Account::findOrFail($accountNo);
        $account->status = $account->status === 'Actif' ? 'Désactivé' : 'Actif';
        $account->save();

        // Sync with corresponding user active status
        $user = User::find($account->owner_id);
        if ($user) {
            $user->active = $account->status === 'Actif';
            $user->save();
        }

        return response()->json($account);
    }

    /**
     * Update bank account details
     */
    public function updateAccount(Request $request, $accountNo)
    {
        $account = Account::findOrFail($accountNo);

        $fields = $request->validate([
            'balance' => 'numeric',
            'status' => 'string'
        ]);

        if (array_key_exists('balance', $fields)) {
            $account->balance = floatval($fields['balance']);
        }

        if (array_key_exists('status', $fields)) {
            $account->status = $fields['status'];
            
            // Sync with corresponding user active status
            $user = User::find($account->owner_id);
            if ($user) {
                $user->active = $account->status === 'Actif';
                $user->save();
            }
        }

        $account->save();

        return response()->json($account);
    }

    /**
     * Validate or reject a self-registration account
     */
    public function validateRegistration(Request $request, $accountNo)
    {
        $account = Account::findOrFail($accountNo);
        $action = $request->input('action'); // "accept" or "reject"
        
        $user = User::findOrFail($account->owner_id);
        
        if ($action === 'accept') {
            $account->status = 'Actif';
            $user->active = true;
        } else {
            $account->status = 'Désactivé';
            $user->active = false;
        }
        
        $account->pending_validation = false;
        
        $account->save();
        $user->save();
        
        return response()->json([
            'success' => true,
            'account' => $account,
            'user' => $user
        ]);
    }

    /**
     * Validate or reject an operation (deposit, withdraw, transfer)
     */
public function validateTransaction(Request $request, $id)
{
    try {
        $tx = Transaction::findOrFail($id);

        $action = $request->input('action');

        if ($tx->status !== 'En attente') {
            return response()->json(['error' => 'Cette transaction a déjà été traitée.'], 400);
        }

        $account = Account::where('account_no', $tx->account_no)->firstOrFail();

        if ($action === 'validate') {
            $tx->status = 'Validé';

            if (in_array($tx->type, ['Retrait', 'Virement'])) {
                if ($account->balance < $tx->amount) {
                    $tx->status = 'Rejeté';
                    $tx->save();
                    return response()->json(['error' => 'Solde insuffisant.'], 400);
                }
                $account->balance -= $tx->amount;

                if ($tx->type === 'Virement') {
                    preg_match('/BM-\d+/', $tx->description, $matches);
                    if (!empty($matches)) {
                        $destAccount = Account::where('account_no', $matches[0])->first();
                        if ($destAccount) {
                            $destAccount->balance += $tx->amount;
                            $destAccount->save();

                            // Créer la transaction de dépôt sans timestamps
                            Transaction::create([
                                'id' => 'TX-' . mt_rand(10000, 99999),
                                'account_no' => $destAccount->account_no,
                                'date' => now(),
                                'type' => 'Dépôt',
                                'amount' => $tx->amount,
                                'description' => "Virement reçu de " . $account->owner_name,
                                'status' => 'Validé'
                            ]);
                        }
                    }
                }
            } elseif ($tx->type === 'Dépôt') {
                $account->balance += $tx->amount;
            } else {
                return response()->json(['error' => 'Type de transaction inconnu.'], 400);
            }

            $account->save();
        } else {
            $tx->status = 'Rejeté';
        }

        $tx->save();

        return response()->json(['success' => true, 'transaction' => $tx, 'account' => $account]);

    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
        return response()->json(['error' => 'Transaction introuvable.'], 404);
    } catch (\Exception $e) {
        \Log::error('Erreur validation transaction : ' . $e->getMessage());
        return response()->json(['error' => 'Erreur interne.'], 500);
    }
}
    /**
     * Get all transactions
     */
    public function getAllTransactions()
    {
        return response()->json(Transaction::orderBy('date', 'desc')->get());
    }
    
}
