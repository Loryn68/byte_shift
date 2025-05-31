import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, Search, Calendar, Clock, User, Filter, RefreshCw } from "lucide-react";

export default function UserActivity() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [activityFilter, setActivityFilter] = useState("all");
  const [dateRange, setDateRange] = useState("7days");

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["/api/users"],
  });

  const { data: activities = [], isLoading: activitiesLoading } = useQuery({
    queryKey: ["/api/user-activities", { dateRange, roleFilter, activityFilter }],
  });

  const filteredUsers = users.filter((user: any) => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    const roleColors = {
      admin: "bg-red-100 text-red-800",
      doctor: "bg-blue-100 text-blue-800",
      nurse: "bg-green-100 text-green-800",
      pharmacist: "bg-purple-100 text-purple-800",
      cashier: "bg-yellow-100 text-yellow-800",
      receptionist: "bg-gray-100 text-gray-800",
      therapist: "bg-indigo-100 text-indigo-800",
      staff: "bg-orange-100 text-orange-800"
    };
    
    return (
      <Badge className={roleColors[role as keyof typeof roleColors] || "bg-gray-100 text-gray-800"}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  const getActivityBadge = (activity: string) => {
    const activityColors = {
      login: "bg-green-100 text-green-800",
      logout: "bg-gray-100 text-gray-800",
      "patient_create": "bg-blue-100 text-blue-800",
      "patient_update": "bg-blue-100 text-blue-800",
      "consultation_create": "bg-purple-100 text-purple-800",
      "prescription_create": "bg-orange-100 text-orange-800",
      "prescription_approve": "bg-green-100 text-green-800",
      "billing_create": "bg-yellow-100 text-yellow-800",
      "payment_process": "bg-green-100 text-green-800",
      "user_create": "bg-red-100 text-red-800",
      "settings_update": "bg-indigo-100 text-indigo-800"
    };
    
    return (
      <Badge className={activityColors[activity as keyof typeof activityColors] || "bg-gray-100 text-gray-800"}>
        {activity.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  const getStatusIndicator = (isActive: boolean, lastLogin?: string) => {
    if (!isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    }

    if (!lastLogin) {
      return <Badge variant="outline">Never Logged In</Badge>;
    }

    const lastLoginDate = new Date(lastLogin);
    const now = new Date();
    const daysSince = Math.floor((now.getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSince === 0) {
      return <Badge className="bg-green-100 text-green-800">Active Today</Badge>;
    } else if (daysSince === 1) {
      return <Badge className="bg-yellow-100 text-yellow-800">Active Yesterday</Badge>;
    } else if (daysSince <= 7) {
      return <Badge className="bg-orange-100 text-orange-800">{daysSince} days ago</Badge>;
    } else {
      return <Badge variant="secondary">Inactive ({daysSince} days)</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Activity className="h-8 w-8 text-blue-600" />
          Users Activeness
        </h1>
        <p className="text-gray-600 mt-2">Monitor user activity and login patterns</p>
      </div>

      {/* Activity Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
              <User className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-green-600">
                  {users.filter((u: any) => u.isActive).length}
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Logged In Today</p>
                <p className="text-2xl font-bold text-blue-600">
                  {users.filter((u: any) => {
                    if (!u.lastLogin) return false;
                    const today = new Date().toDateString();
                    return new Date(u.lastLogin).toDateString() === today;
                  }).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Never Logged In</p>
                <p className="text-2xl font-bold text-orange-600">
                  {users.filter((u: any) => !u.lastLogin).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
                <SelectItem value="doctor">Doctor</SelectItem>
                <SelectItem value="nurse">Nurse</SelectItem>
                <SelectItem value="pharmacist">Pharmacist</SelectItem>
                <SelectItem value="cashier">Cashier</SelectItem>
                <SelectItem value="receptionist">Receptionist</SelectItem>
                <SelectItem value="therapist">Therapist</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Activity Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Activity Status</CardTitle>
        </CardHeader>
        <CardContent>
          {usersLoading ? (
            <div className="text-center py-8">Loading user activity data...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No users found matching your criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Activity Status</TableHead>
                    <TableHead>Login Count</TableHead>
                    <TableHead>Account Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user: any) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.firstName} {user.lastName}</div>
                          <div className="text-sm text-gray-500">@{user.username}</div>
                          <div className="text-xs text-gray-400">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        {user.lastLogin ? (
                          <div>
                            <div className="text-sm">
                              {new Date(user.lastLogin).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(user.lastLogin).toLocaleTimeString()}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusIndicator(user.isActive, user.lastLogin)}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">
                          {user.loginCount || 0} times
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? "default" : "secondary"}>
                          {user.isActive ? "Active" : "Disabled"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity Log */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recent System Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {activitiesLoading ? (
            <div className="text-center py-8">Loading activity logs...</div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No recent activity found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.slice(0, 10).map((activity: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Activity className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">{activity.description}</div>
                      <div className="text-sm text-gray-500">by {activity.userName}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </div>
                    {getActivityBadge(activity.type)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}