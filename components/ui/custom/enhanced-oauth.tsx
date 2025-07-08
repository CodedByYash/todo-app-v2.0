import { useState } from "react";
import { motion } from "motion/react";

export const OAuthButton: React.FC<{
  provider: "google" | "github";
  onClick: () => void;
  children: React.ReactNode;
  theme: any;
}> = ({ provider, onClick, children, theme }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      type="button"
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative w-full group"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div
        className={`relative overflow-hidden rounded-xl border-2 ${theme.oauthBg} p-3 transition-all duration-300 hover:shadow-lg`}
      >
        {/* Animated gradient background */}
        <motion.div
          className={`absolute inset-0 ${
            theme.isDark
              ? provider === "google"
                ? "bg-gradient-to-r from-blue-50/5 to-red-50/5"
                : "bg-gradient-to-r from-gray-50/5 to-purple-50/5"
              : provider === "google"
              ? "bg-gradient-to-r from-blue-50 to-red-50"
              : "bg-gradient-to-r from-gray-50 to-purple-50"
          } opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
        />

        {/* Content */}
        <div className="relative z-10 flex items-center justify-center space-x-3">
          {children}
        </div>

        {/* Shimmer effect */}
        <motion.div
          className={`absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent ${
            theme.isDark ? "via-white/10" : "via-white/50"
          } to-transparent opacity-30`}
          animate={{
            x: isHovered ? "200%" : "-100%",
          }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />
      </div>
    </motion.button>
  );
};
