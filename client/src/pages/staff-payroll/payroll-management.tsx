import { useState, useEffect, useMemo } from "react";
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
  Calculator, DollarSign, Users, FileText, Calendar, Download,
  Plus, Edit3, Eye, Search, Filter, AlertTriangle, CheckCircle,
  TrendingUp, PieChart, BarChart3, Settings, Printer, Mail
} from "lucide-react";

interface Employee {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  position: string;
  grossSalary: number;
  benefits: number;
  providentFund: number;
  loanRepayment: number;
  saccoContribution: number;
  otherDeductions: number;
  status: "active" | "inactive";
}

interface Payslip {
  totalGrossTaxableIncome: number;
  nssfContribution: number;
  shifContribution: number;
  housingLevyContribution: number;
  taxDeductibleProvidentFund: number;
  taxableIncome: number;
  paye: number;
  loanRepayment: number;
  saccoContribution: number;
  otherDeductions: number;
  totalDeductions: number;
  netPay: number;
}

export default function PayrollManagement() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState("current");
  const [calculatedPayslip, setCalculatedPayslip] = useState<Payslip | null>(null);
  const [payrollError, setPayrollError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Sample employee data
  const employees: Employee[] = [
    {
      id: "EMP001",
      name: "Dr. Sarah Johnson",
      employeeId: "H001",
      department: "Pediatric Psychiatry",
      position: "Chief Psychiatrist",
      grossSalary: 250000,
      benefits: 15000,
      providentFund: 25000,
      loanRepayment: 8000,
      saccoContribution: 5000,
      otherDeductions: 2000,
      status: "active"
    },
    {
      id: "EMP002",
      name: "Nurse Mary Wanjiku",
      employeeId: "H002",
      department: "Inpatient Care",
      position: "Senior Nurse",
      grossSalary: 85000,
      benefits: 5000,
      providentFund: 8000,
      loanRepayment: 5000,
      saccoContribution: 3000,
      otherDeductions: 1000,
      status: "active"
    },
    {
      id: "EMP003",
      name: "John Mwangi",
      employeeId: "H003",
      department: "Administration",
      position: "HR Manager",
      grossSalary: 120000,
      benefits: 8000,
      providentFund: 12000,
      loanRepayment: 6000,
      saccoContribution: 4000,
      otherDeductions: 1500,
      status: "active"
    },
    {
      id: "EMP004",
      name: "Dr. Peter Kamau",
      employeeId: "H004",
      department: "Clinical Psychology",
      position: "Clinical Psychologist",
      grossSalary: 180000,
      benefits: 10000,
      providentFund: 18000,
      loanRepayment: 7000,
      saccoContribution: 4500,
      otherDeductions: 2000,
      status: "active"
    }
  ];

  // Payroll calculation function based on Kenya tax laws
  const calculatePayroll = (employee: Employee, setError?: (error: string) => void): Payslip => {
    const { grossSalary, benefits, providentFund, loanRepayment, saccoContribution, otherDeductions } = employee;

    // 1. Calculate Total Taxable Earnings
    let totalGrossTaxableIncome = grossSalary + benefits;

    // 2. Calculate Statutory Deductions
    // NSSF Contribution (6% capped at KES 4,320)
    const nssfRate = 0.06;
    const nssfUpperLimit = 72000;
    let nssfContribution = Math.min(totalGrossTaxableIncome * nssfRate, 4320);

    // SHIF Contribution (2.75%)
    const shifRate = 0.0275;
    let shifContribution = totalGrossTaxableIncome * shifRate;

    // Housing Levy (1.5%)
    const housingLevyRate = 0.015;
    let housingLevyContribution = totalGrossTaxableIncome * housingLevyRate;

    // Tax-deductible Provident Fund (capped at KES 30,000)
    const maxProvidentFundRelief = 30000;
    const taxDeductibleProvidentFund = Math.min(providentFund, maxProvidentFundRelief);

    // 3. Calculate Taxable Income for PAYE
    let taxableIncome = totalGrossTaxableIncome - nssfContribution - shifContribution - housingLevyContribution - taxDeductibleProvidentFund;
    taxableIncome = Math.max(0, taxableIncome);

    // 4. Calculate PAYE (Pay As You Earn)
    let paye = 0;
    const personalRelief = 2400; // KES 2,400 per month

    // PAYE Tax Bands (Monthly) - Kenya Finance Act 2023/2024
    const bands = [
      { limit: 24000, rate: 0.10 },
      { limit: 8333, rate: 0.25 },
      { limit: 467667, rate: 0.30 },
      { limit: 300000, rate: 0.325 },
      { limit: Infinity, rate: 0.35 }
    ];

    let remainingTaxable = taxableIncome;
    let cumulativeBandLimit = 0;

    for (const band of bands) {
      if (remainingTaxable <= 0) break;
      const amountInBand = Math.min(remainingTaxable, band.limit);
      paye += amountInBand * band.rate;
      remainingTaxable -= amountInBand;
      cumulativeBandLimit += band.limit;
    }

    // Apply Personal Relief
    paye = Math.max(0, paye - personalRelief);

    // 5. Calculate Total Deductions
    let totalDeductions = nssfContribution + shifContribution + housingLevyContribution + loanRepayment + saccoContribution + otherDeductions + paye;

    // 6. Calculate Net Pay
    let netPay = totalGrossTaxableIncome - totalDeductions;

    // 7. Apply One-Third Rule
    const minimumNetPayRequired = totalGrossTaxableIncome / 3;
    
    let adjustedLoanRepayment = loanRepayment;
    let adjustedSaccoContribution = saccoContribution;
    let adjustedOtherDeductions = otherDeductions;

    if (netPay < minimumNetPayRequired) {
      const errorMessage = `Warning: Net pay (KES ${netPay.toFixed(2)}) is less than 1/3 of gross salary (KES ${minimumNetPayRequired.toFixed(2)}). Adjusting voluntary deductions.`;
      if (setError) {
        setError(errorMessage);
      }
      
      const reductionNeeded = minimumNetPayRequired - netPay;
      let tempReduction = reductionNeeded;

      // Reduce voluntary deductions in priority order
      if (adjustedOtherDeductions >= tempReduction) {
        adjustedOtherDeductions -= tempReduction;
        tempReduction = 0;
      } else {
        tempReduction -= adjustedOtherDeductions;
        adjustedOtherDeductions = 0;
      }

      if (tempReduction > 0) {
        if (adjustedSaccoContribution >= tempReduction) {
          adjustedSaccoContribution -= tempReduction;
          tempReduction = 0;
        } else {
          tempReduction -= adjustedSaccoContribution;
          adjustedSaccoContribution = 0;
        }
      }

      if (tempReduction > 0) {
        adjustedLoanRepayment = Math.max(0, adjustedLoanRepayment - tempReduction);
      }

      // Recalculate with adjusted deductions
      totalDeductions = nssfContribution + shifContribution + housingLevyContribution + adjustedLoanRepayment + adjustedSaccoContribution + adjustedOtherDeductions + paye;
      netPay = totalGrossTaxableIncome - totalDeductions;
    }

    return {
      totalGrossTaxableIncome,
      nssfContribution,
      shifContribution,
      housingLevyContribution,
      taxDeductibleProvidentFund,
      taxableIncome,
      paye,
      loanRepayment: adjustedLoanRepayment,
      saccoContribution: adjustedSaccoContribution,
      otherDeductions: adjustedOtherDeductions,
      totalDeductions,
      netPay
    };
  };

  const handleCalculatePayroll = (employee: Employee) => {
    const payslip = calculatePayroll(employee, setPayrollError);
    setCalculatedPayslip(payslip);
    setSelectedEmployee(employee);
  };

  const handleGeneratePayslips = () => {
    toast({
      title: "Payslips Generated",
      description: `Generated payslips for ${employees.filter(e => e.status === "active").length} active employees`,
    });
  };

  const handleExportPayroll = () => {
    toast({
      title: "Payroll Exported",
      description: "Payroll data exported successfully to Excel",
    });
  };

  // Calculate summary statistics using useMemo to prevent re-renders
  const summaryStats = useMemo(() => {
    const totalGrossPay = employees.reduce((sum, emp) => sum + emp.grossSalary + emp.benefits, 0);
    const totalNetPay = employees.reduce((sum, emp) => {
      const payslip = calculatePayroll(emp);
      return sum + payslip.netPay;
    }, 0);
    const totalTaxDeductions = employees.reduce((sum, emp) => {
      const payslip = calculatePayroll(emp);
      return sum + payslip.paye;
    }, 0);
    const totalStatutoryDeductions = employees.reduce((sum, emp) => {
      const payslip = calculatePayroll(emp);
      return sum + payslip.nssfContribution + payslip.shifContribution + payslip.housingLevyContribution;
    }, 0);

    return {
      totalGrossPay,
      totalNetPay,
      totalTaxDeductions,
      totalStatutoryDeductions
    };
  }, [employees]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Calculator className="h-8 w-8 text-blue-600" />
              Hospital Payroll Management System (Kenya)
            </h1>
            <p className="text-gray-600 mt-1">Comprehensive payroll processing with Kenya tax compliance</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Current Month</SelectItem>
                <SelectItem value="previous">Previous Month</SelectItem>
                <SelectItem value="custom">Custom Period</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="outline" className="px-3 py-1">
              <Calendar className="h-4 w-4 mr-1" />
              January 2024
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white shadow-sm">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="employees" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Employees
            </TabsTrigger>
            <TabsTrigger value="calculator" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Calculator
            </TabsTrigger>
            <TabsTrigger value="payslips" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Payslips
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-6">
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Gross Pay</p>
                      <p className="text-3xl font-bold text-gray-900">KES {summaryStats.totalGrossPay.toLocaleString()}</p>
                      <p className="text-sm text-blue-600">Current month</p>
                    </div>
                    <DollarSign className="h-12 w-12 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Net Pay</p>
                      <p className="text-3xl font-bold text-gray-900">KES {summaryStats.totalNetPay.toLocaleString()}</p>
                      <p className="text-sm text-green-600">After deductions</p>
                    </div>
                    <CheckCircle className="h-12 w-12 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">PAYE Tax</p>
                      <p className="text-3xl font-bold text-gray-900">KES {summaryStats.totalTaxDeductions.toLocaleString()}</p>
                      <p className="text-sm text-orange-600">Income tax</p>
                    </div>
                    <Calculator className="h-12 w-12 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Statutory Deductions</p>
                      <p className="text-3xl font-bold text-gray-900">KES {summaryStats.totalStatutoryDeductions.toLocaleString()}</p>
                      <p className="text-sm text-purple-600">NSSF + SHIF + Housing</p>
                    </div>
                    <PieChart className="h-12 w-12 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payroll Actions */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Payroll Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <Button onClick={handleGeneratePayslips} className="h-20 flex flex-col gap-2">
                    <FileText className="h-6 w-6" />
                    Generate Payslips
                  </Button>
                  <Button variant="outline" onClick={handleExportPayroll} className="h-20 flex flex-col gap-2">
                    <Download className="h-6 w-6" />
                    Export Payroll
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Mail className="h-6 w-6" />
                    Email Payslips
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Printer className="h-6 w-6" />
                    Print Reports
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Payroll Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-semibold">Payroll for January 2024 processed</p>
                      <p className="text-sm text-gray-600">4 employees • Total: KES {totalNetPay.toLocaleString()}</p>
                    </div>
                    <Badge variant="outline">Completed</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-semibold">Tax returns submitted to KRA</p>
                      <p className="text-sm text-gray-600">PAYE returns for December 2023</p>
                    </div>
                    <Badge variant="outline">Submitted</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Employees Tab */}
          <TabsContent value="employees" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Employee Management</h2>
              <div className="flex gap-3">
                <Input
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                />
                <Button variant="outline">
                  <Search className="h-4 w-4" />
                </Button>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Employee
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Employee ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Gross Salary</TableHead>
                      <TableHead>Net Pay</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((employee) => {
                      const payslip = calculatePayroll(employee);
                      return (
                        <TableRow key={employee.id}>
                          <TableCell className="font-medium">{employee.employeeId}</TableCell>
                          <TableCell>{employee.name}</TableCell>
                          <TableCell>{employee.department}</TableCell>
                          <TableCell>{employee.position}</TableCell>
                          <TableCell>KES {(employee.grossSalary + employee.benefits).toLocaleString()}</TableCell>
                          <TableCell>KES {payslip.netPay.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={employee.status === "active" ? "default" : "secondary"}>
                              {employee.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" onClick={() => handleCalculatePayroll(employee)}>
                                <Calculator className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost">
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Calculator Tab */}
          <TabsContent value="calculator" className="space-y-6">
            <h2 className="text-2xl font-bold">Payroll Calculator</h2>
            
            {selectedEmployee && (
              <div className="grid grid-cols-2 gap-6">
                {/* Employee Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Employee Details - {selectedEmployee.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Employee ID</Label>
                        <Input value={selectedEmployee.employeeId} readOnly />
                      </div>
                      <div>
                        <Label>Department</Label>
                        <Input value={selectedEmployee.department} readOnly />
                      </div>
                    </div>
                    <div>
                      <Label>Position</Label>
                      <Input value={selectedEmployee.position} readOnly />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Gross Salary (KES)</Label>
                        <Input value={selectedEmployee.grossSalary.toLocaleString()} readOnly />
                      </div>
                      <div>
                        <Label>Other Benefits (KES)</Label>
                        <Input value={selectedEmployee.benefits.toLocaleString()} readOnly />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Provident Fund (KES)</Label>
                        <Input value={selectedEmployee.providentFund.toLocaleString()} readOnly />
                      </div>
                      <div>
                        <Label>Loan Repayment (KES)</Label>
                        <Input value={selectedEmployee.loanRepayment.toLocaleString()} readOnly />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>SACCO Contribution (KES)</Label>
                        <Input value={selectedEmployee.saccoContribution.toLocaleString()} readOnly />
                      </div>
                      <div>
                        <Label>Other Deductions (KES)</Label>
                        <Input value={selectedEmployee.otherDeductions.toLocaleString()} readOnly />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payslip Calculation */}
                {calculatedPayslip && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-center">Payslip for {selectedEmployee.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {payrollError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-red-600 text-sm">{payrollError}</p>
                        </div>
                      )}
                      
                      <div className="space-y-4">
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-green-700 mb-2">Earnings</h3>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Gross Salary:</span>
                              <span>KES {selectedEmployee.grossSalary.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Other Benefits:</span>
                              <span>KES {selectedEmployee.benefits.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between font-bold border-t pt-1">
                              <span>Total Gross Income:</span>
                              <span>KES {calculatedPayslip.totalGrossTaxableIncome.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-red-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-red-700 mb-2">Deductions</h3>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>PAYE (Tax):</span>
                              <span>KES {calculatedPayslip.paye.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>NSSF:</span>
                              <span>KES {calculatedPayslip.nssfContribution.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>SHIF:</span>
                              <span>KES {calculatedPayslip.shifContribution.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Housing Levy:</span>
                              <span>KES {calculatedPayslip.housingLevyContribution.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Loan Repayment:</span>
                              <span>KES {calculatedPayslip.loanRepayment.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>SACCO:</span>
                              <span>KES {calculatedPayslip.saccoContribution.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Other Deductions:</span>
                              <span>KES {calculatedPayslip.otherDeductions.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between font-bold border-t pt-1">
                              <span>Total Deductions:</span>
                              <span>KES {calculatedPayslip.totalDeductions.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg text-center">
                          <h3 className="font-bold text-2xl text-blue-700">
                            Net Pay: KES {calculatedPayslip.netPay.toLocaleString()}
                          </h3>
                        </div>

                        <div className="flex gap-2">
                          <Button className="flex-1">
                            <Printer className="h-4 w-4 mr-2" />
                            Print Payslip
                          </Button>
                          <Button variant="outline" className="flex-1">
                            <Mail className="h-4 w-4 mr-2" />
                            Email Payslip
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {!selectedEmployee && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calculator className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">Select an employee from the Employees tab to calculate their payroll</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Payslips Tab */}
          <TabsContent value="payslips" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Generated Payslips</h2>
              <Button onClick={handleGeneratePayslips}>
                <FileText className="h-4 w-4 mr-2" />
                Generate All Payslips
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Employee</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Gross Pay</TableHead>
                      <TableHead>Net Pay</TableHead>
                      <TableHead>Generated Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((employee) => {
                      const payslip = calculatePayroll(employee);
                      return (
                        <TableRow key={employee.id}>
                          <TableCell>{employee.name}</TableCell>
                          <TableCell>January 2024</TableCell>
                          <TableCell>KES {(employee.grossSalary + employee.benefits).toLocaleString()}</TableCell>
                          <TableCell>KES {payslip.netPay.toLocaleString()}</TableCell>
                          <TableCell>2024-01-31</TableCell>
                          <TableCell>
                            <Badge variant="default">Generated</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost">
                                <Printer className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost">
                                <Mail className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <h2 className="text-2xl font-bold">Payroll Reports</h2>
            
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Payroll Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total Employees:</span>
                      <span className="font-bold">{employees.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Gross Pay:</span>
                      <span className="font-bold">KES {totalGrossPay.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Net Pay:</span>
                      <span className="font-bold">KES {totalNetPay.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Tax (PAYE):</span>
                      <span className="font-bold">KES {totalTaxDeductions.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Statutory Deductions:</span>
                      <span className="font-bold">KES {totalStatutoryDeductions.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Generate Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Monthly Payroll Report
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      PAYE Tax Report
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      NSSF Contribution Report
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Employee Summary Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-2xl font-bold">Payroll Settings</h2>
            
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tax Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Personal Relief (Monthly)</Label>
                    <Input defaultValue="2400" />
                  </div>
                  <div>
                    <Label>NSSF Rate (%)</Label>
                    <Input defaultValue="6" />
                  </div>
                  <div>
                    <Label>SHIF Rate (%)</Label>
                    <Input defaultValue="2.75" />
                  </div>
                  <div>
                    <Label>Housing Levy Rate (%)</Label>
                    <Input defaultValue="1.5" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Payroll Processing Day</Label>
                    <Select defaultValue="last">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="last">Last Day of Month</SelectItem>
                        <SelectItem value="25">25th of Month</SelectItem>
                        <SelectItem value="30">30th of Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Currency</Label>
                    <Select defaultValue="kes">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kes">Kenyan Shilling (KES)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Rounding Method</Label>
                    <Select defaultValue="nearest">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nearest">Nearest Whole Number</SelectItem>
                        <SelectItem value="up">Round Up</SelectItem>
                        <SelectItem value="down">Round Down</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}