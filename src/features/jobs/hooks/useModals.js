import { useState } from 'react';

/**
 * Custom hook to manage all modal states
 */
export const useModals = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCombinedEstimatesModal, setShowCombinedEstimatesModal] = useState(false);
  const [viewingSingleEstimate, setViewingSingleEstimate] = useState(null);
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(null);

  return {
    showAuthModal,
    setShowAuthModal,
    showCombinedEstimatesModal,
    setShowCombinedEstimatesModal,
    viewingSingleEstimate,
    setViewingSingleEstimate,
    viewingInvoice,
    setViewingInvoice,
    statusDropdownOpen,
    setStatusDropdownOpen
  };
};