import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  Receipt, 
  CheckCircle, 
  User, 
  Calendar, 
  Pill,
  CreditCard,
  Banknote,
  Smartphone,
  Building2,
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Cleared approved prescriptions for fresh demo
const mockApprovedPrescriptions = [];

export default function CashierPrescriptionBilling() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);
  const [showBillingDialog, setShowBillingDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [amountReceived, setAmountReceived] = useState("");
  const [mpesaCode, setMpesaCode] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data - in real app this would be from API
  const { data: approvedPrescriptions = mockApprovedPrescriptions } = useQuery({
    queryKey: ["/api/prescriptions/approved"],
    queryFn: () => mockApprovedPrescriptions
  });

  // Filter prescriptions
  const filteredPrescriptions = approvedPrescriptions.filter((prescription: any) =>
    prescription.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prescription.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prescription.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Process payment mutation
  const processPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      return await apiRequest("POST", "/api/prescription-payments", paymentData);
    },
    onSuccess: () => {
      toast({
        title: "Payment Processed",
        description: "Payment has been recorded and prescription can be dispensed.",
      });
      setShowBillingDialog(false);
      setSelectedPrescription(null);
      setPaymentMethod("");
      setAmountReceived("");
      setMpesaCode("");
      queryClient.invalidateQueries({ queryKey: ["/api/prescriptions/approved"] });
      queryClient.invalidateQueries({ queryKey: ["/api/prescription-payments"] });
    },
  });

  const openBillingDialog = (prescription: any) => {
    setSelectedPrescription(prescription);
    setAmountReceived(prescription.totalAmount.toString());
    setShowBillingDialog(true);
  };

  const processPayment = () => {
    if (!paymentMethod) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method.",
        variant: "destructive"
      });
      return;
    }

    if (!amountReceived || parseFloat(amountReceived) < selectedPrescription.totalAmount) {
      toast({
        title: "Insufficient Payment",
        description: "Payment amount must be at least the total amount due.",
        variant: "destructive"
      });
      return;
    }

    if (paymentMethod === "M-Pesa" && !mpesaCode.trim()) {
      toast({
        title: "M-Pesa Code Required",
        description: "Please enter the M-Pesa transaction code.",
        variant: "destructive"
      });
      return;
    }

    const change = parseFloat(amountReceived) - selectedPrescription.totalAmount;

    const paymentData = {
      prescriptionId: selectedPrescription.id,
      patientId: selectedPrescription.patientId,
      patientName: selectedPrescription.patientName,
      totalAmount: selectedPrescription.totalAmount,
      amountReceived: parseFloat(amountReceived),
      change: change,
      paymentMethod,
      mpesaCode: paymentMethod === "M-Pesa" ? mpesaCode : null,
      cashierName: "Jane Cashier", // This would come from auth
      paymentDate: new Date().toISOString().split('T')[0],
      paymentTime: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      medications: selectedPrescription.medications,
      receiptNumber: `RCP-${Date.now()}`
    };

    processPaymentMutation.mutate(paymentData);
  };

  const printReceipt = (prescription: any) => {
    // This would generate and print a receipt
    toast({
      title: "Receipt Printed",
      description: "Receipt has been sent to printer.",
    });
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "Cash":
        return <Banknote className="w-4 h-4" />;
      case "M-Pesa":
        return <Smartphone className="w-4 h-4" />;
      case "Card":
        return <CreditCard className="w-4 h-4" />;
      case "Bank":
        return <Building2 className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-green-600" />
            Prescription Billing
          </h1>
          <p className="text-gray-600">Process payments for approved prescriptions</p>
        </div>
        <div className="flex gap-4">
          <Card className="px-4 py-2">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{approvedPrescriptions.length}</div>
              <div className="text-sm text-gray-600">Ready for Payment</div>
            </div>
          </Card>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label>Search Prescriptions</Label>
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by patient name, ID, or prescription number..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Approved Prescriptions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Approved Prescriptions Ready for Payment
          </CardTitle>
          <CardDescription>
            Prescriptions approved by pharmacist and ready for billing
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPrescriptions.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchQuery ? "No prescriptions match your search" : "No approved prescriptions ready for payment"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Prescription Details</TableHead>
                  <TableHead>Patient Information</TableHead>
                  <TableHead>Medications</TableHead>
                  <TableHead>Pharmacist Approval</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrescriptions.map((prescription) => (
                  <TableRow key={prescription.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{prescription.id}</div>
                        <div className="text-sm text-gray-500">
                          {prescription.prescriptionType === "doctor" ? "Internal" : "External"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {prescription.dateIssued} at {prescription.timeIssued}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{prescription.patientName}</div>
                        <div className="text-sm text-gray-500">{prescription.patientId}</div>
                        {prescription.patientPhone && (
                          <div className="text-sm text-gray-500">{prescription.patientPhone}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {prescription.medications.slice(0, 2).map((med: any, index: number) => (
                          <div key={index} className="text-sm">
                            <div className="font-medium">{med.medicationName}</div>
                            <div className="text-gray-500">Qty: {med.quantity} - KShs {med.total.toLocaleString()}</div>
                          </div>
                        ))}
                        {prescription.medications.length > 2 && (
                          <div className="text-sm text-gray-500">
                            +{prescription.medications.length - 2} more medications
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <Badge variant="default" className="bg-green-100 text-green-800 mb-1">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Approved
                        </Badge>
                        <div className="text-sm text-gray-600">{prescription.pharmacistName}</div>
                        <div className="text-sm text-gray-500">
                          {prescription.approvalDate} at {prescription.approvalTime}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-lg">KShs {prescription.totalAmount.toLocaleString()}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedPrescription(prescription)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => openBillingDialog(prescription)}
                        >
                          <Receipt className="w-4 h-4 mr-1" />
                          Process Payment
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Payment Processing Dialog */}
      <Dialog open={showBillingDialog} onOpenChange={setShowBillingDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
            <DialogDescription>
              Process payment for prescription {selectedPrescription?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPrescription && (
            <div className="space-y-4">
              {/* Patient and Prescription Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Patient</Label>
                  <p className="font-medium">{selectedPrescription.patientName}</p>
                  <p className="text-sm text-gray-500">{selectedPrescription.patientId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Prescription</Label>
                  <p className="font-medium">{selectedPrescription.id}</p>
                  <p className="text-sm text-gray-500">Approved by {selectedPrescription.pharmacistName}</p>
                </div>
              </div>

              {/* Medication Summary */}
              <div>
                <Label className="text-sm font-medium text-gray-500">Medications</Label>
                <div className="space-y-2 mt-1 max-h-32 overflow-y-auto">
                  {selectedPrescription.medications.map((med: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <div className="font-medium">{med.medicationName}</div>
                        <div className="text-sm text-gray-600">Quantity: {med.quantity}</div>
                      </div>
                      <div className="font-medium">KShs {med.total.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Amount Due:</span>
                    <span className="text-xl font-bold text-blue-600">
                      KShs {selectedPrescription.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-4">
                <div>
                  <Label>Payment Method *</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">
                        <div className="flex items-center gap-2">
                          <Banknote className="w-4 h-4" />
                          Cash
                        </div>
                      </SelectItem>
                      <SelectItem value="M-Pesa">
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4" />
                          M-Pesa
                        </div>
                      </SelectItem>
                      <SelectItem value="Card">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          Credit/Debit Card
                        </div>
                      </SelectItem>
                      <SelectItem value="Bank">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          Bank Transfer
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Amount Received *</Label>
                  <Input
                    type="number"
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value)}
                    placeholder="Enter amount received"
                    min={selectedPrescription.totalAmount}
                  />
                  {amountReceived && parseFloat(amountReceived) > selectedPrescription.totalAmount && (
                    <div className="mt-1 text-sm text-green-600">
                      Change: KShs {(parseFloat(amountReceived) - selectedPrescription.totalAmount).toLocaleString()}
                    </div>
                  )}
                </div>

                {paymentMethod === "M-Pesa" && (
                  <div>
                    <Label>M-Pesa Transaction Code *</Label>
                    <Input
                      value={mpesaCode}
                      onChange={(e) => setMpesaCode(e.target.value)}
                      placeholder="Enter M-Pesa transaction code"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => setShowBillingDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={processPayment} 
                  disabled={processPaymentMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {processPaymentMutation.isPending ? (
                    "Processing..."
                  ) : (
                    <>
                      <Receipt className="h-4 w-4 mr-2" />
                      Process Payment
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}