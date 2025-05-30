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
  ChevronRight,
  TrendingUp,
  DollarSign
} from "lucide-react";

const navigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    section: "main"
  },
  {
    title: "Administrator",
    section: "administrator",
    items: [
      {
        title: "Register User",
        href: "/administrator/register",
        icon: UserPlus
      },
      {
        title: "Registered Users",
        href: "/administrator/users",
        icon: Users
      },
      {
        title: "Assign User Rights",
        href: "/administrator/rights",
        icon: Shield
      },
      {
        title: "Remove/Delete",
        href: "/administrator/remove",
        icon: UserCheck
      },
      {
        title: "Change Password",
        href: "/administrator/passwords",
        icon: Shield
      },
      {
        title: "Users Activeness",
        href: "/administrator/activity",
        icon: Activity
      }
    ]
  },
  {
    title: "Patient Administrator",
    section: "patient-admin",
    items: [
      {
        title: "Registry",
        href: "/patient-registration",
        icon: UserCheck
      },
      {
        title: "Cashier",
        href: "/cashier",
        icon: CreditCard
      },
      {
        title: "Triage",
        href: "/triage",
        icon: Activity
      },
      {
        title: "Therapy",
        href: "/therapy",
        icon: Shield
      },
      {
        title: "Outpatient",
        href: "/outpatient",
        icon: Users
      },
      {
        title: "Inpatient",
        href: "/inpatient",
        icon: Bed
      },
      {
        title: "Laboratory",
        href: "/laboratory",
        icon: FlaskRound
      },
      {
        title: "Pharmacy",
        href: "/pharmacy",
        icon: Pill
      }
    ]
  },
  {
    title: "Financial Management",
    section: "financial",
    items: [
      {
        title: "Inpatient Billing",
        href: "/financial-management/inpatient",
        icon: FileText
      },
      {
        title: "Outpatient Billing",
        href: "/financial-management/outpatient",
        icon: FileText
      },
      {
        title: "Salaries",
        href: "/financial-management/salaries",
        icon: CreditCard
      },
      {
        title: "Unpaid Bills",
        href: "/financial-management/unpaid",
        icon: FileText
      },
      {
        title: "Paid Bills",
        href: "/financial-management/paid",
        icon: FileText
      },
      {
        title: "Petty Cash Book",
        href: "/financial-management/petty-cash",
        icon: CreditCard
      },
      {
        title: "Inventory",
        href: "/financial-management/inventory",
        icon: FileText
      },
      {
        title: "Income Generated",
        href: "/financial-management/income",
        icon: BarChart3
      },
      {
        title: "Insurance Billing",
        href: "/financial-management/insurance",
        icon: Shield
      }
    ]
  },
  {
    title: "Reports and Analytics",
    section: "reports",
    items: [
      {
        title: "Monthly Admission Reports",
        href: "/reports-analytics/admissions",
        icon: BarChart3
      },
      {
        title: "Monthly Outpatient Reports",
        href: "/reports-analytics/outpatient",
        icon: BarChart3
      },
      {
        title: "Growth Graph Per Month",
        href: "/reports-analytics/growth",
        icon: Activity
      },
      {
        title: "Monthly Therapy Reports",
        href: "/reports-analytics/therapy",
        icon: BarChart3
      },
      {
        title: "Monthly Income Reports",
        href: "/reports-analytics/income",
        icon: BarChart3
      },
      {
        title: "Monthly Pharmacy Reports",
        href: "/reports-analytics/pharmacy",
        icon: BarChart3
      },
      {
        title: "Monthly Insurance Reports",
        href: "/reports-analytics/insurance",
        icon: BarChart3
      },
      {
        title: "Monthly Laboratory Reports",
        href: "/reports-analytics/laboratory",
        icon: BarChart3
      },
      {
        title: "Monthly Expenditure Report",
        href: "/reports-analytics/expenditure",
        icon: BarChart3
      },
      {
        title: "Cumulative Report Per Year",
        href: "/reports-analytics/annual",
        icon: Activity
      }
    ]
  }
];

export default function Sidebar() {
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActive = (href: string) => {
    return location === href || (href === "/dashboard" && location === "/");
  };

  return (
    <aside className={`${isCollapsed ? 'w-16' : 'w-64'} bg-gray-800 text-white flex flex-col min-h-screen transition-all duration-300`}>
      {/* Header */}
      <div className="bg-blue-400 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center">
              <span className="text-blue-400 font-bold text-sm">CMH</span>
            </div>
            {!isCollapsed && (
              <div>
                <div className="text-white font-bold text-lg">Child Mental Haven</div>
                <div className="text-blue-100 text-xs">Where Young Minds Evolve</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Menu Toggle */}
      <div 
        className="bg-green-400 px-4 py-3 flex items-center space-x-2 cursor-pointer hover:bg-green-500 transition-colors"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <Menu className="w-5 h-5" />
        {!isCollapsed && <span className="font-medium">MENU</span>}
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
                    "flex items-center justify-between py-3 text-sm font-medium transition-colors hover:bg-gray-700",
                    isCollapsed ? "px-3 justify-center" : "px-6",
                    isActive(item.href!)
                      ? "bg-green-400 text-white border-r-4 border-green-300"
                      : "text-gray-300"
                  )}
                  title={isCollapsed ? item.title : undefined}
                >
                  <div className={`flex items-center ${isCollapsed ? '' : 'space-x-3'}`}>
                    {item.icon && <item.icon className="w-5 h-5" />}
                    {!isCollapsed && <span>{item.title}</span>}
                  </div>
                </Link>
              );
            }

            return (
              <div key={item.section} className="py-2">
                {!isCollapsed && (
                  <div className="px-6 py-2">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      {item.title}
                    </h3>
                  </div>
                )}
                <div className="space-y-1">
                  {item.items?.map((subItem) => (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      className={cn(
                        "flex items-center justify-between py-3 text-sm font-medium transition-colors hover:bg-gray-700",
                        isCollapsed ? "px-3 justify-center" : "px-6",
                        isActive(subItem.href)
                          ? "bg-green-400 text-white border-r-4 border-green-300"
                          : "text-gray-300"
                      )}
                      title={isCollapsed ? subItem.title : undefined}
                    >
                      <div className={`flex items-center ${isCollapsed ? '' : 'space-x-3'}`}>
                        <subItem.icon className="w-5 h-5" />
                        {!isCollapsed && <span>{subItem.title}</span>}
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
