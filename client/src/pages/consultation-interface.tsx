import React, { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Calendar,
  Clock,
  Activity,
  Heart,
  Thermometer,
  Weight,
  Save,
  FileText,
  UserPlus,
  Send,
  TestTube,
  Pill,
  Printer,
  Download
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

export default function ConsultationInterface() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/consultation/:patientId");
  const [consultation, setConsultation] = useState<ConsultationNotes>({
    patientId: 0,
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

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: patients = [] } = useQuery({
    queryKey: ["/api/patients"],
  });

  const patient = patients.find((p: Patient) => p.id === parseInt(params?.patientId || "0"));

  useEffect(() => {
    if (patient) {
      setConsultation(prev => ({
        ...prev,
        patientId: patient.id
      }));
    }
  }, [patient]);

  // Get patient's vital signs
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

  if (!match || !patient) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Patient Not Found</h2>
          <Button onClick={() => setLocation("/outpatient")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Outpatient List
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => setLocation("/outpatient")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Patient List
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Patient Consultation</h1>
            <p className="text-gray-600">Comprehensive consultation interface</p>
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
              <div>
                <h3 className="font-semibold text-lg">
                  {patient.firstName} {patient.middleName} {patient.lastName}
                </h3>
                <p className="text-gray-600">ID: {patient.patientId}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Age:</span>
                  <p>{new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} years</p>
                </div>
                <div>
                  <span className="font-medium">Gender:</span>
                  <p>{patient.gender}</p>
                </div>
                <div>
                  <span className="font-medium">Phone:</span>
                  <p>{patient.phoneNumber}</p>
                </div>
                <div>
                  <span className="font-medium">Address:</span>
                  <p>{patient.address}</p>
                </div>
              </div>

              {/* Vital Signs */}
              {vitals && (
                <div className="mt-6">
                  <h4 className="font-semibold text-lg mb-3 text-blue-800">Latest Vital Signs</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="bg-blue-50 p-3 rounded">
                      <h5 className="font-semibold text-blue-800 mb-2">Cardiovascular</h5>
                      <div className="space-y-1 text-sm">
                        <div><strong>Blood Pressure:</strong> {vitals.bloodPressureSystolic}/{vitals.bloodPressureDiastolic} mmHg</div>
                        <div><strong>Heart Rate:</strong> {vitals.heartRate} bpm</div>
                      </div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded">
                      <h5 className="font-semibold text-blue-800 mb-2">Physical</h5>
                      <div className="space-y-1 text-sm">
                        <div><strong>Temperature:</strong> {vitals.temperature}°C</div>
                        <div><strong>Weight:</strong> {vitals.weight} kg</div>
                        <div><strong>Height:</strong> {vitals.height} cm</div>
                      </div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded">
                      <h5 className="font-semibold text-blue-800 mb-2">Respiratory</h5>
                      <div className="space-y-1 text-sm">
                        <div><strong>Respiration Rate:</strong> {vitals.respirationRate} breaths/min</div>
                        <div><strong>Oxygen Saturation:</strong> {vitals.oxygenSaturation}%</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Consultation Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Medical Action Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Medical Actions</CardTitle>
              <CardDescription>Quick access to medical forms and actions</CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          {/* Consultation Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Consultation Notes</CardTitle>
              <CardDescription>Record detailed consultation information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <div className="flex justify-end space-x-3 pt-4 border-t">
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

// Import the form components from the original file
function ClinicalSummaryForm() {
  // This would be the same component from outpatient-consultation.tsx
  return <div className="p-4 text-center text-gray-500">Clinical Summary Form will be loaded here</div>;
}

function MedicalReportForm() {
  return <div className="p-4 text-center text-gray-500">Medical Report Form will be loaded here</div>;
}

function ReferralOutForm() {
  return <div className="p-4 text-center text-gray-500">Referral Out Form will be loaded here</div>;
}

function LabRequestForm() {
  return <div className="p-4 text-center text-gray-500">Lab Request Form will be loaded here</div>;
}