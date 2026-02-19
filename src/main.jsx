import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/live-map" element={<LiveMapPage />} />
            <Route path="/crm" element={<CRMPage />} />
            <Route path="/properties" element={<PropertiesPage />} />
            <Route path="/deals" element={<DealsPage />} />
            <Route path="/markets" element={<MarketsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
