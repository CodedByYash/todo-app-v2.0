import { Eye, EyeOff } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ThemeType } from "./theme-component";
export const EnhancedInput: React.FC<{
  icon: React.ReactNode;
  type: string;
  name: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  showPassword?: boolean;
  onTogglePassword?: () => void;
  theme: ThemeType;
}> = ({
  icon,
  type,
  name,
  placeholder,
  value,
  onChange,
  error,
  showPassword,
  onTogglePassword,
  theme,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      <motion.div
        className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${
          isFocused
            ? `${theme.inputFocusBorder} shadow-lg ${
                theme.isDark ? "shadow-blue-500/25" : "shadow-blue-500/15"
              }`
            : error
            ? "border-red-400"
            : theme.inputBorder
        }`}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        {/* Animated gradient background */}
        <div
          className={`absolute inset-0 ${
            theme.isDark
              ? "bg-gradient-to-r from-blue-50/5 to-purple-50/5"
              : "bg-gradient-to-r from-blue-50 to-purple-50"
          } opacity-50`}
        />

        {/* Input field */}
        <div className="relative">
          <div
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme.textTertiary} z-10`}
          >
            {icon}
          </div>
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`w-full pl-10 pr-10 py-3 bg-transparent border-0 focus:outline-none ${
              theme.textPrimary
            } ${
              theme.isDark ? "placeholder-gray-500" : "placeholder-gray-400"
            } relative z-10 text-sm`}
            placeholder={placeholder}
          />
          {onTogglePassword && (
            <button
              type="button"
              onClick={onTogglePassword}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${theme.textTertiary} hover:${theme.textSecondary} z-10`}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Animated border effect */}
        <motion.div
          className={`absolute inset-0 border-2 ${theme.inputFocusBorder} rounded-xl opacity-0`}
          animate={{
            opacity: isFocused ? 1 : 0,
            scale: isFocused ? 1 : 0.95,
          }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-red-500 text-sm mt-2 flex items-center space-x-1"
          >
            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
            <span>{error}</span>
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
