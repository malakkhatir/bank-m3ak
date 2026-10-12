<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Account;
use App\Models\Transaction;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Authenticate and login client or administrator
     */
public function login(Request $request)
{
    $fields = $request->validate([
        'email' => 'required|email',
        'password' => 'required|string',
    ]);

    $user = User::where('email', $fields['email'])->first();

    if (!$user || !Hash::check($fields['password'], $user->password)) {
        return response()->json([
            'message' => 'Adresse e-mail ou mot de passe incorrect.'
        ], 401);
    }

    if (!$user->active) {
        return response()->json([
            'message' => 'Votre compte est en attente de validation.'
        ], 403);
    }

    $user->tokens()->delete();

    $token = $user->createToken('bank-m3ak')->plainTextToken;

    $account = Account::where('owner_id', $user->id)->first();

    return response()->json([
        'token' => $token,
        'user' => $user,
        'account' => $account
    ]);
}

    /**
     * Self-registration for new client account
     */
public function register(Request $request)
{
    $fields = $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|email|unique:users,email',
        'phone' => 'required|string|max:10',
        'address' => 'required|string|max:255',
        'password' => 'required|string|min:6|confirmed',
    ]);

    $user = User::create([
        'name' => $fields['name'],
        'email' => $fields['email'],
        'phone' => $fields['phone'],
        'address' => $fields['address'],
        'password' => Hash::make($fields['password']),
        'role' => 'Utilisateur',
        'active' => false,
    ]);

    $account = Account::create([
        'account_no' => 'BM-' . random_int(1000000, 9999999),
        'owner_id' => $user->id,
        'owner_name' => $user->name,
        'balance' => 0,
        'status' => 'Désactivé',
        'pending_validation' => true,
    ]);

    return response()->json([
        'message' => "Compte créé avec succès.",
        'user' => $user,
        'account' => $account,
    ], 201);
}
    /**
     * Get details of authenticated user
     */
    public function me(Request $request)
    {
        $user = $request->user();
        $account = Account::where('owner_id', $user->id)->first();

        return response()->json([
            'user' => $user,
            'account' => $account
        ]);
    }
}
