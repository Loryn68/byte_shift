import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Users, 
  Search, 
  Activity, 
  Heart,
  Thermometer,
  Weight,
  Ruler,
  UserCheck,
  Stethoscope,
  Save,
  AlertTriangle
} from "lucide-react";
import { formatDateTime, getTimeAgo } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Patient } from "@shared/schema";

interface VitalSigns {
  measurementDate: string;
  measurementTime: string;
  height: string;
  weight: string;
  bmi: string;
  temperature: string;
  bloodPressureSystolic: string;
  bloodPressureDiastolic: string;
  respirationRate: string;
  pulseRate: string;
  oxygenSaturation: string;
  bloodSugar: string;
  notes: string;
  clinician: string;
}

export default function OutpatientQueue() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [activeTab, setActiveTab] = useState("queue");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Vital Signs Form State
  const [vitals, setVitals] = useState<VitalSigns>({
    measurementDate: new Date().toISOString().split('T')[0],
    measurementTime: new Date().toTimeString().slice(0, 5),
    height: "",
    weight: "",
    bmi: "",
    temperature: "",
    bloodPressureSystolic: "",
    bloodPressureDiastolic: "",
    respirationRate: "",
    pulseRate: "",
    oxygenSaturation: "",
    bloodSugar: "",
    notes: "",
    clinician: "Nurse"
  });

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["/api/patients"],
  });

  const { data: billingRecords = [] } = useQuery({
    queryKey: ["/api/billing"],
  });

  const createConsultationBillMutation = useMutation({
    mutationFn: async (patientId: number) => {
      const billData = {
        patientId,
        serviceType: "Consultation",
        serviceDescription: "General medical consultation and examination",
        amount: "50.00",
        discount: "0.00",
        totalAmount: "50.00",
        paymentStatus: "pending",
        paymentMethod: "",
        insuranceClaimed: false,
        insuranceAmount: "0.00",
        notes: "Consultation fee - Required before doctor consultation"
      };
      return await apiRequest("POST", "/api/billing", billData);
    },
    onSuccess: async (response) => {
      const billing = await response.json();
      toast({
        title: "Consultation Bill Created",
        description: `Bill ${billing.billId} created. Patient can now proceed to payment.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/billing"] });
    },
  });

  const updatePaymentMutation = useMutation({
    mutationFn: async ({ billId, paymentMethod, amountPaid, transactionRef }: { 
      billId: number; 
      paymentMethod: string; 
      amountPaid?: string; 
      transactionRef?: string; 
    }) => {
      return await apiRequest("PUT", `/api/billing/${billId}`, {
        paymentStatus: "paid",
        paymentMethod,
        notes: `Payment received: Kshs.${amountPaid || "50.00"} via ${paymentMethod}${transactionRef ? ` (Ref: ${transactionRef})` : ""}`
      });
    },
    onSuccess: () => {
      toast({
        title: "Payment Recorded Successfully",
        description: "Patient can now proceed to doctor consultation.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/billing"] });
      setShowPaymentModal(false);
      setPaymentMethod("");
      setAmountPaid("");
      setTransactionRef("");
      setChangeAmount(0);
    },
  });

  const filteredPatients = patients.filter((patient: Patient) => {
    if (!searchQuery) return true;
    return (
      patient.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.patientId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getPatientStatus = (patient: Patient) => {
    const consultationBill = billingRecords.find((bill: Billing) => 
      bill.patientId === patient.id && 
      bill.serviceType === "Consultation" &&
      bill.paymentStatus === "paid"
    );

    const pendingBill = billingRecords.find((bill: Billing) => 
      bill.patientId === patient.id && 
      bill.serviceType === "Consultation" &&
      bill.paymentStatus === "pending"
    );

    if (consultationBill) return "ready-for-doctor";
    if (pendingBill) return "payment-pending";
    return "needs-billing";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ready-for-doctor":
        return <Badge className="bg-green-100 text-green-800">Ready for Doctor</Badge>;
      case "payment-pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Payment Pending</Badge>;
      case "needs-billing":
        return <Badge className="bg-red-100 text-red-800">Needs Billing</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const handleCreateBill = (patient: Patient) => {
    createConsultationBillMutation.mutate(patient.id);
  };

  const handleMarkPaid = (patient: Patient, method: string, amount?: string, transactionRef?: string) => {
    const consultationBill = billingRecords.find((bill: Billing) => 
      bill.patientId === patient.id && 
      bill.serviceType === "Consultation" && 
      bill.paymentStatus === "pending"
    );

    if (consultationBill) {
      updatePaymentMutation.mutate({ 
        billId: consultationBill.id, 
        paymentMethod: method,
        amountPaid: amount,
        transactionRef: transactionRef
      });
    } else {
      toast({
        title: "Error",
        description: "No pending consultation bill found for this patient.",
        variant: "destructive"
      });
    }
  };



  const readyForDoctorPatients = filteredPatients.filter((p: Patient) => getPatientStatus(p) === "ready-for-doctor");
  const paymentPendingPatients = filteredPatients.filter((p: Patient) => getPatientStatus(p) === "payment-pending");
  const needsBillingPatients = filteredPatients.filter((p: Patient) => getPatientStatus(p) === "needs-billing");

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Outpatient Queue</h2>
            <p className="text-gray-600">Manage patient consultation workflow and payments</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search patients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Patients</p>
              <p className="text-2xl font-bold text-gray-900">{filteredPatients.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ready for Doctor</p>
              <p className="text-2xl font-bold text-gray-900">{readyForDoctorPatients.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Payment Pending</p>
              <p className="text-2xl font-bold text-gray-900">{paymentPendingPatients.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Needs Billing</p>
              <p className="text-2xl font-bold text-gray-900">{needsBillingPatients.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Queue Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Patient Queue</h3>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Patient ID</TableHead>
              <TableHead>Registration Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Consultation Fee</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading patients...
                </TableCell>
              </TableRow>
            ) : filteredPatients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No patients in queue</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredPatients.map((patient: Patient) => {
                const status = getPatientStatus(patient);
                const consultationBill = billingRecords.find((bill: Billing) => 
                  bill.patientId === patient.id && bill.serviceType === "Consultation"
                );

                return (
                  <TableRow key={patient.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                        <p className="text-sm text-gray-500">{patient.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{patient.patientId}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{formatDateTime(patient.registrationDate)}</p>
                        <p className="text-xs text-gray-500">{getTimeAgo(patient.registrationDate)}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(status)}</TableCell>
                    <TableCell>
                      {consultationBill ? (
                        <div>
                          <p className="font-medium">{formatCurrency(Number(consultationBill.totalAmount))}</p>
                          <p className="text-xs text-gray-500">Bill: {consultationBill.billId}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400">Not billed</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {status === "needs-billing" && (
                          <Button 
                            size="sm" 
                            onClick={() => handleCreateBill(patient)}
                            disabled={createConsultationBillMutation.isPending}
                          >
                            <DollarSign className="w-4 h-4 mr-1" />
                            Create Bill
                          </Button>
                        )}
                        
                        {status === "payment-pending" && (
                          <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setSelectedPatient(patient)}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Record Payment
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg">
                              <DialogHeader>
                                <DialogTitle>Record Payment - {selectedPatient?.firstName} {selectedPatient?.lastName}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="text-center bg-blue-50 p-4 rounded-lg">
                                  <p className="text-lg font-semibold text-blue-600">
                                    Consultation Fee: Kshs.50.00
                                  </p>
                                </div>
                                
                                {!paymentMethod ? (
                                  <div className="grid grid-cols-1 gap-3">
                                    <Button 
                                      className="w-full bg-green-600 hover:bg-green-700 h-12 text-white" 
                                      onClick={() => setPaymentMethod("cash")}
                                    >
                                      <DollarSign className="h-5 w-5 mr-2" />
                                      Cash Payment
                                    </Button>
                                    <Button 
                                      className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-white" 
                                      onClick={() => setPaymentMethod("card")}
                                    >
                                      <CheckCircle className="h-5 w-5 mr-2" />
                                      Card Payment
                                    </Button>
                                    <Button 
                                      className="w-full bg-purple-600 hover:bg-purple-700 h-12 text-white" 
                                      onClick={() => setPaymentMethod("mobile")}
                                    >
                                      <UserCheck className="h-5 w-5 mr-2" />
                                      Mobile Payment (M-Pesa)
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                      <h3 className="font-semibold capitalize">{paymentMethod} Payment</h3>
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => {
                                          setPaymentMethod("");
                                          setAmountPaid("");
                                          setTransactionRef("");
                                          setChangeAmount(0);
                                        }}
                                      >
                                        Change Method
                                      </Button>
                                    </div>
                                    
                                    {paymentMethod === "cash" && (
                                      <div className="space-y-3">
                                        <div>
                                          <label className="text-sm font-medium">Amount Received (Kshs.)</label>
                                          <Input
                                            type="number"
                                            placeholder="Enter amount received"
                                            value={amountPaid}
                                            onChange={(e) => {
                                              const paid = parseFloat(e.target.value) || 0;
                                              setAmountPaid(e.target.value);
                                              setChangeAmount(paid - 50);
                                            }}
                                            className="mt-1"
                                          />
                                        </div>
                                        {amountPaid && (
                                          <div className="bg-yellow-50 p-3 rounded-lg border">
                                            <div className="flex justify-between text-sm">
                                              <span>Bill Amount:</span>
                                              <span>Kshs.50.00</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                              <span>Amount Paid:</span>
                                              <span>Kshs.{amountPaid}</span>
                                            </div>
                                            <hr className="my-2" />
                                            <div className="flex justify-between font-semibold">
                                              <span>Change:</span>
                                              <span className={changeAmount < 0 ? "text-red-600" : "text-green-600"}>
                                                Kshs.{changeAmount.toFixed(2)}
                                              </span>
                                            </div>
                                            {changeAmount < 0 && (
                                              <p className="text-red-600 text-xs mt-1 font-medium">
                                                ⚠️ Insufficient payment. Balance: Kshs.{Math.abs(changeAmount).toFixed(2)}
                                              </p>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                    
                                    {(paymentMethod === "mobile" || paymentMethod === "card") && (
                                      <div className="space-y-3">
                                        <div>
                                          <label className="text-sm font-medium">Amount Paid (Kshs.)</label>
                                          <Input
                                            type="number"
                                            placeholder="Enter exact amount: 50.00"
                                            value={amountPaid}
                                            onChange={(e) => setAmountPaid(e.target.value)}
                                            className="mt-1"
                                          />
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium">
                                            {paymentMethod === "mobile" ? "M-Pesa Transaction Code" : "Card Transaction Reference"}
                                          </label>
                                          <Input
                                            placeholder={paymentMethod === "mobile" ? "e.g. QA12B3CD45" : "e.g. AUTH123456"}
                                            value={transactionRef}
                                            onChange={(e) => setTransactionRef(e.target.value)}
                                            className="mt-1"
                                            required
                                          />
                                        </div>
                                        {amountPaid && parseFloat(amountPaid) !== 50 && (
                                          <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                                            <p className="text-red-600 text-sm font-medium">
                                              ⚠️ Amount must be exactly Kshs.50.00 for consultation fee
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                    
                                    <div className="flex space-x-2 pt-4">
                                      <Button 
                                        onClick={() => {
                                          setShowPaymentModal(false);
                                          setPaymentMethod("");
                                          setAmountPaid("");
                                          setTransactionRef("");
                                          setChangeAmount(0);
                                        }}
                                        variant="outline" 
                                        className="flex-1"
                                      >
                                        Cancel
                                      </Button>
                                      <Button 
                                        onClick={() => {
                                          if (paymentMethod === "cash" && changeAmount >= 0) {
                                            handleMarkPaid(selectedPatient!, paymentMethod, amountPaid, transactionRef);
                                          } else if ((paymentMethod === "mobile" || paymentMethod === "card") && 
                                                   parseFloat(amountPaid) === 50 && transactionRef) {
                                            handleMarkPaid(selectedPatient!, paymentMethod, amountPaid, transactionRef);
                                          }
                                        }}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                        disabled={
                                          !amountPaid || 
                                          (paymentMethod === "cash" && changeAmount < 0) ||
                                          ((paymentMethod === "mobile" || paymentMethod === "card") && 
                                           (!transactionRef || parseFloat(amountPaid) !== 50))
                                        }
                                      >
                                        Complete Payment
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                        
                        {status === "ready-for-doctor" && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <Stethoscope className="w-4 h-4 mr-1" />
                            Send to Doctor
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}