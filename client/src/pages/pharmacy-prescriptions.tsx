import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Search, Pill, FileText, Clock, CheckCircle, XCircle, AlertCircle, Eye, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Mock prescription data - this would come from your backend
const prescriptionData = [
  {
    id: 1,
    patientId: "CMH-202501LKM001",
    patientName: "John Doe",
    prescriptionType: "doctor", // doctor or registry
    doctorName: "Dr. Sarah Johnson",
    dateIssued: "2025-01-30",
    timeIssued: "14:30",
    status: "pending", // pending, approved, dispensed, rejected
    medications: [
      { name: "Risperidone 2mg", quantity: 30, instructions: "Take 1 tablet twice daily", available: true, unitPrice: 80 },
      { name: "Sertraline 50mg", quantity: 28, instructions: "Take 1 tablet once daily in morning", available: true, unitPrice: 75 }
    ],
    totalAmount: 4500,
    notes: "Patient showing improvement with current medication regimen",
    approvalNotes: ""
  },
  {
    id: 2,
    patientId: "CMH-202501ABC002",
    patientName: "Mary Smith",
    prescriptionType: "registry",
    doctorName: "Dr. External Clinic",
    dateIssued: "2025-01-30",
    timeIssued: "15:45",
    status: "pending",
    medications: [
      { name: "Olanzapine 10mg", quantity: 30, instructions: "Take 1 tablet at bedtime", available: true, unitPrice: 50 },
      { name: "Lamotrigine 100mg", quantity: 60, instructions: "Take 1 tablet twice daily", available: true, unitPrice: 80 }
    ],
    totalAmount: 6300,
    notes: "External prescription from psychiatrist",
    approvalNotes: ""
  },
  {
    id: 3,
    patientId: "CMH-202501XYZ003",
    patientName: "James Wilson",
    prescriptionType: "doctor",
    doctorName: "Dr. Michael Brown",
    dateIssued: "2025-01-30",
    timeIssued: "16:20",
    status: "approved",
    medications: [
      { name: "Quetiapine 100mg", quantity: 30, instructions: "Take 1 tablet at bedtime", available: true, unitPrice: 70 },
      { name: "Escitalopram 10mg", quantity: 28, instructions: "Take 1 tablet once daily", available: true, unitPrice: 115 }
    ],
    totalAmount: 5320,
    notes: "Patient requires mood stabilization",
    approvalNotes: "Approved by Head Pharmacist"
  }
];

