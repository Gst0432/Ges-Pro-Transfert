import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Step1SupplierInfo } from '@/components/wizards/new-purchase-order/Step1SupplierInfo';
import { Step2PurchaseItems } from '@/components/wizards/new-purchase-order/Step2PurchaseItems';
import { Step3PurchaseFinalization } from '@/components/wizards/new-purchase-order/Step3PurchaseFinalization';
import { StepIndicator } from '@/components/wizards/new-purchase-order/StepIndicator';

const steps = ["Fournisseur", "Articles", "Finalisation"];

export const NewPurchaseOrderWizard = ({ isOpen, onOpenChange, onOrderSaved }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [orderData, setOrderData] = useState({
    supplier_id: '',
    order_date: new Date().toISOString().split('T')[0],
    payment_status: 'Non Payé',
    amount_paid: 0,
    items: [],
  });

  const resetWizard = useCallback(() => {
    setCurrentStep(0);
    setOrderData({
      supplier_id: '',
      order_date: new Date().toISOString().split('T')[0],
      payment_status: 'Non Payé',
      amount_paid: 0,
      items: [],
    });
  }, []);

  const handleOpenChange = (open) => {
    if (!open) {
      resetWizard();
    }
    onOpenChange(open);
  };

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <Step1SupplierInfo onNext={handleNext} orderData={orderData} setOrderData={setOrderData} />;
      case 1:
        return <Step2PurchaseItems onNext={handleNext} onBack={handleBack} orderData={orderData} setOrderData={setOrderData} />;
      case 2:
        return <Step3PurchaseFinalization onBack={handleBack} orderData={orderData} setOrderData={setOrderData} onSave={onOrderSaved} closeWizard={() => handleOpenChange(false)} />;
      default:
        return null;
    }
  };

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  const [direction, setDirection] = useState(0);

  const paginate = (newDirection) => {
    setDirection(newDirection);
    if (newDirection > 0) handleNext();
    else handleBack();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-3xl bg-white p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl">Nouvelle Commande Fournisseur</DialogTitle>
          <DialogDescription>Suivez les étapes pour créer une nouvelle commande.</DialogDescription>
        </DialogHeader>
        <div className="p-6">
          <StepIndicator currentStep={currentStep} steps={steps} />
          <div className="mt-8 overflow-hidden relative" style={{ minHeight: '400px' }}>
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: 'spring', stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                className="w-full"
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};