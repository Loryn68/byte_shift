import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  LayoutDashboard,
  UserPlus,
  Calendar,
  Stethoscope,
  Bed,
  FlaskRound,
  Pill,
  X as XRay,
  FileText,
  Shield,
  BarChart3,
  Activity,
  Users,
  UserCheck,
  CreditCard,
  Menu,
  Search,
  ClipboardList,
  Shield as ShieldIcon,
  FileCheck,
  Receipt,
  ChevronRight
} from "lucide-react";

const navigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard
  },
  {
    title: "Eligibility",
    href: "/patient-registration",
    icon: Search
  },
  {
    title: "Enrollment",
    href: "/cashier",
    icon: ClipboardList
  },
  {
    title: "Visits",
    href: "/outpatient",
    icon: UserCheck
  },
  {
    title: "Authorizations",
    href: "/triage",
    icon: ShieldIcon
  },
  {
    title: "Preauthorizations",
    href: "/therapy",
    icon: FileCheck
  },
  {
    title: "Invoices",
    href: "/billing",
    icon: Receipt
  },
  {
    title: "Auto Reconciliation",
    href: "/laboratory",
    icon: Activity
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart3,
    hasSubmenu: true
  },
  {
    title: "Payments",
    href: "/pharmacy",
    icon: CreditCard
  },
  {
    title: "EDI Billing",
    href: "/professional-billing",
    icon: FileText
  }
];

export default function Sidebar() {
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActive = (href: string) => {
    return location === href || (href === "/dashboard" && location === "/");
  };

  return (
    <aside className="w-64 bg-gray-800 text-white flex flex-col min-h-screen">
      {/* Header */}
      <div className="bg-purple-700 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center">
              <span className="text-purple-700 font-bold text-sm">CMH</span>
            </div>
            <div>
              <div className="text-white font-bold text-lg">Child Mental Haven</div>
              <div className="text-purple-200 text-xs">Healthcare Simplified</div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Toggle */}
      <div className="bg-green-600 px-4 py-3 flex items-center space-x-2 cursor-pointer hover:bg-green-700 transition-colors">
        <Menu className="w-5 h-5" />
        <span className="font-medium">MENU</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-0 py-2">
        <div className="space-y-1">
          {navigationItems.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-6 py-3 text-sm font-medium transition-colors hover:bg-gray-700",
                isActive(item.href)
                  ? "bg-green-600 text-white border-r-4 border-green-400"
                  : "text-gray-300"
              )}
            >
              <div className="flex items-center space-x-3">
                <item.icon className="w-5 h-5" />
                <span>{item.title}</span>
              </div>
              {item.hasSubmenu && (
                <ChevronRight className="w-4 h-4" />
              )}
            </Link>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-700">
        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <div className="w-4 h-4 bg-blue-500 rounded-sm flex items-center justify-center">
            <span className="text-white text-xs">?</span>
          </div>
          <span>Support</span>
          <span className="ml-auto">v4.3.9</span>
        </div>
      </div>
    </aside>
  );
}
