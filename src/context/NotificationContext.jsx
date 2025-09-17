import { createContext, useContext, useState } from 'react';
import NotificationPopup from '../components/Notification/NotificationPopup';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = (message, type = 'success', duration = 3000) => {
    console.log('🔔 showNotification called:', { message, type, duration });
    const id = Date.now();
    const newNotification = { id, message, type, duration };
    
    setNotifications(prev => {
      console.log('📝 Setting notifications:', [...prev, newNotification]);
      return [...prev, newNotification];
    });
    
    // Auto-remove after duration
    setTimeout(() => {
      removeNotification(id);
    }, duration);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const value = {
    showNotification,
    removeNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {/* Render all notifications */}
      {notifications.map(notification => {
        console.log('🎯 Rendering notification:', notification);
        return (
          <NotificationPopup
            key={notification.id}
            message={notification.message}
            type={notification.type}
            duration={notification.duration}
            onClose={() => removeNotification(notification.id)}
          />
        );
      })}
    </NotificationContext.Provider>
  );
};
