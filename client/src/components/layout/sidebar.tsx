import { useState } from "react";
import { useLocation } from "wouter";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  UserPlus, 
  Calendar, 
  Stethoscope, 
  Bed, 
  FileText, 
  Activity, 
  HeartHandshake,
  FlaskRound, 
  Pill, 
  Scan,
  CreditCard, 
  Receipt, 
  TrendingUp, 
  TrendingDown, 
  BookOpen,
  UserCheck, 
  DollarSign,
  Package, 
  Truck,
  BarChart3, 
  ClipboardList, 
  PieChart, 
  Menu,
  Hospital
} from "lucide-react";

const navigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    section: "main"
  },
  {
    title: "Core Administration",
    section: "core-admin",
    items: [
      {
        title: "User Management",
        href: "/administration/users",
        icon: Users
      },
      {
        title: "System Configuration",
        href: "/administration/system",
        icon: Settings
      }
    ]
  },
  {
    title: "Patient Management",
    section: "patient-mgmt",
    items: [
      {
        title: "Patient Registry",
        href: "/patient/registry",
        icon: UserPlus
      },
      {
        title: "Appointments & Scheduling",
        href: "/patient/appointments",
        icon: Calendar
      },
      {
        title: "Outpatient Management",
        href: "/patient/outpatient",
        icon: Stethoscope
      },
      {
        title: "Inpatient Management",
        href: "/patient/inpatient",
        icon: Bed
      },
      {
        title: "Electronic Health Records",
        href: "/patient/ehr",
        icon: FileText
      },
      {
        title: "Triage Management",
        href: "/patient/triage",
        icon: Activity
      },
      {
        title: "Therapy Management",
        href: "/patient/therapy",
        icon: HeartHandshake
      }
    ]
  },
  {
    title: "Clinical Support",
    section: "clinical-support",
    items: [
      {
        title: "Laboratory Management",
        href: "/clinical/laboratory",
        icon: FlaskRound
      },
      {
        title: "Pharmacy Management",
        href: "/clinical/pharmacy",
        icon: Pill
      },
      {
        title: "Radiology Management",
        href: "/clinical/radiology",
        icon: Scan
      }
    ]
  },
  {
    title: "Financial Management",
    section: "financial",
    items: [
      {
        title: "Billing & Invoicing",
        href: "/financial/billing",
        icon: CreditCard
      },
      {
        title: "Cashier & Collections",
        href: "/financial/cashier",
        icon: Receipt
      },
      {
        title: "Expenditure Management",
        href: "/financial/expenditure",
        icon: TrendingDown
      },
      {
        title: "Income Management",
        href: "/financial/income",
        icon: TrendingUp
      },
      {
        title: "General Ledger",
        href: "/financial/ledger",
        icon: BookOpen
      }
    ]
  },
  {
    title: "Staff & Payroll",
    section: "staff-payroll",
    items: [
      {
        title: "Staff Management",
        href: "/staff/management",
        icon: UserCheck
      },
      {
        title: "Payroll Management",
        href: "/staff/payroll",
        icon: DollarSign
      }
    ]
  },
  {
    title: "Inventory & Supply",
    section: "inventory-supply",
    items: [
      {
        title: "Inventory Management",
        href: "/inventory/management",
        icon: Package
      },
      {
        title: "Supply Chain Management",
        href: "/inventory/supply-chain",
        icon: Truck
      }
    ]
  },
  {
    title: "Reports & Analytics",
    section: "reports",
    items: [
      {
        title: "Operational Reports",
        href: "/reports/operational",
        icon: ClipboardList
      },
      {
        title: "Clinical Reports",
        href: "/reports/clinical",
        icon: BarChart3
      },
      {
        title: "Financial Reports",
        href: "/reports/financial",
        icon: PieChart
      },
      {
        title: "Inventory Reports",
        href: "/reports/inventory",
        icon: Package
      },
      {
        title: "Analytics Dashboard",
        href: "/reports/analytics",
        icon: BarChart3
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
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center">
              <Hospital className="text-blue-600 font-bold text-sm" />
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
      <nav className="flex-1 px-0 py-2 overflow-y-auto">
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

            // Section with sub-items
            return (
              <div key={item.section}>
                {!isCollapsed && (
                  <div className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {item.title}
                  </div>
                )}
                {item.items?.map((subItem) => (
                  <Link
                    key={subItem.href}
                    href={subItem.href}
                    className={cn(
                      "flex items-center py-2 text-sm transition-colors hover:bg-gray-700",
                      isCollapsed ? "px-3 justify-center" : "px-8",
                      isActive(subItem.href)
                        ? "bg-green-400 text-white border-r-4 border-green-300"
                        : "text-gray-300"
                    )}
                    title={isCollapsed ? subItem.title : undefined}
                  >
                    <div className={`flex items-center ${isCollapsed ? '' : 'space-x-3'}`}>
                      {subItem.icon && <subItem.icon className="w-4 h-4" />}
                      {!isCollapsed && <span>{subItem.title}</span>}
                    </div>
                  </Link>
                ))}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="bg-gray-900 px-4 py-3">
        {!isCollapsed && (
          <div className="text-xs text-gray-400">
            Hospital Management System v2.0
          </div>
        )}
      </div>
    </aside>
  );
}