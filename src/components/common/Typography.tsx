// Typography.tsx
const Typography = {
  H1: ({ children, className = "" }) => (
    <h1 className={`text-4xl font-bold tracking-tight ${className}`}>
      {children}
    </h1>
  ),
  H2: ({ children, className = "" }) => (
    <h2 className={`text-3xl font-semibold tracking-tight ${className}`}>
      {children}
    </h2>
  ),
  H3: ({ children, className = "" }) => (
    <h3 className={`text-2xl font-semibold ${className}`}>{children}</h3>
  ),
  H4: ({ children, className = "" }) => (
    <h4 className={`text-xl font-semibold ${className}`}>{children}</h4>
  ),
  Body: ({ children, className = "" }) => (
    <p className={`text-base leading-7 ${className}`}>{children}</p>
  ),
  Small: ({ children, className = "" }) => (
    <p className={`text-sm leading-6 ${className}`}>{children}</p>
  ),
  Label: ({ children, className = "" }) => (
    <span className={`text-sm font-medium ${className}`}>{children}</span>
  )
};

// Card.tsx
import { cva, type VariantProps } from "class-variance-authority";

const cardVariants = cva(
  "rounded-lg shadow-sm border bg-background",
  {
    variants: {
      variant: {
        default: "bg-background",
        game: "bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20",
        tier: "bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20",
        alert: "bg-gradient-to-br from-red-500/10 to-pink-500/10 border-red-500/20"
      },
      size: {
        sm: "p-4",
        md: "p-6",
        lg: "p-8"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md"
    }
  }
);

interface CardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {
  hoverable?: boolean;
}

const Card = ({
  className,
  variant,
  size,
  hoverable = false,
  children,
  ...props
}: CardProps) => {
  return (
    <div
      className={`${cardVariants({ variant, size })} ${
        hoverable ? "transition-transform hover:scale-102" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Badge.tsx
const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary hover:bg-primary/20",
        tier1: "bg-bronze/10 text-bronze hover:bg-bronze/20",
        tier2: "bg-silver/10 text-silver hover:bg-silver/20",
        tier3: "bg-gold/10 text-gold hover:bg-gold/20",
        success: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
        warning: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
        danger: "bg-red-500/10 text-red-500 hover:bg-red-500/20"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

const Badge = ({ className, variant, ...props }: BadgeProps) => {
  return <div className={badgeVariants({ variant, className })} {...props} />;
};

// AnimatedNumber.tsx
import { useState, useEffect } from "react";
import { animate } from "framer-motion";

interface AnimatedNumberProps {
  value: number;
  precision?: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

const AnimatedNumber = ({
  value,
  precision = 0,
  duration = 1,
  className = "",
  prefix = "",
  suffix = ""
}: AnimatedNumberProps) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const controls = animate(displayValue, value, {
      duration,
      onUpdate: (value) => {
        setDisplayValue(Number(value.toFixed(precision)));
      }
    });

    return () => controls.stop();
  }, [value, precision, duration]);

  return (
    <span className={className}>
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
};

// LoadingSpinner.tsx
import { Loader } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const LoadingSpinner = ({ size = "md", className = "" }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader className={`${sizeClasses[size]} animate-spin text-primary`} />
    </div>
  );
};

// Progress.tsx
interface ProgressProps {
  value: number;
  max: number;
  variant?: "default" | "success" | "warning" | "danger";
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const Progress = ({
  value,
  max,
  variant = "default",
  showLabel = false,
  size = "md",
  className = ""
}: ProgressProps) => {
  const percentage = Math.min(100, (value / max) * 100);

  const variantClasses = {
    default: "bg-primary",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    danger: "bg-red-500"
  };

  const sizeClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3"
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="relative">
        <div className={`w-full bg-gray-200 rounded-full ${sizeClasses[size]}`}>
          <div
            className={`${sizeClasses[size]} rounded-full transition-all duration-300 ${variantClasses[variant]}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showLabel && (
          <span className="absolute right-0 -top-6 text-sm font-medium">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
    </div>
  );
};

// Tooltip.tsx
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
}

const Tooltip = ({
  content,
  children,
  position = "top",
  delay = 0.3
}: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay * 1000);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2"
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className={`absolute z-50 ${positionClasses[position]}`}
          >
            <div className="bg-gray-900 text-white text-sm rounded-lg py-1 px-2 shadow-lg">
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// IconButton.tsx
import { ButtonHTMLAttributes } from "react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const IconButton = ({
  icon,
  variant = "primary",
  size = "md",
  isLoading = false,
  className = "",
  disabled,
  ...props
}: IconButtonProps) => {
  const baseClasses = "rounded-full flex items-center justify-center transition-all duration-200";

  const variantClasses = {
    primary: "bg-primary hover:bg-primary-dark text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-900",
    ghost: "hover:bg-gray-100 text-gray-600"
  };

  const sizeClasses = {
    sm: "p-1",
    md: "p-2",
    lg: "p-3"
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };

  return (
    <button
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <LoadingSpinner size={size} />
      ) : (
        <div className={iconSizes[size]}>{icon}</div>
      )}
    </button>
  );
};

export {
  Typography,
  Card,
  Badge,
  AnimatedNumber,
  LoadingSpinner,
  Progress,
  Tooltip,
  IconButton
};