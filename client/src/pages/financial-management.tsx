import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { DollarSign, CreditCard, AlertCircle, TrendingUp, Users, Calendar, FileText, Wallet, Building, Receipt } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function FinancialManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("inpatient-billing");
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  // Fetch financial data
  const { data: billingData = [] } = useQuery({
    queryKey: ["/api/billing"],
  });

  const { data: patients = [] } = useQuery({
    queryKey: ["/api/patients"],
  });

  // Calculate financial metrics
  const totalRevenue = billingData
    .filter((bill: any) => bill.paymentStatus === 'paid')
    .reduce((sum: number, bill: any) => sum + parseFloat(bill.totalAmount || '0'), 0);

  const pendingPayments = billingData
    .filter((bill: any) => bill.paymentStatus === 'pending')
    .reduce((sum: number, bill: any) => sum + parseFloat(bill.totalAmount || '0'), 0);

  const inpatientBilling = billingData.filter((bill: any) => 
    patients.find((p: any) => p.id === bill.patientId)?.patientType === 'inpatient'
  );

  const outpatientBilling = billingData.filter((bill: any) => 
    patients.find((p: any) => p.id === bill.patientId)?.patientType === 'outpatient'
  );

  const insuranceBilling = billingData.filter((bill: any) => 
    patients.find((p: any) => p.id === bill.patientId)?.insuranceProvider
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-green-600" />
            Financial Management
          </h1>
          <p className="text-gray-600">Complete financial oversight and billing management</p>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">KShs {totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-green-600">Paid invoices</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Pending Bills</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">KShs {pendingPayments.toLocaleString()}</div>
            <p className="text-xs text-orange-600">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Inpatient Revenue</CardTitle>
            <Building className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              KShs {inpatientBilling
                .filter((bill: any) => bill.paymentStatus === 'paid')
                .reduce((sum: number, bill: any) => sum + parseFloat(bill.totalAmount || '0'), 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-blue-600">Admitted patients</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Insurance Claims</CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              KShs {insuranceBilling
                .filter((bill: any) => bill.paymentStatus === 'paid')
                .reduce((sum: number, bill: any) => sum + parseFloat(bill.totalAmount || '0'), 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-purple-600">Insurance revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="inpatient-billing">Inpatient Billing</TabsTrigger>
          <TabsTrigger value="outpatient-billing">Outpatient Billing</TabsTrigger>
          <TabsTrigger value="salaries">Salaries</TabsTrigger>
          <TabsTrigger value="unpaid-bills">Unpaid Bills</TabsTrigger>
          <TabsTrigger value="petty-cash">Petty Cash</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>

        {/* Inpatient Billing */}
        <TabsContent value="inpatient-billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-600" />
                Inpatient Billing Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {inpatientBilling.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No inpatient billing records found</p>
                  </div>
                ) : (
                  inpatientBilling.map((bill: any) => {
                    const patient = patients.find((p: any) => p.id === bill.patientId);
                    return (
                      <div key={bill.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">
                            {patient?.firstName} {patient?.lastName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {bill.serviceDescription} | Bill ID: {bill.billId}
                          </p>
                          <p className="text-sm text-gray-500">
                            Ward: {patient?.wardAssignment || 'Not assigned'} | Bed: {patient?.bedNumber || 'N/A'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">KShs {parseFloat(bill.totalAmount).toLocaleString()}</p>
                          <Badge variant={bill.paymentStatus === 'paid' ? 'default' : 'destructive'}>
                            {bill.paymentStatus}
                          </Badge>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Outpatient Billing */}
        <TabsContent value="outpatient-billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                Outpatient Billing Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {outpatientBilling.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No outpatient billing records found</p>
                  </div>
                ) : (
                  outpatientBilling.map((bill: any) => {
                    const patient = patients.find((p: any) => p.id === bill.patientId);
                    return (
                      <div key={bill.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">
                            {patient?.firstName} {patient?.lastName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {bill.serviceDescription} | Bill ID: {bill.billId}
                          </p>
                          <p className="text-sm text-gray-500">
                            Payment Method: {bill.paymentMethod || 'Not specified'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">KShs {parseFloat(bill.totalAmount).toLocaleString()}</p>
                          <Badge variant={bill.paymentStatus === 'paid' ? 'default' : 'destructive'}>
                            {bill.paymentStatus}
                          </Badge>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Salaries */}
        <TabsContent value="salaries" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-purple-600" />
                  Staff Salary Management
                </CardTitle>
                <Button
                  onClick={() => setShowSalaryModal(true)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Process Payroll
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg bg-blue-50">
                    <h3 className="font-semibold text-blue-800">Doctors</h3>
                    <p className="text-2xl font-bold text-blue-900">KShs 450,000</p>
                    <p className="text-sm text-blue-600">5 staff members</p>
                  </div>
                  <div className="p-4 border rounded-lg bg-green-50">
                    <h3 className="font-semibold text-green-800">Nurses</h3>
                    <p className="text-2xl font-bold text-green-900">KShs 280,000</p>
                    <p className="text-sm text-green-600">8 staff members</p>
                  </div>
                  <div className="p-4 border rounded-lg bg-orange-50">
                    <h3 className="font-semibold text-orange-800">Support Staff</h3>
                    <p className="text-2xl font-bold text-orange-900">KShs 180,000</p>
                    <p className="text-sm text-orange-600">12 staff members</p>
                  </div>
                </div>
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Detailed payroll records will be displayed here</p>
                  <p className="text-sm">Monthly salary processing and employee payments</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Unpaid Bills */}
        <TabsContent value="unpaid-bills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                Unpaid Bills Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {billingData.filter((bill: any) => bill.paymentStatus === 'pending').length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No unpaid bills</p>
                    <p className="text-sm">All bills have been settled</p>
                  </div>
                ) : (
                  billingData
                    .filter((bill: any) => bill.paymentStatus === 'pending')
                    .map((bill: any) => {
                      const patient = patients.find((p: any) => p.id === bill.patientId);
                      return (
                        <div key={bill.id} className="flex items-center justify-between p-4 border rounded-lg bg-red-50">
                          <div>
                            <h3 className="font-medium text-red-900">
                              {patient?.firstName} {patient?.lastName}
                            </h3>
                            <p className="text-sm text-red-700">
                              {bill.serviceDescription} | Bill ID: {bill.billId}
                            </p>
                            <p className="text-sm text-red-600">
                              Created: {new Date(bill.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg text-red-900">KShs {parseFloat(bill.totalAmount).toLocaleString()}</p>
                            <Badge variant="destructive">UNPAID</Badge>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Petty Cash Book */}
        <TabsContent value="petty-cash" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-green-600" />
                  Petty Cash Book
                </CardTitle>
                <Button
                  onClick={() => setShowExpenseModal(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Add Expense
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg bg-green-50">
                    <h3 className="font-semibold text-green-800">Opening Balance</h3>
                    <p className="text-2xl font-bold text-green-900">KShs 25,000</p>
                    <p className="text-sm text-green-600">Month start</p>
                  </div>
                  <div className="p-4 border rounded-lg bg-red-50">
                    <h3 className="font-semibold text-red-800">Total Expenses</h3>
                    <p className="text-2xl font-bold text-red-900">KShs 8,500</p>
                    <p className="text-sm text-red-600">This month</p>
                  </div>
                  <div className="p-4 border rounded-lg bg-blue-50">
                    <h3 className="font-semibold text-blue-800">Current Balance</h3>
                    <p className="text-2xl font-bold text-blue-900">KShs 16,500</p>
                    <p className="text-sm text-blue-600">Available</p>
                  </div>
                </div>
                <div className="text-center py-8 text-gray-500">
                  <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Petty cash transactions will be displayed here</p>
                  <p className="text-sm">Office supplies, utilities, and miscellaneous expenses</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory */}
        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Inventory Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg bg-blue-50">
                    <h3 className="font-semibold text-blue-800">Medical Supplies</h3>
                    <p className="text-2xl font-bold text-blue-900">KShs 85,000</p>
                    <p className="text-sm text-blue-600">Current stock value</p>
                  </div>
                  <div className="p-4 border rounded-lg bg-green-50">
                    <h3 className="font-semibold text-green-800">Pharmaceuticals</h3>
                    <p className="text-2xl font-bold text-green-900">KShs 120,000</p>
                    <p className="text-sm text-green-600">Medication inventory</p>
                  </div>
                  <div className="p-4 border rounded-lg bg-purple-50">
                    <h3 className="font-semibold text-purple-800">Equipment</h3>
                    <p className="text-2xl font-bold text-purple-900">KShs 45,000</p>
                    <p className="text-sm text-purple-600">Medical equipment</p>
                  </div>
                  <div className="p-4 border rounded-lg bg-orange-50">
                    <h3 className="font-semibold text-orange-800">Office Supplies</h3>
                    <p className="text-2xl font-bold text-orange-900">KShs 12,000</p>
                    <p className="text-sm text-orange-600">Administrative items</p>
                  </div>
                </div>
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Detailed inventory tracking will be displayed here</p>
                  <p className="text-sm">Stock levels, reorder points, and supplier information</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Salary Processing Modal */}
      <Dialog open={showSalaryModal} onOpenChange={setShowSalaryModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Process Staff Payroll</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Payroll Period</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current Month</SelectItem>
                  <SelectItem value="previous">Previous Month</SelectItem>
                  <SelectItem value="custom">Custom Period</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Department</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="medical">Medical Staff</SelectItem>
                  <SelectItem value="nursing">Nursing</SelectItem>
                  <SelectItem value="admin">Administration</SelectItem>
                  <SelectItem value="support">Support Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowSalaryModal(false)}>
                Cancel
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700">
                Process Payroll
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Expense Modal */}
      <Dialog open={showExpenseModal} onOpenChange={setShowExpenseModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Petty Cash Expense</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Description</Label>
              <Input placeholder="Office supplies, utilities, etc." />
            </div>
            <div>
              <Label>Amount (KShs)</Label>
              <Input type="number" placeholder="0.00" />
            </div>
            <div>
              <Label>Category</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="office">Office Supplies</SelectItem>
                  <SelectItem value="utilities">Utilities</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="transport">Transport</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea placeholder="Additional details..." />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowExpenseModal(false)}>
                Cancel
              </Button>
              <Button className="bg-green-600 hover:bg-green-700">
                Add Expense
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}