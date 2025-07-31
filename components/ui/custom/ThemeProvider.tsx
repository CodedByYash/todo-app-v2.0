"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Moon, Sun } from "lucide-react";
import { motion } from "motion/react";

export interface ThemeType {
  isDark: boolean;
  toggleTheme: () => void;
  bg: string;
  cardBg: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  inputBg: string;
  inputBorder: string;
  inputFocusBorder: string;
  buttonGradient: string;
  oauthBg: string;
  oauthText: string;
  particleColor: string;
  glowEffect: string;
}

const ThemeContext = createContext<ThemeType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: session } = useSession();
  const [themeMode, setThemeMode] = useState<"LIGHT" | "DARK" | "SYSTEM">(
    "SYSTEM"
  );
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const fetchTheme = async () => {
      if (!session?.user?.id) return;
      try {
        const response = await fetch("/api/preferences");
        if (response.ok) {
          const data = await response.json();
          setThemeMode(data.theme || "SYSTEM");
        }
      } catch (error) {
        console.error("Error fetching theme:", error);
      }
    };
    fetchTheme();
  }, [session]);

  useEffect(() => {
    const updateTheme = () => {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setIsDark(
        themeMode === "DARK" || (themeMode === "SYSTEM" && prefersDark)
      );
    };
    updateTheme();
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", updateTheme);
    return () => mediaQuery.removeEventListener("change", updateTheme);
  }, [themeMode]);

  const toggleTheme = async () => {
    const newMode = themeMode === "DARK" ? "LIGHT" : "DARK";
    setThemeMode(newMode);
    if (session?.user?.id) {
      try {
        await fetch("/api/preferences", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ theme: newMode }),
        });
      } catch (error) {
        console.error("Error updating theme:", error);
      }
    }
  };

  const theme: ThemeType = {
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
      : "from-emerald-500 to-emerald-600", // Updated to emerald
    oauthBg: isDark
      ? "bg-white/10 border-white/20"
      : "bg-white border-gray-200",
    oauthText: isDark ? "text-white" : "text-gray-700",
    particleColor: isDark ? "bg-blue-300" : "bg-emerald-400", // Updated to emerald
    glowEffect: isDark
      ? "from-blue-500/20 to-purple-500/20"
      : "from-emerald-500/10 to-emerald-600/10", // Updated to emerald
  };

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
};

export const ThemeToggle: React.FC<{ theme: ThemeType }> = ({ theme }) => {
  return (
    <motion.button
      onClick={theme.toggleTheme}
      className={`fixed top-4 right-4 z-50 p-3 rounded-full ${
        theme.isDark
          ? "bg-white/10 border-white/20"
          : "bg-white/80 border-gray-200"
      } border backdrop-blur-sm shadow-lg`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        animate={{ rotate: theme.isDark ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {theme.isDark ? (
          <Sun className="w-5 h-5 text-yellow-400" />
        ) : (
          <Moon className="w-5 h-5 text-gray-600" />
        )}
      </motion.div>
    </motion.button>
  );
};
