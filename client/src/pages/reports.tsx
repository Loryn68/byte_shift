import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  FileText,
  Download,
  Calendar,
  Users,
  DollarSign,
  Activity,
  TrendingUp,
  PieChart,
  Filter,
  RefreshCw
} from "lucide-react";
import { formatCurrency, formatDate, exportToCSV } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { Patient, Appointment, Billing, LabTest } from "@shared/schema";

export default function Reports() {
  const [selectedDateRange, setSelectedDateRange] = useState("month");
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(1); // First day of current month
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  });
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  // Fetch data for reports
  const { data: patients = [], isLoading: patientsLoading } = useQuery({
    queryKey: ["/api/patients"],
  });

  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery({
    queryKey: ["/api/appointments"],
  });

  const { data: billingRecords = [], isLoading: billingLoading } = useQuery({
    queryKey: ["/api/billing"],
  });

  const { data: labTests = [], isLoading: labTestsLoading } = useQuery({
    queryKey: ["/api/lab-tests"],
  });

  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  // Filter data by date range
  const filterByDateRange = (data: any[], dateField: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include the entire end date
    
    return data.filter(item => {
      const itemDate = new Date(item[dateField]);
      return itemDate >= start && itemDate <= end;
    });
  };

  // Calculate statistics
  const getPatientStatistics = () => {
    const filteredPatients = filterByDateRange(patients, 'registrationDate');
    const totalPatients = patients.length;
    const newPatients = filteredPatients.length;
    
    const ageGroups = {
      children: 0,
      adults: 0,
      seniors: 0
    };
    
    const genderDistribution = {
      male: 0,
      female: 0,
      other: 0
    };

    patients.forEach((patient: Patient) => {
      const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();
      if (age < 18) ageGroups.children++;
      else if (age < 65) ageGroups.adults++;
      else ageGroups.seniors++;

      genderDistribution[patient.gender as keyof typeof genderDistribution]++;
    });

    return {
      totalPatients,
      newPatients,
      ageGroups,
      genderDistribution
    };
  };

  const getAppointmentStatistics = () => {
    const filteredAppointments = filterByDateRange(appointments, 'appointmentDate');
    
    const statusCounts = {
      scheduled: 0,
      completed: 0,
      cancelled: 0,
      'no-show': 0
    };

    const departmentCounts: Record<string, number> = {};
    const typeCounts = {
      consultation: 0,
      'follow-up': 0,
      emergency: 0
    };

    filteredAppointments.forEach((appointment: Appointment) => {
      statusCounts[appointment.status as keyof typeof statusCounts]++;
      typeCounts[appointment.type as keyof typeof typeCounts]++;
      
      departmentCounts[appointment.department] = (departmentCounts[appointment.department] || 0) + 1;
    });

    return {
      totalAppointments: filteredAppointments.length,
      statusCounts,
      departmentCounts,
      typeCounts
    };
  };

  const getFinancialStatistics = () => {
    const filteredBilling = filterByDateRange(billingRecords, 'createdAt');
    
    const totalRevenue = filteredBilling
      .filter((record: Billing) => record.paymentStatus === 'paid')
      .reduce((sum: number, record: Billing) => sum + Number(record.totalAmount), 0);
    
    const pendingAmount = filteredBilling
      .filter((record: Billing) => record.paymentStatus === 'pending')
      .reduce((sum: number, record: Billing) => sum + Number(record.totalAmount), 0);
    
    const totalBills = filteredBilling.length;
    const paidBills = filteredBilling.filter((record: Billing) => record.paymentStatus === 'paid').length;
    
    const serviceTypeCounts: Record<string, number> = {};
    const serviceTypeRevenue: Record<string, number> = {};
    
    filteredBilling.forEach((record: Billing) => {
      serviceTypeCounts[record.serviceType] = (serviceTypeCounts[record.serviceType] || 0) + 1;
      if (record.paymentStatus === 'paid') {
        serviceTypeRevenue[record.serviceType] = (serviceTypeRevenue[record.serviceType] || 0) + Number(record.totalAmount);
      }
    });

    return {
      totalRevenue,
      pendingAmount,
      totalBills,
      paidBills,
      collectionRate: totalBills > 0 ? (paidBills / totalBills) * 100 : 0,
      serviceTypeCounts,
      serviceTypeRevenue
    };
  };

  const getLabTestStatistics = () => {
    const filteredLabTests = filterByDateRange(labTests, 'orderDate');
    
    const statusCounts = {
      ordered: 0,
      collected: 0,
      processing: 0,
      completed: 0,
      cancelled: 0
    };

    const typeCounts: Record<string, number> = {};
    const urgencyCounts = {
      routine: 0,
      urgent: 0,
      stat: 0
    };

    filteredLabTests.forEach((test: LabTest) => {
      statusCounts[test.status as keyof typeof statusCounts]++;
      urgencyCounts[test.urgency as keyof typeof urgencyCounts]++;
      typeCounts[test.testType] = (typeCounts[test.testType] || 0) + 1;
    });

    return {
      totalTests: filteredLabTests.length,
      statusCounts,
      typeCounts,
      urgencyCounts
    };
  };

  const handleDateRangeChange = (range: string) => {
    setSelectedDateRange(range);
    const today = new Date();
    let start = new Date();
    
    switch (range) {
      case "today":
        start = new Date();
        break;
      case "week":
        start.setDate(today.getDate() - 7);
        break;
      case "month":
        start.setMonth(today.getMonth() - 1);
        break;
      case "quarter":
        start.setMonth(today.getMonth() - 3);
        break;
      case "year":
        start.setFullYear(today.getFullYear() - 1);
        break;
      default:
        return;
    }
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  };

  const exportReport = (reportType: string) => {
    let data: any[] = [];
    let filename = "";
    let headers: string[] = [];

    switch (reportType) {
      case "patients":
        data = filterByDateRange(patients, 'registrationDate');
        filename = "patients-report";
        headers = ["Patient ID", "Name", "Gender", "Date of Birth", "Phone", "Registration Date"];
        break;
      case "appointments":
        data = filterByDateRange(appointments, 'appointmentDate').map((apt: Appointment) => ({
          appointmentId: apt.appointmentId,
          appointmentDate: formatDate(apt.appointmentDate),
          department: apt.department,
          type: apt.type,
          status: apt.status
        }));
        filename = "appointments-report";
        headers = ["Appointment ID", "Date", "Department", "Type", "Status"];
        break;
      case "financial":
        data = filterByDateRange(billingRecords, 'createdAt').map((bill: Billing) => ({
          billId: bill.billId,
          serviceType: bill.serviceType,
          amount: Number(bill.amount),
          totalAmount: Number(bill.totalAmount),
          paymentStatus: bill.paymentStatus,
          createdAt: formatDate(bill.createdAt)
        }));
        filename = "financial-report";
        headers = ["Bill ID", "Service Type", "Amount", "Total Amount", "Payment Status", "Date"];
        break;
      case "labtests":
        data = filterByDateRange(labTests, 'orderDate').map((test: LabTest) => ({
          testId: test.testId,
          testName: test.testName,
          testType: test.testType,
          urgency: test.urgency,
          status: test.status,
          orderDate: formatDate(test.orderDate)
        }));
        filename = "lab-tests-report";
        headers = ["Test ID", "Test Name", "Type", "Urgency", "Status", "Order Date"];
        break;
      default:
        return;
    }

    if (data.length === 0) {
      toast({
        title: "No Data",
        description: "No data available for the selected date range.",
        variant: "destructive",
      });
      return;
    }

    exportToCSV(data, filename, headers);
    toast({
      title: "Report Exported",
      description: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report has been exported successfully.`,
    });
  };

  const patientStats = getPatientStatistics();
  const appointmentStats = getAppointmentStatistics();
  const financialStats = getFinancialStatistics();
  const labTestStats = getLabTestStatistics();

  const isLoading = patientsLoading || appointmentsLoading || billingLoading || labTestsLoading || statsLoading;

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
            <p className="text-gray-600">Comprehensive reporting and data analytics for hospital operations</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              className="flex items-center space-x-2"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh Data</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Date Range Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-gray-900">Report Period</h3>
            <div className="flex items-center space-x-2">
              <Select value={selectedDateRange} onValueChange={handleDateRangeChange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="quarter">Last Quarter</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">From:</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-auto"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">To:</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-auto"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Report Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="clinical">Clinical</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{patientStats.totalPatients}</div>
                <p className="text-xs text-muted-foreground">
                  +{patientStats.newPatients} new in period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{appointmentStats.totalAppointments}</div>
                <p className="text-xs text-muted-foreground">
                  {appointmentStats.statusCounts.completed} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(financialStats.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">
                  {financialStats.collectionRate.toFixed(1)}% collection rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lab Tests</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{labTestStats.totalTests}</div>
                <p className="text-xs text-muted-foreground">
                  {labTestStats.statusCounts.completed} completed
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Summary Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Patient Demographics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Age Distribution</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Children (0-17)</span>
                        <span className="text-sm font-medium">{patientStats.ageGroups.children}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Adults (18-64)</span>
                        <span className="text-sm font-medium">{patientStats.ageGroups.adults}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Seniors (65+)</span>
                        <span className="text-sm font-medium">{patientStats.ageGroups.seniors}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Gender Distribution</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Male</span>
                        <span className="text-sm font-medium">{patientStats.genderDistribution.male}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Female</span>
                        <span className="text-sm font-medium">{patientStats.genderDistribution.female}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Other</span>
                        <span className="text-sm font-medium">{patientStats.genderDistribution.other}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Department Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(appointmentStats.departmentCounts)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 6)
                    .map(([department, count]) => (
                      <div key={department} className="flex justify-between items-center">
                        <span className="text-sm">{department}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                  {Object.keys(appointmentStats.departmentCounts).length === 0 && (
                    <p className="text-sm text-gray-500">No department data available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Patients Tab */}
        <TabsContent value="patients" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Patient Analytics</h3>
            <Button
              onClick={() => exportReport("patients")}
              className="flex items-center space-x-2"
              variant="outline"
            >
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Registration Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Patients</span>
                    <span className="font-medium">{patientStats.totalPatients}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>New Registrations</span>
                    <span className="font-medium">{patientStats.newPatients}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Patients</span>
                    <span className="font-medium">
                      {patients.filter((p: Patient) => p.isActive).length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Age Groups</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Children (0-17)</span>
                    <span className="font-medium">{patientStats.ageGroups.children}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Adults (18-64)</span>
                    <span className="font-medium">{patientStats.ageGroups.adults}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Seniors (65+)</span>
                    <span className="font-medium">{patientStats.ageGroups.seniors}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gender Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Male</span>
                    <span className="font-medium">{patientStats.genderDistribution.male}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Female</span>
                    <span className="font-medium">{patientStats.genderDistribution.female}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Other</span>
                    <span className="font-medium">{patientStats.genderDistribution.other}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Registrations Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Patient Registrations</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Registration Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filterByDateRange(patients, 'registrationDate')
                    .slice(0, 10)
                    .map((patient: Patient) => {
                      const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();
                      return (
                        <TableRow key={patient.id}>
                          <TableCell className="font-medium">{patient.patientId}</TableCell>
                          <TableCell>{patient.firstName} {patient.lastName}</TableCell>
                          <TableCell className="capitalize">{patient.gender}</TableCell>
                          <TableCell>{age}</TableCell>
                          <TableCell>{formatDate(patient.registrationDate)}</TableCell>
                        </TableRow>
                      );
                    })}
                  {filterByDateRange(patients, 'registrationDate').length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500">
                        No patient registrations in the selected period
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Appointment Analytics</h3>
            <Button
              onClick={() => exportReport("appointments")}
              className="flex items-center space-x-2"
              variant="outline"
            >
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Scheduled</span>
                    <Badge className="bg-blue-100 text-blue-800">{appointmentStats.statusCounts.scheduled}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Completed</span>
                    <Badge className="bg-green-100 text-green-800">{appointmentStats.statusCounts.completed}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Cancelled</span>
                    <Badge className="bg-red-100 text-red-800">{appointmentStats.statusCounts.cancelled}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>No Show</span>
                    <Badge className="bg-gray-100 text-gray-800">{appointmentStats.statusCounts['no-show']}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Appointment Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Consultation</span>
                    <span className="font-medium">{appointmentStats.typeCounts.consultation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Follow-up</span>
                    <span className="font-medium">{appointmentStats.typeCounts['follow-up']}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Emergency</span>
                    <span className="font-medium">{appointmentStats.typeCounts.emergency}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Departments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(appointmentStats.departmentCounts)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([department, count]) => (
                      <div key={department} className="flex justify-between">
                        <span className="text-sm">{department}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  {Object.keys(appointmentStats.departmentCounts).length === 0 && (
                    <p className="text-sm text-gray-500">No data available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Appointments</span>
                    <span className="font-medium">{appointmentStats.totalAppointments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completion Rate</span>
                    <span className="font-medium">
                      {appointmentStats.totalAppointments > 0 
                        ? ((appointmentStats.statusCounts.completed / appointmentStats.totalAppointments) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>No-Show Rate</span>
                    <span className="font-medium">
                      {appointmentStats.totalAppointments > 0 
                        ? ((appointmentStats.statusCounts['no-show'] / appointmentStats.totalAppointments) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Financial Reports</h3>
            <Button
              onClick={() => exportReport("financial")}
              className="flex items-center space-x-2"
              variant="outline"
            >
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Revenue</span>
                    <span className="font-medium">{formatCurrency(financialStats.totalRevenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending Amount</span>
                    <span className="font-medium">{formatCurrency(financialStats.pendingAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Collection Rate</span>
                    <span className="font-medium">{financialStats.collectionRate.toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Billing Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Bills</span>
                    <span className="font-medium">{financialStats.totalBills}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Paid Bills</span>
                    <span className="font-medium">{financialStats.paidBills}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending Bills</span>
                    <span className="font-medium">{financialStats.totalBills - financialStats.paidBills}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(financialStats.serviceTypeRevenue)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([service, revenue]) => (
                      <div key={service} className="flex justify-between">
                        <span className="text-sm">{service}</span>
                        <span className="font-medium">{formatCurrency(revenue)}</span>
                      </div>
                    ))}
                  {Object.keys(financialStats.serviceTypeRevenue).length === 0 && (
                    <p className="text-sm text-gray-500">No revenue data available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(financialStats.serviceTypeCounts)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([service, count]) => (
                      <div key={service} className="flex justify-between">
                        <span className="text-sm">{service}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  {Object.keys(financialStats.serviceTypeCounts).length === 0 && (
                    <p className="text-sm text-gray-500">No service data available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Clinical Tab */}
        <TabsContent value="clinical" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Clinical Analytics</h3>
            <Button
              onClick={() => exportReport("labtests")}
              className="flex items-center space-x-2"
              variant="outline"
            >
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Lab Test Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Tests</span>
                    <span className="font-medium">{labTestStats.totalTests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completed</span>
                    <span className="font-medium">{labTestStats.statusCounts.completed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending</span>
                    <span className="font-medium">
                      {labTestStats.statusCounts.ordered + labTestStats.statusCounts.collected + labTestStats.statusCounts.processing}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Test Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Ordered</span>
                    <Badge className="bg-blue-100 text-blue-800">{labTestStats.statusCounts.ordered}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Collected</span>
                    <Badge className="bg-yellow-100 text-yellow-800">{labTestStats.statusCounts.collected}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Processing</span>
                    <Badge className="bg-purple-100 text-purple-800">{labTestStats.statusCounts.processing}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Completed</span>
                    <Badge className="bg-green-100 text-green-800">{labTestStats.statusCounts.completed}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Test Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(labTestStats.typeCounts)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([type, count]) => (
                      <div key={type} className="flex justify-between">
                        <span className="text-sm">{type}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  {Object.keys(labTestStats.typeCounts).length === 0 && (
                    <p className="text-sm text-gray-500">No test data available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Urgency Levels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Routine</span>
                    <span className="font-medium">{labTestStats.urgencyCounts.routine}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Urgent</span>
                    <span className="font-medium">{labTestStats.urgencyCounts.urgent}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>STAT</span>
                    <span className="font-medium">{labTestStats.urgencyCounts.stat}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
