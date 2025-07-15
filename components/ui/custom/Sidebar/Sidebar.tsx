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

const handleClick = () => {};

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(true);
  const pathname = usePathname();
  return (
    <div
      onMouseEnter={() => setCollapsed(false)}
      onMouseLeave={() => setCollapsed(true)}
    >
      <div
        className={`transition-all duration-300 ease-in-out shadow-sm bg-[#f7f7f7] rounded-2xl mr-6 ${
          collapsed ? "w-16" : "w-64 flex flex-col"
        }  `}
      >
        <div
          className={`flex items-center p-3 transition-all duration-300 ease-in-out ${
            collapsed ? "justify-center" : "justify-start space-x-2"
          }`}
        >
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <span className="text-xl font-bold text-gray-900 transition-all duration-300">
              Taskito
            </span>
          )}
        </div>

        <div className="border-b-2 border-gray-300 h-1 w-full px-2" />

        <nav className={`${collapsed ? "" : "flex-1"}`}>
          {!collapsed ? (
            <div className="flex items-center justify-between p-2">
              {/* <div className="text-md font-medium text-gray-400 uppercase tracking-wider">
                Menu
              </div> */}
              <PanelRight
                className="w-5 h-5 cursor-pointer"
                onClick={() => setCollapsed(true)}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center p-2">
              <PanelRight
                className="w-5 h-5 cursor-pointer"
                onClick={() => {
                  setCollapsed((prev) => !prev);
                }}
              />
            </div>
          )}

          <div className="border-b-2 border-gray-300 h-1 w-full mb-4" />
          <div className="flex items-start justify-center flex-col space-y-2">
            {SidebarItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <SidebarItem
                  key={item.name}
                  collapsed={collapsed}
                  isActive={isActive}
                  item={item}
                />
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
