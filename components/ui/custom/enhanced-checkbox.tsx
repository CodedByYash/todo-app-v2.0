import { CheckCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { ThemeType } from "@/components/ui/custom/theme-component";
export const EnhancedCheckbox: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  theme: ThemeType;
}> = ({ checked, onChange, label, theme }) => {
  return (
    <motion.div
      className="flex items-center space-x-2"
      whileHover={{ scale: 1.02 }}
    >
      <motion.div
        className={`relative w-5 h-5 rounded border-2 transition-all duration-300 cursor-pointer ${
          checked
            ? "bg-blue-500 border-blue-500"
            : `${theme.inputBorder} hover:border-blue-400`
        }`}
        onClick={() => onChange(!checked)}
        whileTap={{ scale: 0.9 }}
      >
        <AnimatePresence>
          {checked && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <CheckCircle className="w-3 h-3 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <span
        className={`text-sm ${theme.textSecondary} cursor-pointer`}
        onClick={() => onChange(!checked)}
      >
        {label}
      </span>
    </motion.div>
  );
};
