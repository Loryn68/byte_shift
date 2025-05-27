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
  Stethoscope,
  Save,
  FileText,
  Eye,
  Plus,
  User,
  Calendar,
  Clock
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
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
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
  const [showConsultationModal, setShowConsultationModal] = useState(false);

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
                                onClick={() => openConsultationModal(patient)}
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

      {/* Consultation Modal */}
      <Dialog open={showConsultationModal} onOpenChange={setShowConsultationModal}>
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

              {/* Vital Signs */}
              {selectedPatient && getPatientVitals(selectedPatient.id) && (
                <div>
                  <h4 className="font-medium mb-2">Recent Vital Signs</h4>
                  <div className="bg-blue-50 p-4 rounded-lg text-sm space-y-1">
                    {(() => {
                      const vitals = getPatientVitals(selectedPatient.id);
                      return (
                        <>
                          <div><strong>Height:</strong> {vitals.height} cm</div>
                          <div><strong>Weight:</strong> {vitals.weight} kg</div>
                          <div><strong>BMI:</strong> {vitals.bmi}</div>
                          <div><strong>Temperature:</strong> {vitals.temperature}°C</div>
                          <div><strong>Blood Pressure:</strong> {vitals.bloodPressureSystolic}/{vitals.bloodPressureDiastolic} mmHg</div>
                          <div><strong>Pulse:</strong> {vitals.pulseRate} bpm</div>
                          <div><strong>Oxygen Saturation:</strong> {vitals.oxygenSaturation}%</div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
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