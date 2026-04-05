import React from 'react';
import { Search, Bell, Mail, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

const Header = () => {
  const { user, signOut } = useAuth();
  
  // Get initial from email or metadata
  const userInitial = user?.email ? user.email[0].toUpperCase() : 'U';
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Utilizador';
  const userEmail = user?.email || 'user@example.com';

  return (
    <header className="top-header">
      <div className="search-bar">
        <Search size={18} className="search-icon" />
        <input type="text" placeholder="Pesquisar no iMatch..." />
        <span className="search-shortcut">⌘ F</span>
      </div>
      
      <div className="header-actions">
        <button className="action-btn">
          <Mail size={20} />
        </button>
        <button className="action-btn">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>
        
        <div className="user-profile">
          <div className="user-avatar" style={{ background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
            {user?.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="Avatar" />
            ) : (
              <span>{userInitial}</span>
            )}
          </div>
          <div className="user-details">
            <span className="user-name">{userName}</span>
            <span className="user-email">{userEmail}</span>
          </div>
          <div className="profile-dropdown-trigger" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => { if(confirm('Deseja terminar sessão?')) signOut(); }}>
            <ChevronDown size={16} className="text-muted" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
