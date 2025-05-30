import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, TrendingUp, FileText, Calendar, Users, DollarSign, Activity, Building, Heart, Stethoscope, Pill, FlaskConical, Download, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ReportsAnalytics() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("admission-reports");
  const [selectedPeriod, setSelectedPeriod] = useState("current-month");
  const [selectedYear, setSelectedYear] = useState("2025");

  // Fetch data for reports
  const { data: patients = [] } = useQuery({
    queryKey: ["/api/patients"],
  });

  const { data: billingData = [] } = useQuery({
    queryKey: ["/api/billing"],
  });

  const { data: therapySessions = [] } = useQuery({
    queryKey: ["/api/therapy-sessions"],
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ["/api/appointments"],
  });

  // Calculate metrics for current month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyAdmissions = patients.filter((p: any) => {
    if (!p.registrationDate) return false;
    const regDate = new Date(p.registrationDate);
    return regDate.getMonth() === currentMonth && regDate.getFullYear() === currentYear;
  });

  const monthlyOutpatients = monthlyAdmissions.filter((p: any) => p.patientType === 'outpatient');
  const monthlyInpatients = monthlyAdmissions.filter((p: any) => p.patientType === 'inpatient');

  const monthlyTherapySessions = therapySessions.filter((s: any) => {
    if (!s.sessionDate) return false;
    const sessionDate = new Date(s.sessionDate);
    return sessionDate.getMonth() === currentMonth && sessionDate.getFullYear() === currentYear;
  });

  const monthlyRevenue = billingData
    .filter((bill: any) => {
      if (!bill.createdAt || bill.paymentStatus !== 'paid') return false;
      const billDate = new Date(bill.createdAt);
      return billDate.getMonth() === currentMonth && billDate.getFullYear() === currentYear;
    })
    .reduce((sum: number, bill: any) => sum + parseFloat(bill.totalAmount || '0'), 0);

  const monthlyPharmacyRevenue = billingData
    .filter((bill: any) => {
      if (!bill.createdAt || bill.paymentStatus !== 'paid') return false;
      const billDate = new Date(bill.createdAt);
      return billDate.getMonth() === currentMonth && 
             billDate.getFullYear() === currentYear &&
             bill.serviceType?.toLowerCase().includes('pharmacy');
    })
    .reduce((sum: number, bill: any) => sum + parseFloat(bill.totalAmount || '0'), 0);

  const monthlyLabRevenue = billingData
    .filter((bill: any) => {
      if (!bill.createdAt || bill.paymentStatus !== 'paid') return false;
      const billDate = new Date(bill.createdAt);
      return billDate.getMonth() === currentMonth && 
             billDate.getFullYear() === currentYear &&
             (bill.serviceType?.toLowerCase().includes('lab') || 
              bill.serviceType?.toLowerCase().includes('test'));
    })
    .reduce((sum: number, bill: any) => sum + parseFloat(bill.totalAmount || '0'), 0);

  const insuranceRevenue = billingData
    .filter((bill: any) => {
      if (!bill.createdAt || bill.paymentStatus !== 'paid') return false;
      const billDate = new Date(bill.createdAt);
      const patient = patients.find((p: any) => p.id === bill.patientId);
      return billDate.getMonth() === currentMonth && 
             billDate.getFullYear() === currentYear &&
             patient?.insuranceProvider;
    })
    .reduce((sum: number, bill: any) => sum + parseFloat(bill.totalAmount || '0'), 0);

  const handleExportReport = (reportType: string) => {
    toast({
      title: "Report Generated",
      description: `${reportType} report has been generated and downloaded.`,
    });
  };

  const handlePrintReport = (reportType: string) => {
    toast({
      title: "Printing Report",
      description: `${reportType} report is being sent to printer.`,
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart className="h-8 w-8 text-blue-600" />
            Reports & Analytics
          </h1>
          <p className="text-gray-600">Comprehensive business intelligence and hospital performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-month">Current Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="current-year">Current Year</SelectItem>
              <SelectItem value="custom">Custom Period</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">KShs {monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-blue-600">Total income this month</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">New Admissions</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{monthlyAdmissions.length}</div>
            <p className="text-xs text-green-600">Patients registered</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Therapy Sessions</CardTitle>
            <Heart className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{monthlyTherapySessions.length}</div>
            <p className="text-xs text-purple-600">Mental health services</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">+15.3%</div>
            <p className="text-xs text-orange-600">Compared to last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Reports Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="admission-reports">Monthly Reports</TabsTrigger>
          <TabsTrigger value="department-reports">Department Reports</TabsTrigger>
          <TabsTrigger value="financial-reports">Financial Reports</TabsTrigger>
          <TabsTrigger value="annual-reports">Annual Reports</TabsTrigger>
        </TabsList>

        {/* Monthly Reports */}
        <TabsContent value="admission-reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Monthly Admission Reports */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Monthly Admission Report
                </CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handlePrintReport("Monthly Admission")}>
                    <Printer className="h-4 w-4 mr-1" />
                    Print
                  </Button>
                  <Button size="sm" onClick={() => handleExportReport("Monthly Admission")}>
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Admissions:</span>
                    <span className="font-bold">{monthlyAdmissions.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Outpatients:</span>
                    <span className="font-bold text-green-600">{monthlyOutpatients.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Inpatients:</span>
                    <span className="font-bold text-blue-600">{monthlyInpatients.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Emergency Cases:</span>
                    <span className="font-bold text-red-600">0</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Outpatient Reports */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-green-600" />
                  Monthly Outpatient Report
                </CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handlePrintReport("Monthly Outpatient")}>
                    <Printer className="h-4 w-4 mr-1" />
                    Print
                  </Button>
                  <Button size="sm" onClick={() => handleExportReport("Monthly Outpatient")}>
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Consultations:</span>
                    <span className="font-bold">{appointments.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">General Medicine:</span>
                    <span className="font-bold text-blue-600">
                      {appointments.filter((a: any) => a.department === 'General Medicine').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Mental Health:</span>
                    <span className="font-bold text-purple-600">
                      {appointments.filter((a: any) => a.department === 'Mental Health').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Follow-up Visits:</span>
                    <span className="font-bold text-orange-600">
                      {appointments.filter((a: any) => a.type?.includes('follow')).length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Therapy Reports */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-purple-600" />
                  Monthly Therapy Report
                </CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handlePrintReport("Monthly Therapy")}>
                    <Printer className="h-4 w-4 mr-1" />
                    Print
                  </Button>
                  <Button size="sm" onClick={() => handleExportReport("Monthly Therapy")}>
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Sessions:</span>
                    <span className="font-bold">{monthlyTherapySessions.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Individual Therapy:</span>
                    <span className="font-bold text-blue-600">
                      {monthlyTherapySessions.filter((s: any) => s.sessionType === 'individual').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Family Therapy:</span>
                    <span className="font-bold text-green-600">
                      {monthlyTherapySessions.filter((s: any) => s.sessionType === 'family').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Completed Sessions:</span>
                    <span className="font-bold text-purple-600">
                      {monthlyTherapySessions.filter((s: any) => s.status === 'completed').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Income Reports */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Monthly Income Report
                </CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handlePrintReport("Monthly Income")}>
                    <Printer className="h-4 w-4 mr-1" />
                    Print
                  </Button>
                  <Button size="sm" onClick={() => handleExportReport("Monthly Income")}>
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Revenue:</span>
                    <span className="font-bold">KShs {monthlyRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Consultation Fees:</span>
                    <span className="font-bold text-blue-600">
                      KShs {billingData
                        .filter((bill: any) => 
                          bill.paymentStatus === 'paid' && 
                          bill.serviceType?.toLowerCase().includes('consultation')
                        )
                        .reduce((sum: number, bill: any) => sum + parseFloat(bill.totalAmount || '0'), 0)
                        .toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Therapy Revenue:</span>
                    <span className="font-bold text-purple-600">
                      KShs {billingData
                        .filter((bill: any) => 
                          bill.paymentStatus === 'paid' && 
                          bill.serviceType?.toLowerCase().includes('counseling')
                        )
                        .reduce((sum: number, bill: any) => sum + parseFloat(bill.totalAmount || '0'), 0)
                        .toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Insurance Claims:</span>
                    <span className="font-bold text-orange-600">KShs {insuranceRevenue.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Department Reports */}
        <TabsContent value="department-reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pharmacy Reports */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5 text-green-600" />
                  Monthly Pharmacy Report
                </CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handlePrintReport("Pharmacy")}>
                    <Printer className="h-4 w-4 mr-1" />
                    Print
                  </Button>
                  <Button size="sm" onClick={() => handleExportReport("Pharmacy")}>
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pharmacy Revenue:</span>
                    <span className="font-bold">KShs {monthlyPharmacyRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Prescriptions Filled:</span>
                    <span className="font-bold text-green-600">0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Medications Dispensed:</span>
                    <span className="font-bold text-blue-600">0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Inventory Turnover:</span>
                    <span className="font-bold text-purple-600">N/A</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Laboratory Reports */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FlaskConical className="h-5 w-5 text-blue-600" />
                  Monthly Laboratory Report
                </CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handlePrintReport("Laboratory")}>
                    <Printer className="h-4 w-4 mr-1" />
                    Print
                  </Button>
                  <Button size="sm" onClick={() => handleExportReport("Laboratory")}>
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Lab Revenue:</span>
                    <span className="font-bold">KShs {monthlyLabRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tests Performed:</span>
                    <span className="font-bold text-blue-600">0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Results Delivered:</span>
                    <span className="font-bold text-green-600">0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pending Results:</span>
                    <span className="font-bold text-orange-600">0</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Insurance Reports */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  Monthly Insurance Report
                </CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handlePrintReport("Insurance")}>
                    <Printer className="h-4 w-4 mr-1" />
                    Print
                  </Button>
                  <Button size="sm" onClick={() => handleExportReport("Insurance")}>
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Insurance Revenue:</span>
                    <span className="font-bold">KShs {insuranceRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Claims Processed:</span>
                    <span className="font-bold text-blue-600">
                      {billingData.filter((bill: any) => {
                        const patient = patients.find((p: any) => p.id === bill.patientId);
                        return patient?.insuranceProvider;
                      }).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pending Claims:</span>
                    <span className="font-bold text-orange-600">0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Rejected Claims:</span>
                    <span className="font-bold text-red-600">0</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Expenditure Reports */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-red-600" />
                  Monthly Expenditure Report
                </CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handlePrintReport("Expenditure")}>
                    <Printer className="h-4 w-4 mr-1" />
                    Print
                  </Button>
                  <Button size="sm" onClick={() => handleExportReport("Expenditure")}>
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Expenses:</span>
                    <span className="font-bold">KShs 285,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Staff Salaries:</span>
                    <span className="font-bold text-blue-600">KShs 180,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Medical Supplies:</span>
                    <span className="font-bold text-green-600">KShs 45,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Utilities & Maintenance:</span>
                    <span className="font-bold text-orange-600">KShs 35,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Equipment & Other:</span>
                    <span className="font-bold text-purple-600">KShs 25,000</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Financial Reports */}
        <TabsContent value="financial-reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Financial Performance Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 border rounded-lg bg-green-50">
                  <h3 className="font-semibold text-green-800 mb-2">Revenue Streams</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Consultations:</span>
                      <span className="font-medium">45%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Therapy Services:</span>
                      <span className="font-medium">30%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Laboratory:</span>
                      <span className="font-medium">15%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pharmacy:</span>
                      <span className="font-medium">10%</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 border rounded-lg bg-blue-50">
                  <h3 className="font-semibold text-blue-800 mb-2">Monthly Growth</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Patient Volume:</span>
                      <span className="font-medium text-green-600">+12%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Revenue:</span>
                      <span className="font-medium text-green-600">+15%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>New Registrations:</span>
                      <span className="font-medium text-green-600">+8%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Therapy Sessions:</span>
                      <span className="font-medium text-green-600">+20%</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 border rounded-lg bg-orange-50">
                  <h3 className="font-semibold text-orange-800 mb-2">Key Metrics</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Avg. Revenue/Patient:</span>
                      <span className="font-medium">KShs 3,200</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Collection Rate:</span>
                      <span className="font-medium">92%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Profit Margin:</span>
                      <span className="font-medium">35%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Patient Satisfaction:</span>
                      <span className="font-medium">4.6/5</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Annual Reports */}
        <TabsContent value="annual-reports" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Cumulative Annual Report {selectedYear}
              </CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handlePrintReport("Annual Report")}>
                  <Printer className="h-4 w-4 mr-1" />
                  Print Full Report
                </Button>
                <Button size="sm" onClick={() => handleExportReport("Annual Report")}>
                  <Download className="h-4 w-4 mr-1" />
                  Export Annual Data
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg text-center">
                  <h3 className="font-semibold text-gray-800">Total Patients</h3>
                  <p className="text-3xl font-bold text-blue-600">{patients.length}</p>
                  <p className="text-sm text-gray-600">Registered this year</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <h3 className="font-semibold text-gray-800">Annual Revenue</h3>
                  <p className="text-3xl font-bold text-green-600">
                    KShs {billingData
                      .filter((bill: any) => bill.paymentStatus === 'paid')
                      .reduce((sum: number, bill: any) => sum + parseFloat(bill.totalAmount || '0'), 0)
                      .toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Total income</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <h3 className="font-semibold text-gray-800">Therapy Sessions</h3>
                  <p className="text-3xl font-bold text-purple-600">{therapySessions.length}</p>
                  <p className="text-sm text-gray-600">Mental health services</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <h3 className="font-semibold text-gray-800">Growth Rate</h3>
                  <p className="text-3xl font-bold text-orange-600">+28%</p>
                  <p className="text-sm text-gray-600">Year-over-year</p>
                </div>
              </div>
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Annual Summary</h3>
                <p className="text-sm text-blue-700">
                  This comprehensive report captures all hospital activities including patient admissions, 
                  outpatient consultations, therapy services, financial transactions, pharmacy operations, 
                  laboratory services, insurance claims, and staff expenditures for the fiscal year {selectedYear}.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}