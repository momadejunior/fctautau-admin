import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { LogIn, Mail, Lock, User, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import './Login.css';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName }
        }
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        setSuccess(true);
        setLoading(false);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      }
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setError(null);
    setSuccess(false);
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="bg-shape shape-1"></div>
        <div className="bg-shape shape-2"></div>
        <div className="bg-shape shape-3"></div>
      </div>
      
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <svg width="48" height="48" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 4C9.37258 4 4 9.37258 4 16C4 22.6274 9.37258 28 16 28C22.6274 28 28 22.6274 28 16C28 9.37258 22.6274 4 16 4ZM16 24C11.5817 24 8 20.4183 8 16C8 11.5817 11.5817 8 16 8C20.4183 8 24 11.5817 24 16C24 20.4183 20.4183 24 16 24Z" fill="var(--primary)"/>
              <circle cx="16" cy="16" r="4" fill="var(--primary)"/>
            </svg>
          </div>
          <h1>iMatch Dashboard</h1>
          <p>{isSignUp ? 'Crie sua conta administrativa' : 'Gestão desportiva de alta performance'}</p>
        </div>

        {success && isSignUp ? (
          <div className="login-success">
            <CheckCircle2 size={32} />
            <h2>Registo iniciado!</h2>
            <p>Verifique o seu email para confirmar a conta e poder entrar no dashboard.</p>
            <button onClick={toggleAuthMode} className="login-button secondary">
              Ir para o Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleAuth} className="login-form">
            {error && (
              <div className="login-error">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {isSignUp && (
              <div className="input-group">
                <label htmlFor="name">Nome Completo</label>
                <div className="input-wrapper">
                  <User className="input-icon" size={18} />
                  <input
                    id="name"
                    type="text"
                    placeholder="Seu nome"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="input-group">
              <label htmlFor="email">Email</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={18} />
                <input
                  id="email"
                  type="email"
                  placeholder="nome@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="password">Palavra-passe</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? (
                <Loader2 className="spinner" size={20} />
              ) : (
                <>
                  {isSignUp ? <User size={20} /> : <LogIn size={20} />}
                  <span>{isSignUp ? 'Criar Conta' : 'Entrar'}</span>
                </>
              )}
            </button>

            <div className="auth-toggle">
              {isSignUp ? 'Já tem uma conta?' : 'Não tem conta?'}
              <button type="button" onClick={toggleAuthMode} className="toggle-btn">
                {isSignUp ? 'Entrar agora' : 'Criar conta'}
              </button>
            </div>
          </form>
        )}

        <div className="login-footer">
          <p>© 2024 fctautau. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
