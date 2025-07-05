import { useState } from "react";
import { motion } from "framer-motion";

export const OAuthButton: React.FC<{
  provider: "google" | "github";
  onClick: () => void;
  children: React.ReactNode;
}> = ({ provider, onClick, children }) => {
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
      <div className="relative overflow-hidden rounded-2xl border-2 border-gray-200 bg-white p-4 transition-all duration-300 hover:border-gray-300 hover:shadow-lg">
        {/* Animated gradient background */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-r ${
            provider === "google"
              ? "from-blue-50 to-red-50"
              : "from-gray-50 to-purple-50"
          } opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
        />

        {/* Content */}
        <div className="relative z-10 flex items-center justify-center space-x-3">
          {children}
        </div>

        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
          animate={{
            x: isHovered ? "200%" : "-100%",
          }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />
      </div>
    </motion.button>
  );
};
