import React, { useState } from 'react';
import { User } from '../types';
import { Mail, Lock, User as UserIcon, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';

interface AuthPageProps {
  onLogin: (user: User) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER' | 'FORGOT'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    // Mock Authentication Logic
    setTimeout(() => {
        setLoading(false);
        if (mode === 'LOGIN') {
            // Mock Login
            if (email && password) {
                 const mockUser: User = {
                    uid: 'mock-user-' + Date.now(),
                    email: email,
                    displayName: 'Demo User',
                    country: 'Netherlands',
                    tier: 'standard',
                    role: 'user',
                    subscriptionStatus: 'ACTIVE',
                    nextBillingDate: new Date().toISOString(),
                    createdAt: new Date().toISOString()
                };
                onLogin(mockUser);
            } else {
                setError("Please enter valid credentials.");
            }
        } else if (mode === 'REGISTER') {
             // Mock Register
             if (email && password && name) {
                 const mockUser: User = {
                    uid: 'mock-user-' + Date.now(),
                    email: email,
                    displayName: name,
                    country: 'Netherlands',
                    tier: 'standard',
                    role: 'user',
                    subscriptionStatus: 'ACTIVE',
                    nextBillingDate: new Date().toISOString(),
                    createdAt: new Date().toISOString()
                };
                onLogin(mockUser);
             } else {
                 setError("Please fill in all fields.");
             }
        } else {
            // Forgot Password
            setMessage("Password reset link sent (Mock).");
            setMode('LOGIN');
        }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-zinc-950 to-yellow-900/10" />
      
      <div className="w-full max-w-md relative z-10 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden p-8">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Homera Studios Ai</h1>
            <p className="text-zinc-500">
                {mode === 'LOGIN' ? 'Sign in to access your dashboard' : 
                 mode === 'REGISTER' ? 'Create your professional account' : 
                 'Reset your password'}
            </p>
        </div>

        {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {error}
            </div>
        )}

        {message && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> {message}
            </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
            {mode === 'REGISTER' && (
                <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Full Name</label>
                    <div className="relative">
                        <UserIcon className="absolute left-3 top-3 w-5 h-5 text-zinc-600" />
                        <input 
                            type="text" required value={name} onChange={e => setName(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 pl-10 text-white"
                        />
                    </div>
                </div>
            )}
            
            <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase">Email</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-zinc-600" />
                    <input 
                        type="email" required value={email} onChange={e => setEmail(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 pl-10 text-white"
                    />
                </div>
            </div>

            {mode !== 'FORGOT' && (
                <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 w-5 h-5 text-zinc-600" />
                        <input 
                            type="password" required value={password} onChange={e => setPassword(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 pl-10 text-white"
                        />
                    </div>
                </div>
            )}

            <button disabled={loading} className="w-full bg-yellow-500 text-black font-bold py-3 rounded-lg hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2">
                {loading ? 'Processing...' : (
                    <>
                        {mode === 'LOGIN' ? 'Sign In' : mode === 'REGISTER' ? 'Create Account' : 'Send Reset Link'}
                        <ArrowRight className="w-4 h-4" />
                    </>
                )}
            </button>
        </form>

        <div className="mt-6 text-center space-y-2">
            {mode === 'LOGIN' && (
                <>
                    <p className="text-sm text-zinc-500">Don't have an account? <button onClick={() => setMode('REGISTER')} className="text-yellow-500 hover:underline">Register</button></p>
                    <button onClick={() => setMode('FORGOT')} className="text-xs text-zinc-600 hover:text-zinc-400">Forgot Password?</button>
                </>
            )}
            {mode === 'REGISTER' && (
                <p className="text-sm text-zinc-500">Already have an account? <button onClick={() => setMode('LOGIN')} className="text-yellow-500 hover:underline">Login</button></p>
            )}
            {mode === 'FORGOT' && (
                <button onClick={() => setMode('LOGIN')} className="text-sm text-zinc-500 hover:text-white">Back to Login</button>
            )}
        </div>
      </div>
    </div>
  );
};