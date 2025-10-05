import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './components/App';
import { AuthProvider } from './contexts/AuthContext';
import { TodoProvider } from './contexts/TodoContext';
import './index.css';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <TodoProvider>
          <App />
        </TodoProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
