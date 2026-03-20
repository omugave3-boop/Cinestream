import React, { useState } from 'react';
import { Film, LogIn, UserPlus } from 'lucide-react';
import { User } from '../types';
import { getUsers, saveUsers, setCurrentUser } from '../store';

interface AuthFormProps {
  onAuth: (user: User) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onAuth }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const users = getUsers();

    if (isLogin) {
      const found = users.find((u) => u.email === email && u.password === password);
      if (!found) {
        setError('Invalid email or password');
        return;
      }
      setCurrentUser(found);
      onAuth(found);
    } else {
      if (!name.trim()) {
        setError('Name is required');
        return;
      }
      if (users.find((u) => u.email === email)) {
        setError('An account with this email already exists');
        return;
      }
      const newUser: User = {
        id: 'user-' + Date.now(),
        email,
        password,
        name: name.trim(),
        createdAt: new Date().toISOString(),
      };
      users.push(newUser);
      saveUsers(users);
      setCurrentUser(newUser);
      onAuth(newUser);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <Film size={40} className="auth-logo" />
          <h1>CineStream</h1>
          <p>{isLogin ? 'Sign in to your account' : 'Create a new account'}</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
          )}
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
            {isLogin ? <><LogIn size={18} /> Sign In</> : <><UserPlus size={18} /> Create Account</>}
          </button>
        </form>
        <div className="auth-switch">
          {isLogin ? (
            <p>Don't have an account? <button onClick={() => { setIsLogin(false); setError(''); }}>Sign up</button></p>
          ) : (
            <p>Already have an account? <button onClick={() => { setIsLogin(true); setError(''); }}>Sign in</button></p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
