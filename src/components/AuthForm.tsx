import React, { useState } from 'react';
import { Film, LogIn } from 'lucide-react';
import { User } from '../types';
import { getUsers, setCurrentUser } from '../store';

interface AuthFormProps {
  onAuth: (user: User) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onAuth }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const users = getUsers();

    const found = users.find((u) => u.email === email && u.password === password);
    if (!found) {
      setError('Invalid email or password');
      return;
    }
    setCurrentUser(found);
    onAuth(found);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <Film size={40} className="auth-logo" />
          <h1>CineStream</h1>
          <p>Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={4}
            />
          </div>
          {error && <div className="auth-error">{error}</div>}
          <button type="submit" className="btn btn-primary btn-full">
            <LogIn size={18} /> Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthForm;