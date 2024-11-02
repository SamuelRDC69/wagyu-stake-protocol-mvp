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