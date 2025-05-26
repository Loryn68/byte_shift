import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  CreditCard, 
  DollarSign, 
  Users, 
  Receipt, 
  Shield, 
  FileX, 
  TrendingUp,
  RefreshCw,
  Search,
  Building2
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Patient, Billing } from "@shared/schema";
import logoPath from "@assets/image_1748235729903.png";

export default function Cashier() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedView, setSelectedView] = useState<'payments' | 'queue' | 'receipts' | 'insurance' | 'credit' | 'cancelled' | 'income' | 'refunds'>('payments');
  const [paymentDialog, setPaymentDialog] = useState<{
    isOpen: boolean;
    bill: Billing | null;
    method: 'cash' | 'card' | 'mobile' | 'bank' | null;
  }>({
    isOpen: false,
    bill: null,
    method: null
  });
  const [paymentData, setPaymentData] = useState({
    amountReceived: '',
    transactionNumber: ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: patients = [] } = useQuery({
    queryKey: ["/api/patients"],
  });

  const { data: billingRecords = [] } = useQuery({
    queryKey: ["/api/billing"],
  });

  const updatePaymentMutation = useMutation({
    mutationFn: async ({ id, paymentMethod, transactionNumber }: { 
      id: number; 
      paymentMethod: string; 
      transactionNumber?: string;
    }) => {
      const updateData: any = {
        paymentStatus: "paid",
        paymentMethod,
        paymentDate: new Date().toISOString(),
      };
      
      if (transactionNumber) {
        updateData.transactionNumber = transactionNumber;
      }
      
      return await apiRequest("PUT", `/api/billing/${id}`, updateData);
    },
    onSuccess: () => {
      toast({
        title: "Payment Processed",
        description: "Payment has been processed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/billing"] });
      setPaymentDialog({ isOpen: false, bill: null, method: null });
      setPaymentData({ amountReceived: '', transactionNumber: '' });
    },
  });

  const openPaymentDialog = (bill: Billing, method: 'cash' | 'card' | 'mobile' | 'bank') => {
    setPaymentDialog({ isOpen: true, bill, method });
    setPaymentData({ amountReceived: bill.totalAmount || '', transactionNumber: '' });
  };

  const processPayment = () => {
    if (!paymentDialog.bill) return;
    
    const { bill, method } = paymentDialog;
    const { transactionNumber } = paymentData;
    
    updatePaymentMutation.mutate({
      id: bill.id!,
      paymentMethod: method!,
      transactionNumber: method === 'cash' ? undefined : transactionNumber
    });
  };

  const processRefundMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string }) => {
      return await apiRequest("PUT", `/api/billing/${id}`, {
        paymentStatus: "refunded",
        notes: `Refund: ${reason}`,
      });
    },
    onSuccess: () => {
      toast({
        title: "Refund Processed",
        description: "Refund has been processed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/billing"] });
    },
  });

  const getPatientName = (patientId: number) => {
    const patient = patients.find((p: Patient) => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : "Unknown Patient";
  };

  const getPatientId = (patientId: number) => {
    const patient = patients.find((p: Patient) => p.id === patientId);
    return patient?.patientId || "";
  };

  const filterBillingByStatus = (status: string[]) => {
    return billingRecords.filter((bill: Billing) => 
      status.includes(bill.paymentStatus) &&
      (searchQuery === "" || 
       getPatientName(bill.patientId).toLowerCase().includes(searchQuery.toLowerCase()) ||
       getPatientId(bill.patientId).toLowerCase().includes(searchQuery.toLowerCase()) ||
       bill.serviceType.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const calculateIncomeByDepartment = () => {
    const departments: Record<string, number> = {};
    billingRecords
      .filter((bill: Billing) => bill.paymentStatus === "paid")
      .forEach((bill: Billing) => {
        const dept = bill.serviceType.includes("Psychiatric") ? "Psychiatry" :
                    bill.serviceType.includes("Medical") ? "Medical" :
                    bill.serviceType.includes("Child") ? "Pediatrics" :
                    bill.serviceType.includes("Counseling") ? "Psychology" :
                    bill.serviceType.includes("Laboratory") ? "Laboratory" :
                    bill.serviceType.includes("Pharmacy") ? "Pharmacy" : "General";
        
        departments[dept] = (departments[dept] || 0) + parseFloat(bill.totalAmount || "0");
      });
    return departments;
  };

  const renderContent = () => {
    switch (selectedView) {
      case 'payments':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Receive Payment</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient ID</TableHead>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filterBillingByStatus(["pending"]).map((bill: Billing) => (
                  <TableRow key={bill.id}>
                    <TableCell>{getPatientId(bill.patientId)}</TableCell>
                    <TableCell>{getPatientName(bill.patientId)}</TableCell>
                    <TableCell>{bill.serviceType}</TableCell>
                    <TableCell>{formatCurrency(parseFloat(bill.totalAmount || "0"))}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-orange-600 border-orange-600">
                        Pending
                      </Badge>
                    </TableCell>
                    <TableCell className="space-x-2">
                      <Button
                        size="sm"
                        onClick={() => openPaymentDialog(bill, "cash")}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Cash
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => openPaymentDialog(bill, "card")}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Card
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => openPaymentDialog(bill, "mobile")}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        M-Pesa
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => openPaymentDialog(bill, "bank")}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        Bank
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );

      case 'queue':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Payment Queue</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-medium text-orange-800">Pending Payments</h4>
                <p className="text-2xl font-bold text-orange-600">
                  {filterBillingByStatus(["pending"]).length}
                </p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800">Paid Today</h4>
                <p className="text-2xl font-bold text-green-600">
                  {filterBillingByStatus(["paid"]).filter((bill: Billing) => 
                    bill.paymentDate && new Date(bill.paymentDate).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800">Total Revenue Today</h4>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(
                    filterBillingByStatus(["paid"])
                      .filter((bill: Billing) => 
                        bill.paymentDate && new Date(bill.paymentDate).toDateString() === new Date().toDateString()
                      )
                      .reduce((sum, bill) => sum + parseFloat(bill.totalAmount || "0"), 0)
                  )}
                </p>
              </div>
            </div>
          </div>
        );

      case 'receipts':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Cash Receipts</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt #</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead>Method</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filterBillingByStatus(["paid"]).filter((bill: Billing) => bill.paymentMethod === "cash").map((bill: Billing) => (
                  <TableRow key={bill.id}>
                    <TableCell>#{bill.billId}</TableCell>
                    <TableCell>{getPatientName(bill.patientId)}</TableCell>
                    <TableCell>{bill.serviceType}</TableCell>
                    <TableCell>{formatCurrency(parseFloat(bill.totalAmount || "0"))}</TableCell>
                    <TableCell>{bill.paymentDate ? formatDate(bill.paymentDate) : "-"}</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">Cash</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );

      case 'insurance':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Insurance Bills</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Insurance Amount</TableHead>
                  <TableHead>Patient Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filterBillingByStatus(["pending", "paid"]).filter((bill: Billing) => bill.insuranceClaimed).map((bill: Billing) => (
                  <TableRow key={bill.id}>
                    <TableCell>{getPatientName(bill.patientId)}</TableCell>
                    <TableCell>{bill.serviceType}</TableCell>
                    <TableCell>{formatCurrency(parseFloat(bill.totalAmount || "0"))}</TableCell>
                    <TableCell>{formatCurrency(parseFloat(bill.insuranceAmount || "0"))}</TableCell>
                    <TableCell>
                      {formatCurrency(parseFloat(bill.totalAmount || "0") - parseFloat(bill.insuranceAmount || "0"))}
                    </TableCell>
                    <TableCell>
                      <Badge className={bill.paymentStatus === "paid" ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}>
                        {bill.paymentStatus}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );

      case 'credit':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Credit Bills</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead>Method</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filterBillingByStatus(["paid"]).filter((bill: Billing) => ["card", "mobile"].includes(bill.paymentMethod || "")).map((bill: Billing) => (
                  <TableRow key={bill.id}>
                    <TableCell>{getPatientName(bill.patientId)}</TableCell>
                    <TableCell>{bill.serviceType}</TableCell>
                    <TableCell>{formatCurrency(parseFloat(bill.totalAmount || "0"))}</TableCell>
                    <TableCell>{bill.paymentDate ? formatDate(bill.paymentDate) : "-"}</TableCell>
                    <TableCell>
                      <Badge className={bill.paymentMethod === "card" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}>
                        {bill.paymentMethod === "card" ? "Card" : "Mobile"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );

      case 'cancelled':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Cancelled Bills</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Cancelled Date</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filterBillingByStatus(["cancelled", "refunded"]).map((bill: Billing) => (
                  <TableRow key={bill.id}>
                    <TableCell>{getPatientName(bill.patientId)}</TableCell>
                    <TableCell>{bill.serviceType}</TableCell>
                    <TableCell>{formatCurrency(parseFloat(bill.totalAmount || "0"))}</TableCell>
                    <TableCell>{bill.paymentDate ? formatDate(bill.paymentDate) : "-"}</TableCell>
                    <TableCell>{bill.notes || "No reason provided"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );

      case 'income':
        const departmentIncome = calculateIncomeByDepartment();
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Income Per Department</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(departmentIncome).map(([dept, income]) => (
                <div key={dept} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800">{dept}</h4>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(income)}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'refunds':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Process Refunds</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filterBillingByStatus(["paid"]).map((bill: Billing) => (
                  <TableRow key={bill.id}>
                    <TableCell>{getPatientName(bill.patientId)}</TableCell>
                    <TableCell>{bill.serviceType}</TableCell>
                    <TableCell>{formatCurrency(parseFloat(bill.totalAmount || "0"))}</TableCell>
                    <TableCell>{bill.paymentDate ? formatDate(bill.paymentDate) : "-"}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          const reason = prompt("Enter refund reason:");
                          if (reason) {
                            processRefundMutation.mutate({ id: bill.id!, reason });
                          }
                        }}
                      >
                        Process Refund
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <img src={logoPath} alt="Child Mental Haven" className="h-10 w-10" />
            <h1 className="text-2xl font-bold text-gray-900">Cashier Portal</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search patients, services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar with Cashier Buttons */}
        <div className="w-64 bg-white shadow-sm border-r min-h-screen">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Cashier Functions</h2>
            <div className="space-y-2">
              <Button
                variant={selectedView === 'payments' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setSelectedView('payments')}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Receive Payment
              </Button>
              <Button
                variant={selectedView === 'queue' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setSelectedView('queue')}
              >
                <Users className="w-4 h-4 mr-2" />
                Queue
              </Button>
              <Button
                variant={selectedView === 'receipts' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setSelectedView('receipts')}
              >
                <Receipt className="w-4 h-4 mr-2" />
                Cash Receipts
              </Button>
              <Button
                variant={selectedView === 'insurance' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setSelectedView('insurance')}
              >
                <Shield className="w-4 h-4 mr-2" />
                Insurance Bills
              </Button>
              <Button
                variant={selectedView === 'credit' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setSelectedView('credit')}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Credit Bills
              </Button>
              <Button
                variant={selectedView === 'cancelled' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setSelectedView('cancelled')}
              >
                <FileX className="w-4 h-4 mr-2" />
                Cancelled Bills
              </Button>
              <Button
                variant={selectedView === 'income' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setSelectedView('income')}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Income Per Department
              </Button>
              <Button
                variant={selectedView === 'refunds' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setSelectedView('refunds')}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refund
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {renderContent()}
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={paymentDialog.isOpen} onOpenChange={(open) => 
        setPaymentDialog({ isOpen: open, bill: null, method: null })
      }>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Process {paymentDialog.method === 'cash' ? 'Cash' : 
                     paymentDialog.method === 'card' ? 'Card' :
                     paymentDialog.method === 'mobile' ? 'M-Pesa' : 'Bank'} Payment
            </DialogTitle>
          </DialogHeader>
          
          {paymentDialog.bill && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>Patient:</strong> {getPatientName(paymentDialog.bill.patientId)}</p>
                <p><strong>Service:</strong> {paymentDialog.bill.serviceType}</p>
                <p><strong>Amount Due:</strong> {formatCurrency(parseFloat(paymentDialog.bill.totalAmount || "0"))}</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Amount Received</label>
                  <Input
                    value={paymentData.amountReceived}
                    onChange={(e) => setPaymentData({...paymentData, amountReceived: e.target.value})}
                    placeholder="Enter amount received"
                    type="number"
                  />
                </div>

                {paymentDialog.method !== 'cash' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {paymentDialog.method === 'mobile' ? 'M-Pesa Transaction Code' : 'Transaction Number'}
                    </label>
                    <Input
                      value={paymentData.transactionNumber}
                      onChange={(e) => setPaymentData({...paymentData, transactionNumber: e.target.value})}
                      placeholder={paymentDialog.method === 'mobile' ? 'Enter M-Pesa code' : 'Enter transaction number'}
                    />
                  </div>
                )}

                {paymentDialog.method === 'cash' && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm">
                      <strong>Change Due:</strong> {formatCurrency(
                        Math.max(0, parseFloat(paymentData.amountReceived || "0") - parseFloat(paymentDialog.bill.totalAmount || "0"))
                      )}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={processPayment}
                  disabled={updatePaymentMutation.isPending || 
                    !paymentData.amountReceived || 
                    (paymentDialog.method !== 'cash' && !paymentData.transactionNumber)}
                  className="flex-1"
                >
                  {updatePaymentMutation.isPending ? 'Processing...' : 'Process Payment'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPaymentDialog({ isOpen: false, bill: null, method: null })}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}