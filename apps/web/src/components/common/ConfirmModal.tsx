import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'danger' | 'primary';
  loading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'danger',
  loading = false
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm" showCloseButton={false} variant="dark">
      <div className="text-center py-2">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-rose-950/80 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-4 shadow-lg">
          <AlertTriangle className="w-6 h-6 animate-pulse" />
        </div>
        <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
        <p className="mt-2 text-xs text-slate-300 leading-relaxed">{message}</p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            fullWidth
            type="button"
            className="border-slate-800 text-slate-300 hover:bg-slate-800"
          >
            {cancelLabel}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            loading={loading}
            fullWidth
            type="button"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
