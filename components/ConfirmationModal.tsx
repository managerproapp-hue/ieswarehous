
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { WarningIcon } from './icons';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  confirmationText: string;
  children: React.ReactNode;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  confirmationText,
  children,
}) => {
  const [inputText, setInputText] = useState('');
  const isConfirmed = inputText === confirmationText;

  useEffect(() => {
    if (!isOpen) {
      setInputText('');
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50">
          <WarningIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <div className="mt-3 text-center sm:mt-5">
          <div className="mt-2">
            <div className="text-sm text-gray-500 dark:text-gray-400 space-y-2">{children}</div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Para confirmar, por favor escribe "<strong className="text-red-600 dark:text-red-400">{confirmationText}</strong>" en el campo de abajo.
            </p>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="mt-2 w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
            />
          </div>
        </div>
      </div>
      <div className="mt-5 sm:mt-6 flex justify-end space-x-3">
        <button
          type="button"
          className="inline-flex justify-center w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none sm:text-sm"
          onClick={onClose}
        >
          Cancelar
        </button>
        <button
          type="button"
          className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none disabled:bg-red-300 dark:disabled:bg-red-800 disabled:cursor-not-allowed sm:text-sm"
          onClick={onConfirm}
          disabled={!isConfirmed}
        >
          Confirmar
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
