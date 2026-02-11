import React from 'react';
import {
  LayoutDashboard,
  Package,
  Users,
  Settings,
  BarChart3,
  FileText,
  Bell,
  HelpCircle,
} from 'lucide-react';

interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const defaultItems: SidebarItem[] = [
  { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', active: true },
  { icon: <BarChart3 className="w-5 h-5" />, label: 'Analytics' },
  { icon: <Package className="w-5 h-5" />, label: 'Products' },
  { icon: <Users className="w-5 h-5" />, label: 'Customers' },
  { icon: <FileText className="w-5 h-5" />, label: 'Reports' },
  { icon: <Bell className="w-5 h-5" />, label: 'Notifications' },
  { icon: <Settings className="w-5 h-5" />, label: 'Settings' },
  { icon: <HelpCircle className="w-5 h-5" />, label: 'Help' },
];

interface SidebarProps {
  items?: SidebarItem[];
  logo?: React.ReactNode;
}

export function Sidebar({ items = defaultItems, logo }: SidebarProps) {
  return (
    <div className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6">
        {logo || (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary" />
            <span className="text-lg font-semibold">Dashboard</span>
          </div>
        )}
      </div>
      
      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {items.map((item, index) => (
            <li key={index}>
              <button
                onClick={item.onClick}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  item.active
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                }`}
              >
                {item.icon}
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
