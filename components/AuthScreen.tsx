import React, { useState } from 'react';
import { Film, LogIn, UserPlus, Shield, Eye, EyeOff, Mail, Lock, User as UserIcon } from 'lucide-react';
import { AuthTab, User } from '../types';
import { escapeSQL, getRandomColor, simpleHash } from '../utils/helpers';

interface AuthScreenProps {
  onLogin: (user: User) => void;
  onAdminLogin: (user: User) => void;
  initialTab?: AuthTab;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onAdminLogin, initialTab = 'login' }) => {
  const [tab, setTab] = useState<AuthTab>(initialTab);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  // Load saved credentials on mount
  React.useEffect(() => {
    const saved = localStorage.getItem('cinestream_login');
    if (saved) {
      try {
        const { email: savedEmail, password: savedPassword } = JSON.parse(saved);
        setEmail(savedEmail);
        setPassword(savedPassword);
        setRememberMe(true);
      } catch (e) {
        console.error('Failed to load saved credentials:', e);
      }
    }
  }, []);

  // Handle PWA install prompt
  React.useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
      }
    }
  };

  const resetForm = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setError('');
    setShowPassword(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('All fields are required');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }
    setLoading(true);
    try {
      const existing = await window.tasklet.sqlQuery(
        `SELECT id FROM users WHERE email = '${escapeSQL(email)}' OR username = '${escapeSQL(username)}'`
      );
      if ((existing as unknown[]).length > 0) {
        setError('Username or email already exists');
        setLoading(false);
        return;
      }
      const color = getRandomColor();
      const hashed = simpleHash(password);
      await window.tasklet.sqlExec(
        `INSERT INTO users (username, email, password, role, avatar_color) VALUES ('${escapeSQL(username)}', '${escapeSQL(email)}', '${hashed}', 'user', '${color}')`
      );
      const rows = await window.tasklet.sqlQuery(
        `SELECT * FROM users WHERE email = '${escapeSQL(email)}'`
      );
      const user = (rows as unknown as User[])[0];
      onLogin(user);
    } catch (err) {
      console.error('Registration failed:', err);
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required');
      return;
    }
    setLoading(true);
    try {
      const hashed = simpleHash(password);
      const rows = await window.tasklet.sqlQuery(
        `SELECT * FROM users WHERE email = '${escapeSQL(email)}' AND password = '${hashed}' AND role = 'user'`
      );
      const users = rows as unknown as User[];
      if (users.length === 0) {
        setError('Invalid email or password');
        setLoading(false);
        return;
      }
      
      // Save credentials if "Remember me" is checked
      if (rememberMe) {
        localStorage.setItem('cinestream_login', JSON.stringify({ email, password }));
      } else {
        localStorage.removeItem('cinestream_login');
      }
      
      onLogin(users[0]);
    } catch (err) {
      console.error('Login failed:', err);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required');
      return;
    }
    setLoading(true);
    try {
      const hashed = simpleHash(password);
      const rows = await window.tasklet.sqlQuery(
        `SELECT * FROM users WHERE email = '${escapeSQL(email)}' AND password = '${hashed}' AND role = 'admin'`
      );
      const users = rows as unknown as User[];
      if (users.length === 0) {
        setError('Invalid admin credentials');
        setLoading(false);
        return;
      }
      
      // Save credentials if "Remember me" is checked
      if (rememberMe) {
        localStorage.setItem('cinestream_admin', JSON.stringify({ email, password }));
      } else {
        localStorage.removeItem('cinestream_admin');
      }
      
      onAdminLogin(users[0]);
    } catch (err) {
      console.error('Admin login failed:', err);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Film className="text-primary" size={40} />
              <span className="text-3xl font-bold tracking-tight">
                Cine<span className="text-primary">Stream</span>
              </span>
            </div>
            <p className="text-base-content/50 text-sm">Your premium movie streaming platform</p>
          </div>

          {/* PWA Install Button */}
          {showInstallPrompt && (
            <button
              onClick={handleInstallClick}
              className="btn btn-accent btn-sm w-full mb-4 gap-2"
            >
              📱 Install App on Home Screen
            </button>
          )}

          {/* Auth card */}
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body p-6">
              {/* Tabs */}
              <div className="tabs tabs-boxed bg-base-300 mb-6">
                <button
                  className={`tab flex-1 gap-1 ${tab === 'login' ? 'tab-active' : ''}`}
                  onClick={() => { setTab('login'); resetForm(); }}
                >
                  <LogIn size={14} /> Login
                </button>
                <button
                  className={`tab flex-1 gap-1 ${tab === 'register' ? 'tab-active' : ''}`}
                  onClick={() => { setTab('register'); resetForm(); }}
                >
                  <UserPlus size={14} /> Register
                </button>
                <button
                  className={`tab flex-1 gap-1 ${tab === 'admin-login' ? 'tab-active' : ''}`}
                  onClick={() => {
                    setTab('admin-login');
                    resetForm();
                    // Load saved admin credentials
                    const saved = localStorage.getItem('cinestream_admin');
                    if (saved) {
                      try {
                        const { email: savedEmail, password: savedPassword } = JSON.parse(saved);
                        setEmail(savedEmail);
                        setPassword(savedPassword);
                        setRememberMe(true);
                      } catch (e) {
                        console.error('Failed to load saved admin credentials:', e);
                      }
                    }
                  }}
                >
                  <Shield size={14} /> Admin
                </button>
              </div>

              {error && (
                <div className="alert alert-error text-sm py-2 mb-4">
                  <span>{error}</span>
                </div>
              )}

              {/* Login Form */}
              {tab === 'login' && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="input input-bordered flex items-center gap-2">
                      <Mail className="h-[1em] opacity-50" />
                      <input
                        type="email"
                        className="grow"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </label>
                  </div>
                  <div>
                    <label className="input input-bordered flex items-center gap-2">
                      <Lock className="h-[1em] opacity-50" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="grow"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="opacity-50 hover:opacity-100">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </label>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span className="text-sm">Remember me</span>
                  </label>
                  <button className="btn btn-primary w-full" disabled={loading}>
                    {loading ? <span className="loading loading-spinner loading-sm" /> : <><LogIn size={16} /> Sign In</>}
                  </button>
                  <p className="text-center text-sm text-base-content/50">
                    Don&apos;t have an account?{' '}
                    <button type="button" className="text-primary hover:underline" onClick={() => { setTab('register'); resetForm(); }}>
                      Register here
                    </button>
                  </p>
                </form>
              )}

              {/* Register Form */}
              {tab === 'register' && (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="input input-bordered flex items-center gap-2">
                      <UserIcon className="h-[1em] opacity-50" />
                      <input
                        type="text"
                        className="grow"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </label>
                  </div>
                  <div>
                    <label className="input input-bordered flex items-center gap-2">
                      <Mail className="h-[1em] opacity-50" />
                      <input
                        type="email"
                        className="grow"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </label>
                  </div>
                  <div>
                    <label className="input input-bordered flex items-center gap-2">
                      <Lock className="h-[1em] opacity-50" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="grow"
                        placeholder="Password (min 4 chars)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={4}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="opacity-50 hover:opacity-100">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </label>
                  </div>
                  <button className="btn btn-primary w-full" disabled={loading}>
                    {loading ? <span className="loading loading-spinner loading-sm" /> : <><UserPlus size={16} /> Create Account</>}
                  </button>
                  <p className="text-center text-sm text-base-content/50">
                    Already have an account?{' '}
                    <button type="button" className="text-primary hover:underline" onClick={() => { setTab('login'); resetForm(); }}>
                      Sign in
                    </button>
                  </p>
                </form>
              )}

              {/* Admin Login Form */}
              {tab === 'admin-login' && (
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="alert alert-info text-sm py-2 mb-2">
                    <Shield size={14} />
                    <span>Default: admin@cinestream.com / admin123</span>
                  </div>
                  <div>
                    <label className="input input-bordered flex items-center gap-2">
                      <Mail className="h-[1em] opacity-50" />
                      <input
                        type="email"
                        className="grow"
                        placeholder="Admin email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </label>
                  </div>
                  <div>
                    <label className="input input-bordered flex items-center gap-2">
                      <Lock className="h-[1em] opacity-50" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="grow"
                        placeholder="Admin password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="opacity-50 hover:opacity-100">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </label>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span className="text-sm">Remember me</span>
                  </label>
                  <button className="btn btn-secondary w-full" disabled={loading}>
                    {loading ? <span className="loading loading-spinner loading-sm" /> : <><Shield size={16} /> Admin Login</>}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-base-content/30 mt-6">
            &copy; 2026 CineStream. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};
