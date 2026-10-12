<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\UserController;

/*
|--------------------------------------------------------------------------
| API Routes - Bank M3ak
|--------------------------------------------------------------------------
*/

// Public Authentication Routes
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Client account lookup for transfers
Route::get('/user/lookup-account/{accountNo}', [UserController::class, 'lookupAccount']);

// Protected Routes (Requires Sanctum Token)
Route::middleware('auth:sanctum')->group(function () {
    
    // User Profile
    Route::get('/auth/me', [AuthController::class, 'me']);
    
    // Client-Specific Operations
    Route::middleware('role:Utilisateur')->group(function () {
        Route::put('/user/profile', [UserController::class, 'updateProfile']);
        Route::post('/user/deposit', [UserController::class, 'deposit']);
        Route::post('/user/withdraw', [UserController::class, 'withdraw']);
        Route::post('/user/transfer', [UserController::class, 'transfer']);
        Route::get('/transactions', [UserController::class, 'getTransactions']);
    });

    // Administrator-Specific Operations
    Route::middleware('role:Administrateur')->group(function () {
        // Users Management
        Route::get('/admin/users', [AdminController::class, 'getUsers']);
        Route::post('/admin/users', [AdminController::class, 'createUser']);
        Route::put('/admin/users/{id}', [AdminController::class, 'updateUser']);
        Route::delete('/admin/users/{id}', [AdminController::class, 'deleteUser']);

        // Accounts Management
        Route::get('/admin/accounts', [AdminController::class, 'getAccounts']);
        Route::post('/admin/accounts', [AdminController::class, 'createAccount']);
        Route::put('/admin/accounts/{accountNo}', [AdminController::class, 'updateAccount']);
        Route::post('/admin/accounts/{accountNo}/toggle', [AdminController::class, 'toggleAccountStatus']);
        Route::post('/admin/accounts/{accountNo}/validate-registration', [AdminController::class, 'validateRegistration']);

        // Transaction validations
        Route::post('/admin/transactions/{id}/validate', [AdminController::class, 'validateTransaction']);
        Route::get('/admin/transactions', [AdminController::class, 'getAllTransactions']);
        Route::get('/admin/transactions', [AdminController::class, 'getAllTransactions']);
    });
});
