import { useNotification } from '../context/NotificationContext';

const TestNotification = () => {
  const { showNotification } = useNotification();

  const testSuccess = () => {
    console.log('🧪 Test Success button clicked');
    showNotification('This is a success notification!', 'success');
  };

  const testError = () => {
    console.log('🧪 Test Error button clicked');
    showNotification('This is an error notification!', 'error');
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border">
      <h3 className="text-sm font-medium mb-2">Test Notifications</h3>
      <div className="space-y-2">
        <button
          onClick={testSuccess}
          className="block w-full px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
        >
          Test Success
        </button>
        <button
          onClick={testError}
          className="block w-full px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
        >
          Test Error
        </button>
      </div>
    </div>
  );
};

export default TestNotification;
