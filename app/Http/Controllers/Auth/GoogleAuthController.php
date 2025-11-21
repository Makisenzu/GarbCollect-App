<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Http\RedirectResponse;
use Exception;

class GoogleAuthController extends Controller
{
    public function redirectToGoogle(): RedirectResponse
    {
        return Socialite::driver('google')->redirect();
    }

    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();
            
            $user = User::where('email', $googleUser->email)
                ->orWhere('google_id', $googleUser->id)
                ->first();
            
            if ($user) {
                if (!$user->google_id) {
                    $user->update(['google_id' => $googleUser->id]);
                }
                
                if ($user->roles === 'applicant') {
                    return redirect()->route('loginPage')->withErrors([
                        'email' => 'Your account is pending approval. Please wait for admin to activate your account as a driver.'
                    ]);
                }
                
                Auth::login($user);
                
                return match($user->roles) {
                    'admin' => redirect()->intended(route('admin.dashboard')),
                    'employee' => redirect()->intended(route('dashboard')),
                    default => redirect()->route('loginPage')->withErrors([
                        'email' => 'Your account is pending approval.'
                    ])
                };
            }
            
            $newUser = User::create([
                'google_id' => $googleUser->id,
                'name' => $googleUser->name ?? $googleUser->user['given_name'] ?? 'User',
                'lastname' => $googleUser->user['family_name'] ?? '',
                'email' => $googleUser->email,
                'password' => bcrypt(str()->random(32)),
                'roles' => 'applicant',
                'is_active' => 'no',
                'email_verified_at' => now(),
            ]);
            
            return redirect()->route('loginPage')->with('status', 'Account created successfully! Please wait for admin approval to access the system.');
            
        } catch (Exception $e) {
            return redirect()->route('loginPage')->withErrors([
                'email' => 'Unable to login with Google. Please try again.'
            ]);
        }
    }
}
