import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Calendar, 
  Activity, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Hospital,
  Bed,
  FlaskRound,
  Pill
} from "lucide-react";

export default function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const dashboardStats = {
    totalPatients: stats?.totalPatients || 0,
    activeAppointments: stats?.activeAppointments || 0,
    todayRevenue: stats?.todayRevenue || 0,
    bedOccupancy: stats?.bedOccupancy || 0,
    labTests: stats?.labTests || 0,
    prescriptions: stats?.prescriptions || 0,
    staff: stats?.staff || 0,
    pendingBills: stats?.pendingBills || 0
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Hospital className="h-8 w-8 text-blue-600" />
          Child Mental Haven Dashboard
        </h1>
        <p className="text-gray-600 mt-2">Comprehensive hospital management overview</p>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalPatients}</div>
            <p className="text-xs text-muted-foreground">
              Registered in system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.activeAppointments}</div>
            <p className="text-xs text-muted-foreground">
              Scheduled consultations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {dashboardStats.todayRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              From billing and collections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bed Occupancy</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.bedOccupancy}%</div>
            <p className="text-xs text-muted-foreground">
              Inpatient capacity utilization
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Department Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Clinical Operations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FlaskRound className="h-5 w-5 text-blue-600" />
                <span>Lab Tests Pending</span>
              </div>
              <span className="font-semibold">{dashboardStats.labTests}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Pill className="h-5 w-5 text-purple-600" />
                <span>Prescriptions Today</span>
              </div>
              <span className="font-semibold">{dashboardStats.prescriptions}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Activity className="h-5 w-5 text-green-600" />
                <span>Active Staff</span>
              </div>
              <span className="font-semibold">{dashboardStats.staff}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span>Monthly Revenue</span>
              </div>
              <span className="font-semibold text-green-600">
                KES {(dashboardStats.todayRevenue * 30).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <TrendingDown className="h-5 w-5 text-red-600" />
                <span>Pending Bills</span>
              </div>
              <span className="font-semibold text-red-600">{dashboardStats.pendingBills}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <DollarSign className="h-5 w-5 text-blue-600" />
                <span>Collection Rate</span>
              </div>
              <span className="font-semibold">95%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <Users className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <p className="text-sm font-medium">Register Patient</p>
            </div>
            <div className="text-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <Calendar className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <p className="text-sm font-medium">Schedule Appointment</p>
            </div>
            <div className="text-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <FlaskRound className="h-8 w-8 mx-auto text-purple-600 mb-2" />
              <p className="text-sm font-medium">Lab Test Order</p>
            </div>
            <div className="text-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <DollarSign className="h-8 w-8 mx-auto text-orange-600 mb-2" />
              <p className="text-sm font-medium">Process Payment</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Hospital Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">New patient registered</p>
                <p className="text-xs text-gray-500">John Doe - 5 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Calendar className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Appointment scheduled</p>
                <p className="text-xs text-gray-500">Dr. Smith consultation - 12 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <FlaskRound className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Lab results ready</p>
                <p className="text-xs text-gray-500">Blood work completed - 25 minutes ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}