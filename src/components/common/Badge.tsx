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