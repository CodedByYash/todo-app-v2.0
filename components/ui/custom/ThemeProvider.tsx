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
  }, [session?.user?.id]);

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

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

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
      ? "bg-[#0e1512]"
      : "bg-[#f7f8f5]",
    cardBg: isDark
      ? "bg-[#17211c] border border-white/10"
      : "bg-white border border-[#dde3dc]",
    textPrimary: isDark ? "text-white" : "text-gray-900",
    textSecondary: isDark ? "text-gray-300" : "text-gray-600",
    textTertiary: isDark ? "text-gray-400" : "text-gray-500",
    inputBg: isDark ? "bg-white/5" : "bg-gray-50/50",
    inputBorder: isDark ? "border-white/20" : "border-gray-200",
    inputFocusBorder: isDark ? "border-emerald-400" : "border-emerald-600",
    buttonGradient: isDark
      ? "from-emerald-600 to-emerald-700"
      : "from-emerald-600 to-emerald-700",
    oauthBg: isDark
      ? "bg-white/10 border-white/20"
      : "bg-white border-gray-200",
    oauthText: isDark ? "text-white" : "text-gray-700",
    particleColor: isDark ? "bg-emerald-300" : "bg-emerald-400",
    glowEffect: isDark
      ? "from-emerald-500/20 to-emerald-600/20"
      : "from-emerald-500/10 to-emerald-600/10",
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
