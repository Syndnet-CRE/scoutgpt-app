import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LiveMapPage from './pages/LiveMapPage';
import Dashboard from './pages/Dashboard';
import CRMPage from './pages/CRMPage';
import PropertiesPage from './pages/PropertiesPage';
import DealsPage from './pages/DealsPage';
import MarketsPage from './pages/MarketsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import DocumentsPage from './pages/DocumentsPage';
import SettingsPage from './pages/SettingsPage';
import { ThemeProvider } from './theme.jsx';
import './styles/index.css';

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Dashboard /> },
      { path: '/dashboard', element: <Navigate to="/" replace /> },
      { path: '/live-map', element: <LiveMapPage /> },
      { path: '/crm', element: <CRMPage /> },
      { path: '/properties', element: <PropertiesPage /> },
      { path: '/deals', element: <DealsPage /> },
      { path: '/markets', element: <MarketsPage /> },
      { path: '/analytics', element: <AnalyticsPage /> },
      { path: '/documents', element: <DocumentsPage /> },
      { path: '/settings', element: <SettingsPage /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>
);
