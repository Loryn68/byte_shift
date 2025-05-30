import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  User, 
  Calendar, 
  Pill,
  DollarSign,
  AlertTriangle,
  Eye,
  Send
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Mock prescription data - in real app this would come from API
const mockPrescriptions = [
  {
    id: "RX001",
    patientId: "CMH-202501JDM001",
    patientName: "John Doe Mwangi",
    doctorName: "Dr. Sarah Johnson",
    prescriptionType: "doctor",
    diagnosis: "Anxiety disorder with mild depression",
    dateIssued: "2025-05-30",
    timeIssued: "14:30",
    status: "pending",
    medications: [
      {
        medicationId: 6,
        medicationName: "Sertraline 50mg",
        quantity: 30,
        instructions: "Take 1 tablet once daily in the morning",
        unitPrice: 75,
        total: 2250
      },
      {
        medicationId: 11,
        medicationName: "Diazepam 5mg",
        quantity: 20,
        instructions: "Take 1 tablet as needed for anxiety (max 2 per day)",
        unitPrice: 10,
        total: 200
      }
    ],
    totalAmount: 2450,
    prescriptionNotes: "Start with half dose for first week, then increase to full dose",
    followUpInstructions: "Review in 2 weeks"
  },
  {
    id: "RX002",
    patientId: "EXT-1748619001",
    patientName: "Mary Wanjiku",
    doctorName: "Dr. Peter Kamau",
    prescriptionType: "registry",
    clinicName: "Nairobi Medical Center",
    prescriptionDate: "2025-05-29",
    dateIssued: "2025-05-30",
    timeIssued: "15:45",
    status: "pending",
    medications: [
      {
        medicationId: 3,
        medicationName: "Risperidone 2mg",
        quantity: 60,
        instructions: "Take 1 tablet twice daily with meals",
        unitPrice: 80,
        total: 4800
      },
      {
        medicationId: 12,
        medicationName: "Omeprazole 20mg",
        quantity: 30,
        instructions: "Take 1 tablet before breakfast",
        unitPrice: 15,
        total: 450
      }
    ],
    totalAmount: 5250,
    prescriptionNotes: "External prescription from psychiatric consultation",
    registryNotes: "Patient has been on this medication for 3 months"
  }
];

