import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, UserPlus, Calendar, Clock, CheckCircle, XCircle, AlertTriangle,
  Edit3, Trash2, Eye, Search, Filter, Download, Plus, TrendingUp, UserCheck
} from "lucide-react";

interface Employee {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  role: string;
  contact: string;
  email: string;
  startDate: string;
  salary: number;
  status: 'Active' | 'Inactive' | 'On Leave';
}

interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedDate: string;
}

interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  clockIn: string;
  clockOut: string;
  hoursWorked: number;
  status: 'Present' | 'Absent' | 'Late' | 'Half Day';
}

export default function StaffManagementSystem() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [newLeaveRequest, setNewLeaveRequest] = useState({
    employeeId: "",
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock data - replace with actual API calls
  const employees: Employee[] = [
    {
      id: "1",
      name: "Dr. Sarah Johnson",
      employeeId: "EMP001",
      department: "Pediatrics",
      role: "Senior Doctor",
      contact: "+254701234567",
      email: "sarah.johnson@hospital.com",
      startDate: "2020-01-15",
      salary: 150000,
      status: "Active"
    },
    {
      id: "2",
      name: "Nurse Mary Wanjiku",
      employeeId: "EMP002",
      department: "Mental Health",
      role: "Head Nurse",
      contact: "+254701234568",
      email: "mary.wanjiku@hospital.com",
      startDate: "2019-03-20",
      salary: 85000,
      status: "Active"
    },
    {
      id: "3",
      name: "James Mwangi",
      employeeId: "EMP003",
      department: "Administration",
      role: "HR Manager",
      contact: "+254701234569",
      email: "james.mwangi@hospital.com",
      startDate: "2021-06-10",
      salary: 120000,
      status: "On Leave"
    },
    {
      id: "4",
      name: "Dr. Grace Njoroge",
      employeeId: "EMP004",
      department: "Mental Health",
      role: "Psychiatrist",
      contact: "+254701234570",
      email: "grace.njoroge@hospital.com",
      startDate: "2021-09-05",
      salary: 180000,
      status: "Active"
    },
    {
      id: "5",
      name: "Peter Kimani",
      employeeId: "EMP005",
      department: "Security",
      role: "Security Officer",
      contact: "+254701234571",
      email: "peter.kimani@hospital.com",
      startDate: "2022-01-10",
      salary: 45000,
      status: "Active"
    }
  ];

  const leaveRequests: LeaveRequest[] = [
    {
      id: "1",
      employeeId: "EMP003",
      employeeName: "James Mwangi",
      leaveType: "Annual Leave",
      startDate: "2024-02-01",
      endDate: "2024-02-14",
      reason: "Family vacation",
      status: "Pending",
      appliedDate: "2024-01-15"
    },
    {
      id: "2",
      employeeId: "EMP002",
      employeeName: "Nurse Mary Wanjiku",
      leaveType: "Sick Leave",
      startDate: "2024-01-25",
      endDate: "2024-01-27",
      reason: "Medical treatment",
      status: "Approved",
      appliedDate: "2024-01-20"
    },
    {
      id: "3",
      employeeId: "EMP004",
      employeeName: "Dr. Grace Njoroge",
      leaveType: "Maternity Leave",
      startDate: "2024-03-01",
      endDate: "2024-06-01",
      reason: "Maternity leave",
      status: "Pending",
      appliedDate: "2024-01-28"
    }
  ];

  const attendanceRecords: AttendanceRecord[] = [
    {
      id: "1",
      employeeId: "EMP001",
      employeeName: "Dr. Sarah Johnson",
      date: "2024-01-30",
      clockIn: "08:00",
      clockOut: "17:00",
      hoursWorked: 9,
      status: "Present"
    },
    {
      id: "2",
      employeeId: "EMP002",
      employeeName: "Nurse Mary Wanjiku",
      date: "2024-01-30",
      clockIn: "08:15",
      clockOut: "16:45",
      hoursWorked: 8.5,
      status: "Late"
    },
    {
      id: "3",
      employeeId: "EMP004",
      employeeName: "Dr. Grace Njoroge",
      date: "2024-01-30",
      clockIn: "07:45",
      clockOut: "18:00",
      hoursWorked: 10.25,
      status: "Present"
    },
    {
      id: "4",
      employeeId: "EMP005",
      employeeName: "Peter Kimani",
      date: "2024-01-30",
      clockIn: "22:00",
      clockOut: "06:00",
      hoursWorked: 8,
      status: "Present"
    }
  ];

  // Dashboard statistics
  const dashboardStats = {
    totalEmployees: employees.length,
    activeEmployees: employees.filter(emp => emp.status === 'Active').length,
    onLeaveEmployees: employees.filter(emp => emp.status === 'On Leave').length,
    pendingLeaveRequests: leaveRequests.filter(req => req.status === 'Pending').length,
    presentToday: attendanceRecords.filter(record => record.status === 'Present').length,
    averageSalary: employees.reduce((sum, emp) => sum + emp.salary, 0) / employees.length
  };

  const departments = [...new Set(employees.map(emp => emp.department))];

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         employee.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = filterDepartment === "all" || employee.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  const handleAddEmployee = () => {
    setShowAddEmployee(true);
    setEditingEmployee(null);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setShowAddEmployee(true);
  };

  const handleDeleteEmployee = (employeeId: string) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      toast({
        title: "Employee Deleted",
        description: "Employee has been successfully removed from the system.",
      });
    }
  };

  const handleLeaveAction = (leaveId: string, action: 'approve' | 'reject') => {
    toast({
      title: action === 'approve' ? "Leave Approved" : "Leave Rejected",
      description: `Leave request has been ${action}d successfully.`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header with Logo */}
      <div className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <img 
              src="/logo.png" 
              alt="Child Mental Haven" 
              className="h-16 w-auto"
            />
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-green-600">Child Mental Haven</h1>
              <p className="text-sm text-blue-600 font-medium">- Where Young Minds Evolve</p>
              <p className="text-xs text-gray-600 ml-4">Staff Management System</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Date: {new Date().toLocaleDateString()}</p>
            <p className="text-sm text-gray-600">Time: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                Staff Management
              </h1>
              <p className="text-gray-600 mt-1">Comprehensive employee management and attendance tracking</p>
            </div>
            <Badge variant="secondary" className="px-3 py-1">
              <UserCheck className="h-4 w-4 mr-1" />
              {dashboardStats.activeEmployees} Active Staff
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="employees" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Employees
            </TabsTrigger>
            <TabsTrigger value="leave" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Leave Management
            </TabsTrigger>
            <TabsTrigger value="attendance" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Attendance
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.totalEmployees}</div>
                  <p className="text-xs text-muted-foreground">
                    {dashboardStats.activeEmployees} active, {dashboardStats.onLeaveEmployees} on leave
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Leave Requests</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.pendingLeaveRequests}</div>
                  <p className="text-xs text-muted-foreground">
                    Require approval
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Present Today</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.presentToday}</div>
                  <p className="text-xs text-muted-foreground">
                    Out of {dashboardStats.activeEmployees} active staff
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Salary</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">KES {dashboardStats.averageSalary.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Monthly average
                  </p>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Department Distribution</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {departments.map(dept => {
                      const count = employees.filter(emp => emp.department === dept).length;
                      const percentage = (count / employees.length) * 100;
                      return (
                        <div key={dept} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{dept}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-muted-foreground">{count}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Dr. Sarah Johnson clocked in</p>
                      <p className="text-xs text-muted-foreground">Today at 8:00 AM</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New leave request from Dr. Grace Njoroge</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Nurse Mary Wanjiku's leave approved</p>
                      <p className="text-xs text-muted-foreground">Yesterday</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Peter Kimani started night shift</p>
                      <p className="text-xs text-muted-foreground">Yesterday at 10:00 PM</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Employees Tab */}
          <TabsContent value="employees" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Employee Management</CardTitle>
                  <Button onClick={handleAddEmployee} className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Add Employee
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search and Filter */}
                <div className="flex gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search employees..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Employee Table */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Salary</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell className="font-medium">{employee.employeeId}</TableCell>
                        <TableCell>{employee.name}</TableCell>
                        <TableCell>{employee.department}</TableCell>
                        <TableCell>{employee.role}</TableCell>
                        <TableCell>{employee.contact}</TableCell>
                        <TableCell>KES {employee.salary.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={
                            employee.status === 'Active' ? 'default' :
                            employee.status === 'On Leave' ? 'secondary' : 'destructive'
                          }>
                            {employee.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEditEmployee(employee)}>
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setSelectedEmployee(employee)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDeleteEmployee(employee.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leave Management Tab */}
          <TabsContent value="leave" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Leave Requests Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaveRequests.map((request) => {
                      const startDate = new Date(request.startDate);
                      const endDate = new Date(request.endDate);
                      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                      
                      return (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">{request.employeeName}</TableCell>
                          <TableCell>{request.leaveType}</TableCell>
                          <TableCell>{request.startDate}</TableCell>
                          <TableCell>{request.endDate}</TableCell>
                          <TableCell>{daysDiff} days</TableCell>
                          <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                          <TableCell>
                            <Badge variant={
                              request.status === 'Approved' ? 'default' :
                              request.status === 'Pending' ? 'secondary' : 'destructive'
                            }>
                              {request.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {request.status === 'Pending' && (
                              <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline" onClick={() => handleLeaveAction(request.id, 'approve')}>
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleLeaveAction(request.id, 'reject')}>
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Attendance Records</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Clock In</TableHead>
                      <TableHead>Clock Out</TableHead>
                      <TableHead>Hours Worked</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Shift Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceRecords.map((record) => {
                      const clockInHour = parseInt(record.clockIn.split(':')[0]);
                      const isNightShift = clockInHour >= 22 || clockInHour <= 6;
                      
                      return (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">{record.employeeName}</TableCell>
                          <TableCell>{record.date}</TableCell>
                          <TableCell>{record.clockIn}</TableCell>
                          <TableCell>{record.clockOut}</TableCell>
                          <TableCell>{record.hoursWorked} hrs</TableCell>
                          <TableCell>
                            <Badge variant={
                              record.status === 'Present' ? 'default' :
                              record.status === 'Late' ? 'secondary' : 'destructive'
                            }>
                              {record.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {isNightShift ? 'Night Shift' : 'Day Shift'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}