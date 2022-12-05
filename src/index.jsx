import React from 'react';
import ReactDOM from 'react-dom/client';

import { App } from './components/App';
import { ModalPlaceholder, ModalProvider } from './context/Modal';

import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ModalProvider>
      <App />
      <ModalPlaceholder />
    </ModalProvider>
  </React.StrictMode>
);
