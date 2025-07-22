import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Prices from './pages/Prices';
import Orders from './pages/Orders';
import Costs from './pages/Costs';
import Agents from './pages/Agents';
import Analytics from './pages/Analytics';
import AdminSettings from './pages/AdminSettings';
import MarketSettings from './pages/MarketSettings';
import AccountDetails from './pages/AccountDetails';
import Roles from './pages/Roles';
import DockDemo from './pages/DockDemo';
import Checkout from './pages/Checkout';
import Invoices from './pages/Invoices';
import InvoiceBuilder from './pages/InvoiceBuilder';
import Customers from './pages/Customers';
import TestAPI from './pages/TestAPI';
import Financing from './pages/Financing';

import { CartProvider } from './contexts/CartContext';
import { LanguageProvider } from './contexts/LanguageContext';

// Theme provider component
const ThemeProvider = ({ children }) => {
  React.useEffect(() => {
    // Force dark theme by default
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
  }, []);

  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <CartProvider>
          <Router>
            <Routes>
              {/* Landing page route - redirect to dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* Landing page accessible via /landing */}
              <Route path="/landing" element={<LandingPage />} />
              
              {/* Dashboard routes with Layout */}
              <Route path="/dashboard" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="prices" element={<Prices />} />
                <Route path="orders" element={<Orders />} />
                <Route path="costs" element={<Costs />} />
                <Route path="agents" element={<Agents />} />
                <Route path="roles" element={<Roles />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="admin" element={<AdminSettings />} />
                <Route path="market-settings" element={<MarketSettings />} />
                <Route path="account" element={<AccountDetails />} />
                <Route path="dock-demo" element={<DockDemo />} />
                <Route path="checkout" element={<Checkout />} />
                <Route path="invoices" element={<Invoices />} />
                <Route path="invoice-builder" element={<InvoiceBuilder />} />
                <Route path="customers" element={<Customers />} />
                <Route path="financing" element={<Financing />} />
                <Route path="test-api" element={<TestAPI />} />

              </Route>
              
              {/* Redirect old routes to dashboard */}
              <Route path="/prices" element={<Navigate to="/dashboard/prices" replace />} />
              <Route path="/orders" element={<Navigate to="/dashboard/orders" replace />} />
              <Route path="/costs" element={<Navigate to="/dashboard/costs" replace />} />
              <Route path="/agents" element={<Navigate to="/dashboard/agents" replace />} />
              <Route path="/roles" element={<Navigate to="/dashboard/roles" replace />} />
              <Route path="/analytics" element={<Navigate to="/dashboard/analytics" replace />} />
              <Route path="/admin" element={<Navigate to="/dashboard/admin" replace />} />
              <Route path="/market-settings" element={<Navigate to="/dashboard/market-settings" replace />} />
              <Route path="/account" element={<Navigate to="/dashboard/account" replace />} />
              <Route path="/dock-demo" element={<Navigate to="/dashboard/dock-demo" replace />} />
              <Route path="/checkout" element={<Navigate to="/dashboard/checkout" replace />} />

              
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>
        </CartProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
