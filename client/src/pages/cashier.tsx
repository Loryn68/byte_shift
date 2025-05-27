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

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString();
  };

  const formatDateTime = (date: string | Date) => {
    return new Date(date).toLocaleString();
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
        const pendingPayments = filterBillingByStatus(["pending"]);
        const todayPayments = filterBillingByStatus(["paid"]).filter((bill: Billing) => 
          bill.paymentDate && new Date(bill.paymentDate).toDateString() === new Date().toDateString()
        );

        const paymentsByMethod = todayPayments.reduce((acc: any, bill: Billing) => {
          const method = bill.paymentMethod || 'unknown';
          acc[method] = (acc[method] || 0) + parseFloat(bill.totalAmount || "0");
          return acc;
        }, {});

        const totalRevenue = todayPayments.reduce((sum, bill) => sum + parseFloat(bill.totalAmount || "0"), 0);

        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Queue Management</h3>
            
            {/* Patients with Pending Payments */}
            <div>
              <h4 className="text-md font-medium mb-3 text-orange-600">Patients with Pending Payments</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient ID</TableHead>
                    <TableHead>Patient Name</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingPayments.map((bill: Billing) => (
                    <TableRow key={bill.id}>
                      <TableCell>{getPatientId(bill.patientId)}</TableCell>
                      <TableCell>{getPatientName(bill.patientId)}</TableCell>
                      <TableCell>{bill.serviceType}</TableCell>
                      <TableCell>{formatCurrency(parseFloat(bill.totalAmount || "0"))}</TableCell>
                      <TableCell>{formatDate(bill.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Today's Payments by Method */}
            <div>
              <h4 className="text-md font-medium mb-3 text-green-600">Payments Made Today by Method</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h5 className="font-medium text-green-800">Cash</h5>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(paymentsByMethod.cash || 0)}
                  </p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h5 className="font-medium text-purple-800">M-Pesa</h5>
                  <p className="text-xl font-bold text-purple-600">
                    {formatCurrency(paymentsByMethod.mobile || 0)}
                  </p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-medium text-blue-800">Card</h5>
                  <p className="text-xl font-bold text-blue-600">
                    {formatCurrency(paymentsByMethod.card || 0)}
                  </p>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h5 className="font-medium text-orange-800">Bank</h5>
                  <p className="text-xl font-bold text-orange-600">
                    {formatCurrency(paymentsByMethod.bank || 0)}
                  </p>
                </div>
              </div>
              
              {/* Combined Total Revenue */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium text-gray-800">Total Revenue Today</h5>
                <p className="text-2xl font-bold text-gray-700">
                  {formatCurrency(totalRevenue)}
                </p>
                <p className="text-sm text-gray-600">
                  Combined total: Cash + M-Pesa + Card + Bank
                </p>
              </div>
            </div>
          </div>
        );

      case 'receipts':
        const cashReceipts = filterBillingByStatus(["paid"]).filter((bill: Billing) => bill.paymentMethod === "cash");
        
        const generateReceiptContent = (bill: Billing) => {
          const patient = patients.find((p: Patient) => p.id === bill.patientId);
          if (!patient) return "";

          const formatDateTime = (date: string | Date) => {
            return new Date(date).toLocaleString();
          };
          
          return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px;">
                <h1 style="color: #2563eb; margin: 0;">Child Mental Haven</h1>
                <p style="margin: 5px 0; color: #666;">Hospital Information Management</p>
                <h2 style="margin: 10px 0; color: #333;">PAYMENT RECEIPT</h2>
              </div>
              
              <div style="margin-bottom: 20px;">
                <h3 style="color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Receipt Information</h3>
                <p><strong>Receipt #:</strong> ${bill.billId}</p>
                <p><strong>Date:</strong> ${bill.paymentDate ? formatDateTime(bill.paymentDate) : formatDateTime(new Date())}</p>
                <p><strong>Payment Method:</strong> Cash</p>
              </div>
              
              <div style="margin-bottom: 20px;">
                <h3 style="color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Patient Information</h3>
                <p><strong>Patient ID:</strong> ${patient.patientId}</p>
                <p><strong>Name:</strong> ${patient.firstName} ${patient.middleName ? patient.middleName + ' ' : ''}${patient.lastName}</p>
                <p><strong>Date of Birth:</strong> ${formatDate(patient.dateOfBirth)}</p>
                <p><strong>Age:</strong> ${new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} years</p>
                <p><strong>Gender:</strong> ${patient.gender}</p>
                <p><strong>Address:</strong> ${patient.address}</p>
                <p><strong>County:</strong> ${patient.county || 'Not specified'}</p>
                ${patient.occupation ? `<p><strong>Occupation:</strong> ${patient.occupation}</p>` : ''}
                ${patient.bloodType ? `<p><strong>Blood Type:</strong> ${patient.bloodType}</p>` : ''}
                ${patient.insuranceProvider ? `<p><strong>Insurance Provider:</strong> ${patient.insuranceProvider}</p>` : ''}
                ${patient.insuranceNumber ? `<p><strong>Insurance Number:</strong> ${patient.insuranceNumber}</p>` : ''}
                ${patient.allergies ? `<p><strong>Allergies:</strong> ${patient.allergies}</p>` : ''}
                ${patient.medicalHistory ? `<p><strong>Medical History:</strong> ${patient.medicalHistory}</p>` : ''}
              </div>
              
              <div style="margin-bottom: 20px;">
                <h3 style="color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Service Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr style="background-color: #f5f5f5;">
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Description</th>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Amount</th>
                  </tr>
                  <tr>
                    <td style="border: 1px solid #ddd; padding: 8px;">${bill.serviceDescription}</td>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatCurrency(parseFloat(bill.amount || "0"))}</td>
                  </tr>
                  ${bill.discount && parseFloat(bill.discount) > 0 ? `
                    <tr>
                      <td style="border: 1px solid #ddd; padding: 8px;">Discount</td>
                      <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">-${formatCurrency(parseFloat(bill.discount))}</td>
                    </tr>
                  ` : ''}
                  <tr style="background-color: #f0f0f0; font-weight: bold;">
                    <td style="border: 1px solid #ddd; padding: 8px;">Total Amount</td>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatCurrency(parseFloat(bill.totalAmount || "0"))}</td>
                  </tr>
                </table>
              </div>
              
              <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #666;">
                <p>Thank you for choosing Child Mental Haven</p>
                <p>For inquiries, please contact us</p>
                <p style="margin-top: 20px;">This is a computer-generated receipt</p>
              </div>
            </div>
          `;
        };
        
        const printReceipt = (bill: Billing) => {
          const printWindow = window.open('', '_blank');
          if (printWindow) {
            printWindow.document.write(`
              <html>
                <head>
                  <title>Receipt ${bill.billId}</title>
                  <style>
                    @media print {
                      body { margin: 0; }
                      @page { margin: 1cm; }
                    }
                  </style>
                </head>
                <body>
                  ${generateReceiptContent(bill)}
                </body>
              </html>
            `);
            printWindow.document.close();
            printWindow.print();
          }
        };
        
        const downloadPDF = (bill: Billing) => {
          // Create a new window for PDF generation
          const pdfWindow = window.open('', '_blank');
          if (pdfWindow) {
            pdfWindow.document.write(`
              <html>
                <head>
                  <title>Receipt ${bill.billId}</title>
                  <style>
                    body { margin: 0; font-family: Arial, sans-serif; }
                  </style>
                </head>
                <body>
                  ${generateReceiptContent(bill)}
                  <script>
                    window.onload = function() {
                      window.print();
                    }
                  </script>
                </body>
              </html>
            `);
            pdfWindow.document.close();
          }
        };
        
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
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cashReceipts.map((bill: Billing) => (
                  <TableRow key={bill.id}>
                    <TableCell>#{bill.billId}</TableCell>
                    <TableCell>{getPatientName(bill.patientId)}</TableCell>
                    <TableCell>{bill.serviceType}</TableCell>
                    <TableCell>{formatCurrency(parseFloat(bill.totalAmount || "0"))}</TableCell>
                    <TableCell>{bill.paymentDate ? formatDate(bill.paymentDate) : "-"}</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">Cash</Badge>
                    </TableCell>
                    <TableCell className="space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => printReceipt(bill)}
                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                      >
                        Print
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadPDF(bill)}
                        className="text-green-600 border-green-600 hover:bg-green-50"
                      >
                        PDF
                      </Button>
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