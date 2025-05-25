import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Stethoscope, 
  FileText, 
  Plus, 
  Printer,
  Pill,
  FlaskConical,
  Search,
  ClipboardList
} from "lucide-react";
import { formatDateTime, calculateAge } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Patient, Billing, Prescription, LabTest, Medication } from "@shared/schema";
import ClinicalSummary from "@/components/forms/clinical-summary";
import MedicalReport from "@/components/forms/medical-report";
import LabRequest from "@/components/forms/lab-request";
import DischargeSummary from "@/components/forms/discharge-summary";
import PrescriptionForm from "@/components/forms/prescription-form";

const medicalReportSchema = z.object({
  patientId: z.number(),
  diagnosis: z.string().min(1, "Diagnosis is required"),
  symptoms: z.string().min(1, "Symptoms are required"),
  treatment: z.string().min(1, "Treatment plan is required"),
  medications: z.string().optional(),
  labTests: z.string().optional(),
  followUpDate: z.string().optional(),
  notes: z.string().optional(),
});

type MedicalReportData = z.infer<typeof medicalReportSchema>;

export default function DoctorPortal() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showLabTestModal, setShowLabTestModal] = useState(false);
  const [showClinicalSummary, setShowClinicalSummary] = useState(false);
  const [showMedicalReport, setShowMedicalReport] = useState(false);
  const [showLabRequest, setShowLabRequest] = useState(false);
  const [showDischargeSummary, setShowDischargeSummary] = useState(false);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [medicalReport, setMedicalReport] = useState<MedicalReportData | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: patients = [] } = useQuery({
    queryKey: ["/api/patients"],
  });

  const { data: billingRecords = [] } = useQuery({
    queryKey: ["/api/billing"],
  });

  const { data: medications = [] } = useQuery({
    queryKey: ["/api/medications"],
  });

  const form = useForm<MedicalReportData>({
    resolver: zodResolver(medicalReportSchema),
    defaultValues: {
      patientId: 0,
      diagnosis: "",
      symptoms: "",
      treatment: "",
      medications: "",
      labTests: "",
      followUpDate: "",
      notes: "",
    },
  });

  const createPrescriptionMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/prescriptions", data);
    },
    onSuccess: () => {
      toast({
        title: "Prescription Created",
        description: "Prescription has been added to patient's record and billing.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/prescriptions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/billing"] });
    },
  });

  const createLabTestMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/lab-tests", data);
    },
    onSuccess: () => {
      toast({
        title: "Lab Test Ordered",
        description: "Lab test has been ordered and added to patient's billing.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/lab-tests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/billing"] });
    },
  });

  // Get patients who have paid consultation fees
  const readyPatients = patients.filter((patient: Patient) => {
    return billingRecords.some((bill: Billing) =>
      bill.patientId === patient.id &&
      bill.serviceType === "Consultation" &&
      bill.paymentStatus === "paid"
    );
  });

  const filteredPatients = readyPatients.filter((patient: Patient) => {
    if (!searchQuery) return true;
    return (
      patient.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.patientId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleStartConsultation = (patient: Patient) => {
    setSelectedPatient(patient);
    form.setValue("patientId", patient.id);
    setShowConsultationModal(true);
  };

  const handlePrescribeMedication = (medicationId: number, dosage: string, frequency: string, duration: string) => {
    if (!selectedPatient) return;

    const medication = medications.find((med: Medication) => med.id === medicationId);
    if (!medication) return;

    // Create prescription
    const prescriptionData = {
      patientId: selectedPatient.id,
      medicationId,
      prescribedBy: 1, // Current doctor ID
      dosage,
      frequency,
      duration,
      quantity: 30, // Default quantity
      instructions: `Take ${dosage} ${frequency} for ${duration}`,
      status: "active"
    };

    createPrescriptionMutation.mutate(prescriptionData);

    // Add medication cost to billing
    const medicationBill = {
      patientId: selectedPatient.id,
      serviceType: "Pharmacy",
      serviceDescription: `${medication.name} - ${dosage}`,
      amount: medication.unitPrice,
      discount: "0.00",
      totalAmount: medication.unitPrice,
      paymentStatus: "pending",
      paymentMethod: "",
      insuranceClaimed: false,
      insuranceAmount: "0.00",
      notes: `Prescribed by doctor - ${medication.name}`
    };

    apiRequest("POST", "/api/billing", medicationBill);
  };

  const handleOrderLabTest = (testName: string, testType: string, urgency: string) => {
    if (!selectedPatient) return;

    const labTestData = {
      patientId: selectedPatient.id,
      testName,
      testType,
      orderedBy: 1, // Current doctor ID
      orderDate: new Date(),
      urgency,
      status: "ordered",
      results: null,
      notes: `Ordered by doctor during consultation`
    };

    createLabTestMutation.mutate(labTestData);

    // Add lab test cost to billing
    const testCosts = {
      "Blood Test": "25.00",
      "Urine Test": "15.00",
      "X-Ray": "50.00",
      "CT Scan": "200.00",
      "MRI": "500.00"
    };

    const labTestBill = {
      patientId: selectedPatient.id,
      serviceType: "Laboratory",
      serviceDescription: `${testName} (${testType})`,
      amount: testCosts[testType as keyof typeof testCosts] || "30.00",
      discount: "0.00",
      totalAmount: testCosts[testType as keyof typeof testCosts] || "30.00",
      paymentStatus: "pending",
      paymentMethod: "",
      insuranceClaimed: false,
      insuranceAmount: "0.00",
      notes: `Lab test ordered by doctor - ${testName}`
    };

    apiRequest("POST", "/api/billing", labTestBill);
  };

  const generateMedicalReport = () => {
    if (!selectedPatient) return;

    const reportData = form.getValues();
    setMedicalReport({
      ...reportData,
      patientId: selectedPatient.id
    });
    
    setShowConsultationModal(false);
    toast({
      title: "Medical Report Generated",
      description: "Patient consultation completed. Report is ready for printing.",
    });
  };

  const printMedicalReport = () => {
    window.print();
  };

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Doctor Portal</h2>
            <p className="text-gray-600">Manage patient consultations and medical records</p>
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

      {/* Ready Patients */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Patients Ready for Consultation</h3>
          <p className="text-sm text-gray-600">Patients who have paid consultation fees</p>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Medical History</TableHead>
              <TableHead>Registration Time</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPatients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <Stethoscope className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No patients ready for consultation</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredPatients.map((patient: Patient) => (
                <TableRow key={patient.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                      <p className="text-sm text-gray-500">ID: {patient.patientId}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p>{calculateAge(patient.dateOfBirth)} years</p>
                      <p className="text-sm text-gray-500">{patient.gender}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p>{patient.phone}</p>
                      {patient.email && <p className="text-sm text-gray-500">{patient.email}</p>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-48">
                      {patient.medicalHistory ? (
                        <p className="text-sm truncate">{patient.medicalHistory}</p>
                      ) : (
                        <span className="text-gray-400">No history recorded</span>
                      )}
                      {patient.allergies && (
                        <p className="text-xs text-red-600 mt-1">Allergies: {patient.allergies}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{formatDateTime(patient.registrationDate)}</p>
                  </TableCell>
                  <TableCell>
                    <Button 
                      size="sm"
                      onClick={() => handleStartConsultation(patient)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Stethoscope className="w-4 h-4 mr-1" />
                      Start Consultation
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Consultation Modal */}
      <Dialog open={showConsultationModal} onOpenChange={setShowConsultationModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>
              Patient Consultation - {selectedPatient?.firstName} {selectedPatient?.lastName}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form className="space-y-6">
              {/* Patient Info Summary */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p><strong>Age:</strong> {selectedPatient && calculateAge(selectedPatient.dateOfBirth)} years</p>
                    <p><strong>Gender:</strong> {selectedPatient?.gender}</p>
                  </div>
                  <div>
                    <p><strong>Blood Type:</strong> {selectedPatient?.bloodType || "Not recorded"}</p>
                    <p><strong>Phone:</strong> {selectedPatient?.phone}</p>
                  </div>
                  <div>
                    <p><strong>Emergency Contact:</strong> {selectedPatient?.emergencyContactName}</p>
                    <p><strong>Phone:</strong> {selectedPatient?.emergencyContactPhone}</p>
                  </div>
                </div>
              </div>

              {/* Medical Assessment */}
              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="symptoms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Symptoms *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe patient's symptoms"
                          className="resize-none"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="diagnosis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Diagnosis *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Medical diagnosis"
                          className="resize-none"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="treatment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Treatment Plan *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Detailed treatment plan and recommendations"
                        className="resize-none"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPrescriptionModal(true)}
                >
                  <Pill className="w-4 h-4 mr-1" />
                  Prescribe Medication
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowLabRequest(true)}
                >
                  <FlaskConical className="w-4 h-4 mr-1" />
                  Order Lab Test
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowClinicalSummary(true)}
                >
                  <ClipboardList className="w-4 h-4 mr-1" />
                  Clinical Summary
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowMedicalReport(true)}
                >
                  <FileText className="w-4 h-4 mr-1" />
                  Medical Report
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDischargeSummary(true)}
                >
                  <Stethoscope className="w-4 h-4 mr-1" />
                  Discharge Summary
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPrescriptionForm(true)}
                >
                  <Printer className="w-4 h-4 mr-1" />
                  Prescription Form
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="followUpDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Follow-up Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Additional observations or notes"
                          className="resize-none"
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setShowConsultationModal(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={generateMedicalReport}>
                  <FileText className="w-4 h-4 mr-1" />
                  Complete Consultation
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Quick Prescription Modal */}
      <Dialog open={showPrescriptionModal} onOpenChange={setShowPrescriptionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quick Prescription</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Select onValueChange={(value) => {
                const medication = medications.find((med: Medication) => med.id === parseInt(value));
                if (medication) {
                  handlePrescribeMedication(medication.id, "1 tablet", "twice daily", "7 days");
                  setShowPrescriptionModal(false);
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select medication" />
                </SelectTrigger>
                <SelectContent>
                  {medications.slice(0, 10).map((medication: Medication) => (
                    <SelectItem key={medication.id} value={medication.id.toString()}>
                      {medication.name} - {medication.strength}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Lab Test Modal */}
      <Dialog open={showLabTestModal} onOpenChange={setShowLabTestModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Order Lab Test</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {["Blood Test", "Urine Test", "X-Ray", "CT Scan"].map((test) => (
                <Button 
                  key={test}
                  variant="outline"
                  onClick={() => {
                    handleOrderLabTest(test, test, "routine");
                    setShowLabTestModal(false);
                  }}
                >
                  {test}
                </Button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Medical Report Preview */}
      {medicalReport && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-4 border-b print:hidden">
              <h3 className="text-lg font-semibold">Medical Report</h3>
              <div className="flex space-x-2">
                <Button onClick={printMedicalReport}>
                  <Printer className="w-4 h-4 mr-1" />
                  Print Report
                </Button>
                <Button variant="outline" onClick={() => setMedicalReport(null)}>
                  Close
                </Button>
              </div>
            </div>

            <div className="p-8 print:p-0">
              {/* Medical Report Content */}
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-blue-800">CHILD MENTAL HAVEN</h1>
                <p className="text-sm text-gray-600">Medical Consultation Report</p>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-6">
                <div>
                  <h3 className="font-bold mb-2">PATIENT INFORMATION</h3>
                  <p><strong>Name:</strong> {selectedPatient.firstName} {selectedPatient.lastName}</p>
                  <p><strong>Patient ID:</strong> {selectedPatient.patientId}</p>
                  <p><strong>Age:</strong> {calculateAge(selectedPatient.dateOfBirth)} years</p>
                  <p><strong>Gender:</strong> {selectedPatient.gender}</p>
                  <p><strong>Blood Type:</strong> {selectedPatient.bloodType || "Not recorded"}</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">CONSULTATION DETAILS</h3>
                  <p><strong>Date:</strong> {formatDateTime(new Date())}</p>
                  <p><strong>Doctor:</strong> Dr. Medical Officer</p>
                  <p><strong>Department:</strong> General Medicine</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-bold mb-2">SYMPTOMS</h3>
                  <p className="bg-gray-50 p-3 rounded">{medicalReport.symptoms}</p>
                </div>

                <div>
                  <h3 className="font-bold mb-2">DIAGNOSIS</h3>
                  <p className="bg-gray-50 p-3 rounded">{medicalReport.diagnosis}</p>
                </div>

                <div>
                  <h3 className="font-bold mb-2">TREATMENT PLAN</h3>
                  <p className="bg-gray-50 p-3 rounded">{medicalReport.treatment}</p>
                </div>

                {medicalReport.followUpDate && (
                  <div>
                    <h3 className="font-bold mb-2">FOLLOW-UP</h3>
                    <p>Next appointment: {medicalReport.followUpDate}</p>
                  </div>
                )}

                {medicalReport.notes && (
                  <div>
                    <h3 className="font-bold mb-2">ADDITIONAL NOTES</h3>
                    <p className="bg-gray-50 p-3 rounded">{medicalReport.notes}</p>
                  </div>
                )}
              </div>

              <div className="border-t pt-6 mt-8 text-center text-sm text-gray-600">
                <p>This report was generated on {formatDateTime(new Date())}</p>
                <p>Child Mental Haven - Comprehensive Mental Health Services</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clinical Summary Dialog */}
      {showClinicalSummary && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-screen overflow-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Clinical Summary - {selectedPatient.firstName} {selectedPatient.lastName}</h2>
              <Button variant="ghost" onClick={() => setShowClinicalSummary(false)}>✕</Button>
            </div>
            <ClinicalSummary 
              patient={selectedPatient}
              doctorName="Dr. Medical Officer"
            />
          </div>
        </div>
      )}

      {/* Medical Report Dialog */}
      {showMedicalReport && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-screen overflow-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Medical Report - {selectedPatient.firstName} {selectedPatient.lastName}</h2>
              <Button variant="ghost" onClick={() => setShowMedicalReport(false)}>✕</Button>
            </div>
            <MedicalReport 
              patient={selectedPatient}
              doctorName="Dr. Medical Officer"
            />
          </div>
        </div>
      )}

      {/* Lab Request Dialog */}
      {showLabRequest && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-screen overflow-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Laboratory Request - {selectedPatient.firstName} {selectedPatient.lastName}</h2>
              <Button variant="ghost" onClick={() => setShowLabRequest(false)}>✕</Button>
            </div>
            <LabRequest 
              patient={selectedPatient}
              doctorName="Dr. Medical Officer"
            />
          </div>
        </div>
      )}

      {/* Discharge Summary Dialog */}
      {showDischargeSummary && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-screen overflow-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Discharge Summary - {selectedPatient.firstName} {selectedPatient.lastName}</h2>
              <Button variant="ghost" onClick={() => setShowDischargeSummary(false)}>✕</Button>
            </div>
            <DischargeSummary 
              patient={selectedPatient}
              doctorName="Dr. Medical Officer"
            />
          </div>
        </div>
      )}

      {/* Prescription Form Dialog */}
      {showPrescriptionForm && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-screen overflow-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Prescription Form - {selectedPatient.firstName} {selectedPatient.lastName}</h2>
              <Button variant="ghost" onClick={() => setShowPrescriptionForm(false)}>✕</Button>
            </div>
            <PrescriptionForm 
              patient={selectedPatient}
              doctorName="Dr. Medical Officer"
              medications={[]}
            />
          </div>
        </div>
      )}
    </div>
  );
}