export default function PharmacyApproval() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalAction, setApprovalAction] = useState<"approve" | "reject" | "">("");
  const [pharmacistNotes, setPharmacistNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  // Mock data - in real app this would be from API
  const { data: prescriptions = mockPrescriptions } = useQuery({
    queryKey: ["/api/prescriptions"],
    queryFn: () => mockPrescriptions
  });

  // Filter prescriptions by status
  const pendingPrescriptions = prescriptions.filter((p: any) => p.status === "pending");
  const approvedPrescriptions = prescriptions.filter((p: any) => p.status === "approved");
  const rejectedPrescriptions = prescriptions.filter((p: any) => p.status === "rejected");

  // Approve/Reject prescription mutation
  const updatePrescriptionMutation = useMutation({
    mutationFn: async ({ prescriptionId, action, notes, reason }: any) => {
      return await apiRequest("PATCH", `/api/prescriptions/${prescriptionId}`, {
        status: action,
        pharmacistNotes: notes,
        rejectionReason: reason,
        pharmacistName: "Dr. Alice Pharmacist", // This would come from auth
        approvalDate: new Date().toISOString().split('T')[0],
        approvalTime: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
      });
    },
    onSuccess: (data, variables) => {
      toast({
        title: variables.action === "approve" ? "Prescription Approved" : "Prescription Rejected",
        description: variables.action === "approve" 
          ? "Prescription has been approved and sent to cashier for billing."
          : "Prescription has been rejected and returned to doctor.",
      });
      setShowApprovalDialog(false);
      setSelectedPrescription(null);
      setPharmacistNotes("");
      setRejectionReason("");
      queryClient.invalidateQueries({ queryKey: ["/api/prescriptions"] });
    },
  });

  const openApprovalDialog = (prescription: any, action: "approve" | "reject") => {
    setSelectedPrescription(prescription);
    setApprovalAction(action);
    setShowApprovalDialog(true);
  };

  const handleApproval = () => {
    if (approvalAction === "reject" && !rejectionReason.trim()) {
      toast({
        title: "Rejection Reason Required",
        description: "Please provide a reason for rejecting this prescription.",
        variant: "destructive"
      });
      return;
    }

    updatePrescriptionMutation.mutate({
      prescriptionId: selectedPrescription.id,
      action: approvalAction,
      notes: pharmacistNotes,
      reason: rejectionReason
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "approved":
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const renderPrescriptionTable = (prescriptionsData: any[], showActions = false) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Prescription ID</TableHead>
          <TableHead>Patient</TableHead>
          <TableHead>Doctor/Source</TableHead>
          <TableHead>Medications</TableHead>
          <TableHead>Total Amount</TableHead>
          <TableHead>Date/Time</TableHead>
          <TableHead>Status</TableHead>
          {showActions && <TableHead>Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {prescriptionsData.map((prescription) => (
          <TableRow key={prescription.id}>
            <TableCell>
              <div className="font-medium">{prescription.id}</div>
              <div className="text-sm text-gray-500">
                {prescription.prescriptionType === "doctor" ? "Internal" : "External"}
              </div>
            </TableCell>
            <TableCell>
              <div>
                <div className="font-medium">{prescription.patientName}</div>
                <div className="text-sm text-gray-500">{prescription.patientId}</div>
              </div>
            </TableCell>
            <TableCell>
              <div>
                <div className="font-medium">{prescription.doctorName}</div>
                {prescription.clinicName && (
                  <div className="text-sm text-gray-500">{prescription.clinicName}</div>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div className="space-y-1">
                {prescription.medications.slice(0, 2).map((med: any, index: number) => (
                  <div key={index} className="text-sm">
                    <div className="font-medium">{med.medicationName}</div>
                    <div className="text-gray-500">Qty: {med.quantity}</div>
                  </div>
                ))}
                {prescription.medications.length > 2 && (
                  <div className="text-sm text-gray-500">
                    +{prescription.medications.length - 2} more
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div className="font-medium">KShs {prescription.totalAmount.toLocaleString()}</div>
            </TableCell>
            <TableCell>
              <div>
                <div className="text-sm">{prescription.dateIssued}</div>
                <div className="text-sm text-gray-500">{prescription.timeIssued}</div>
              </div>
            </TableCell>
            <TableCell>{getStatusBadge(prescription.status)}</TableCell>
            {showActions && (
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
                    onClick={() => openApprovalDialog(prescription, "approve")}
                  >
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => openApprovalDialog(prescription, "reject")}
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Pill className="h-8 w-8 text-blue-600" />
            Pharmacy Approval System
          </h1>
          <p className="text-gray-600">Review and approve prescriptions before billing</p>
        </div>
        <div className="flex gap-4">
          <Card className="px-4 py-2">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{pendingPrescriptions.length}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </Card>
          <Card className="px-4 py-2">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{approvedPrescriptions.length}</div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Pending Review ({pendingPrescriptions.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Approved ({approvedPrescriptions.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Rejected ({rejectedPrescriptions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Prescriptions Awaiting Approval
              </CardTitle>
              <CardDescription>
                Review prescriptions and approve for billing or reject with reason
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingPrescriptions.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No prescriptions pending approval</p>
                </div>
              ) : (
                renderPrescriptionTable(pendingPrescriptions, true)
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Approved Prescriptions
              </CardTitle>
              <CardDescription>
                Prescriptions approved and sent to cashier for billing
              </CardDescription>
            </CardHeader>
            <CardContent>
              {approvedPrescriptions.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No approved prescriptions yet</p>
                </div>
              ) : (
                renderPrescriptionTable(approvedPrescriptions)
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                Rejected Prescriptions
              </CardTitle>
              <CardDescription>
                Prescriptions rejected and returned to prescribing doctor
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rejectedPrescriptions.length === 0 ? (
                <div className="text-center py-8">
                  <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No rejected prescriptions</p>
                </div>
              ) : (
                renderPrescriptionTable(rejectedPrescriptions)
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Approval/Rejection Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {approvalAction === "approve" ? "Approve" : "Reject"} Prescription
            </DialogTitle>
            <DialogDescription>
              {approvalAction === "approve" 
                ? "Approve this prescription and send to cashier for billing"
                : "Reject this prescription and return to doctor with reason"
              }
            </DialogDescription>
          </DialogHeader>
          
          {selectedPrescription && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Patient</Label>
                  <p className="font-medium">{selectedPrescription.patientName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Doctor</Label>
                  <p className="font-medium">{selectedPrescription.doctorName}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">Medications</Label>
                <div className="space-y-2 mt-1">
                  {selectedPrescription.medications.map((med: any, index: number) => (
                    <div key={index} className="border rounded p-3">
                      <div className="font-medium">{med.medicationName}</div>
                      <div className="text-sm text-gray-600">
                        Quantity: {med.quantity} | Instructions: {med.instructions}
                      </div>
                      <div className="text-sm font-medium">KShs {med.total.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-right">
                  <div className="text-lg font-bold">
                    Total: KShs {selectedPrescription.totalAmount.toLocaleString()}
                  </div>
                </div>
              </div>

              {approvalAction === "reject" && (
                <div>
                  <Label>Rejection Reason *</Label>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Explain why this prescription is being rejected..."
                    rows={3}
                  />
                </div>
              )}

              <div>
                <Label>Pharmacist Notes</Label>
                <Textarea
                  value={pharmacistNotes}
                  onChange={(e) => setPharmacistNotes(e.target.value)}
                  placeholder="Additional notes from pharmacist..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleApproval} 
                  disabled={updatePrescriptionMutation.isPending}
                  className={approvalAction === "approve" ? "bg-green-600 hover:bg-green-700" : ""}
                  variant={approvalAction === "reject" ? "destructive" : "default"}
                >
                  {updatePrescriptionMutation.isPending ? (
                    "Processing..."
                  ) : (
                    <>
                      {approvalAction === "approve" ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve & Send to Cashier
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject Prescription
                        </>
                      )}
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