"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface EnhancedSelectProps {
  options: { value: string; label: string }[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  isMulti?: boolean;
  theme: { bg: string; text: string; border: string; hover: string };
}

const EnhancedSelect: React.FC<EnhancedSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  isMulti = false,
  theme,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (optionValue: string) => {
    if (isMulti) {
      const currentValues = Array.isArray(value) ? value : [];
      if (currentValues.includes(optionValue)) {
        onChange(currentValues.filter((v) => v !== optionValue));
      } else {
        onChange([...currentValues, optionValue]);
      }
    } else {
      onChange(optionValue);
      setIsOpen(false);
    }
  };

  const displayValue = (() => {
    if (isMulti && Array.isArray(value)) {
      const selectedLabels = value
        .map((val) => options.find((opt) => opt.value === val)?.label)
        .filter((label): label is string => Boolean(label));
      return selectedLabels.length > 0
        ? selectedLabels.join(", ")
        : placeholder;
    }
    const selectedOption = options.find((opt) => opt.value === value);
    return selectedOption ? selectedOption.label : placeholder;
  })();

  return (
    <div className="relative">
      <motion.button
        type="button"
        className={`${theme.bg} ${theme.text} ${theme.border} rounded-2xl p-2 w-full text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-emerald-500`}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        aria-expanded={isOpen}
        aria-label={placeholder}
      >
        <span className="truncate">{displayValue}</span>
        <span>▼</span>
      </motion.button>
      {isOpen && (
        <motion.ul
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`${theme.bg} ${theme.border} rounded-2xl mt-1 absolute w-full z-10 shadow-lg max-h-60 overflow-y-auto`}
        >
          {options.map((option) => (
            <motion.li
              key={option.value}
              className={`${theme.hover} p-2 cursor-pointer flex items-center`}
              onClick={() => handleSelect(option.value)}
              whileHover={{ backgroundColor: theme.hover }}
            >
              {isMulti && (
                <input
                  type="checkbox"
                  checked={Array.isArray(value) && value.includes(option.value)}
                  readOnly
                  className="mr-2"
                />
              )}
              {option.label}
            </motion.li>
          ))}
        </motion.ul>
      )}
    </div>
  );
};

export default EnhancedSelect;
