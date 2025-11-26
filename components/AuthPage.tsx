import React, { useState } from 'react';
import { User } from '../types';
import { Box, Mail, Lock, User as UserIcon, ArrowRight, CheckCircle, ShieldCheck } from 'lucide-react';

interface AuthPageProps {
  onLogin: (user: User) => void;
}

type AuthMode = 'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD' | 'VERIFY_EMAIL';

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Simulate API Call
    setTimeout(() => {
      // Basic mock validation
      if (email && password) {
        // Recover user from local storage if matches
        const storedUserStr = localStorage.getItem('nano_banana_user_db');
        const storedUser = storedUserStr ? JSON.parse(storedUserStr) : null;
        
        // Use stored user if email matches, otherwise create a session user
        // In a real app, this would validate against a backend
        const userToLogin: User = (storedUser && storedUser.email === email) ? storedUser : {
          id: 'user-' + Date.now(),
          name: 'Demo User',
          email: email,
          country: 'Netherlands', // Default for demo VAT
          tier: 'FREE',
          subscriptionStatus: 'ACTIVE',
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          paymentMethod: { type: 'VISA', last4: '4242' }
        };

        onLogin(userToLogin);
      } else {
        setError("Invalid credentials");
        setIsLoading(false);
      }
    }, 1500);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API
    setTimeout(() => {
      setIsLoading(false);
      setMode('VERIFY_EMAIL');
      setNotification(`We sent a verification code to ${email}`);
    }, 1500);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      const newUser: User = {
        id: 'user-' + Date.now(),
        name: name,
        email: email,
        country: 'Netherlands', // Default for demo VAT
        tier: 'FREE',
        subscriptionStatus: 'ACTIVE',
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      // Persist "database" user for demo purposes
      localStorage.setItem('nano_banana_user_db', JSON.stringify(newUser));
      
      onLogin(newUser);
    }, 1500);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setMode('LOGIN');
      setNotification("Password reset link sent to your email.");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-yellow-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center text-black shadow-2xl shadow-yellow-500/20 mx-auto mb-6 transform -rotate-6">
            <Box className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Nano Banana</h1>
          <p className="text-zinc-500">AI-Powered Real Estate Visualization</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Progress Bar for Verification */}
          {mode === 'VERIFY_EMAIL' && (
            <div className="h-1 w-full bg-zinc-800">
              <div className="h-full bg-emerald-500 w-2/3 animate-pulse" />
            </div>
          )}

          <div className="p-8">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              {mode === 'LOGIN' && 'Sign In to your account'}
              {mode === 'REGISTER' && 'Create your account'}
              {mode === 'FORGOT_PASSWORD' && 'Reset Password'}
              {mode === 'VERIFY_EMAIL' && 'Verify Email Address'}
            </h2>

            {notification && (
              <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-3 text-sm text-emerald-400">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                {notification}
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                {error}
              </div>
            )}

            {/* FORMS */}
            <form className="space-y-4" onSubmit={
              mode === 'LOGIN' ? handleLogin : 
              mode === 'REGISTER' ? handleRegister : 
              mode === 'VERIFY_EMAIL' ? handleVerify :
              handleForgotPassword
            }>
              
              {mode === 'REGISTER' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3.5 w-5 h-5 text-zinc-600" />
                    <input 
                      type="text" 
                      required
                      placeholder="Jane Doe"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 pl-10 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              {(mode === 'LOGIN' || mode === 'REGISTER' || mode === 'FORGOT_PASSWORD') && (
                 <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-5 h-5 text-zinc-600" />
                    <input 
                      type="email" 
                      required
                      placeholder="name@company.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 pl-10 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              {(mode === 'LOGIN' || mode === 'REGISTER') && (
                 <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Password</label>
                    {mode === 'LOGIN' && (
                      <button type="button" onClick={() => setMode('FORGOT_PASSWORD')} className="text-xs text-yellow-500 hover:text-yellow-400">
                        Forgot?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 w-5 h-5 text-zinc-600" />
                    <input 
                      type="password" 
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 pl-10 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              {mode === 'VERIFY_EMAIL' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Verification Code</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3 top-3.5 w-5 h-5 text-zinc-600" />
                    <input 
                      type="text" 
                      required
                      placeholder="123456"
                      value={verificationCode}
                      onChange={e => setVerificationCode(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 pl-10 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all tracking-widest text-lg font-mono"
                    />
                  </div>
                  <p className="text-xs text-zinc-500 mt-2">Enter the 6-digit code sent to your email.</p>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-yellow-500 text-black font-bold py-3.5 rounded-xl hover:bg-yellow-400 transition-all transform active:scale-[0.98] shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    {mode === 'LOGIN' && 'Sign In'}
                    {mode === 'REGISTER' && 'Create Account'}
                    {mode === 'FORGOT_PASSWORD' && 'Send Reset Link'}
                    {mode === 'VERIFY_EMAIL' && 'Verify & Login'}
                    {!isLoading && mode !== 'FORGOT_PASSWORD' && <ArrowRight className="w-4 h-4" />}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer Switching */}
          <div className="bg-zinc-950/50 border-t border-zinc-800 p-4 text-center">
            {mode === 'LOGIN' && (
              <p className="text-sm text-zinc-400">
                New to Nano Banana?{' '}
                <button onClick={() => setMode('REGISTER')} className="text-yellow-500 font-bold hover:underline">
                  Join now
                </button>
              </p>
            )}
            {mode === 'REGISTER' && (
              <p className="text-sm text-zinc-400">
                Already have an account?{' '}
                <button onClick={() => setMode('LOGIN')} className="text-yellow-500 font-bold hover:underline">
                  Log in
                </button>
              </p>
            )}
            {(mode === 'FORGOT_PASSWORD' || mode === 'VERIFY_EMAIL') && (
               <button onClick={() => setMode('LOGIN')} className="text-sm text-zinc-500 font-medium hover:text-white">
                 Back to Login
               </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};