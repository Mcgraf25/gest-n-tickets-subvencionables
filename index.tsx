import './index.css'
import React from 'react';
import ReactDOM from 'react-dom/client';
// FIX: Corrected import path for App component and ensured App.tsx has a default export.
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);