import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  UserPlus,
  CalendarPlus,
  FlaskRound,
  BarChart3
} from "lucide-react";

interface QuickActionsProps {
  onRegisterPatient: () => void;
}

export default function QuickActions({ onRegisterPatient }: QuickActionsProps) {
  const quickActions = [
    {
      title: "Register New Patient",
      description: "Add patient to system",
      icon: UserPlus,
      iconBg: "bg-blue-100",
      iconColor: "text-primary",
      onClick: onRegisterPatient
    },
    {
      title: "Schedule Appointment",
      description: "Book patient visit",
      icon: CalendarPlus,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      href: "/appointments"
    },
    {
      title: "Lab Order Entry",
      description: "Request lab tests",
      icon: FlaskRound,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      href: "/laboratory"
    },
    {
      title: "Generate Reports",
      description: "View analytics",
      icon: BarChart3,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      href: "/reports"
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
      </div>
      <div className="p-6">
        <div className="space-y-3">
          {quickActions.map((action, index) => {
            const content = (
              <div className="w-full flex items-center space-x-3 p-4 text-left hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                <div className={`w-10 h-10 ${action.iconBg} rounded-lg flex items-center justify-center`}>
                  <action.icon className={action.iconColor} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{action.title}</p>
                  <p className="text-sm text-gray-500">{action.description}</p>
                </div>
              </div>
            );

            if (action.href) {
              return (
                <Link key={index} href={action.href}>
                  {content}
                </Link>
              );
            }

            return (
              <button key={index} onClick={action.onClick} className="w-full">
                {content}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
