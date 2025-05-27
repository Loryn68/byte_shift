import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
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
  CreditCard
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
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200">
      <div className="p-6">
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            if (item.section === "main") {
              return (
                <Link
                  key={item.href}
                  href={item.href!}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors",
                    isActive(item.href!)
                      ? "text-primary bg-blue-50"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.title}</span>
                </Link>
              );
            }

            return (
              <div key={item.section} className="pt-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {item.title}
                </h3>
                <div className="space-y-1">
                  {item.items?.map((subItem) => (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      className={cn(
                        "flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors",
                        isActive(subItem.href)
                          ? "text-primary bg-blue-50 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      <subItem.icon className="w-5 h-5" />
                      <span>{subItem.title}</span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
