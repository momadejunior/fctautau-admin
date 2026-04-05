import React from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  AlertTriangle, 
  X 
} from 'lucide-react';
import './NotificationComponent.css';

const NotificationComponent = () => {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) return null;

  return (
    <div className="notification-container">
      {notifications.map(({ id, message, type }) => (
        <div key={id} className={`notification-toast ${type}`}>
          <div className="notification-icon">
            {type === 'success' && <CheckCircle2 size={24} color="#10b981" />}
            {type === 'error' && <AlertCircle size={24} color="#ef4444" />}
            {type === 'warning' && <AlertTriangle size={24} color="#f59e0b" />}
            {type === 'info' && <Info size={24} color="#3b82f6" />}
          </div>
          <div className="notification-content">
            <span className="notification-message">{message}</span>
          </div>
          <button 
            className="notification-close" 
            onClick={() => removeNotification(id)}
          >
            <X size={18} />
          </button>
          <div className="notification-progress-bar">
            <div className="progress" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationComponent;
