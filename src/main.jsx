import React from 'react';
import ReactDOM from 'react-dom/client';

import { App } from './components';
import { ToastProvider } from './context/Toast';

import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <ToastProvider>
    <App />
  </ToastProvider>
);
