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
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

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
      {collapsed ? (
        <>
          <div className="w-15  shadow-sm p-1 bg-[#f7f7f7] rounded-2xl mr-6">
            <div className="flex items-center flex-col space-y-2 p-5">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div className="border-b-2 mt-1 border-gray-300 h-1 w-full " />
              <div className="w-8 h-8 flex items-center justify-center">
                <PanelRight
                  onClick={() => {
                    setCollapsed(false);
                  }}
                />
              </div>
              <div className="border-b-2 border-gray-300 h-1 w-full " />
              <nav>
                <div className="flex items-center justify-center flex-col gap-5">
                  {SidebarItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        href={item.href}
                        key={item.name}
                        className="relative"
                      >
                        {isActive && (
                          <span className="absolute left-0 top-0 h-full w-1 bg-emerald-600 rounded-r-sm" />
                        )}
                        <Icon
                          className={`w-5 h-5 mr-3 ml-3 ${
                            isActive
                              ? "text-emerald-600 font-semibold"
                              : "text-gray-600"
                          }`}
                        />
                      </Link>
                    );
                  })}
                </div>
              </nav>
            </div>
          </div>
        </>
      ) : (
        <div className="w-64  shadow-sm flex flex-col p-1 bg-[#f7f7f7] rounded-2xl mr-6">
          <div className="flex items-center space-x-2 p-5 ">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Taskito</span>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-2">
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wider px-2 mb-3">
              Menu
            </div>
            <div>
              {SidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group relative flex items-center px-3 py-2 text-md font-medium rounded-lg  ${
                      isActive
                        ? "text-gray-900 hover:bg-gray-100 font-semibold"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-0 h-full w-2 bg-emerald-600 rounded-r-md" />
                    )}
                    <Icon
                      className={`w-5 h-5 mr-3 ml-3 ${
                        isActive
                          ? "text-emerald-600 font-semibold"
                          : "text-gray-600"
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      )}

      {/* <a
          href="#"
          className="flex items-center px-3 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg"
        >
          <BarChart3 className="w-4 h-4 mr-3" />
          Dashboard
        </a>
        <a
          href="#"
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          <CheckCircle2 className="w-4 h-4 mr-3" />
          Tasks
          <span className="ml-auto bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full">
            12
          </span>
        </a>
        <a
          href="#"
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          <Calendar className="w-4 h-4 mr-3" />
          Calendar
        </a>
        <a
          href="#"
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          <BarChart3 className="w-4 h-4 mr-3" />
          Analytics
        </a>
        <a
          href="#"
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          <Users className="w-4 h-4 mr-3" />
          Team
        </a>

        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2 mb-3 mt-6">
          General
        </div>
        <a
          href="#"
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          <Settings className="w-4 h-4 mr-3" />
          Settings
        </a>
        <a
          href="#"
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          <HelpCircle className="w-4 h-4 mr-3" />
          Help
        </a>
        <a
          href="#"
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          <LogOut className="w-4 h-4 mr-3" />
          Logout
        </a> */}
    </div>
  );
};

export default Sidebar;
