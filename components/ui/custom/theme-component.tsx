import { Moon, Sun } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

export const useTheme = () => {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => setIsDark(!isDark);

  const theme = {
    isDark,
    toggleTheme,
    bg: isDark
      ? "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
      : "bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50",
    cardBg: isDark
      ? "bg-white/10 backdrop-blur-2xl border-white/20"
      : "bg-white/80 backdrop-blur-2xl border-gray-200/50",
    textPrimary: isDark ? "text-white" : "text-gray-900",
    textSecondary: isDark ? "text-gray-300" : "text-gray-600",
    textTertiary: isDark ? "text-gray-400" : "text-gray-500",
    inputBg: isDark ? "bg-white/5" : "bg-gray-50/50",
    inputBorder: isDark ? "border-white/20" : "border-gray-200",
    inputFocusBorder: isDark ? "border-blue-400" : "border-blue-500",
    buttonGradient: isDark
      ? "from-blue-600 to-purple-600"
      : "from-blue-500 to-purple-500",
    oauthBg: isDark
      ? "bg-white/10 border-white/20"
      : "bg-white border-gray-200",
    oauthText: isDark ? "text-white" : "text-gray-700",
    particleColor: isDark ? "bg-blue-300" : "bg-purple-400",
    glowEffect: isDark
      ? "from-blue-500/20 to-purple-500/20"
      : "from-blue-500/10 to-purple-500/10",
  };

  return theme;
};

export const ThemeToggle: React.FC<{ theme: any }> = ({ theme }) => {
  return (
    <motion.button
      onClick={theme.toggleTheme}
      className={`fixed top-6 right-6 z-50 p-3 rounded-full ${
        theme.isDark
          ? "bg-white/10 border-white/20"
          : "bg-white/80 border-gray-200"
      } border backdrop-blur-lg hover:scale-105 transition-all duration-300`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <AnimatePresence mode="wait">
        {theme.isDark ? (
          <motion.div
            key="sun"
            initial={{ opacity: 0, rotate: -180 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 180 }}
            transition={{ duration: 0.3 }}
          >
            <Sun className="w-5 h-5 text-yellow-400" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ opacity: 0, rotate: 180 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: -180 }}
            transition={{ duration: 0.3 }}
          >
            <Moon className="w-5 h-5 text-purple-600" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};
