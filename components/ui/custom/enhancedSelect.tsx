import { useState } from "react";
import { motion } from "motion/react";

interface EnhancedSelectProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  theme: { bg: string; text: string; border: string; hover: string };
}

const EnhancedSelect: React.FC<EnhancedSelectProps> = ({
  options,
  value,
  onChange,
  placeholder,
  theme,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <motion.button
        className={`${theme.bg} ${theme.text} ${theme.border} rounded-2xl p-2 w-full text-left flex justify-between items-center`}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span>
          {options.find((opt) => opt.value === value)?.label || placeholder}
        </span>
        <span>▼</span>
      </motion.button>
      {isOpen && (
        <motion.ul
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${theme.bg} ${theme.border} rounded-2xl mt-1 absolute w-full z-10 shadow-lg`}
        >
          {options.map((option) => (
            <motion.li
              key={option.value}
              className={`${theme.hover} p-2 cursor-pointer`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              whileHover={{ backgroundColor: theme.hover }}
            >
              {option.label}
            </motion.li>
          ))}
        </motion.ul>
      )}
    </div>
  );
};

export default EnhancedSelect;
