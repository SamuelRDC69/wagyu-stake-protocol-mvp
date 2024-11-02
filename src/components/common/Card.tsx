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
