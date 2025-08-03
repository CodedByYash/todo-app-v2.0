"use client";

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
  LogOut,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, Variants } from "motion/react";
import SidebarItem from "./SidebarItem";
import { signOut } from "next-auth/react";
import EnhancedSelect from "../enhancedSelect";
import { useWorkspace, Workspace } from "@/components/WorkspaceProvider";
import { useTheme } from "@/components/ui/custom/ThemeProvider";

const SidebarItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Tasks", href: "/tasks", icon: CheckCircle2 },
  { name: "Calendar", href: "/calendar", icon: Calendar }, // Fixed icon to Calendar
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Team", href: "/team", icon: Users },
  { name: "Workspaces", href: "/workspace", icon: FolderKanban },
  { name: "Tags", href: "/tags", icon: Tag },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Notifications", href: "/notification", icon: Bell },
];

const Sidebar = () => {
  const { buttonGradient } = useTheme();
  const [collapsed, setCollapsed] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { selectedWorkspace, setSelectedWorkspace, workspaces } =
    useWorkspace();
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

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/auth/signin" });
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
    open: { x: 0, transition: { type: "spring", damping: 25, stiffness: 200 } },
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
          className="fixed top-6 left-6 z-50 rounded-2xl border border-gray-200 bg-white p-2 shadow-lg transition-all duration-200 hover:shadow-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none sm:p-3"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Toggle navigation menu"
        >
          <motion.div
            animate={{ rotate: mobileMenuOpen ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
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
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm sm:bg-black/50"
                onClick={() => setMobileMenuOpen(false)}
              />
              <motion.div
                initial="closed"
                animate="open"
                exit="closed"
                variants={mobileMenuVariants}
                className="fixed top-0 left-0 z-50 flex h-full w-3/4 min-w-[240px] flex-col border-r border-gray-200 bg-gradient-to-b from-stone-50 to-gray-50 shadow-2xl sm:w-64"
                role="navigation"
                aria-label="Main navigation"
                aria-expanded={mobileMenuOpen}
              >
                <div className="flex items-center justify-between border-b border-gray-200 p-6">
                  <motion.div
                    className="flex items-center space-x-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/25">
                      <CheckCircle2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <span className="text-lg font-bold text-gray-900 sm:text-xl">
                        Taskito
                      </span>
                      <p className="text-xs text-gray-500 sm:text-sm">
                        Project Management
                      </p>
                    </div>
                  </motion.div>
                  <motion.button
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-2xl p-2 transition-colors hover:bg-gray-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X className="h-5 w-5 text-gray-600" />
                  </motion.button>
                </div>
                <div className="p-6">
                  <EnhancedSelect
                    options={workspaces.map((ws: Workspace) => ({
                      value: ws.id,
                      label: ws.workspacename,
                    }))}
                    value={selectedWorkspace || ""}
                    onChange={(value) =>
                      setSelectedWorkspace(
                        Array.isArray(value) ? value[0] : value,
                      )
                    }
                    placeholder="Select Workspace"
                    theme={{
                      bg: "bg-white",
                      text: "text-gray-900",
                      border: "border-gray-200",
                      hover: "hover:bg-emerald-50",
                    }}
                  />
                </div>
                <nav className="flex-1 overflow-y-auto p-6">
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
                  className="border-t border-gray-200 p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <motion.button
                    onClick={handleSignOut}
                    className={`flex w-full items-center justify-center space-x-2 bg-gradient-to-r px-4 py-2 ${buttonGradient} rounded-2xl text-white transition-all duration-200 hover:shadow-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Sign out"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                  </motion.button>
                  <p className="mt-4 text-center text-xs text-gray-500 sm:text-sm">
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
      className="relative hidden h-full md:block"
    >
      <motion.div
        initial="collapsed"
        animate={collapsed && !isHovered ? "collapsed" : "expanded"}
        variants={sidebarVariants}
        className="mr-4 flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200/50 bg-gradient-to-b from-stone-50 to-gray-50 shadow-xl shadow-gray-200/50 backdrop-blur-sm sm:mr-6 xl:mr-8"
        role="navigation"
        aria-label="Main navigation"
        aria-expanded={!collapsed || isHovered}
      >
        <motion.div
          className={`relative flex items-center p-6 ${
            collapsed && !isHovered
              ? "justify-center"
              : "justify-start space-x-3"
          }`}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          <motion.div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/25"
            whileHover={{
              scale: 1.1,
              rotate: [0, -10, 10, 0],
              transition: { duration: 0.5 },
            }}
            whileTap={{ scale: 0.95 }}
          >
            <CheckCircle2 className="h-6 w-6 text-white" />
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
                <span className="text-lg font-bold text-gray-900 sm:text-xl">
                  Taskito
                </span>
                <span className="text-xs font-medium text-gray-500 sm:text-sm">
                  Project Management
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.div
            className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/5 to-blue-500/5 opacity-0"
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
        <motion.div
          className="mx-6 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        />
        <div className="px-6 py-4">
          <EnhancedSelect
            options={workspaces.map((ws: Workspace) => ({
              value: ws.id,
              label: ws.workspacename,
            }))}
            value={selectedWorkspace || ""}
            onChange={(value) =>
              setSelectedWorkspace(Array.isArray(value) ? value[0] : value)
            }
            placeholder="Select Workspace"
            theme={{
              bg: "bg-white",
              text: "text-gray-900",
              border: "border-gray-200",
              hover: "hover:bg-emerald-50",
            }}
          />
        </div>
        <nav className="flex flex-1 flex-col overflow-y-auto pt-2">
          <motion.div
            className={`mb-6 flex items-center px-6 ${
              collapsed && !isHovered ? "justify-center" : "justify-between"
            }`}
          >
            <AnimatePresence mode="wait">
              {(!collapsed || isHovered) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="text-xs font-semibold tracking-wider text-gray-400 uppercase"
                >
                  Navigation
                </motion.div>
              )}
            </AnimatePresence>
            <motion.button
              onClick={handleToggleCollapse}
              className="group rounded-2xl p-2 transition-all duration-200 hover:bg-gray-100 hover:shadow-md focus:ring-2 focus:ring-emerald-500 focus:outline-none active:scale-95"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <motion.div
                animate={{ rotate: collapsed && !isHovered ? 0 : 180 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <PanelRight className="h-5 w-5 text-gray-600 group-hover:text-emerald-600" />
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
          className="mt-auto p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          <motion.div
            className="mb-4 h-px w-full bg-gradient-to-r from-transparent via-gray-300 to-transparent"
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
              >
                <motion.button
                  onClick={handleSignOut}
                  className={`flex w-full items-center justify-center space-x-2 bg-gradient-to-r px-4 py-2 ${buttonGradient} rounded-2xl text-white transition-all duration-200 hover:shadow-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Sign out"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </motion.button>
                <p className="mt-4 text-center text-xs font-medium text-gray-500 sm:text-sm">
                  Made with ❤️ by Team
                </p>
              </motion.div>
            )}
            {collapsed && !isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="flex justify-center"
              >
                <motion.button
                  onClick={handleSignOut}
                  className={`bg-gradient-to-r p-2 ${buttonGradient} rounded-2xl text-white transition-all duration-200 hover:shadow-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Sign out"
                >
                  <LogOut className="h-5 w-5" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5"
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
