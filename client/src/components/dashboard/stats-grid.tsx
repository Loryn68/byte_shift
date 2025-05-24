import { Users, Calendar, Bed, DollarSign, TrendingUp, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsGridProps {
  stats?: {
    totalPatients: number;
    activeAppointments: number;
    bedOccupancy: number;
    todayRevenue: number;
  };
  loading: boolean;
}

export default function StatsGrid({ stats, loading }: StatsGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Patients",
      value: stats?.totalPatients || 0,
      growth: "12%",
      growthLabel: "from last month",
      icon: Users,
      iconBg: "bg-blue-100",
      iconColor: "text-primary",
      growthPositive: true
    },
    {
      title: "Active Appointments",
      value: stats?.activeAppointments || 0,
      growth: "8%",
      growthLabel: "from yesterday",
      icon: Calendar,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      growthPositive: true
    },
    {
      title: "Bed Occupancy",
      value: `${stats?.bedOccupancy || 0}%`,
      growth: "14 beds available",
      growthLabel: "",
      icon: Bed,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      growthPositive: false,
      isWarning: stats?.bedOccupancy && stats.bedOccupancy > 85
    },
    {
      title: "Revenue Today",
      value: `$${stats?.todayRevenue?.toLocaleString() || '0'}`,
      growth: "15%",
      growthLabel: "from yesterday",
      icon: DollarSign,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      growthPositive: true
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className={`text-sm mt-1 flex items-center ${
                stat.isWarning 
                  ? 'text-yellow-600' 
                  : stat.growthPositive 
                    ? 'text-green-600' 
                    : 'text-gray-600'
              }`}>
                {stat.isWarning ? (
                  <AlertTriangle className="w-3 h-3 mr-1" />
                ) : stat.growthPositive ? (
                  <TrendingUp className="w-3 h-3 mr-1" />
                ) : null}
                <span>{stat.growth}</span>
                {stat.growthLabel && <span className="ml-1">{stat.growthLabel}</span>}
              </p>
            </div>
            <div className={`w-12 h-12 ${stat.iconBg} rounded-lg flex items-center justify-center`}>
              <stat.icon className={`${stat.iconColor} text-xl`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
