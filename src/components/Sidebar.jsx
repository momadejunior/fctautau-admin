import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Calendar, Settings, LogOut, Award, HelpCircle, ChevronRight, ShieldCheck, Image as ImageIcon, ChevronLeft, Menu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Sidebar.css';

const Sidebar = ({ activeTab = 'golos', setActiveTab }) => {
  const { signOut } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Check window size on mount
  useEffect(() => {
    if (window.innerWidth <= 1024) {
      setIsCollapsed(true);
    }
  }, []);

  const menuItems = [
    { id: 'golos', icon: LayoutDashboard, label: 'Dashboard' },
    {
      id: 'jogadores',
      icon: Users,
      label: 'Jogadores',
      badge: '',
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
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
        <div className="sidebar-brand" style={{ marginBottom: 0 }}>
          <div className="brand-logo">
            <img src="/favicon.svg" alt="Logo FC TAU-TAU" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
          </div>
          {!isCollapsed && <span className="brand-name">FC TAU-TAU</span>}
        </div>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="toggle-sidebar-btn"
        >
          {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
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

            {item.subItems && activeTab.startsWith(item.id) && !isCollapsed && (
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
          <div 
            key={item.id} 
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={item.action ? item.action : () => setActiveTab(item.id)}
          >
            <item.icon size={20} />
            <span className="nav-text">{item.label}</span>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer" style={{ borderTop: '1px solid var(--border)', padding: '1.5rem', marginTop: 'auto' }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          fctautau Dashboard v1.0<br />Estádio Virtual © 2024
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
