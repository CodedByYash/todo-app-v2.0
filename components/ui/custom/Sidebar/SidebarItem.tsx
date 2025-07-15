import Link from "next/link";
import { ElementType } from "react";

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
    <Link
      href={item.href}
      key={item.name}
      className={`p-1 relative ${
        collapsed
          ? ""
          : "group flex items-center  text-md font-medium rounded-lg"
      } ${
        isActive
          ? "text-gray-900 hover:bg-gray-100 font-semibold"
          : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      {isActive && (
        <span className="absolute left-0 top-0 h-full w-2 bg-emerald-600 rounded-r-sm" />
      )}
      <span className="flex items-center justify-center p-1 w-full">
        <Icon
          className={`w-5 h-5 mr-3 ml-3 ${
            isActive ? "text-emerald-600 font-semibold" : "text-gray-600"
          }`}
        />
        {!collapsed && item.name}
      </span>
    </Link>
  );
};
export default SidebarItem;
