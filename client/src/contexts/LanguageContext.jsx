import React, { createContext, useContext } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// English translations
const translations = {
  dashboard: 'Dashboard',
  orders: 'Orders',
  pricing: 'Pricing',
  costs: 'Costs',
  analytics: 'Analytics',
  agents: 'Agents',
  roles: 'Roles',
  admin: 'Admin',
  settings: 'Settings',
  profile: 'Profile',
  logout: 'Logout',
  search: 'Search',
  filter: 'Filter',
  export: 'Export',
  import: 'Import',
  save: 'Save',
  cancel: 'Cancel',
  delete: 'Delete',
  edit: 'Edit',
  add: 'Add',
  view: 'View',
  loading: 'Loading...',
  error: 'Error',
  success: 'Success',
  warning: 'Warning',
  info: 'Information',
};

export const LanguageProvider = ({ children }) => {
  const t = translations;

  const value = {
    t,
    currentLanguage: 'en',
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}; 