<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register user baru.
     */
    public function register(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = User::create([
            'name' => $request->string('name'),
            'email' => $request->string('email'),
            'password' => Hash::make($request->string('password')),
            'role' => 'user',
        ]);

        $token = $user->createToken('register')->plainTextToken;

        return response()->json([
            'message' => 'Registered successfully',
            'token' => $token,
            'user' => $user,
            'role' => $user->role,
        ], 201);
    }

    /**
     * Handle login for both SPA (cookie-based) and token-based (Sanctum tokens).
     */
    public function login(LoginRequest $request)
    {
        $credentials = $request->only(['email', 'password']);

        if (!Auth::attempt($credentials, $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $user = $request->user();

        if ($request->boolean('token')) {
            $tokenName = $request->string('device_name')->toString() ?: 'api-token';
            $token = $user->createToken($tokenName)->plainTextToken;

            return response()->json([
                'message' => 'Logged in successfully (token mode)',
                'token' => $token,
                'user' => $user,
                'role' => $user->role,
            ], 200);
        }

        return response()->json([
            'message' => 'Logged in successfully',
            'user' => $user,
            'role' => $user->role,
        ], 200);
    }

    /**
     * Logout user.
     */
    public function logout(Request $request)
    {
        $user = $request->user();

        if (method_exists($user, 'currentAccessToken') && $user->currentAccessToken()) {
            $user->currentAccessToken()->delete();
        }

        return response()->json([
            'message' => 'Logged out successfully',
        ], 200);
    }
    /**
     * Google OAuth using ID token from React (Google Identity Services).
     */
    public function oauthGoogle(Request $request)
    {
        $request->validate([
            'id_token' => ['required', 'string'],
            'device_name' => ['sometimes', 'string', 'max:255'],
        ]);

        $idToken = $request->string('id_token')->toString();
        $clientId = config('services.google.client_id') ?? env('GOOGLE_CLIENT_ID');

        $resp = Http::asForm()->get('https://oauth2.googleapis.com/tokeninfo', [
            'id_token' => $idToken,
        ]);

        if (!$resp->ok()) {
            throw ValidationException::withMessages([
                'id_token' => ['Invalid Google ID token.'],
            ]);
        }

        $payload = $resp->json();

        if (($payload['aud'] ?? null) !== $clientId) {
            throw ValidationException::withMessages([
                'id_token' => ['Google token audience mismatch.'],
            ]);
        }

        if (($payload['email_verified'] ?? 'false') !== 'true' && ($payload['email_verified'] ?? false) !== true) {
            throw ValidationException::withMessages([
                'id_token' => ['Email is not verified by Google.'],
            ]);
        }

        $googleId = $payload['sub'] ?? null;
        $email = $payload['email'] ?? null;
        $name = $payload['name'] ?? ($payload['given_name'] ?? 'Google User');

        if (!$googleId || !$email) {
            throw ValidationException::withMessages([
                'id_token' => ['Google token missing required fields.'],
            ]);
        }

        $user = User::where('google_id', $googleId)->first();
        if (!$user) {
            $user = User::where('email', $email)->first();
        }

        if ($user) {
            $user->forceFill([
                'google_id' => $googleId,
                'name' => $user->name ?: $name,
            ])->save();
        } else {
            $user = User::create([
                'name' => $name,
                'email' => $email,
                'google_id' => $googleId,
                'role' => 'user',
                'password' => bcrypt(Str::random(32)),
            ]);
        }

        $tokenName = $request->string('device_name')->toString() ?: 'google-oauth';
        $token = $user->createToken($tokenName)->plainTextToken;

        return response()->json([
            'message' => 'Logged in with Google',
            'token' => $token,
            'user' => $user,
            'role' => $user->role,
        ], 200);
    }
}