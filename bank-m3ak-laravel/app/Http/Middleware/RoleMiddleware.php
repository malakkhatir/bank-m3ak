<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        if (!auth()->check()) {
            return response()->json(['message' => 'Non authentifié.'], 401);
        }

        $userRole = auth()->user()->role; // suppose que 'role' est une colonne dans users

        if (!in_array($userRole, $roles)) {
            return response()->json(['message' => 'Accès refusé. Rôle insuffisant.'], 403);
        }

        return $next($request);
    }
}
