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
  Menu,
  X,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
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
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const memoizedSidebarItems = useMemo(() => SidebarItems, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  const handleToggleCollapse = () => {
    if (isMobile) {
      setMobileMenuOpen((prev) => !prev);
    } else {
      setCollapsed((prev) => !prev);
    }
  };

  const sidebarVariants: Variants = {
    expanded: {
      width: isMobile ? 256 : window.innerWidth >= 1536 ? 288 : 256,
      transition: { type: "spring", damping: 25, stiffness: 200 },
    },
    collapsed: {
      width: window.innerWidth >= 640 ? 80 : 64,
      transition: { type: "spring", damping: 25, stiffness: 200 },
    },
  };

  const mobileOverlayVariants = {
    open: { opacity: 1, transition: { duration: 0.3 } },
    closed: { opacity: 0, transition: { duration: 0.3 } },
  };

  const mobileMenuVariants: Variants = {
    open: {
      x: 0,
      transition: { type: "spring", damping: 25, stiffness: 200 },
    },
    closed: {
      x: "-100%",
      transition: { type: "spring", damping: 25, stiffness: 200 },
    },
  };

  if (isMobile) {
    return (
      <>
        <motion.button
          onClick={handleToggleCollapse}
          className="
            fixed top-6 left-6 z-50 p-2 sm:p-3
            bg-white shadow-lg border border-gray-200
            rounded-xl hover:shadow-xl
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-emerald-500
          "
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Toggle navigation menu"
        >
          <motion.div
            animate={{ rotate: mobileMenuOpen ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial="closed"
                animate="open"
                exit="closed"
                variants={mobileOverlayVariants}
                className="fixed inset-0 bg-black/40 sm:bg-black/50 backdrop-blur-sm z-40"
                onClick={() => setMobileMenuOpen(false)}
              />
              <motion.div
                initial="closed"
                animate="open"
                exit="closed"
                variants={mobileMenuVariants}
                className="
                  fixed top-0 left-0 h-full w-3/4 sm:w-64 min-w-[240px] z-50
                  bg-gradient-to-b from-stone-50 to-gray-50
                  shadow-2xl border-r border-gray-200
                  flex flex-col
                "
                role="navigation"
                aria-label="Main navigation"
                aria-expanded={mobileMenuOpen}
              >
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <motion.div
                    className="flex items-center space-x-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div
                      className="
                      w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600
                      rounded-2xl flex items-center justify-center
                      shadow-lg shadow-emerald-500/25
                    "
                    >
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <span className="text-lg sm:text-xl font-bold text-gray-900">
                        Taskito
                      </span>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Project Management
                      </p>
                    </div>
                  </motion.div>
                  <motion.button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </motion.button>
                </div>
                <nav className="flex-1 p-6 overflow-y-auto">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-2"
                  >
                    {memoizedSidebarItems.map((item, index) => (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index + 0.2, duration: 0.3 }}
                      >
                        <SidebarItem
                          collapsed={false}
                          isActive={pathname === item.href}
                          item={item}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                </nav>
                <motion.div
                  className="p-6 border-t border-gray-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <p className="text-xs sm:text-sm text-gray-500 text-center">
                    Made with ❤️ by Team
                  </p>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="h-full relative hidden md:block"
    >
      <motion.div
        initial="collapsed"
        animate={collapsed && !isHovered ? "collapsed" : "expanded"}
        variants={sidebarVariants}
        className="
          h-full flex flex-col
          bg-gradient-to-b from-stone-50 to-gray-50
          backdrop-blur-sm
          shadow-xl shadow-gray-200/50
          border border-gray-200/50
          rounded-2xl mr-4 sm:mr-6 xl:mr-8
          overflow-hidden
        "
        role="navigation"
        aria-label="Main navigation"
        aria-expanded={!collapsed || isHovered}
      >
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
            className="
              w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600
              rounded-2xl flex items-center justify-center shrink-0
              shadow-lg shadow-emerald-500/25
            "
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
                <span className="text-lg sm:text-xl font-bold text-gray-900">
                  Taskito
                </span>
                <span className="text-xs sm:text-sm text-gray-500 font-medium">
                  Project Management
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-blue-500/5 rounded-2xl opacity-0"
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
        <motion.div
          className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-6"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        />
        <nav className="flex-1 flex flex-col pt-6 overflow-y-auto">
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
              className="
                p-2 hover:bg-gray-100 rounded-xl
                transition-all duration-200
                hover:shadow-md active:scale-95
                group
                focus:outline-none focus:ring-2 focus:ring-emerald-500
              "
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <motion.div
                animate={{ rotate: collapsed && !isHovered ? 0 : 180 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <PanelRight className="w-5 h-5 text-gray-600 group-hover:text-emerald-600" />
              </motion.div>
            </motion.button>
          </motion.div>
          <motion.div
            className="flex flex-col space-y-2 px-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {memoizedSidebarItems.map((item, index) => (
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
                  isActive={pathname === item.href}
                  item={item}
                />
              </motion.div>
            ))}
          </motion.div>
        </nav>
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
                <p className="text-xs sm:text-sm text-gray-500 font-medium">
                  Made with ❤️ by Team
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        <motion.div
          className="
            absolute inset-0 bg-gradient-to-br
            from-emerald-500/5 via-transparent to-blue-500/5
            pointer-events-none rounded-2xl
          "
          animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.98 }}
          transition={{ duration: 0.4 }}
        />
      </motion.div>
    </div>
  );
};

export default Sidebar;
