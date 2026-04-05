import React from 'react';
import { Search, Bell, Mail, ChevronDown } from 'lucide-react';
import './Header.css';

const Header = () => {
  return (
    <header className="top-header">
      <div className="search-bar">
        <Search size={18} className="search-icon" />
        <input type="text" placeholder="Search task" />
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
          <div className="user-avatar">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Michael" alt="Avatar" />
          </div>
          <div className="user-details">
            <span className="user-name">Totok Michael</span>
            <span className="user-email">tmichael20@mail.com</span>
          </div>
          <ChevronDown size={16} className="text-muted" />
        </div>
      </div>
    </header>
  );
};

export default Header;
