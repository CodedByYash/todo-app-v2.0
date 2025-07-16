import {
  BarChart3,
  Bell,
  Calendar,
  CheckCircle2,
  FolderKanban,
  LayoutDashboard,
  PanelRight,
  Settings,
  Tag,
  Users,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence, Variants } from "motion/react";
import SidebarItem from "./SidebarItem";

const SidebarItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Tasks", href: "/tasks", icon: CheckCircle2 },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Team", href: "/team", icon: Users },
  { name: "Workspaces", href: "/workspace", icon: FolderKanban },
  { name: "Tags", href: "/tags", icon: Tag },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Notifications", href: "/notification", icon: Bell },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const pathname = usePathname();

  const handleToggleCollapse = () => {
    setCollapsed((prev) => !prev);
  };

  const sidebarVariants: Variants = {
    expanded: {
      width: 256,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 200,
      },
    },
    collapsed: {
      width: 80,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 200,
      },
    },
  };

  const logoVariants = {
    expanded: {
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.1,
        duration: 0.3,
      },
    },
    collapsed: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="h-full relative"
    >
      <motion.div
        initial="collapsed"
        animate={collapsed && !isHovered ? "collapsed" : "expanded"}
        variants={sidebarVariants}
        className="h-full flex flex-col bg-gradient-to-b from-white to-gray-50/50 backdrop-blur-sm shadow-xl shadow-gray-200/50 border border-gray-200/50 rounded-3xl mr-6 overflow-hidden"
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Logo Section */}
        <motion.div
          className={`
            flex items-center p-6 relative
            ${
              collapsed && !isHovered
                ? "justify-center"
                : "justify-start space-x-3"
            }
          `}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          <motion.div
            className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/25"
            whileHover={{
              scale: 1.1,
              rotate: [0, -10, 10, 0],
              transition: { duration: 0.5 },
            }}
            whileTap={{ scale: 0.95 }}
          >
            <CheckCircle2 className="w-6 h-6 text-white" />
          </motion.div>

          <AnimatePresence mode="wait">
            {(!collapsed || isHovered) && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col"
              >
                <span className="text-xl font-bold text-gray-900">Taskito</span>
                <span className="text-xs text-gray-500 font-medium">
                  Tasks Management
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Subtle glow effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-blue-500/5 rounded-2xl opacity-0"
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>

        {/* Divider */}
        <motion.div
          className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-6"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        />

        {/* Navigation Section */}
        <nav className="flex-1 flex flex-col pt-6">
          {/* Toggle Button */}
          <motion.div
            className={`
            flex items-center px-6 mb-6
            ${collapsed && !isHovered ? "justify-center" : "justify-between"}
          `}
          >
            <AnimatePresence mode="wait">
              {(!collapsed || isHovered) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="text-xs font-semibold text-gray-400 uppercase tracking-wider"
                >
                  Navigation
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              onClick={handleToggleCollapse}
              className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:shadow-md active:scale-95 group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <motion.div
                animate={{
                  rotate: collapsed && !isHovered ? 0 : 180,
                }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                }}
              >
                <PanelRight className="w-5 h-5 text-gray-600 group-hover:text-emerald-600" />
              </motion.div>
            </motion.button>
          </motion.div>

          {/* Navigation Items */}
          <motion.div
            className="flex flex-col space-y-2 px-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {SidebarItems.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.1 * index,
                    duration: 0.3,
                    ease: "easeOut",
                  }}
                >
                  <SidebarItem
                    collapsed={collapsed && !isHovered}
                    isActive={isActive}
                    item={item}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        </nav>

        {/* Footer */}
        <motion.div
          className="p-6 mt-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          <motion.div
            className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-4"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          />

          <AnimatePresence mode="wait">
            {(!collapsed || isHovered) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <p className="text-xs text-gray-500 font-medium">
                  Made with ❤️ by Team
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Background gradient overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5 pointer-events-none rounded-3xl"
          animate={{
            opacity: isHovered ? 1 : 0,
            scale: isHovered ? 1 : 0.98,
          }}
          transition={{ duration: 0.4 }}
        />
      </motion.div>
    </div>
  );
};

export default Sidebar;
