import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Mail, ChevronDown, LogOut, Menu, X, Users, Calendar, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import './Header.css';

const Header = ({ onMenuToggle, onNavigate }) => {
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState({ jogadores: [], jogos: [] });
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchTimer = setTimeout(() => {
      if (searchTerm.length >= 2) {
        performSearch(searchTerm);
      } else {
        setSearchResults({ jogadores: [], jogos: [] });
      }
    }, 300);
    return () => clearTimeout(searchTimer);
  }, [searchTerm]);

  const performSearch = async (term) => {
    setIsSearching(true);
    try {
      const { data: jogadores } = await supabase
        .from('jogadores')
        .select('id, nome, posicao')
        .ilike('nome', `%${term}%`)
        .limit(3);
        
      const { data: jogos } = await supabase
        .from('jogos')
        .select('id, equipe_a, equipe_b, data')
        .or(`equipe_a.ilike.%${term}%,equipe_b.ilike.%${term}%`)
        .limit(3);

      setSearchResults({
        jogadores: jogadores || [],
        jogos: jogos || []
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultClick = (type) => {
    setSearchTerm('');
    if (type === 'jogador' && onNavigate) {
      onNavigate('jogadores-list');
    } else if (type === 'jogo' && onNavigate) {
      onNavigate('jogos');
    }
  };
  
  // Get initial from email or metadata
  const userInitial = user?.email ? user.email[0].toUpperCase() : 'U';
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Utilizador';
  const userEmail = user?.email || 'user@example.com';

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (onMenuToggle) {
      onMenuToggle(!isMobileMenuOpen);
    }
  };

  return (
    <header className="top-header">
      <div className="search-bar" ref={searchRef}>
        <Search size={18} className="search-icon" />
        <input 
          type="text" 
          placeholder="Pesquisar jogadores, jogos..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <span className="search-shortcut">⌘ K</span>

        {searchTerm.length >= 2 && (
          <div className="search-dropdown">
            {isSearching ? (
              <div style={{ padding: '1rem', display: 'flex', justifyContent: 'center', color: 'var(--primary)' }}>
                <Loader2 size={24} className="animate-spin" />
              </div>
            ) : (
              <>
                {searchResults.jogadores.length > 0 && (
                  <div className="search-section">
                    <div className="search-section-title">Jogadores</div>
                    {searchResults.jogadores.map(j => (
                      <div key={j.id} className="search-result-item" onClick={() => handleResultClick('jogador')}>
                        <div className="search-result-icon"><Users size={16} /></div>
                        <div className="search-result-info">
                          <span className="search-result-title">{j.nome}</span>
                          <span className="search-result-subtitle">{j.posicao || 'Jogador'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {searchResults.jogos.length > 0 && (
                  <div className="search-section">
                    <div className="search-section-title">Jogos</div>
                    {searchResults.jogos.map(j => (
                      <div key={j.id} className="search-result-item" onClick={() => handleResultClick('jogo')}>
                        <div className="search-result-icon"><Calendar size={16} /></div>
                        <div className="search-result-info">
                          <span className="search-result-title">{j.equipe_a} vs {j.equipe_b}</span>
                          <span className="search-result-subtitle">{new Date(j.data).toLocaleDateString('pt-PT')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {searchResults.jogadores.length === 0 && searchResults.jogos.length === 0 && (
                  <div style={{ padding: '1.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Nenhum resultado encontrado para "{searchTerm}"</div>
                )}
              </>
            )}
          </div>
        )}
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

      <div className="header-mobile">
        <button className="mobile-menu-btn" onClick={toggleMobileMenu} aria-label="Menu">
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <span className="header-title">iMatch Dashboard</span>
      </div>
    </header>
  );
};

export default Header;
