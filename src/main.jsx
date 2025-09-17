import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { store } from './store/store';
import { NotificationProvider } from './context/NotificationContext';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <HelmetProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </HelmetProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>
);