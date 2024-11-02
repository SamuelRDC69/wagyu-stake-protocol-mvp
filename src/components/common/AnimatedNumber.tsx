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