// src/components/ui/toast.tsx
type ToastProps = {
  title: string;
  description: string;
  variant?: 'default' | 'destructive';
};

export const toast = ({ title, description, variant = 'default' }: ToastProps) => {
  // For now, we'll just use console.log as a placeholder
  // You can replace this with your preferred toast library
  console.log(`[${variant.toUpperCase()}] ${title}: ${description}`);
};