
import React from 'react';
import { Modal } from './Modal';
import { useLanguage } from '../../contexts/LanguageContext';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}) => {
  const { t } = useLanguage();
  if (!isOpen) {
    return null;
  }

  // A simple check to see if the default english text is passed, if so, we translate it.
  const finalConfirmText = confirmText === 'Yes, Cancel' ? t('confirm.yesCancel') : confirmText;
  const finalCancelText = cancelText === 'Cancel' ? t('confirm.cancel') : cancelText;
  const finalTitle = title === 'Cancel Subscription' ? t('confirm.cancelSubscriptionTitle') : title;
  const finalMessage = message.startsWith('Are you sure') ? t('confirm.cancelSubscriptionMessage') : message;


  return (
    <Modal title={finalTitle} onClose={onClose}>
      <p className="text-muted mb-6">{finalMessage}</p>
      <div className="flex justify-end gap-4">
        <button
          onClick={onClose}
          className="bg-surface text-text font-bold py-2 px-6 rounded-lg transition-colors hover:bg-gray-100 border border-border"
        >
          {finalCancelText}
        </button>
        <button
          onClick={onConfirm}
          className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition-transform hover:scale-105 shadow-sm"
        >
          {finalConfirmText}
        </button>
      </div>
    </Modal>
  );
};
