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
  ChevronRight
} from "lucide-react";

const navigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    section: "main"
  },
  {
    title: "Patient Administration",
    section: "patient-admin",
    items: [
      {
        title: "Patient Registration",
        href: "/patient-registration",
        icon: UserPlus
      },
      {
        title: "Cashier",
        href: "/cashier",
        icon: CreditCard
      },
      {
        title: "Triage",
        href: "/triage",
        icon: Stethoscope
      },
      {
        title: "Therapy",
        href: "/therapy",
        icon: Users
      },
      {
        title: "Outpatient",
        href: "/outpatient",
        icon: UserCheck
      },
      {
        title: "Inpatient",
        href: "/inpatient",
        icon: Bed
      },
      {
        title: "Appointments",
        href: "/appointments",
        icon: Calendar
      }
    ]
  },
  {
    title: "Clinical Support",
    section: "clinical",
    items: [
      {
        title: "Laboratory",
        href: "/laboratory",
        icon: FlaskRound
      },
      {
        title: "Pharmacy",
        href: "/pharmacy",
        icon: Pill
      },
      {
        title: "Radiology",
        href: "/radiology",
        icon: XRay
      }
    ]
  },
  {
    title: "Financial Management",
    section: "financial",
    items: [
      {
        title: "Billing",
        href: "/billing",
        icon: FileText
      },
      {
        title: "Professional Billing",
        href: "/professional-billing",
        icon: Shield
      },
      {
        title: "Insurance",
        href: "/insurance",
        icon: Shield
      }
    ]
  },
  {
    title: "Reports & Analytics",
    section: "reports",
    items: [
      {
        title: "Reports",
        href: "/reports",
        icon: BarChart3
      },
      {
        title: "Analytics",
        href: "/analytics",
        icon: Activity
      }
    ]
  }
];

export default function Sidebar() {
  const [location] = useLocation();

  const isActive = (href: string) => {
    return location === href || (href === "/dashboard" && location === "/");
  };

  return (
    <aside className="w-64 bg-gray-800 text-white flex flex-col min-h-screen">
      {/* Header */}
      <div className="bg-blue-400 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center">
              <span className="text-blue-400 font-bold text-sm">CMH</span>
            </div>
            <div>
              <div className="text-white font-bold text-lg">Child Mental Haven</div>
              <div className="text-blue-100 text-xs">Where Young Minds Evolve</div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Toggle */}
      <div className="bg-green-400 px-4 py-3 flex items-center space-x-2 cursor-pointer hover:bg-green-500 transition-colors">
        <Menu className="w-5 h-5" />
        <span className="font-medium">MENU</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-0 py-2">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            if (item.section === "main") {
              return (
                <Link
                  key={item.href}
                  href={item.href!}
                  className={cn(
                    "flex items-center justify-between px-6 py-3 text-sm font-medium transition-colors hover:bg-gray-700",
                    isActive(item.href!)
                      ? "bg-green-400 text-white border-r-4 border-green-300"
                      : "text-gray-300"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="w-5 h-5" />
                    <span>{item.title}</span>
                  </div>
                </Link>
              );
            }

            return (
              <div key={item.section} className="py-2">
                <div className="px-6 py-2">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {item.title}
                  </h3>
                </div>
                <div className="space-y-1">
                  {item.items?.map((subItem) => (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      className={cn(
                        "flex items-center justify-between px-6 py-3 text-sm font-medium transition-colors hover:bg-gray-700",
                        isActive(subItem.href)
                          ? "bg-green-400 text-white border-r-4 border-green-300"
                          : "text-gray-300"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <subItem.icon className="w-5 h-5" />
                        <span>{subItem.title}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-700">
        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <div className="w-4 h-4 bg-blue-400 rounded-sm flex items-center justify-center">
            <span className="text-white text-xs">?</span>
          </div>
          <span>Support</span>
          <span className="ml-auto">v1.0.0</span>
        </div>
      </div>
    </aside>
  );
}
