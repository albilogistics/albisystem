import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';

const ClearOverridesButton = ({ onClearAll }) => {
  const [showModal, setShowModal] = useState(false);

  const handleClearAll = () => {
    localStorage.removeItem('overrideData');
    onClearAll();
    window.dispatchEvent(new CustomEvent('overrideDataChanged', { 
      detail: { itemId: 'all', overrideInfo: null } 
    }));
    setShowModal(false);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="btn-secondary flex items-center space-x-2 text-red-400 hover:text-red-300"
        title="Clear All Overrides"
      >
        <Trash2 className="w-4 h-4" />
        <span>Clear All</span>
      </button>
      
      <ConfirmationModal
        isOpen={showModal}
        onConfirm={handleClearAll}
        onCancel={() => setShowModal(false)}
        title="Clear All Overrides"
        message="Are you sure you want to clear all price overrides? This action cannot be undone and will reset all custom pricing to the original calculated prices."
        confirmText="Clear All"
        cancelText="Cancel"
      />
    </>
  );
};

export default ClearOverridesButton; 