import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface AnimatingTokenAmountProps {
  value: number;
  precision?: number;
}

// Format number for display with specified precision
const formatForDisplay = (number = 0, precision = 8) => {
  return number.toFixed(precision).split('').reverse();
};

const DecimalColumn = () => {
  return (
    <div className="flex items-center justify-center w-2">
      <span>.</span>
    </div>
  );
};

const NumberColumn = ({ digit, delta }: { digit: string; delta: string | null }) => {
  const [position, setPosition] = useState(0);
  const [animationClass, setAnimationClass] = useState<string | null>(null);
  const previousDigit = useRef(digit);
  const columnContainer = useRef<HTMLDivElement>(null);

  const setColumnToNumber = (number: string) => {
    if (columnContainer.current) {
      setPosition(columnContainer.current.clientHeight * parseInt(number, 10));
    }
  };

  useEffect(() => {
    if (previousDigit.current !== digit) {
      setAnimationClass(delta);
      previousDigit.current = digit;
    }
  }, [digit, delta]);

  useEffect(() => {
    setColumnToNumber(digit);
  }, [digit]);

  return (
    <div className="ticker-column-container" ref={columnContainer}>
      <motion.div
        animate={{ y: position }}
        className={`ticker-column ${animationClass || ''}`}
        onAnimationComplete={() => setAnimationClass(null)}
      >
        {[9, 8, 7, 6, 5, 4, 3, 2, 1, 0].map((num) => (
          <div key={num} className="ticker-digit">
            <span>{num}</span>
          </div>
        ))}
      </motion.div>
      <span className="number-placeholder">0</span>
    </div>
  );
};

export const AnimatingTokenAmount: React.FC<AnimatingTokenAmountProps> = ({ value, precision = 8 }) => {
  const [previousValue, setPreviousValue] = useState(value);
  const numArray = formatForDisplay(value, precision);

  let delta: string | null = null;
  if (value > previousValue) delta = 'increase';
  if (value < previousValue) delta = 'decrease';

  useEffect(() => {
    setPreviousValue(value);
  }, [value]);

  return (
    <motion.div layout className="ticker-view">
      {numArray.map((number, index) =>
        number === '.' ? (
          <DecimalColumn key={index} />
        ) : (
          <NumberColumn key={index} digit={number} delta={delta} />
        )
      )}
    </motion.div>
  );
};

export default AnimatingTokenAmount;