export default function PharmacyPrescriptions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalData, setApprovalData] = useState({ action: "", notes: "" });

  // Filter prescriptions
  const filteredPrescriptions = useMemo(() => {
    return prescriptionData.filter(prescription => {
      const matchesSearch = 
        prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || prescription.status === statusFilter;
      const matchesType = typeFilter === "all" || prescription.prescriptionType === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [searchTerm, statusFilter, typeFilter]);

  // Get statistics
  const stats = useMemo(() => {
    return {
      total: prescriptionData.length,
      pending: prescriptionData.filter(p => p.status === "pending").length,
      approved: prescriptionData.filter(p => p.status === "approved").length,
      dispensed: prescriptionData.filter(p => p.status === "dispensed").length,
      rejected: prescriptionData.filter(p => p.status === "rejected").length
    };
  }, []);

  // Prescription approval mutation
  const approvePrescriptionMutation = useMutation({
    mutationFn: async (approvalData: any) => {
      return await apiRequest("PUT", `/api/prescriptions/${approvalData.prescriptionId}/status`, approvalData);
    },
    onSuccess: () => {
      toast({
        title: "Prescription Updated",
        description: "Prescription status has been updated successfully.",
      });
      setShowApprovalModal(false);
      queryClient.invalidateQueries({ queryKey: ["/api/prescriptions"] });
    },
  });

  const handleViewDetails = (prescription: any) => {
    setSelectedPrescription(prescription);
    setShowDetailModal(true);
  };

  const handleApprovalAction = (prescription: any, action: string) => {
    setSelectedPrescription(prescription);
    setApprovalData({ action, notes: "" });
    setShowApprovalModal(true);
  };

  const submitApproval = () => {
    if (!selectedPrescription) return;
    approvePrescriptionMutation.mutate({
      prescriptionId: selectedPrescription.id,
      ...approvalData
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "approved":
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Approved</Badge>;
      case "dispensed":
        return <Badge variant="default" className="bg-green-100 text-green-800">Dispensed</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    return type === "doctor" ? 
      <Badge variant="outline" className="bg-purple-100 text-purple-800">Doctor Prescription</Badge> :
      <Badge variant="outline" className="bg-orange-100 text-orange-800">Registry Prescription</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="h-8 w-8 text-blue-600" />
            Pharmacy Prescriptions
          </h1>
          <p className="text-gray-600">Manage prescriptions from doctors and registry</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Total Prescriptions</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats.approved}</div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Dispensed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{stats.dispensed}</div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by patient name, ID, or doctor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="dispensed">Dispensed</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="doctor">Doctor Prescriptions</SelectItem>
            <SelectItem value="registry">Registry Prescriptions</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Prescriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Prescription Queue</CardTitle>
          <CardDescription>
            Review and manage prescriptions from doctors and external sources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Doctor/Source</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Medications</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPrescriptions.map((prescription) => (
                <TableRow key={prescription.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{prescription.patientName}</div>
                      <div className="text-sm text-gray-500">{prescription.patientId}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getTypeBadge(prescription.prescriptionType)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{prescription.doctorName}</div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm">{prescription.dateIssued}</div>
                      <div className="text-xs text-gray-500">{prescription.timeIssued}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {prescription.medications.length} medication(s)
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">KShs {prescription.totalAmount.toLocaleString()}</div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(prescription.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetails(prescription)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      {prescription.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleApprovalAction(prescription, "approve")}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleApprovalAction(prescription, "reject")}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Prescription Details Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Prescription Details</DialogTitle>
          </DialogHeader>
          {selectedPrescription && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Patient</Label>
                  <div className="font-medium">{selectedPrescription.patientName}</div>
                  <div className="text-sm text-gray-500">{selectedPrescription.patientId}</div>
                </div>
                <div>
                  <Label>Doctor/Source</Label>
                  <div className="font-medium">{selectedPrescription.doctorName}</div>
                </div>
                <div>
                  <Label>Date & Time</Label>
                  <div>{selectedPrescription.dateIssued} at {selectedPrescription.timeIssued}</div>
                </div>
                <div>
                  <Label>Status</Label>
                  <div>{getStatusBadge(selectedPrescription.status)}</div>
                </div>
              </div>

              <div>
                <Label>Prescribed Medications</Label>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medication</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Instructions</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedPrescription.medications.map((med: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{med.name}</TableCell>
                        <TableCell>{med.quantity}</TableCell>
                        <TableCell className="text-sm">{med.instructions}</TableCell>
                        <TableCell>KShs {med.unitPrice}</TableCell>
                        <TableCell>KShs {(med.quantity * med.unitPrice).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div>
                <Label>Notes</Label>
                <div className="text-sm bg-gray-50 p-3 rounded">{selectedPrescription.notes}</div>
              </div>

              {selectedPrescription.approvalNotes && (
                <div>
                  <Label>Approval Notes</Label>
                  <div className="text-sm bg-blue-50 p-3 rounded">{selectedPrescription.approvalNotes}</div>
                </div>
              )}

              <div className="text-right">
                <div className="text-lg font-bold">Total: KShs {selectedPrescription.totalAmount.toLocaleString()}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approval/Rejection Modal */}
      <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {approvalData.action === "approve" ? "Approve" : "Reject"} Prescription
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Patient: {selectedPrescription?.patientName}</Label>
              <div className="text-sm text-gray-500">{selectedPrescription?.patientId}</div>
            </div>
            <div>
              <Label>Action</Label>
              <div className="font-medium text-lg">
                {approvalData.action === "approve" ? "✓ Approve Prescription" : "✗ Reject Prescription"}
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={approvalData.notes}
                onChange={(e) => setApprovalData({...approvalData, notes: e.target.value})}
                placeholder={`Enter reason for ${approvalData.action}...`}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowApprovalModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={submitApproval} 
                disabled={approvePrescriptionMutation.isPending}
                variant={approvalData.action === "approve" ? "default" : "destructive"}
              >
                {approvePrescriptionMutation.isPending ? "Processing..." : 
                 approvalData.action === "approve" ? "Approve" : "Reject"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}