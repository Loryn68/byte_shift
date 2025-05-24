import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Clock, 
  DollarSign, 
  CheckCircle,
  AlertCircle,
  UserCheck,
  Stethoscope
} from "lucide-react";
import { formatCurrency, formatDateTime, getTimeAgo } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Patient, Billing } from "@shared/schema";

export default function OutpatientQueue() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
    mutationFn: async ({ billId, paymentMethod }: { billId: number; paymentMethod: string }) => {
      return await apiRequest("PUT", `/api/billing/${billId}`, {
        paymentStatus: "paid",
        paymentMethod,
        paymentDate: new Date()
      });
    },
    onSuccess: () => {
      toast({
        title: "Payment Recorded",
        description: "Patient can now proceed to doctor consultation.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/billing"] });
      setShowPaymentModal(false);
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

  const handleMarkPaid = (patient: Patient, paymentMethod: string) => {
    const bill = billingRecords.find((bill: Billing) => 
      bill.patientId === patient.id && 
      bill.serviceType === "Consultation" &&
      bill.paymentStatus === "pending"
    );
    
    if (bill) {
      updatePaymentMutation.mutate({ billId: bill.id, paymentMethod });
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
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Record Payment - {selectedPatient?.firstName} {selectedPatient?.lastName}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <p>Consultation Fee: {formatCurrency(50)}</p>
                                <div className="flex space-x-2">
                                  <Button onClick={() => handleMarkPaid(selectedPatient!, "cash")}>
                                    Cash Payment
                                  </Button>
                                  <Button onClick={() => handleMarkPaid(selectedPatient!, "card")}>
                                    Card Payment
                                  </Button>
                                  <Button onClick={() => handleMarkPaid(selectedPatient!, "mobile")}>
                                    Mobile Payment
                                  </Button>
                                </div>
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