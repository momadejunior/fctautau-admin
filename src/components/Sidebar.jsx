import React from 'react';
import { LayoutDashboard, Users, Calendar, Settings, LogOut, Award, HelpCircle, ChevronRight, ShieldCheck, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Sidebar.css';

const Sidebar = ({ activeTab = 'golos', setActiveTab }) => {
  const { signOut } = useAuth();
  
  const menuItems = [
    { id: 'golos', icon: LayoutDashboard, label: 'Dashboard' },
    { 
      id: 'jogadores', 
      icon: Users, 
      label: 'Jogadores', 
      badge: '12+',
      subItems: [
        { id: 'jogadores-list', label: 'Ver todos', view: 'list' },
        { id: 'jogadores-add', label: 'Adicionar novo', view: 'add' }
      ]
    },
    { 
      id: 'jogos', 
      icon: Calendar, 
      label: 'Jogos',
      subItems: [
        { id: 'jogos-proximos', label: 'Próximos Jogos' },
        { id: 'jogos-agendar', label: 'Agendar Jogos' }
      ]
    },
    { id: 'resumo', icon: LayoutDashboard, label: 'Resumo' },
    { id: 'classificacao', icon: Award, label: 'Classificação' },
    { id: 'administracao', icon: ShieldCheck, label: 'Administração' },
    { id: 'media', icon: ImageIcon, label: 'Media' },
  ];

  const generalItems = [
    { id: 'settings', icon: Settings, label: 'Settings' },
    { id: 'help', icon: HelpCircle, label: 'Help' },
    { id: 'logout', icon: LogOut, label: 'Logout', action: signOut },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-logo">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 4C9.37258 4 4 9.37258 4 16C4 22.6274 9.37258 28 16 28C22.6274 28 28 22.6274 28 16C28 9.37258 22.6274 4 16 4ZM16 24C11.5817 24 8 20.4183 8 16C8 11.5817 11.5817 8 16 8C20.4183 8 24 11.5817 24 16C24 20.4183 20.4183 24 16 24Z" fill="currentColor"/>
            <circle cx="16" cy="16" r="4" fill="currentColor"/>
          </svg>
        </div>
        <span className="brand-name">fctautau</span>
      </div>

      <div className="sidebar-section-label">Menu</div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <div key={item.id}>
            <div
              className={`nav-item ${activeTab.startsWith(item.id) ? 'active' : ''}`}
              onClick={() => {
                if (item.id === 'jogadores') setActiveTab('jogadores-list');
                else if (item.id === 'jogos') setActiveTab('jogos-proximos');
                else setActiveTab(item.id);
              }}
            >
              <item.icon size={20} />
              <span className="nav-text">{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
              {item.subItems && (
                <ChevronRight 
                  size={16} 
                  className={`chevron ${activeTab.startsWith(item.id) ? 'rotate' : ''}`} 
                  style={{ marginLeft: 'auto', transition: 'transform 0.2s', transform: activeTab.startsWith(item.id) ? 'rotate(90deg)' : 'none' }}
                />
              )}
            </div>
            
            {item.subItems && activeTab.startsWith(item.id) && (
              <div className="sub-nav">
                {item.subItems.map(sub => (
                  <div 
                    key={sub.id} 
                    className={`sub-nav-item ${activeTab === sub.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(sub.id)}
                  >
                    {sub.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="sidebar-section-label">General</div>
      <nav className="sidebar-nav">
        {generalItems.map((item) => (
          <div key={item.id} className="nav-item" onClick={item.action}>
            <item.icon size={20} />
            <span className="nav-text">{item.label}</span>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer" style={{ borderTop: '1px solid var(--border)', padding: '1.5rem', marginTop: 'auto' }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          fctautau Dashboard v1.0<br/>Estádio Virtual © 2024
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
