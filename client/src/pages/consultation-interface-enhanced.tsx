import React, { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  User,
  Activity,
  FileText,
  Clock,
  Send,
  UserPlus,
  TestTube,
  Pill,
  Save,
  Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDateTime } from "@/lib/utils";
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

export default function ConsultationInterface() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [consultation, setConsultation] = useState<ConsultationNotes>({
    patientId: parseInt(params?.patientId || "0"),
    consultationDate: new Date().toISOString().split('T')[0],
    consultationTime: new Date().toLocaleTimeString('en-GB', { hour12: false }).slice(0, 5),
    chiefComplaint: "",
    historyOfPresentIllness: "",
    pastMedicalHistory: "",
    physicalExamination: "",
    assessment: "",
    treatment: "",
    prescription: "",
    followUp: "",
    doctor: "Dr. Smith",
    recordedAt: new Date().toISOString()
  });

  const { data: patients = [] } = useQuery({
    queryKey: ["/api/patients"],
  });

  const patient = patients.find((p: Patient) => p.id === parseInt(params?.patientId || "0"));

  // Get patient's vital signs from localStorage
  const getPatientVitals = (patientId: number) => {
    try {
      const vitalsData = JSON.parse(localStorage.getItem('patientVitals') || '[]');
      return vitalsData.find((vital: any) => vital.patientId === patientId);
    } catch {
      return null;
    }
  };

  const vitals = patient ? getPatientVitals(patient.id) : null;

  const saveConsultationMutation = useMutation({
    mutationFn: async (consultationData: ConsultationNotes) => {
      const response = await fetch("/api/consultations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(consultationData),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Consultation notes saved successfully",
      });
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

  const handleSaveConsultation = () => {
    if (!patient) return;
    saveConsultationMutation.mutate(consultation);
  };

  if (!patient) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Patient Not Found</h1>
          <Button onClick={() => setLocation("/outpatient")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Outpatient Consultation
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button onClick={() => setLocation("/outpatient")} variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Patient Consultation</h1>
            <p className="text-gray-600">Comprehensive consultation workspace for {patient.firstName} {patient.lastName}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Information Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Patient Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div><strong>Name:</strong> {patient.firstName} {patient.lastName}</div>
                <div><strong>ID:</strong> {patient.patientId}</div>
                <div><strong>Age:</strong> {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} years</div>
                <div><strong>Gender:</strong> {patient.gender}</div>
                <div><strong>Phone:</strong> {patient.phone}</div>
                <div><strong>Address:</strong> {patient.address}</div>
                {patient.emergencyContactName && (
                  <div><strong>Emergency Contact:</strong> {patient.emergencyContactName} ({patient.emergencyContactPhone})</div>
                )}
              </div>

              {/* Triage Results */}
              {vitals && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center space-x-2">
                    <Activity className="w-4 h-4" />
                    <span>Triage Assessment</span>
                  </h4>
                  <div className="bg-blue-50 p-4 rounded-lg text-sm space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div><strong>Height:</strong> {vitals.height} cm</div>
                      <div><strong>Weight:</strong> {vitals.weight} kg</div>
                      <div><strong>BMI:</strong> {vitals.bmi}</div>
                      <div><strong>Temperature:</strong> {vitals.temperature}°C</div>
                      <div><strong>BP:</strong> {vitals.bloodPressureSystolic}/{vitals.bloodPressureDiastolic}</div>
                      <div><strong>Heart Rate:</strong> {vitals.heartRate} bpm</div>
                      <div><strong>Resp Rate:</strong> {vitals.respirationRate}</div>
                      <div><strong>O2 Sat:</strong> {vitals.oxygenSaturation}%</div>
                    </div>
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                      <div className="text-green-800 font-medium">✓ Triage Complete</div>
                      <div className="text-green-700 text-xs">Assessed by {vitals.clinician}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Medical Action Buttons */}
              <div className="space-y-3">
                <h4 className="font-medium">Medical Actions</h4>
                <div className="grid grid-cols-1 gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="justify-start h-auto p-3">
                        <FileText className="w-4 h-4 mr-2" />
                        <div className="text-left">
                          <div className="font-medium">Clinical Summary</div>
                          <div className="text-xs text-gray-500">Outpatient notes</div>
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
                      <Button variant="outline" className="justify-start h-auto p-3">
                        <UserPlus className="w-4 h-4 mr-2" />
                        <div className="text-left">
                          <div className="font-medium">Medical Report</div>
                          <div className="text-xs text-gray-500">Admit patient</div>
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
                      <Button variant="outline" className="justify-start h-auto p-3">
                        <Send className="w-4 h-4 mr-2" />
                        <div className="text-left">
                          <div className="font-medium">Referral Out</div>
                          <div className="text-xs text-gray-500">Refer to facility</div>
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
                      <Button variant="outline" className="justify-start h-auto p-3">
                        <TestTube className="w-4 h-4 mr-2" />
                        <div className="text-left">
                          <div className="font-medium">Laboratory</div>
                          <div className="text-xs text-gray-500">Lab request</div>
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
                      <Button variant="outline" className="justify-start h-auto p-3">
                        <Pill className="w-4 h-4 mr-2" />
                        <div className="text-left">
                          <div className="font-medium">Prescription</div>
                          <div className="text-xs text-gray-500">Medication orders</div>
                        </div>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Prescription Form</DialogTitle>
                      </DialogHeader>
                      <div className="p-4 text-center text-gray-500">
                        Prescription functionality coming soon
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Consultation Form Panel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Consultation Notes</span>
              </CardTitle>
              <CardDescription>
                Record detailed consultation information for {patient.firstName} {patient.lastName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                  placeholder="Detailed description of current illness..."
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
                <Label htmlFor="followUp">Follow-up Instructions</Label>
                <Textarea
                  id="followUp"
                  placeholder="Follow-up care instructions..."
                  value={consultation.followUp}
                  onChange={(e) => setConsultation(prev => ({ ...prev, followUp: e.target.value }))}
                  rows={2}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setLocation("/outpatient")}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveConsultation}
                  disabled={saveConsultationMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="w-4 h-4 mr-1" />
                  Save Consultation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Clinical Summary Form
function ClinicalSummaryForm() {
  const [formData, setFormData] = useState({
    patientName: "",
    patientId: "",
    consultationDate: new Date().toISOString().split('T')[0],
    consultationTime: new Date().toLocaleTimeString('en-GB', { hour12: false }).slice(0, 5),
    chiefComplaint: "",
    historyOfPresentIllness: "",
    physicalExamination: "",
    assessment: "",
    treatmentPlan: "",
    doctorName: "Dr. Smith"
  });

  const handlePrint = () => {
    const printContent = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0066cc; padding-bottom: 20px;">
          <h1 style="color: #0066cc; margin: 0; font-size: 28px;">CHILD MENTAL HAVEN</h1>
          <p style="margin: 5px 0; color: #666; font-size: 16px;">Where Young Minds Evolve</p>
          <p style="margin: 0; font-size: 14px;">Muchai Drive Off Ngong Road | P.O Box 41622-00100</p>
          <p style="margin: 0; font-size: 14px;">Tel: 254746170159 | Email: info@childmentalhaven.org</p>
        </div>
        
        <h2 style="color: #0066cc; border-bottom: 1px solid #ccc; padding-bottom: 10px;">CLINICAL SUMMARY - OUTPATIENT</h2>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
          <div>
            <p><strong>Patient Name:</strong> ${formData.patientName}</p>
            <p><strong>Patient ID:</strong> ${formData.patientId}</p>
            <p><strong>Date:</strong> ${formData.consultationDate}</p>
          </div>
          <div>
            <p><strong>Time:</strong> ${formData.consultationTime}</p>
            <p><strong>Doctor:</strong> ${formData.doctorName}</p>
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #0066cc;">Chief Complaint</h3>
          <p style="border: 1px solid #ddd; padding: 10px; min-height: 60px;">${formData.chiefComplaint}</p>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #0066cc;">History of Present Illness</h3>
          <p style="border: 1px solid #ddd; padding: 10px; min-height: 80px;">${formData.historyOfPresentIllness}</p>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #0066cc;">Physical Examination</h3>
          <p style="border: 1px solid #ddd; padding: 10px; min-height: 80px;">${formData.physicalExamination}</p>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #0066cc;">Assessment & Diagnosis</h3>
          <p style="border: 1px solid #ddd; padding: 10px; min-height: 60px;">${formData.assessment}</p>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #0066cc;">Treatment Plan</h3>
          <p style="border: 1px solid #ddd; padding: 10px; min-height: 80px;">${formData.treatmentPlan}</p>
        </div>

        <div style="margin-top: 40px; text-align: right;">
          <p><strong>Doctor's Signature:</strong> _________________________</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
      </div>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow!.document.write(printContent);
    printWindow!.document.close();
    printWindow!.print();
  };

  const handleDownload = () => {
    const content = `CHILD MENTAL HAVEN - CLINICAL SUMMARY

Patient: ${formData.patientName}
ID: ${formData.patientId}
Date: ${formData.consultationDate}

CHIEF COMPLAINT:
${formData.chiefComplaint}

HISTORY OF PRESENT ILLNESS:
${formData.historyOfPresentIllness}

PHYSICAL EXAMINATION:
${formData.physicalExamination}

ASSESSMENT & DIAGNOSIS:
${formData.assessment}

TREATMENT PLAN:
${formData.treatmentPlan}

Doctor: ${formData.doctorName}
Date: ${new Date().toLocaleDateString()}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clinical-summary-${formData.patientId}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Clinical Summary - Outpatient</h3>
        <div className="flex space-x-2">
          <Button onClick={handlePrint} variant="outline" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button onClick={handleDownload} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="patientName">Patient Name</Label>
          <Input
            id="patientName"
            value={formData.patientName}
            onChange={(e) => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
            placeholder="Enter patient name"
          />
        </div>
        <div>
          <Label htmlFor="patientId">Patient ID</Label>
          <Input
            id="patientId"
            value={formData.patientId}
            onChange={(e) => setFormData(prev => ({ ...prev, patientId: e.target.value }))}
            placeholder="Enter patient ID"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="chiefComplaint">Chief Complaint</Label>
        <Textarea
          id="chiefComplaint"
          value={formData.chiefComplaint}
          onChange={(e) => setFormData(prev => ({ ...prev, chiefComplaint: e.target.value }))}
          placeholder="Patient's main concern or reason for visit..."
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="historyOfPresentIllness">History of Present Illness</Label>
        <Textarea
          id="historyOfPresentIllness"
          value={formData.historyOfPresentIllness}
          onChange={(e) => setFormData(prev => ({ ...prev, historyOfPresentIllness: e.target.value }))}
          placeholder="Detailed description of current illness..."
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="physicalExamination">Physical Examination</Label>
        <Textarea
          id="physicalExamination"
          value={formData.physicalExamination}
          onChange={(e) => setFormData(prev => ({ ...prev, physicalExamination: e.target.value }))}
          placeholder="Physical examination findings..."
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="assessment">Assessment & Diagnosis</Label>
        <Textarea
          id="assessment"
          value={formData.assessment}
          onChange={(e) => setFormData(prev => ({ ...prev, assessment: e.target.value }))}
          placeholder="Clinical assessment and diagnosis..."
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="treatmentPlan">Treatment Plan</Label>
        <Textarea
          id="treatmentPlan"
          value={formData.treatmentPlan}
          onChange={(e) => setFormData(prev => ({ ...prev, treatmentPlan: e.target.value }))}
          placeholder="Treatment recommendations and plan..."
          rows={4}
        />
      </div>
    </div>
  );
}

// Medical Report Form - Enhanced Admission Form
function MedicalReportForm() {
  const [formData, setFormData] = useState({
    patientName: "",
    patientId: "",
    modeOfAdmission: "",
    allegation: "",
    patientReaction: "",
    onset: "",
    duration: "",
    department: "",
    ward: "",
    bed: "",
    dailyCharges: "",
    dateOfAdmission: new Date().toISOString().slice(0, 16), // datetime-local format
    admittingDoctor: "Dr. Smith",
    reasonForAdmission: "",
    clinicalFindings: "",
    provisionalDiagnosis: "",
    treatmentPlan: "",
    patientPhoto: null
  });

  const handlePrint = () => {
    const printContent = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0066cc; padding-bottom: 20px;">
          <h1 style="color: #0066cc; margin: 0; font-size: 28px;">CHILD MENTAL HAVEN</h1>
          <p style="margin: 5px 0; color: #666; font-size: 16px;">Where Young Minds Evolve</p>
          <p style="margin: 0; font-size: 14px;">Muchai Drive Off Ngong Road | P.O Box 41622-00100</p>
          <p style="margin: 0; font-size: 14px;">Tel: 254746170159 | Email: info@childmentalhaven.org</p>
        </div>
        
        <h2 style="color: #0066cc; border-bottom: 1px solid #ccc; padding-bottom: 10px;">PATIENT ADMISSION FORM</h2>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
          <div>
            <p><strong>Patient Name:</strong> ${formData.patientName}</p>
            <p><strong>Patient ID:</strong> ${formData.patientId}</p>
            <p><strong>Mode of Admission:</strong> ${formData.modeOfAdmission}</p>
            <p><strong>Allegation:</strong> ${formData.allegation}</p>
            <p><strong>Patient Reaction:</strong> ${formData.patientReaction}</p>
            <p><strong>Onset:</strong> ${formData.onset}</p>
            <p><strong>Duration:</strong> ${formData.duration}</p>
          </div>
          <div>
            <p><strong>Department:</strong> ${formData.department}</p>
            <p><strong>Ward:</strong> ${formData.ward}</p>
            <p><strong>Bed:</strong> ${formData.bed}</p>
            <p><strong>Daily Charges:</strong> ${formData.dailyCharges}</p>
            <p><strong>Date of Admission:</strong> ${formData.dateOfAdmission}</p>
            <p><strong>Admitting Doctor:</strong> ${formData.admittingDoctor}</p>
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #0066cc;">Reason for Admission</h3>
          <p style="border: 1px solid #ddd; padding: 10px; min-height: 60px;">${formData.reasonForAdmission}</p>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #0066cc;">Clinical Findings</h3>
          <p style="border: 1px solid #ddd; padding: 10px; min-height: 80px;">${formData.clinicalFindings}</p>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #0066cc;">Provisional Diagnosis</h3>
          <p style="border: 1px solid #ddd; padding: 10px; min-height: 60px;">${formData.provisionalDiagnosis}</p>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #0066cc;">Treatment Plan</h3>
          <p style="border: 1px solid #ddd; padding: 10px; min-height: 80px;">${formData.treatmentPlan}</p>
        </div>

        <div style="margin-top: 40px; text-align: right;">
          <p><strong>Doctor's Signature:</strong> _________________________</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
      </div>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow!.document.write(printContent);
    printWindow!.document.close();
    printWindow!.print();
  };

  const handleDownload = () => {
    const content = `CHILD MENTAL HAVEN - MEDICAL REPORT (ADMISSION)

Patient: ${formData.patientName}
ID: ${formData.patientId}
Admission Date: ${formData.admissionDate}

REASON FOR ADMISSION:
${formData.reasonForAdmission}

CLINICAL FINDINGS:
${formData.clinicalFindings}

PROVISIONAL DIAGNOSIS:
${formData.provisionalDiagnosis}

TREATMENT PLAN:
${formData.treatmentPlan}

Admitting Doctor: ${formData.admittingDoctor}
Date: ${new Date().toLocaleDateString()}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medical-report-${formData.patientId}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Patient Admission Form</h3>
        <div className="flex space-x-2">
          <Button onClick={handlePrint} variant="outline" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button onClick={handleDownload} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="patientName">Patient Name</Label>
            <Input
              id="patientName"
              value={formData.patientName}
              onChange={(e) => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
              placeholder="Enter patient name"
            />
          </div>

          <div>
            <Label htmlFor="modeOfAdmission">Mode of Admission</Label>
            <select
              id="modeOfAdmission"
              value={formData.modeOfAdmission}
              onChange={(e) => setFormData(prev => ({ ...prev, modeOfAdmission: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Select mode of admission</option>
              <option value="emergency">Emergency</option>
              <option value="elective">Elective</option>
              <option value="urgent">Urgent</option>
              <option value="routine">Routine</option>
            </select>
          </div>

          <div>
            <Label htmlFor="allegation">Allegation</Label>
            <Input
              id="allegation"
              value={formData.allegation}
              onChange={(e) => setFormData(prev => ({ ...prev, allegation: e.target.value }))}
              placeholder="Enter allegation"
            />
          </div>

          <div>
            <Label htmlFor="patientReaction">Patient Reaction</Label>
            <select
              id="patientReaction"
              value={formData.patientReaction}
              onChange={(e) => setFormData(prev => ({ ...prev, patientReaction: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Select patient reaction</option>
              <option value="cooperative">Cooperative</option>
              <option value="agitated">Agitated</option>
              <option value="withdrawn">Withdrawn</option>
              <option value="confused">Confused</option>
              <option value="combative">Combative</option>
            </select>
          </div>

          <div>
            <Label htmlFor="onset">Onset</Label>
            <select
              id="onset"
              value={formData.onset}
              onChange={(e) => setFormData(prev => ({ ...prev, onset: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Select onset</option>
              <option value="sudden">Sudden</option>
              <option value="gradual">Gradual</option>
              <option value="acute">Acute</option>
              <option value="chronic">Chronic</option>
            </select>
          </div>

          <div>
            <Label htmlFor="duration">Duration</Label>
            <Input
              id="duration"
              value={formData.duration}
              onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
              placeholder="e.g., 2 weeks, 3 months"
            />
          </div>
        </div>

        {/* Middle Column */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="department">Department</Label>
            <select
              id="department"
              value={formData.department}
              onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Select department</option>
              <option value="psychiatry">Psychiatry</option>
              <option value="psychology">Psychology</option>
              <option value="pediatric-mental-health">Pediatric Mental Health</option>
              <option value="adolescent-services">Adolescent Services</option>
              <option value="crisis-intervention">Crisis Intervention</option>
            </select>
          </div>

          <div>
            <Label htmlFor="ward">Ward</Label>
            <select
              id="ward"
              value={formData.ward}
              onChange={(e) => setFormData(prev => ({ ...prev, ward: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Select ward</option>
              <option value="general-ward">General Ward</option>
              <option value="intensive-care">Intensive Care</option>
              <option value="secure-unit">Secure Unit</option>
              <option value="adolescent-unit">Adolescent Unit</option>
              <option value="family-unit">Family Unit</option>
            </select>
          </div>

          <div>
            <Label htmlFor="bed">Bed</Label>
            <select
              id="bed"
              value={formData.bed}
              onChange={(e) => setFormData(prev => ({ ...prev, bed: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Select bed</option>
              <option value="bed-1">Bed 1</option>
              <option value="bed-2">Bed 2</option>
              <option value="bed-3">Bed 3</option>
              <option value="bed-4">Bed 4</option>
              <option value="bed-5">Bed 5</option>
              <option value="private-room">Private Room</option>
            </select>
          </div>

          <div>
            <Label htmlFor="dailyCharges">Daily Charges (KShs)</Label>
            <Input
              id="dailyCharges"
              value={formData.dailyCharges}
              onChange={(e) => setFormData(prev => ({ ...prev, dailyCharges: e.target.value }))}
              placeholder="Enter daily charges"
              type="number"
            />
          </div>

          <div>
            <Label htmlFor="dateOfAdmission">Date of Admission</Label>
            <Input
              id="dateOfAdmission"
              type="datetime-local"
              value={formData.dateOfAdmission}
              onChange={(e) => setFormData(prev => ({ ...prev, dateOfAdmission: e.target.value }))}
            />
          </div>
        </div>

        {/* Right Column - Patient Photo and Additional Info */}
        <div className="space-y-4">
          <div className="text-center">
            <Label>Patient Photo</Label>
            <div className="mt-2 flex flex-col items-center">
              <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                {formData.patientPhoto ? (
                  <img src={formData.patientPhoto} alt="Patient" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <div className="text-gray-400 text-center">
                    <User className="w-12 h-12 mx-auto mb-2" />
                    <span className="text-sm">No Photo</span>
                  </div>
                )}
              </div>
              <Button variant="outline" size="sm">
                Upload Image
              </Button>
            </div>
          </div>

          <div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Save Admission Details
            </Button>
          </div>
        </div>
      </div>

      {/* Additional Medical Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-6 border-t">
        <div>
          <Label htmlFor="reasonForAdmission">Reason for Admission</Label>
          <Textarea
            id="reasonForAdmission"
            value={formData.reasonForAdmission}
            onChange={(e) => setFormData(prev => ({ ...prev, reasonForAdmission: e.target.value }))}
            placeholder="Enter reason for admission..."
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="clinicalFindings">Clinical Findings</Label>
          <Textarea
            id="clinicalFindings"
            value={formData.clinicalFindings}
            onChange={(e) => setFormData(prev => ({ ...prev, clinicalFindings: e.target.value }))}
            placeholder="Enter clinical findings..."
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="provisionalDiagnosis">Provisional Diagnosis</Label>
          <Textarea
            id="provisionalDiagnosis"
            value={formData.provisionalDiagnosis}
            onChange={(e) => setFormData(prev => ({ ...prev, provisionalDiagnosis: e.target.value }))}
            placeholder="Enter provisional diagnosis..."
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="treatmentPlan">Treatment Plan</Label>
          <Textarea
            id="treatmentPlan"
            value={formData.treatmentPlan}
            onChange={(e) => setFormData(prev => ({ ...prev, treatmentPlan: e.target.value }))}
            placeholder="Enter treatment plan..."
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}

// Referral Out Form
function ReferralOutForm() {
  const [formData, setFormData] = useState({
    patientName: "",
    patientId: "",
    referralDate: new Date().toISOString().split('T')[0],
    referringFacility: "Child Mental Haven",
    referringDoctor: "Dr. Smith",
    receivingFacility: "",
    receivingDoctor: "",
    reasonForReferral: "",
    clinicalSummary: "",
    investigationsCompleted: "",
    treatmentGiven: "",
    urgency: "routine"
  });

  const handlePrint = () => {
    const printContent = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0066cc; padding-bottom: 20px;">
          <h1 style="color: #0066cc; margin: 0; font-size: 28px;">CHILD MENTAL HAVEN</h1>
          <p style="margin: 5px 0; color: #666; font-size: 16px;">Where Young Minds Evolve</p>
          <p style="margin: 0; font-size: 14px;">Muchai Drive Off Ngong Road | P.O Box 41622-00100</p>
          <p style="margin: 0; font-size: 14px;">Tel: 254746170159 | Email: info@childmentalhaven.org</p>
        </div>
        
        <h2 style="color: #0066cc; border-bottom: 1px solid #ccc; padding-bottom: 10px;">REFERRAL OUT FORM</h2>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
          <div>
            <p><strong>Patient Name:</strong> ${formData.patientName}</p>
            <p><strong>Patient ID:</strong> ${formData.patientId}</p>
            <p><strong>Referral Date:</strong> ${formData.referralDate}</p>
            <p><strong>Urgency:</strong> ${formData.urgency.toUpperCase()}</p>
          </div>
          <div>
            <p><strong>From:</strong> ${formData.referringFacility}</p>
            <p><strong>Referring Doctor:</strong> ${formData.referringDoctor}</p>
            <p><strong>To:</strong> ${formData.receivingFacility}</p>
            <p><strong>Receiving Doctor:</strong> ${formData.receivingDoctor}</p>
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #0066cc;">Reason for Referral</h3>
          <p style="border: 1px solid #ddd; padding: 10px; min-height: 60px;">${formData.reasonForReferral}</p>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #0066cc;">Clinical Summary</h3>
          <p style="border: 1px solid #ddd; padding: 10px; min-height: 80px;">${formData.clinicalSummary}</p>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #0066cc;">Investigations Completed</h3>
          <p style="border: 1px solid #ddd; padding: 10px; min-height: 60px;">${formData.investigationsCompleted}</p>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #0066cc;">Treatment Given</h3>
          <p style="border: 1px solid #ddd; padding: 10px; min-height: 60px;">${formData.treatmentGiven}</p>
        </div>

        <div style="margin-top: 40px; text-align: right;">
          <p><strong>Referring Doctor's Signature:</strong> _________________________</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
      </div>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow!.document.write(printContent);
    printWindow!.document.close();
    printWindow!.print();
  };

  const handleDownload = () => {
    const content = `CHILD MENTAL HAVEN - REFERRAL OUT FORM

Patient: ${formData.patientName}
ID: ${formData.patientId}
Date: ${formData.referralDate}

FROM: ${formData.referringFacility}
TO: ${formData.receivingFacility}

REASON FOR REFERRAL:
${formData.reasonForReferral}

CLINICAL SUMMARY:
${formData.clinicalSummary}

INVESTIGATIONS COMPLETED:
${formData.investigationsCompleted}

TREATMENT GIVEN:
${formData.treatmentGiven}

Referring Doctor: ${formData.referringDoctor}
Date: ${new Date().toLocaleDateString()}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `referral-out-${formData.patientId}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Referral Out Form</h3>
        <div className="flex space-x-2">
          <Button onClick={handlePrint} variant="outline" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button onClick={handleDownload} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="patientName">Patient Name</Label>
          <Input
            id="patientName"
            value={formData.patientName}
            onChange={(e) => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
            placeholder="Enter patient name"
          />
        </div>
        <div>
          <Label htmlFor="patientId">Patient ID</Label>
          <Input
            id="patientId"
            value={formData.patientId}
            onChange={(e) => setFormData(prev => ({ ...prev, patientId: e.target.value }))}
            placeholder="Enter patient ID"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="receivingFacility">Receiving Facility</Label>
          <Input
            id="receivingFacility"
            value={formData.receivingFacility}
            onChange={(e) => setFormData(prev => ({ ...prev, receivingFacility: e.target.value }))}
            placeholder="Enter receiving facility name"
          />
        </div>
        <div>
          <Label htmlFor="receivingDoctor">Receiving Doctor</Label>
          <Input
            id="receivingDoctor"
            value={formData.receivingDoctor}
            onChange={(e) => setFormData(prev => ({ ...prev, receivingDoctor: e.target.value }))}
            placeholder="Enter receiving doctor name"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="urgency">Urgency Level</Label>
        <select
          id="urgency"
          value={formData.urgency}
          onChange={(e) => setFormData(prev => ({ ...prev, urgency: e.target.value }))}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="routine">Routine</option>
          <option value="urgent">Urgent</option>
          <option value="emergency">Emergency</option>
        </select>
      </div>

      <div>
        <Label htmlFor="reasonForReferral">Reason for Referral</Label>
        <Textarea
          id="reasonForReferral"
          value={formData.reasonForReferral}
          onChange={(e) => setFormData(prev => ({ ...prev, reasonForReferral: e.target.value }))}
          placeholder="Enter reason for referral..."
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="clinicalSummary">Clinical Summary</Label>
        <Textarea
          id="clinicalSummary"
          value={formData.clinicalSummary}
          onChange={(e) => setFormData(prev => ({ ...prev, clinicalSummary: e.target.value }))}
          placeholder="Enter clinical summary..."
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="investigationsCompleted">Investigations Completed</Label>
        <Textarea
          id="investigationsCompleted"
          value={formData.investigationsCompleted}
          onChange={(e) => setFormData(prev => ({ ...prev, investigationsCompleted: e.target.value }))}
          placeholder="Enter completed investigations..."
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="treatmentGiven">Treatment Given</Label>
        <Textarea
          id="treatmentGiven"
          value={formData.treatmentGiven}
          onChange={(e) => setFormData(prev => ({ ...prev, treatmentGiven: e.target.value }))}
          placeholder="Enter treatment given..."
          rows={3}
        />
      </div>
    </div>
  );
}

// Laboratory Request Form
function LabRequestForm() {
  const [formData, setFormData] = useState({
    patientName: "",
    patientId: "",
    requestDate: new Date().toISOString().split('T')[0],
    requestingDoctor: "Dr. Smith",
    clinicalHistory: "",
    provisionalDiagnosis: "",
    testsRequested: [],
    urgency: "routine",
    specialInstructions: ""
  });

  const availableTests = [
    "Full Blood Count (FBC)",
    "Blood Sugar Levels", 
    "Liver Function Tests (LFTs)",
    "Kidney Function Tests",
    "Thyroid Function Tests",
    "Lipid Profile",
    "Urine Analysis",
    "Stool Analysis",
    "Blood Culture",
    "Urine Culture",
    "HIV Test",
    "Hepatitis B & C",
    "Pregnancy Test",
    "Malaria Test",
    "Typhoid Test"
  ];

  const handleTestChange = (test: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      testsRequested: checked
        ? [...prev.testsRequested, test]
        : prev.testsRequested.filter(t => t !== test)
    }));
  };

  const handlePrint = () => {
    const printContent = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0066cc; padding-bottom: 20px;">
          <h1 style="color: #0066cc; margin: 0; font-size: 28px;">CHILD MENTAL HAVEN</h1>
          <p style="margin: 5px 0; color: #666; font-size: 16px;">Where Young Minds Evolve</p>
          <p style="margin: 0; font-size: 14px;">Muchai Drive Off Ngong Road | P.O Box 41622-00100</p>
          <p style="margin: 0; font-size: 14px;">Tel: 254746170159 | Email: info@childmentalhaven.org</p>
        </div>
        
        <h2 style="color: #0066cc; border-bottom: 1px solid #ccc; padding-bottom: 10px;">LABORATORY REQUEST FORM</h2>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
          <div>
            <p><strong>Patient Name:</strong> ${formData.patientName}</p>
            <p><strong>Patient ID:</strong> ${formData.patientId}</p>
            <p><strong>Request Date:</strong> ${formData.requestDate}</p>
          </div>
          <div>
            <p><strong>Requesting Doctor:</strong> ${formData.requestingDoctor}</p>
            <p><strong>Urgency:</strong> ${formData.urgency.toUpperCase()}</p>
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #0066cc;">Clinical History</h3>
          <p style="border: 1px solid #ddd; padding: 10px; min-height: 60px;">${formData.clinicalHistory}</p>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #0066cc;">Provisional Diagnosis</h3>
          <p style="border: 1px solid #ddd; padding: 10px; min-height: 60px;">${formData.provisionalDiagnosis}</p>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #0066cc;">Tests Requested</h3>
          <div style="border: 1px solid #ddd; padding: 10px; min-height: 100px;">
            ${formData.testsRequested.map(test => `<p>• ${test}</p>`).join('')}
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #0066cc;">Special Instructions</h3>
          <p style="border: 1px solid #ddd; padding: 10px; min-height: 60px;">${formData.specialInstructions}</p>
        </div>

        <div style="margin-top: 40px; text-align: right;">
          <p><strong>Doctor's Signature:</strong> _________________________</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
      </div>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow!.document.write(printContent);
    printWindow!.document.close();
    printWindow!.print();
  };

  const handleDownload = () => {
    const content = `CHILD MENTAL HAVEN - LABORATORY REQUEST FORM

Patient: ${formData.patientName}
ID: ${formData.patientId}
Date: ${formData.requestDate}

CLINICAL HISTORY:
${formData.clinicalHistory}

PROVISIONAL DIAGNOSIS:
${formData.provisionalDiagnosis}

TESTS REQUESTED:
${formData.testsRequested.map(test => `• ${test}`).join('\n')}

SPECIAL INSTRUCTIONS:
${formData.specialInstructions}

Requesting Doctor: ${formData.requestingDoctor}
Date: ${new Date().toLocaleDateString()}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lab-request-${formData.patientId}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Laboratory Request Form</h3>
        <div className="flex space-x-2">
          <Button onClick={handlePrint} variant="outline" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button onClick={handleDownload} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="patientName">Patient Name</Label>
          <Input
            id="patientName"
            value={formData.patientName}
            onChange={(e) => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
            placeholder="Enter patient name"
          />
        </div>
        <div>
          <Label htmlFor="patientId">Patient ID</Label>
          <Input
            id="patientId"
            value={formData.patientId}
            onChange={(e) => setFormData(prev => ({ ...prev, patientId: e.target.value }))}
            placeholder="Enter patient ID"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="urgency">Urgency Level</Label>
        <select
          id="urgency"
          value={formData.urgency}
          onChange={(e) => setFormData(prev => ({ ...prev, urgency: e.target.value }))}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="routine">Routine</option>
          <option value="urgent">Urgent</option>
          <option value="stat">STAT (Immediate)</option>
        </select>
      </div>

      <div>
        <Label htmlFor="clinicalHistory">Clinical History</Label>
        <Textarea
          id="clinicalHistory"
          value={formData.clinicalHistory}
          onChange={(e) => setFormData(prev => ({ ...prev, clinicalHistory: e.target.value }))}
          placeholder="Enter relevant clinical history..."
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="provisionalDiagnosis">Provisional Diagnosis</Label>
        <Textarea
          id="provisionalDiagnosis"
          value={formData.provisionalDiagnosis}
          onChange={(e) => setFormData(prev => ({ ...prev, provisionalDiagnosis: e.target.value }))}
          placeholder="Enter provisional diagnosis..."
          rows={2}
        />
      </div>

      <div>
        <Label>Tests Requested</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded p-4">
          {availableTests.map((test, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`test-${index}`}
                checked={formData.testsRequested.includes(test)}
                onChange={(e) => handleTestChange(test, e.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor={`test-${index}`} className="text-sm">{test}</label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="specialInstructions">Special Instructions</Label>
        <Textarea
          id="specialInstructions"
          value={formData.specialInstructions}
          onChange={(e) => setFormData(prev => ({ ...prev, specialInstructions: e.target.value }))}
          placeholder="Enter any special instructions for the lab..."
          rows={3}
        />
      </div>
    </div>
  );
}