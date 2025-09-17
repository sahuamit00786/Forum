import { useState } from 'react';

const SimpleNotification = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = 'success') => {
    const id = Date.now();
    const newNotification = { id, message, type };
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 space-y-2">
      {/* Test Buttons */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border">
        <h3 className="text-sm font-medium mb-2">Test Notifications</h3>
        <div className="space-y-2">
          <button
            onClick={() => addNotification('Success notification!', 'success')}
            className="block w-full px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
          >
            Test Success
          </button>
          <button
            onClick={() => addNotification('Error notification!', 'error')}
            className="block w-full px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
          >
            Test Error
          </button>
        </div>
      </div>

      {/* Notifications */}
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`p-3 rounded-lg shadow-lg text-white text-sm max-w-xs ${
            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          <div className="flex justify-between items-start">
            <span>{notification.message}</span>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-2 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SimpleNotification;
