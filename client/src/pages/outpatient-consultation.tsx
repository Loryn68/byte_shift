import React, { useState } from "react";
import { useLocation } from "wouter";
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
  Stethoscope,
  Save,
  FileText,
  Eye,
  Plus,
  User,
  Calendar,
  Clock,
  Download,
  Printer,
  ClipboardList,
  UserPlus,
  Send,
  TestTube,
  Pill
} from "lucide-react";
import { formatDateTime, getTimeAgo } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Patient } from "@shared/schema";

interface ConsultationNotes {
  patientId: number;
  consultationDate: string;
  consultationTime: string;
  chiefComplaint: string;
  historyOfPresentIllness: string;
  pastMedicalHistory: string;
  physicalExamination: string;
  assessment: string;
  treatment: string;
  prescription: string;
  followUp: string;
  doctor: string;
  recordedAt: string;
}

export default function OutpatientConsultation() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: patients = [] } = useQuery({
    queryKey: ["/api/patients"],
  });

  // Get triaged patients from localStorage
  const getTriagedPatients = () => {
    try {
      const vitalsData = JSON.parse(localStorage.getItem('patientVitals') || '[]');
      return vitalsData.map((vital: any) => vital.patientId);
    } catch {
      return [];
    }
  };

  const triagedPatientIds = getTriagedPatients();

  const filteredPatients = patients.filter((patient: Patient) => {
    // Only show patients who have been triaged
    if (!triagedPatientIds.includes(patient.id)) return false;
    
    if (!searchQuery) return true;
    return (
      patient.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.patientId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Get patient's vital signs
  const getPatientVitals = (patientId: number) => {
    try {
      const vitalsData = JSON.parse(localStorage.getItem('patientVitals') || '[]');
      return vitalsData.find((vital: any) => vital.patientId === patientId);
    } catch {
      return null;
    }
  };

  const saveConsultationMutation = useMutation({
    mutationFn: async (consultationData: ConsultationNotes) => {
      // Save consultation notes to localStorage for this session
      console.log("Saving consultation notes:", consultationData);
      
      const existingConsultations = JSON.parse(localStorage.getItem('consultationNotes') || '[]');
      const newConsultation = {
        ...consultationData,
        id: Date.now(),
        status: 'completed'
      };
      existingConsultations.push(newConsultation);
      localStorage.setItem('consultationNotes', JSON.stringify(existingConsultations));
      
      return consultationData;
    },
    onSuccess: () => {
      toast({
        title: "Consultation Completed",
        description: "Patient consultation notes have been successfully recorded.",
      });
      setShowConsultationModal(false);
      setConsultation(prev => ({
        ...prev,
        chiefComplaint: "",
        historyOfPresentIllness: "",
        pastMedicalHistory: "",
        physicalExamination: "",
        assessment: "",
        treatment: "",
        prescription: "",
        followUp: ""
      }));
    },
  });

  const openConsultationModal = (patient: Patient) => {
    setSelectedPatient(patient);
    setConsultation(prev => ({
      ...prev,
      patientId: patient.id,
      consultationDate: new Date().toISOString().split('T')[0],
      consultationTime: new Date().toLocaleTimeString('en-GB', { hour12: false }).slice(0, 5),
      recordedAt: new Date().toISOString()
    }));
    setShowConsultationModal(true);
  };

  const handleSaveConsultation = () => {
    if (!selectedPatient) return;
    saveConsultationMutation.mutate(consultation);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Outpatient Consultation</h1>
          <p className="text-gray-600">Doctor's consultation environment for patient care</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="patients" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="patients" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Patients for Consultation</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Consultation History</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="patients" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Stethoscope className="w-5 h-5" />
                <span>Triaged Patients Ready for Consultation</span>
              </CardTitle>
              <CardDescription>
                Patients who have completed triage and are ready for doctor consultation
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredPatients.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Patients Ready</h3>
                  <p className="text-gray-500">No triaged patients are currently waiting for consultation.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient Details</TableHead>
                      <TableHead>Age/Gender</TableHead>
                      <TableHead>Vital Signs Status</TableHead>
                      <TableHead>Registration Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.map((patient: Patient) => {
                      const vitals = getPatientVitals(patient.id);
                      return (
                        <TableRow key={patient.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{patient.firstName} {patient.lastName}</div>
                              <div className="text-sm text-gray-500">{patient.patientId}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div>{new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} years</div>
                              <div className="text-sm text-gray-500">{patient.gender}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {vitals ? (
                              <Badge className="bg-green-100 text-green-800">
                                Vitals Recorded
                              </Badge>
                            ) : (
                              <Badge className="bg-yellow-100 text-yellow-800">
                                Pending Vitals
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(patient.registrationDate).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => setLocation(`/consultation/${patient.id}`)}
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <Stethoscope className="w-4 h-4 mr-1" />
                                Start Consultation
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Consultation History</span>
              </CardTitle>
              <CardDescription>
                Previous consultation records and patient visits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Consultation History</h3>
                <p className="text-gray-500">Consultation records will appear here after completing patient visits.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Stethoscope className="w-5 h-5" />
              <span>Patient Consultation - {selectedPatient?.firstName} {selectedPatient?.lastName}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Patient Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Patient Information</h3>
              {selectedPatient && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div><strong>Name:</strong> {selectedPatient.firstName} {selectedPatient.lastName}</div>
                  <div><strong>Age:</strong> {new Date().getFullYear() - new Date(selectedPatient.dateOfBirth).getFullYear()} years</div>
                  <div><strong>Gender:</strong> {selectedPatient.gender}</div>
                  <div><strong>Address:</strong> {selectedPatient.address}</div>
                  {selectedPatient.allergies && <div><strong>Allergies:</strong> {selectedPatient.allergies}</div>}
                  {selectedPatient.medicalHistory && <div><strong>Medical History:</strong> {selectedPatient.medicalHistory}</div>}
                </div>
              )}

              {/* Complete Triage Results */}
              {selectedPatient && getPatientVitals(selectedPatient.id) && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center space-x-2">
                    <Activity className="w-4 h-4" />
                    <span>Triage Assessment Results</span>
                  </h4>
                  <div className="bg-blue-50 p-4 rounded-lg text-sm space-y-3">
                    {(() => {
                      const vitals = getPatientVitals(selectedPatient.id);
                      return (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h5 className="font-semibold text-blue-800 mb-2">Physical Measurements</h5>
                              <div className="space-y-1">
                                <div><strong>Height:</strong> {vitals.height} cm</div>
                                <div><strong>Weight:</strong> {vitals.weight} kg</div>
                                <div><strong>BMI:</strong> {vitals.bmi}</div>
                              </div>
                            </div>
                            <div>
                              <h5 className="font-semibold text-blue-800 mb-2">Vital Signs</h5>
                              <div className="space-y-1">
                                <div><strong>Temperature:</strong> {vitals.temperature}°C</div>
                                <div><strong>Blood Pressure:</strong> {vitals.bloodPressureSystolic}/{vitals.bloodPressureDiastolic} mmHg</div>
                                <div><strong>Pulse Rate:</strong> {vitals.pulseRate} bpm</div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h5 className="font-semibold text-blue-800 mb-2">Respiratory</h5>
                              <div className="space-y-1">
                                <div><strong>Respiration Rate:</strong> {vitals.respirationRate} breaths/min</div>
                                <div><strong>Oxygen Saturation:</strong> {vitals.oxygenSaturation}%</div>
                              </div>
                            </div>
                            <div>
                              <h5 className="font-semibold text-blue-800 mb-2">Laboratory Values</h5>
                              <div className="space-y-1">
                                <div><strong>Blood Sugar:</strong> {vitals.bloodSugar} mmol/L</div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h5 className="font-semibold text-blue-800 mb-2">Triage Assessment</h5>
                            <div className="space-y-1">
                              <div><strong>Assessment Date:</strong> {vitals.measurementDate}</div>
                              <div><strong>Assessment Time:</strong> {vitals.measurementTime}</div>
                              <div><strong>Assessed By:</strong> {vitals.clinician}</div>
                              {vitals.notes && <div><strong>Nursing Notes:</strong> {vitals.notes}</div>}
                            </div>
                          </div>

                          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                            <div className="text-green-800 font-medium mb-1">Triage Status: Complete ✓</div>
                            <div className="text-green-700 text-xs">
                              Patient has been assessed by nursing staff and is ready for doctor consultation
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* Medical Action Buttons */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Medical Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="h-auto p-3 text-left justify-start">
                      <div className="flex flex-col items-start space-y-1">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4" />
                          <span className="font-medium">Outpatient Doctor Notes</span>
                        </div>
                        <span className="text-xs text-gray-500">Clinical summary form</span>
                      </div>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Clinical Summary - Outpatient</DialogTitle>
                    </DialogHeader>
                    <ClinicalSummaryForm />
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="h-auto p-3 text-left justify-start">
                      <div className="flex flex-col items-start space-y-1">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span className="font-medium">Patient History</span>
                        </div>
                        <span className="text-xs text-gray-500">View patient records</span>
                      </div>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Patient Medical History</DialogTitle>
                    </DialogHeader>
                    <div className="p-4 text-center text-gray-500">
                      Patient history records will be displayed here
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="h-auto p-3 text-left justify-start">
                      <div className="flex flex-col items-start space-y-1">
                        <div className="flex items-center space-x-2">
                          <Send className="w-4 h-4" />
                          <span className="font-medium">Refer to Another Facility</span>
                        </div>
                        <span className="text-xs text-gray-500">External referral form</span>
                      </div>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Referral Out Form</DialogTitle>
                    </DialogHeader>
                    <ReferralOutForm />
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="h-auto p-3 text-left justify-start">
                      <div className="flex flex-col items-start space-y-1">
                        <div className="flex items-center space-x-2">
                          <UserPlus className="w-4 h-4" />
                          <span className="font-medium">Admit Patient</span>
                        </div>
                        <span className="text-xs text-gray-500">Admission medical report</span>
                      </div>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Medical Report - Admission</DialogTitle>
                    </DialogHeader>
                    <MedicalReportForm />
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="h-auto p-3 text-left justify-start">
                      <div className="flex flex-col items-start space-y-1">
                        <div className="flex items-center space-x-2">
                          <TestTube className="w-4 h-4" />
                          <span className="font-medium">Laboratory</span>
                        </div>
                        <span className="text-xs text-gray-500">Lab request form</span>
                      </div>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Laboratory Request Form</DialogTitle>
                    </DialogHeader>
                    <LabRequestForm />
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="h-auto p-3 text-left justify-start">
                      <div className="flex flex-col items-start space-y-1">
                        <div className="flex items-center space-x-2">
                          <Pill className="w-4 h-4" />
                          <span className="font-medium">Prescription</span>
                        </div>
                        <span className="text-xs text-gray-500">Medication prescription</span>
                      </div>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Prescription Form</DialogTitle>
                    </DialogHeader>
                    <div className="p-4 text-center text-gray-500">
                      Prescription form will be implemented here
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Consultation Form */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Consultation Details</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="consultationDate">Date</Label>
                  <Input
                    id="consultationDate"
                    type="date"
                    value={consultation.consultationDate}
                    onChange={(e) => setConsultation(prev => ({ ...prev, consultationDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="consultationTime">Time</Label>
                  <Input
                    id="consultationTime"
                    type="time"
                    value={consultation.consultationTime}
                    onChange={(e) => setConsultation(prev => ({ ...prev, consultationTime: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="chiefComplaint">Chief Complaint</Label>
                <Textarea
                  id="chiefComplaint"
                  placeholder="Patient's main concern or reason for visit..."
                  value={consultation.chiefComplaint}
                  onChange={(e) => setConsultation(prev => ({ ...prev, chiefComplaint: e.target.value }))}
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="historyOfPresentIllness">History of Present Illness</Label>
                <Textarea
                  id="historyOfPresentIllness"
                  placeholder="Detailed history of current symptoms..."
                  value={consultation.historyOfPresentIllness}
                  onChange={(e) => setConsultation(prev => ({ ...prev, historyOfPresentIllness: e.target.value }))}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="physicalExamination">Physical Examination</Label>
                <Textarea
                  id="physicalExamination"
                  placeholder="Physical examination findings..."
                  value={consultation.physicalExamination}
                  onChange={(e) => setConsultation(prev => ({ ...prev, physicalExamination: e.target.value }))}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="assessment">Assessment & Diagnosis</Label>
                <Textarea
                  id="assessment"
                  placeholder="Clinical assessment and diagnosis..."
                  value={consultation.assessment}
                  onChange={(e) => setConsultation(prev => ({ ...prev, assessment: e.target.value }))}
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="treatment">Treatment Plan</Label>
                <Textarea
                  id="treatment"
                  placeholder="Treatment recommendations and plan..."
                  value={consultation.treatment}
                  onChange={(e) => setConsultation(prev => ({ ...prev, treatment: e.target.value }))}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="prescription">Prescription</Label>
                <Textarea
                  id="prescription"
                  placeholder="Medications prescribed..."
                  value={consultation.prescription}
                  onChange={(e) => setConsultation(prev => ({ ...prev, prescription: e.target.value }))}
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="followUp">Follow-up Instructions</Label>
                <Textarea
                  id="followUp"
                  placeholder="Follow-up appointments, instructions..."
                  value={consultation.followUp}
                  onChange={(e) => setConsultation(prev => ({ ...prev, followUp: e.target.value }))}
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="doctor">Consulting Doctor</Label>
                <Input
                  id="doctor"
                  value={consultation.doctor}
                  onChange={(e) => setConsultation(prev => ({ ...prev, doctor: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-500">
              Patient: {selectedPatient?.patientId} • Age: {selectedPatient ? new Date().getFullYear() - new Date(selectedPatient.dateOfBirth).getFullYear() : 0} years
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setShowConsultationModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveConsultation}
                disabled={saveConsultationMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="w-4 h-4 mr-1" />
                Complete Consultation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Clinical Summary Form Component
function ClinicalSummaryForm() {
  const [formData, setFormData] = useState({
    patientName: "",
    age: "",
    gender: "",
    dateOfVisit: new Date().toISOString().split('T')[0],
    opNumber: "",
    presentingComplaints: "",
    historyOfPresentIllness: "",
    impression: "",
    investigations: "",
    finalDiagnosis: "",
    management: "",
    doctorName: "",
    date: new Date().toISOString().split('T')[0]
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(generateClinicalSummaryHTML());
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownload = () => {
    const pdfWindow = window.open('', '_blank');
    if (pdfWindow) {
      pdfWindow.document.write(`
        <html>
          <head>
            <title>Clinical Summary - ${formData.patientName}</title>
            <style>body { margin: 0; font-family: Arial, sans-serif; }</style>
          </head>
          <body>
            ${generateClinicalSummaryHTML()}
            <script>window.onload = function() { window.print(); }</script>
          </body>
        </html>
      `);
      pdfWindow.document.close();
    }
  };

  const generateClinicalSummaryHTML = () => {
    return `
      <div style="max-width: 800px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #4CAF50; padding-bottom: 15px;">
          <h1 style="color: #4CAF50; margin: 0; font-size: 24px; font-weight: bold;">CHILD MENTAL HAVEN</h1>
          <p style="color: #333; margin: 2px 0; font-size: 14px; font-style: italic;">Where Young Minds Evolve</p>
          <div style="font-size: 12px; color: #666; margin-top: 8px; line-height: 1.4;">
            <div>Muchai Drive Off Ngong Road</div>
            <div>P.O Box 41622-00100, Nairobi, Kenya</div>
            <div>Tel: +254 746 170 159</div>
            <div>Email: info@childmentalhaven.org</div>
          </div>
        </div>
        
        <div style="text-align: center; margin-bottom: 25px;">
          <h2 style="color: #333; margin: 0; font-size: 20px; text-decoration: underline;">CLINICAL SUMMARY</h2>
        </div>
        
        <div style="margin-bottom: 20px;">
          <div style="display: flex; margin-bottom: 15px;">
            <span style="width: 150px; font-weight: bold;">PT NAME(S):</span>
            <span style="border-bottom: 1px solid #333; flex: 1; padding-left: 5px;">${formData.patientName}</span>
            <span style="margin-left: 20px; font-weight: bold;">AGE:</span>
            <span style="border-bottom: 1px solid #333; width: 60px; text-align: center; margin-left: 5px;">${formData.age}</span>
            <span style="margin-left: 20px; font-weight: bold;">GENDER:</span>
            <span style="border-bottom: 1px solid #333; width: 80px; text-align: center; margin-left: 5px;">${formData.gender}</span>
          </div>
          
          <div style="display: flex; margin-bottom: 15px;">
            <span style="width: 150px; font-weight: bold;">DATE OF VISIT:</span>
            <span style="border-bottom: 1px solid #333; width: 150px; text-align: center; margin-right: 20px;">${formData.dateOfVisit}</span>
            <span style="font-weight: bold;">OP NO:</span>
            <span style="border-bottom: 1px solid #333; width: 150px; text-align: center; margin-left: 10px;">${formData.opNumber}</span>
          </div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <div style="font-weight: bold; margin-bottom: 5px;">PRESENTING COMPLAINTS:</div>
          <div style="border: 1px solid #333; min-height: 60px; padding: 8px; white-space: pre-wrap;">${formData.presentingComplaints}</div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <div style="font-weight: bold; margin-bottom: 5px;">HISTORY OF PRESENTING ILLNESS:</div>
          <div style="border: 1px solid #333; min-height: 80px; padding: 8px; white-space: pre-wrap;">${formData.historyOfPresentIllness}</div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <div style="font-weight: bold; margin-bottom: 5px;">IMPRESSION:</div>
          <div style="border: 1px solid #333; min-height: 60px; padding: 8px; white-space: pre-wrap;">${formData.impression}</div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <div style="font-weight: bold; margin-bottom: 5px;">INVESTIGATIONS:</div>
          <div style="border: 1px solid #333; min-height: 80px; padding: 8px; white-space: pre-wrap;">${formData.investigations}</div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <div style="font-weight: bold; margin-bottom: 5px;">FINAL DIAGNOSIS:</div>
          <div style="border: 1px solid #333; min-height: 60px; padding: 8px; white-space: pre-wrap;">${formData.finalDiagnosis}</div>
        </div>
        
        <div style="margin-bottom: 30px;">
          <div style="font-weight: bold; margin-bottom: 5px;">MANAGEMENT:</div>
          <div style="border: 1px solid #333; min-height: 80px; padding: 8px; white-space: pre-wrap;">${formData.management}</div>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-top: 40px;">
          <div>
            <div style="font-weight: bold; margin-bottom: 5px;">DOCTOR'S NAME:</div>
            <div style="border-bottom: 1px solid #333; width: 250px; padding: 5px;">${formData.doctorName}</div>
          </div>
          <div>
            <div style="font-weight: bold; margin-bottom: 5px;">SIGNATURE:</div>
            <div style="border-bottom: 1px solid #333; width: 200px; padding: 5px;"></div>
          </div>
          <div>
            <div style="font-weight: bold; margin-bottom: 5px;">DATE:</div>
            <div style="border-bottom: 1px solid #333; width: 150px; padding: 5px;">${formData.date}</div>
          </div>
        </div>
      </div>
    `;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="patientName">Patient Name</Label>
          <Input
            id="patientName"
            value={formData.patientName}
            onChange={(e) => handleInputChange('patientName', e.target.value)}
            placeholder="Enter patient name"
          />
        </div>
        <div>
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            value={formData.age}
            onChange={(e) => handleInputChange('age', e.target.value)}
            placeholder="Enter age"
          />
        </div>
        <div>
          <Label htmlFor="gender">Gender</Label>
          <Input
            id="gender"
            value={formData.gender}
            onChange={(e) => handleInputChange('gender', e.target.value)}
            placeholder="Enter gender"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="dateOfVisit">Date of Visit</Label>
          <Input
            id="dateOfVisit"
            type="date"
            value={formData.dateOfVisit}
            onChange={(e) => handleInputChange('dateOfVisit', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="opNumber">OP Number</Label>
          <Input
            id="opNumber"
            value={formData.opNumber}
            onChange={(e) => handleInputChange('opNumber', e.target.value)}
            placeholder="Enter OP number"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="presentingComplaints">Presenting Complaints</Label>
        <Textarea
          id="presentingComplaints"
          value={formData.presentingComplaints}
          onChange={(e) => handleInputChange('presentingComplaints', e.target.value)}
          placeholder="Enter presenting complaints"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="historyOfPresentIllness">History of Present Illness</Label>
        <Textarea
          id="historyOfPresentIllness"
          value={formData.historyOfPresentIllness}
          onChange={(e) => handleInputChange('historyOfPresentIllness', e.target.value)}
          placeholder="Enter history of present illness"
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="impression">Impression</Label>
        <Textarea
          id="impression"
          value={formData.impression}
          onChange={(e) => handleInputChange('impression', e.target.value)}
          placeholder="Enter clinical impression"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="investigations">Investigations</Label>
        <Textarea
          id="investigations"
          value={formData.investigations}
          onChange={(e) => handleInputChange('investigations', e.target.value)}
          placeholder="Enter investigations"
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="finalDiagnosis">Final Diagnosis</Label>
        <Textarea
          id="finalDiagnosis"
          value={formData.finalDiagnosis}
          onChange={(e) => handleInputChange('finalDiagnosis', e.target.value)}
          placeholder="Enter final diagnosis"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="management">Management</Label>
        <Textarea
          id="management"
          value={formData.management}
          onChange={(e) => handleInputChange('management', e.target.value)}
          placeholder="Enter management plan"
          rows={4}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="doctorName">Doctor's Name</Label>
          <Input
            id="doctorName"
            value={formData.doctorName}
            onChange={(e) => handleInputChange('doctorName', e.target.value)}
            placeholder="Enter doctor's name"
          />
        </div>
        <div>
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" />
          Print
        </Button>
        <Button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700">
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
      </div>
    </div>
  );
}

// Medical Report Form Component
function MedicalReportForm() {
  const [formData, setFormData] = useState({
    patientName: "",
    age: "",
    gender: "",
    admissionDate: new Date().toISOString().split('T')[0],
    ward: "",
    medicalHistory: "",
    presentingComplaints: "",
    physicalExamination: "",
    investigations: "",
    diagnosis: "",
    treatmentPlan: "",
    prognosis: "",
    doctorName: "",
    date: new Date().toISOString().split('T')[0]
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(generateMedicalReportHTML());
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownload = () => {
    const pdfWindow = window.open('', '_blank');
    if (pdfWindow) {
      pdfWindow.document.write(`
        <html>
          <head>
            <title>Medical Report - ${formData.patientName}</title>
            <style>body { margin: 0; font-family: Arial, sans-serif; }</style>
          </head>
          <body>
            ${generateMedicalReportHTML()}
            <script>window.onload = function() { window.print(); }</script>
          </body>
        </html>
      `);
      pdfWindow.document.close();
    }
  };

  const generateMedicalReportHTML = () => {
    return `
      <div style="max-width: 800px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #4CAF50; padding-bottom: 15px;">
          <h1 style="color: #4CAF50; margin: 0; font-size: 24px; font-weight: bold;">CHILD MENTAL HAVEN</h1>
          <p style="color: #333; margin: 2px 0; font-size: 14px; font-style: italic;">Where Young Minds Evolve</p>
          <div style="font-size: 12px; color: #666; margin-top: 8px; line-height: 1.4;">
            <div>Muchai Drive Off Ngong Road</div>
            <div>P.O Box 41622-00100, Nairobi, Kenya</div>
            <div>Tel: +254 746 170 159</div>
            <div>Email: info@childmentalhaven.org</div>
          </div>
        </div>
        
        <div style="text-align: center; margin-bottom: 25px;">
          <h2 style="color: #333; margin: 0; font-size: 20px; text-decoration: underline;">MEDICAL REPORT - ADMISSION</h2>
        </div>
        
        <div style="margin-bottom: 20px;">
          <div style="display: flex; margin-bottom: 15px;">
            <span style="width: 150px; font-weight: bold;">PATIENT NAME:</span>
            <span style="border-bottom: 1px solid #333; flex: 1; padding-left: 5px;">${formData.patientName}</span>
            <span style="margin-left: 20px; font-weight: bold;">AGE:</span>
            <span style="border-bottom: 1px solid #333; width: 60px; text-align: center; margin-left: 5px;">${formData.age}</span>
            <span style="margin-left: 20px; font-weight: bold;">GENDER:</span>
            <span style="border-bottom: 1px solid #333; width: 80px; text-align: center; margin-left: 5px;">${formData.gender}</span>
          </div>
          
          <div style="display: flex; margin-bottom: 15px;">
            <span style="width: 150px; font-weight: bold;">ADMISSION DATE:</span>
            <span style="border-bottom: 1px solid #333; width: 150px; text-align: center; margin-right: 20px;">${formData.admissionDate}</span>
            <span style="font-weight: bold;">WARD:</span>
            <span style="border-bottom: 1px solid #333; flex: 1; margin-left: 10px; padding-left: 5px;">${formData.ward}</span>
          </div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <div style="font-weight: bold; margin-bottom: 5px;">MEDICAL HISTORY:</div>
          <div style="border: 1px solid #333; min-height: 60px; padding: 8px; white-space: pre-wrap;">${formData.medicalHistory}</div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <div style="font-weight: bold; margin-bottom: 5px;">PRESENTING COMPLAINTS:</div>
          <div style="border: 1px solid #333; min-height: 80px; padding: 8px; white-space: pre-wrap;">${formData.presentingComplaints}</div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <div style="font-weight: bold; margin-bottom: 5px;">PHYSICAL EXAMINATION:</div>
          <div style="border: 1px solid #333; min-height: 100px; padding: 8px; white-space: pre-wrap;">${formData.physicalExamination}</div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <div style="font-weight: bold; margin-bottom: 5px;">INVESTIGATIONS:</div>
          <div style="border: 1px solid #333; min-height: 80px; padding: 8px; white-space: pre-wrap;">${formData.investigations}</div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <div style="font-weight: bold; margin-bottom: 5px;">DIAGNOSIS:</div>
          <div style="border: 1px solid #333; min-height: 60px; padding: 8px; white-space: pre-wrap;">${formData.diagnosis}</div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <div style="font-weight: bold; margin-bottom: 5px;">TREATMENT PLAN:</div>
          <div style="border: 1px solid #333; min-height: 80px; padding: 8px; white-space: pre-wrap;">${formData.treatmentPlan}</div>
        </div>
        
        <div style="margin-bottom: 30px;">
          <div style="font-weight: bold; margin-bottom: 5px;">PROGNOSIS:</div>
          <div style="border: 1px solid #333; min-height: 60px; padding: 8px; white-space: pre-wrap;">${formData.prognosis}</div>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-top: 40px;">
          <div>
            <div style="font-weight: bold; margin-bottom: 5px;">DOCTOR'S NAME:</div>
            <div style="border-bottom: 1px solid #333; width: 250px; padding: 5px;">${formData.doctorName}</div>
          </div>
          <div>
            <div style="font-weight: bold; margin-bottom: 5px;">SIGNATURE:</div>
            <div style="border-bottom: 1px solid #333; width: 200px; padding: 5px;"></div>
          </div>
          <div>
            <div style="font-weight: bold; margin-bottom: 5px;">DATE:</div>
            <div style="border-bottom: 1px solid #333; width: 150px; padding: 5px;">${formData.date}</div>
          </div>
        </div>
      </div>
    `;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="patientName">Patient Name</Label>
          <Input
            id="patientName"
            value={formData.patientName}
            onChange={(e) => handleInputChange('patientName', e.target.value)}
            placeholder="Enter patient name"
          />
        </div>
        <div>
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            value={formData.age}
            onChange={(e) => handleInputChange('age', e.target.value)}
            placeholder="Enter age"
          />
        </div>
        <div>
          <Label htmlFor="gender">Gender</Label>
          <Input
            id="gender"
            value={formData.gender}
            onChange={(e) => handleInputChange('gender', e.target.value)}
            placeholder="Enter gender"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="admissionDate">Admission Date</Label>
          <Input
            id="admissionDate"
            type="date"
            value={formData.admissionDate}
            onChange={(e) => handleInputChange('admissionDate', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="ward">Ward</Label>
          <Input
            id="ward"
            value={formData.ward}
            onChange={(e) => handleInputChange('ward', e.target.value)}
            placeholder="Enter ward"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="medicalHistory">Medical History</Label>
        <Textarea
          id="medicalHistory"
          value={formData.medicalHistory}
          onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
          placeholder="Enter medical history"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="presentingComplaints">Presenting Complaints</Label>
        <Textarea
          id="presentingComplaints"
          value={formData.presentingComplaints}
          onChange={(e) => handleInputChange('presentingComplaints', e.target.value)}
          placeholder="Enter presenting complaints"
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="physicalExamination">Physical Examination</Label>
        <Textarea
          id="physicalExamination"
          value={formData.physicalExamination}
          onChange={(e) => handleInputChange('physicalExamination', e.target.value)}
          placeholder="Enter physical examination findings"
          rows={5}
        />
      </div>

      <div>
        <Label htmlFor="investigations">Investigations</Label>
        <Textarea
          id="investigations"
          value={formData.investigations}
          onChange={(e) => handleInputChange('investigations', e.target.value)}
          placeholder="Enter investigations"
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="diagnosis">Diagnosis</Label>
        <Textarea
          id="diagnosis"
          value={formData.diagnosis}
          onChange={(e) => handleInputChange('diagnosis', e.target.value)}
          placeholder="Enter diagnosis"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="treatmentPlan">Treatment Plan</Label>
        <Textarea
          id="treatmentPlan"
          value={formData.treatmentPlan}
          onChange={(e) => handleInputChange('treatmentPlan', e.target.value)}
          placeholder="Enter treatment plan"
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="prognosis">Prognosis</Label>
        <Textarea
          id="prognosis"
          value={formData.prognosis}
          onChange={(e) => handleInputChange('prognosis', e.target.value)}
          placeholder="Enter prognosis"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="doctorName">Doctor's Name</Label>
          <Input
            id="doctorName"
            value={formData.doctorName}
            onChange={(e) => handleInputChange('doctorName', e.target.value)}
            placeholder="Enter doctor's name"
          />
        </div>
        <div>
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" />
          Print
        </Button>
        <Button onClick={handleDownload} className="bg-green-600 hover:bg-green-700">
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
      </div>
    </div>
  );
}

// Referral Out Form Component
function ReferralOutForm() {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    patientName: "",
    cmhNumber: "",
    phoneNumber: "",
    age: "",
    sex: "",
    briefHistory: "",
    investigations: "",
    treatment: "",
    diagnosis: "",
    reasonForReferral: "",
    referredTo: "",
    referredBy: "",
    additionalComments: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(generateReferralOutHTML());
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownload = () => {
    const pdfWindow = window.open('', '_blank');
    if (pdfWindow) {
      pdfWindow.document.write(`
        <html>
          <head>
            <title>Referral Out Form - ${formData.patientName}</title>
            <style>body { margin: 0; font-family: Arial, sans-serif; }</style>
          </head>
          <body>
            ${generateReferralOutHTML()}
            <script>window.onload = function() { window.print(); }</script>
          </body>
        </html>
      `);
      pdfWindow.document.close();
    }
  };

  const generateReferralOutHTML = () => {
    return `
      <div style="max-width: 800px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #4CAF50; padding-bottom: 15px;">
          <h1 style="color: #4CAF50; margin: 0; font-size: 24px; font-weight: bold;">CHILD MENTAL HAVEN</h1>
          <p style="color: #333; margin: 2px 0; font-size: 14px; font-style: italic;">Where Young Minds Evolve</p>
          <p style="color: #333; margin: 2px 0; font-size: 12px; font-weight: bold;">COMPREHENSIVE MENTAL HEALTH / REHABILITATION</p>
          <div style="font-size: 12px; color: #666; margin-top: 8px; line-height: 1.4;">
            <div>Muchai Drive Off Ngong Road, Nairobi</div>
            <div>P.O Box 41622-00100</div>
            <div>Nairobi</div>
            <div>+254 746 170 159</div>
            <div>info@childmentalhaven.org</div>
          </div>
        </div>
        
        <div style="text-align: center; margin-bottom: 25px;">
          <h2 style="color: #333; margin: 0; font-size: 20px; text-decoration: underline;">REFERRAL OUT FORM</h2>
        </div>
        
        <div style="text-align: right; margin-bottom: 20px;">
          <span style="font-weight: bold;">DATE: </span>
          <span style="border-bottom: 1px solid #333; padding: 5px; min-width: 150px; display: inline-block;">${formData.date}</span>
        </div>
        
        <div style="margin-bottom: 20px;">
          <div style="display: flex; margin-bottom: 15px;">
            <span style="width: 150px; font-weight: bold;">PATIENT NAME:</span>
            <span style="border-bottom: 1px solid #333; flex: 1; padding-left: 5px; margin-right: 20px;">${formData.patientName}</span>
            <span style="font-weight: bold;">CMH NO:</span>
            <span style="border-bottom: 1px solid #333; width: 150px; text-align: center; margin-left: 10px;">${formData.cmhNumber}</span>
          </div>
          
          <div style="display: flex; margin-bottom: 15px;">
            <span style="width: 150px; font-weight: bold;">PHONE NUMBER:</span>
            <span style="border-bottom: 1px solid #333; width: 150px; text-align: center; margin-right: 20px;">${formData.phoneNumber}</span>
            <span style="font-weight: bold;">AGE:</span>
            <span style="border-bottom: 1px solid #333; width: 80px; text-align: center; margin-left: 10px; margin-right: 20px;">${formData.age}</span>
            <span style="font-weight: bold;">SEX:</span>
            <span style="border-bottom: 1px solid #333; width: 80px; text-align: center; margin-left: 10px;">${formData.sex}</span>
          </div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <div style="font-weight: bold; margin-bottom: 5px;">Brief History:</div>
          <div style="border: 1px solid #333; min-height: 80px; padding: 8px; white-space: pre-wrap;">${formData.briefHistory}</div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <div style="font-weight: bold; margin-bottom: 5px;">Investigations:</div>
          <div style="border: 1px solid #333; min-height: 60px; padding: 8px; white-space: pre-wrap;">${formData.investigations}</div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <div style="font-weight: bold; margin-bottom: 5px;">Treatment:</div>
          <div style="border: 1px solid #333; min-height: 60px; padding: 8px; white-space: pre-wrap;">${formData.treatment}</div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <div style="font-weight: bold; margin-bottom: 5px;">Diagnosis:</div>
          <div style="border: 1px solid #333; min-height: 60px; padding: 8px; white-space: pre-wrap;">${formData.diagnosis}</div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <div style="font-weight: bold; margin-bottom: 5px;">Referred to:</div>
          <div style="border: 1px solid #333; min-height: 40px; padding: 8px; white-space: pre-wrap;">${formData.referredTo}</div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <div style="font-weight: bold; margin-bottom: 5px;">Reason for referral:</div>
          <div style="border: 1px solid #333; min-height: 60px; padding: 8px; white-space: pre-wrap;">${formData.reasonForReferral}</div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <div style="display: flex; align-items: center; margin-bottom: 15px;">
            <span style="font-weight: bold; margin-right: 10px;">Referred by:</span>
            <span style="border-bottom: 1px solid #333; flex: 1; padding: 5px;">${formData.referredBy}</span>
            <span style="font-weight: bold; margin-left: 20px; margin-right: 10px;">Signature:</span>
            <span style="border-bottom: 1px solid #333; width: 200px; padding: 5px;"></span>
          </div>
        </div>
        
        <div style="margin-bottom: 30px;">
          <div style="font-weight: bold; margin-bottom: 5px;">Additional Comments:</div>
          <div style="border: 1px solid #333; min-height: 60px; padding: 8px; white-space: pre-wrap;">${formData.additionalComments}</div>
        </div>
      </div>
    `;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="cmhNumber">CMH Number</Label>
          <Input
            id="cmhNumber"
            value={formData.cmhNumber}
            onChange={(e) => handleInputChange('cmhNumber', e.target.value)}
            placeholder="Enter CMH number"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="patientName">Patient Name</Label>
        <Input
          id="patientName"
          value={formData.patientName}
          onChange={(e) => handleInputChange('patientName', e.target.value)}
          placeholder="Enter patient name"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            placeholder="Enter phone number"
          />
        </div>
        <div>
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            value={formData.age}
            onChange={(e) => handleInputChange('age', e.target.value)}
            placeholder="Enter age"
          />
        </div>
        <div>
          <Label htmlFor="sex">Sex</Label>
          <Input
            id="sex"
            value={formData.sex}
            onChange={(e) => handleInputChange('sex', e.target.value)}
            placeholder="Enter sex"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="briefHistory">Brief History</Label>
        <Textarea
          id="briefHistory"
          value={formData.briefHistory}
          onChange={(e) => handleInputChange('briefHistory', e.target.value)}
          placeholder="Enter brief history"
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="investigations">Investigations</Label>
        <Textarea
          id="investigations"
          value={formData.investigations}
          onChange={(e) => handleInputChange('investigations', e.target.value)}
          placeholder="Enter investigations"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="treatment">Treatment</Label>
        <Textarea
          id="treatment"
          value={formData.treatment}
          onChange={(e) => handleInputChange('treatment', e.target.value)}
          placeholder="Enter treatment"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="diagnosis">Diagnosis</Label>
        <Textarea
          id="diagnosis"
          value={formData.diagnosis}
          onChange={(e) => handleInputChange('diagnosis', e.target.value)}
          placeholder="Enter diagnosis"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="referredTo">Referred To</Label>
        <Input
          id="referredTo"
          value={formData.referredTo}
          onChange={(e) => handleInputChange('referredTo', e.target.value)}
          placeholder="Enter facility/doctor being referred to"
        />
      </div>

      <div>
        <Label htmlFor="reasonForReferral">Reason for Referral</Label>
        <Textarea
          id="reasonForReferral"
          value={formData.reasonForReferral}
          onChange={(e) => handleInputChange('reasonForReferral', e.target.value)}
          placeholder="Enter reason for referral"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="referredBy">Referred By</Label>
        <Input
          id="referredBy"
          value={formData.referredBy}
          onChange={(e) => handleInputChange('referredBy', e.target.value)}
          placeholder="Enter referring doctor's name"
        />
      </div>

      <div>
        <Label htmlFor="additionalComments">Additional Comments</Label>
        <Textarea
          id="additionalComments"
          value={formData.additionalComments}
          onChange={(e) => handleInputChange('additionalComments', e.target.value)}
          placeholder="Enter additional comments"
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" />
          Print
        </Button>
        <Button onClick={handleDownload} className="bg-orange-600 hover:bg-orange-700">
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
      </div>
    </div>
  );
}

// Lab Request Form Component
function LabRequestForm() {
  const [formData, setFormData] = useState({
    patientName: "",
    age: "",
    sex: "",
    residence: "",
    ipOpNumber: "",
    reportTo: "",
    specimen: "",
    collectionDateTime: new Date().toISOString().slice(0, 16),
    labNumber: "",
    investigationRequested: "",
    history: "",
    diagnosis: "",
    requestingClinician: "",
    date: new Date().toISOString().split('T')[0],
    // Specimen destination checkboxes
    bloodBank: false,
    histology: false,
    bacteriology: false,
    serology: false,
    parasitology: false,
    hematology: false,
    biochemistry: false,
    others: "",
    otherSpecify: ""
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(generateLabRequestHTML());
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownload = () => {
    const pdfWindow = window.open('', '_blank');
    if (pdfWindow) {
      pdfWindow.document.write(`
        <html>
          <head>
            <title>Lab Request Form - ${formData.patientName}</title>
            <style>body { margin: 0; font-family: Arial, sans-serif; }</style>
          </head>
          <body>
            ${generateLabRequestHTML()}
            <script>window.onload = function() { window.print(); }</script>
          </body>
        </html>
      `);
      pdfWindow.document.close();
    }
  };

  const generateLabRequestHTML = () => {
    return `
      <div style="max-width: 800px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #4CAF50; padding-bottom: 15px;">
          <h1 style="color: #4CAF50; margin: 0; font-size: 24px; font-weight: bold;">CHILD MENTAL HAVEN</h1>
          <p style="color: #333; margin: 2px 0; font-size: 14px; font-weight: bold;">COMPREHENSIVE MENTAL HEALTH / REHABILITATION</p>
          <div style="font-size: 12px; color: #666; margin-top: 8px; line-height: 1.4;">
            <div>Muchai Drive Off Ngong Road</div>
            <div>P.O Box 41622-00100</div>
            <div>Phone: +254 746 170 159</div>
            <div>Email: info@childmentalhaven.org</div>
          </div>
        </div>
        
        <div style="text-align: center; margin-bottom: 25px;">
          <h2 style="color: #333; margin: 0; font-size: 18px; text-decoration: underline;">LABORATORY REQUEST AND REPORT FORM</h2>
        </div>
        
        <div style="font-weight: bold; margin-bottom: 15px; color: red;">
          NOTE: Incompletely filled forms will not be processed
        </div>
        
        <div style="display: flex; gap: 30px; margin-bottom: 20px;">
          <!-- Patient Details -->
          <div style="flex: 2;">
            <h3 style="font-weight: bold; margin-bottom: 10px; text-decoration: underline;">I. Patient Details</h3>
            <div style="margin-bottom: 8px;">
              <span style="font-weight: bold;">Name: </span>
              <span style="border-bottom: 1px solid #333; display: inline-block; min-width: 250px; padding: 2px;">${formData.patientName}</span>
            </div>
            <div style="margin-bottom: 8px;">
              <span style="font-weight: bold;">Age: (yrs/months) </span>
              <span style="border-bottom: 1px solid #333; display: inline-block; min-width: 100px; padding: 2px;">${formData.age}</span>
            </div>
            <div style="margin-bottom: 8px;">
              <span style="font-weight: bold;">Sex: </span>
              <span style="margin-right: 20px;">M ${formData.sex.toLowerCase() === 'male' ? '☑' : '☐'}</span>
              <span>F ${formData.sex.toLowerCase() === 'female' ? '☑' : '☐'}</span>
            </div>
            <div style="margin-bottom: 8px;">
              <span style="font-weight: bold;">Residence/Village: </span>
              <span style="border-bottom: 1px solid #333; display: inline-block; min-width: 200px; padding: 2px;">${formData.residence}</span>
            </div>
            <div style="margin-bottom: 8px;">
              <span style="font-weight: bold;">IP/OP No: </span>
              <span style="border-bottom: 1px solid #333; display: inline-block; min-width: 150px; padding: 2px;">${formData.ipOpNumber}</span>
            </div>
            <div style="margin-bottom: 8px;">
              <span style="font-weight: bold;">Report to (specify clinic/ward/clinician): </span>
              <span style="border-bottom: 1px solid #333; display: inline-block; min-width: 200px; padding: 2px;">${formData.reportTo}</span>
            </div>
          </div>
          
          <!-- Specimen Destination -->
          <div style="flex: 1;">
            <h3 style="font-weight: bold; margin-bottom: 10px; text-decoration: underline;">II. Specimen Destination</h3>
            <p style="font-weight: bold; margin-bottom: 8px;">Tick appropriate box</p>
            <div style="margin-bottom: 4px;">${formData.bloodBank ? '☑' : '☐'} Blood bank</div>
            <div style="margin-bottom: 4px;">${formData.histology ? '☑' : '☐'} Histology/cytology</div>
            <div style="margin-bottom: 4px;">${formData.bacteriology ? '☑' : '☐'} Bacteriology</div>
            <div style="margin-bottom: 4px;">${formData.serology ? '☑' : '☐'} Serology</div>
            <div style="margin-bottom: 4px;">${formData.parasitology ? '☑' : '☐'} Parasitology</div>
            <div style="margin-bottom: 4px;">${formData.hematology ? '☑' : '☐'} Hematology/CD4</div>
            <div style="margin-bottom: 4px;">${formData.biochemistry ? '☑' : '☐'} Biochemistry</div>
            <div style="margin-bottom: 4px;">
              Others(specify)
              <div style="border-bottom: 1px solid #333; min-height: 20px; padding: 2px; margin-top: 4px;">${formData.otherSpecify}</div>
            </div>
          </div>
        </div>
        
        <div style="margin-bottom: 15px;">
          <span style="font-weight: bold;">II. Specimen: </span>
          <span style="border-bottom: 1px solid #333; display: inline-block; min-width: 200px; padding: 2px;">${formData.specimen}</span>
        </div>
        
        <div style="margin-bottom: 15px;">
          <span style="font-weight: bold;">III. Collection date/time: </span>
          <span style="border-bottom: 1px solid #333; display: inline-block; min-width: 200px; padding: 2px;">${formData.collectionDateTime}</span>
        </div>
        
        <div style="margin-bottom: 15px;">
          <span style="font-weight: bold;">IV. Lab. No: </span>
          <span style="border-bottom: 1px solid #333; display: inline-block; min-width: 200px; padding: 2px;">${formData.labNumber}</span>
        </div>
        
        <div style="margin-bottom: 20px;">
          <div style="font-weight: bold; margin-bottom: 5px;">V. Investigation requested:</div>
          <div style="border: 1px solid #333; min-height: 80px; padding: 8px; white-space: pre-wrap;">${formData.investigationRequested}</div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <div style="font-weight: bold; margin-bottom: 5px;">VI. History (including drugs used):</div>
          <div style="border: 1px solid #333; min-height: 60px; padding: 8px; white-space: pre-wrap;">${formData.history}</div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <div style="font-weight: bold; margin-bottom: 5px;">VII. Diagnosis:</div>
          <div style="border-bottom: 1px solid #333; min-height: 30px; padding: 8px;">${formData.diagnosis}</div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <div style="font-weight: bold; margin-bottom: 5px;">VIII. Requesting Clinician's Name:</div>
          <div style="border-bottom: 1px solid #333; min-height: 30px; padding: 8px;">${formData.requestingClinician}</div>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
          <div>
            <span style="font-weight: bold;">Signature: </span>
            <span style="border-bottom: 1px solid #333; display: inline-block; min-width: 200px; padding: 5px;"></span>
          </div>
          <div>
            <span style="font-weight: bold;">Date: </span>
            <span style="border-bottom: 1px solid #333; display: inline-block; min-width: 150px; padding: 5px;">${formData.date}</span>
          </div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <div style="font-weight: bold; margin-bottom: 5px;">IX. Report (including macroscopic examination):</div>
          <div style="border: 1px solid #333; min-height: 100px; padding: 8px;"></div>
        </div>
        
        <div style="display: flex; justify-content: space-between;">
          <div>
            <div style="margin-bottom: 10px;">
              <span style="font-weight: bold;">Test done by (initial): </span>
              <span style="border-bottom: 1px solid #333; display: inline-block; min-width: 100px; padding: 2px;"></span>
              <span style="margin-left: 20px; font-weight: bold;">Sign: </span>
              <span style="border-bottom: 1px solid #333; display: inline-block; min-width: 100px; padding: 2px;"></span>
              <span style="margin-left: 20px; font-weight: bold;">Date: </span>
              <span style="border-bottom: 1px solid #333; display: inline-block; min-width: 100px; padding: 2px;"></span>
            </div>
            <div>
              <span style="font-weight: bold;">Approved by (initial): </span>
              <span style="border-bottom: 1px solid #333; display: inline-block; min-width: 100px; padding: 2px;"></span>
              <span style="margin-left: 20px; font-weight: bold;">Sign: </span>
              <span style="border-bottom: 1px solid #333; display: inline-block; min-width: 100px; padding: 2px;"></span>
              <span style="margin-left: 20px; font-weight: bold;">Date: </span>
              <span style="border-bottom: 1px solid #333; display: inline-block; min-width: 100px; padding: 2px;"></span>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="patientName">Patient Name</Label>
          <Input
            id="patientName"
            value={formData.patientName}
            onChange={(e) => handleInputChange('patientName', e.target.value)}
            placeholder="Enter patient name"
          />
        </div>
        <div>
          <Label htmlFor="age">Age (years/months)</Label>
          <Input
            id="age"
            value={formData.age}
            onChange={(e) => handleInputChange('age', e.target.value)}
            placeholder="Enter age"
          />
        </div>
        <div>
          <Label htmlFor="sex">Sex</Label>
          <Input
            id="sex"
            value={formData.sex}
            onChange={(e) => handleInputChange('sex', e.target.value)}
            placeholder="Male/Female"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="residence">Residence/Village</Label>
          <Input
            id="residence"
            value={formData.residence}
            onChange={(e) => handleInputChange('residence', e.target.value)}
            placeholder="Enter residence"
          />
        </div>
        <div>
          <Label htmlFor="ipOpNumber">IP/OP Number</Label>
          <Input
            id="ipOpNumber"
            value={formData.ipOpNumber}
            onChange={(e) => handleInputChange('ipOpNumber', e.target.value)}
            placeholder="Enter IP/OP number"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="reportTo">Report To (clinic/ward/clinician)</Label>
          <Input
            id="reportTo"
            value={formData.reportTo}
            onChange={(e) => handleInputChange('reportTo', e.target.value)}
            placeholder="Specify clinic/ward/clinician"
          />
        </div>
        <div>
          <Label htmlFor="specimen">Specimen</Label>
          <Input
            id="specimen"
            value={formData.specimen}
            onChange={(e) => handleInputChange('specimen', e.target.value)}
            placeholder="Enter specimen type"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="collectionDateTime">Collection Date/Time</Label>
          <Input
            id="collectionDateTime"
            type="datetime-local"
            value={formData.collectionDateTime}
            onChange={(e) => handleInputChange('collectionDateTime', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="labNumber">Lab Number</Label>
          <Input
            id="labNumber"
            value={formData.labNumber}
            onChange={(e) => handleInputChange('labNumber', e.target.value)}
            placeholder="Enter lab number"
          />
        </div>
      </div>

      <div>
        <Label>Specimen Destination (Tick appropriate boxes)</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.bloodBank}
              onChange={(e) => handleInputChange('bloodBank', e.target.checked)}
            />
            <span>Blood bank</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.histology}
              onChange={(e) => handleInputChange('histology', e.target.checked)}
            />
            <span>Histology/cytology</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.bacteriology}
              onChange={(e) => handleInputChange('bacteriology', e.target.checked)}
            />
            <span>Bacteriology</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.serology}
              onChange={(e) => handleInputChange('serology', e.target.checked)}
            />
            <span>Serology</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.parasitology}
              onChange={(e) => handleInputChange('parasitology', e.target.checked)}
            />
            <span>Parasitology</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.hematology}
              onChange={(e) => handleInputChange('hematology', e.target.checked)}
            />
            <span>Hematology/CD4</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.biochemistry}
              onChange={(e) => handleInputChange('biochemistry', e.target.checked)}
            />
            <span>Biochemistry</span>
          </label>
        </div>
        <div className="mt-2">
          <Label htmlFor="otherSpecify">Others (specify)</Label>
          <Input
            id="otherSpecify"
            value={formData.otherSpecify}
            onChange={(e) => handleInputChange('otherSpecify', e.target.value)}
            placeholder="Specify other destination"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="investigationRequested">Investigation Requested</Label>
        <Textarea
          id="investigationRequested"
          value={formData.investigationRequested}
          onChange={(e) => handleInputChange('investigationRequested', e.target.value)}
          placeholder="Enter investigation requested"
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="history">History (including drugs used)</Label>
        <Textarea
          id="history"
          value={formData.history}
          onChange={(e) => handleInputChange('history', e.target.value)}
          placeholder="Enter patient history including drugs used"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="diagnosis">Diagnosis</Label>
        <Input
          id="diagnosis"
          value={formData.diagnosis}
          onChange={(e) => handleInputChange('diagnosis', e.target.value)}
          placeholder="Enter diagnosis"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="requestingClinician">Requesting Clinician's Name</Label>
          <Input
            id="requestingClinician"
            value={formData.requestingClinician}
            onChange={(e) => handleInputChange('requestingClinician', e.target.value)}
            placeholder="Enter requesting clinician's name"
          />
        </div>
        <div>
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" />
          Print
        </Button>
        <Button onClick={handleDownload} className="bg-purple-600 hover:bg-purple-700">
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
      </div>
    </div>
  );
}