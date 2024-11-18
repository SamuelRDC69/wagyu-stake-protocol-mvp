import React from 'react';
import { AlertCircle, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const notificationVariants = cva(
  "fixed flex items-center gap-2 p-4 rounded-lg shadow-lg transition-all duration-300 transform",
  {
    variants: {
      variant: {
        success: "bg-green-500/90 text-white",
        error: "bg-red-500/90 text-white",
        pending: "bg-yellow-500/90 text-white",
      },
      position: {
        'top-right': "top-4 right-4",
        'bottom-right': "bottom-20 right-4", // Adjusted for mobile nav
        'bottom-center': "bottom-20 left-1/2 -translate-x-1/2",
      }
    },
    defaultVariants: {
      variant: "success",
      position: "bottom-center"
    }
  }
);

interface NotificationProps extends VariantProps<typeof notificationVariants> {
  message: string;
  txid?: string;
  amount?: string;
  onClose?: () => void;
  className?: string;
}

export const Notification: React.FC<NotificationProps> = ({
  variant,
  position,
  message,
  txid,
  amount,
  onClose,
  className
}) => {
  return (
    <div 
      className={cn(
        notificationVariants({ variant, position }), 
        "animate-in slide-in-from-bottom-5",
        className
      )}
    >
      {variant === 'success' && <CheckCircle className="w-5 h-5" />}
      {variant === 'error' && <XCircle className="w-5 h-5" />}
      {variant === 'pending' && <AlertCircle className="w-5 h-5" />}
      
      <div className="flex flex-col">
        <p className="font-medium">{message}</p>
        {amount && (
          <p className="text-sm opacity-90">{amount}</p>
        )}
        {txid && (
          <a
            href={`https://wax.bloks.io/transaction/${txid}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm flex items-center gap-1 hover:underline"
          >
            View Transaction <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
      
      {onClose && (
        <button
          onClick={onClose}
          className="ml-2 opacity-60 hover:opacity-100"
        >
          ✕
        </button>
      )}
    </div>
  );
};