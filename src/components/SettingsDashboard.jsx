import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Shield, LogOut, Info, ExternalLink } from 'lucide-react';

const SettingsDashboard = () => {
  const { user, signOut } = useAuth();

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Utilizador';
  const userEmail = user?.email || '';
  const userInitial = userEmail ? userEmail[0].toUpperCase() : 'U';
  const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-PT', { year: 'numeric', month: 'long', day: 'numeric' }) : '--';

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <div className="dashboard-title-section">
        <h1>Definições & Perfil</h1>
        <p>Informações da conta e configurações da sessão.</p>
      </div>

      {/* Profile Card */}
      <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          background: 'var(--primary)', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2rem', fontWeight: '800', flexShrink: 0
        }}>
          {user?.user_metadata?.avatar_url
            ? <img src={user.user_metadata.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            : userInitial}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.4rem', fontWeight: '700' }}>{userName}</h2>
          <p style={{ margin: '0 0 0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{userEmail}</p>
          <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.2rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>
            Administrador
          </span>
        </div>
      </div>

      {/* Info Cards */}
      <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'var(--primary-light)', padding: '0.75rem', borderRadius: '10px', color: 'var(--primary)' }}>
              <Mail size={20} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Email</p>
              <p style={{ margin: 0, fontWeight: '600' }}>{userEmail}</p>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'var(--primary-light)', padding: '0.75rem', borderRadius: '10px', color: 'var(--primary)' }}>
              <Shield size={20} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Membro desde</p>
              <p style={{ margin: 0, fontWeight: '600' }}>{memberSince}</p>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'var(--primary-light)', padding: '0.75rem', borderRadius: '10px', color: 'var(--primary)' }}>
              <User size={20} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>ID de Utilizador</p>
              <p style={{ margin: 0, fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{user?.id || '--'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Help / Info */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Info size={18} color="var(--primary)" /> Ajuda & Suporte
        </h3>
        <p style={{ margin: '0 0 1rem', color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
          Para suporte técnico, reporte de erros ou pedido de novas funcionalidades, contacte o administrador do sistema.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: '600', fontSize: '0.9rem', textDecoration: 'none' }}
          >
            <ExternalLink size={14} /> Painel Supabase
          </a>
        </div>
      </div>

      {/* Logout Button */}
      <button
        onClick={() => { if (confirm('Deseja mesmo terminar a sessão?')) signOut(); }}
        style={{
          width: '100%', padding: '1rem', borderRadius: '12px',
          background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          fontWeight: '700', fontSize: '1rem', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '0.5rem', transition: 'background 0.2s'
        }}
        onMouseOver={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'}
        onMouseOut={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'}
      >
        <LogOut size={18} /> Terminar Sessão
      </button>
    </div>
  );
};

export default SettingsDashboard;
