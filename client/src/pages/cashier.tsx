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
            <div style="font-family: 'Courier New', monospace; max-width: 400px; margin: 0 auto; padding: 20px; background: white;">
              <div style="text-align: center; border-bottom: 2px dashed #333; padding-bottom: 15px; margin-bottom: 15px;">
                <div style="margin-bottom: 10px;">
                  <svg width="100" height="80" viewBox="0 0 200 150" style="margin: 0 auto; display: block;">
                    <!-- Colorful brain -->
                    <path d="M100 30 C80 25, 60 35, 65 50 C55 55, 60 70, 75 75 C70 85, 85 90, 95 85 C105 90, 120 85, 115 75 C130 70, 135 55, 125 50 C140 35, 120 25, 100 30 Z" fill="#4CAF50"/>
                    <path d="M105 35 C125 30, 135 40, 130 50 C140 55, 135 65, 125 65 C130 75, 115 80, 110 75 C105 80, 95 75, 100 70 C85 65, 85 55, 95 50 C85 40, 95 30, 105 35 Z" fill="#2196F3"/>
                    <path d="M110 40 C120 45, 125 55, 115 60 C125 65, 120 75, 110 70 C115 80, 105 85, 100 80 C95 85, 85 80, 90 70 C80 75, 75 65, 85 60 C75 55, 80 45, 90 50 C85 40, 95 35, 110 40 Z" fill="#FF5722"/>
                    <path d="M95 45 C105 50, 110 60, 100 65 C110 70, 105 80, 95 75 C100 85, 90 90, 85 85 C80 90, 70 85, 75 75 C65 80, 60 70, 70 65 C60 60, 65 50, 75 55 C70 45, 80 40, 95 45 Z" fill="#9C27B0"/>
                    <path d="M100 50 C110 55, 115 65, 105 70 C115 75, 110 85, 100 80 C105 90, 95 95, 90 90 C85 95, 75 90, 80 80 C70 85, 65 75, 75 70 C65 65, 70 55, 80 60 C75 50, 85 45, 100 50 Z" fill="#FF9800"/>
                    
                    <!-- Two children figures holding hands -->
                    <g transform="translate(60, 80)">
                      <!-- Left child -->
                      <circle cx="15" cy="15" r="8" fill="#4CAF50"/>
                      <path d="M7 25 L7 50 L12 50 L12 35 L18 35 L18 50 L23 50 L23 25 C23 20, 20 15, 15 15 C10 15, 7 20, 7 25 Z" fill="#4CAF50"/>
                      <path d="M5 40 L5 55 L10 55 L10 40 Z" fill="#4CAF50"/>
                      <path d="M20 40 L20 55 L25 55 L25 40 Z" fill="#4CAF50"/>
                    </g>
                    
                    <g transform="translate(110, 80)">
                      <!-- Right child -->
                      <circle cx="15" cy="15" r="8" fill="#4CAF50"/>
                      <path d="M7 25 L7 50 L12 50 L12 35 L18 35 L18 50 L23 50 L23 25 C23 20, 20 15, 15 15 C10 15, 7 20, 7 25 Z" fill="#4CAF50"/>
                      <path d="M5 40 L5 55 L10 55 L10 40 Z" fill="#4CAF50"/>
                      <path d="M20 40 L20 55 L25 55 L25 40 Z" fill="#4CAF50"/>
                    </g>
                    
                    <!-- Connection line between children -->
                    <line x1="85" y1="115" x2="115" y2="115" stroke="#4CAF50" stroke-width="3"/>
                  </svg>
                </div>
                <h1 style="font-size: 18px; font-weight: bold; margin: 5px 0; letter-spacing: 1px;">CHILD MENTAL HAVEN</h1>
                <p style="font-size: 12px; margin: 5px 0;">Where Young Minds Evolve</p>
                <h2 style="font-size: 14px; margin: 10px 0; letter-spacing: 2px;">PAYMENT RECEIPT</h2>
              </div>
              
              <div style="margin-bottom: 15px; font-size: 12px;">
                <div style="border-bottom: 1px dashed #333; padding-bottom: 8px; margin-bottom: 8px;">
                  <strong>RECEIPT DETAILS</strong>
                </div>
                <div>Receipt #: ${bill.billId}</div>
                <div>Date: ${bill.paymentDate ? formatDateTime(bill.paymentDate) : formatDateTime(new Date())}</div>
                <div>Payment: CASH</div>
              </div>
              
              <div style="margin-bottom: 15px; font-size: 12px;">
                <div style="border-bottom: 1px dashed #333; padding-bottom: 8px; margin-bottom: 8px;">
                  <strong>PATIENT INFORMATION</strong>
                </div>
                <div>ID: ${patient.patientId}</div>
                <div>Name: ${patient.firstName} ${patient.middleName ? patient.middleName + ' ' : ''}${patient.lastName}</div>
                <div>DOB: ${formatDate(patient.dateOfBirth)}</div>
                <div>Age: ${new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} years</div>
                <div>Gender: ${patient.gender}</div>
                <div>Address: ${patient.address}</div>
                <div>County: ${patient.county || 'Not specified'}</div>
                ${patient.occupation ? `<div>Occupation: ${patient.occupation}</div>` : ''}
                ${patient.bloodType ? `<div>Blood Type: ${patient.bloodType}</div>` : ''}
                ${patient.insuranceProvider ? `<div>Insurance: ${patient.insuranceProvider}</div>` : ''}
                ${patient.insuranceNumber ? `<div>Policy #: ${patient.insuranceNumber}</div>` : ''}
                ${patient.allergies ? `<div>Allergies: ${patient.allergies}</div>` : ''}
                ${patient.medicalHistory ? `<div>Medical History: ${patient.medicalHistory}</div>` : ''}
              </div>
              
              <div style="margin-bottom: 15px; font-size: 12px;">
                <div style="border-bottom: 1px dashed #333; padding-bottom: 8px; margin-bottom: 8px;">
                  <strong>SERVICE DETAILS</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                  <span>${bill.serviceDescription}</span>
                  <span>${formatCurrency(parseFloat(bill.amount || "0"))}</span>
                </div>
                ${bill.discount && parseFloat(bill.discount) > 0 ? `
                  <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span>Discount</span>
                    <span>-${formatCurrency(parseFloat(bill.discount))}</span>
                  </div>
                ` : ''}
                <div style="border-top: 1px dashed #333; padding-top: 5px; margin-top: 10px;">
                  <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 14px;">
                    <span>TOTAL AMOUNT</span>
                    <span>${formatCurrency(parseFloat(bill.totalAmount || "0"))}</span>
                  </div>
                </div>
              </div>
              
              <div style="text-align: center; font-size: 10px; margin-top: 20px; border-top: 1px dashed #333; padding-top: 10px;">
                <div style="margin-bottom: 5px;">Thank you for choosing</div>
                <div style="font-weight: bold; margin-bottom: 5px;">CHILD MENTAL HAVEN</div>
                <div style="margin-bottom: 10px;">For inquiries, please contact us</div>
                <div>*** COMPUTER GENERATED RECEIPT ***</div>
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