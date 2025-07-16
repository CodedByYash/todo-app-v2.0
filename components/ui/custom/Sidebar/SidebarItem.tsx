import Link from "next/link";
import { ElementType } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarItemProps {
  collapsed: boolean;
  isActive: boolean;
  item: {
    href: string;
    name: string;
    icon: ElementType;
  };
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  item,
  isActive,
  collapsed,
}) => {
  const Icon = item.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <Link
        href={item.href}
        className={`
          group relative flex items-center rounded-xl transition-all duration-300 ease-in-out
          ${collapsed ? "justify-center p-3" : "justify-start p-3 mx-2"}
          ${
            isActive
              ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25"
              : "text-gray-700 hover:bg-gray-100 hover:shadow-md"
          }
        `}
      >
        {/* Active indicator for collapsed state */}
        {isActive && collapsed && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-emerald-600 rounded-full"
          />
        )}

        {/* Icon */}
        <motion.div
          className={`
            flex items-center justify-center rounded-lg
            ${collapsed ? "w-6 h-6" : "w-8 h-8 mr-3"}
            ${
              isActive
                ? "text-white"
                : "text-gray-600 group-hover:text-emerald-600"
            }
          `}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Icon className="w-5 h-5" />
        </motion.div>

        {/* Label with animation */}
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className={`
                text-sm font-medium whitespace-nowrap overflow-hidden
                ${
                  isActive
                    ? "text-white"
                    : "text-gray-700 group-hover:text-gray-900"
                }
              `}
            >
              {item.name}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Tooltip for collapsed state */}
        {collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 0, x: -10 }}
            whileHover={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="
              absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg z-50 whitespace-nowrap pointer-events-none before:content-[''] before:absolute before:right-full before:top-1/2  before:transform before:-translate-y-1/2 before:border-4  before:border-transparent before:border-r-gray-900
            "
          >
            {item.name}
          </motion.div>
        )}

        {/* Hover effect */}
        {!isActive && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            layoutId="sidebar-hover"
          />
        )}
      </Link>
    </motion.div>
  );
};

export default SidebarItem;
