import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, User, Clock, FileText, Save, Plus, Stethoscope, Pill, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function OutpatientManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("consultation");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  const [consultationForm, setConsultationForm] = useState({
    patientId: "",
    consultationType: "",
    chiefComplaint: "",
    historyOfPresentIllness: "",
    vitalSigns: {
      temperature: "",
      bloodPressure: "",
      heartRate: "",
      respiratoryRate: "",
      weight: "",
      height: "",
      bmi: ""
    },
    physicalExamination: "",
    clinicalFindings: "",
    provisionalDiagnosis: "",
    treatmentPlan: "",
    medications: "",
    followUpInstructions: "",
    nextAppointment: "",
    doctorNotes: "",
    consultationDate: new Date().toISOString(),
    consultedBy: ""
  });

  const [labForm, setLabForm] = useState({
    testType: "",
    testReason: "",
    instructions: "",
    urgency: "routine"
  });

  const [prescriptionForm, setPrescriptionForm] = useState({
    medications: [
      { name: "", dosage: "", frequency: "", duration: "", instructions: "" }
    ]
  });

  const { data: patients = [] } = useQuery({
    queryKey: ["/api/patients"],
  });

  const { data: outpatientQueue = [] } = useQuery({
    queryKey: ["/api/outpatient-queue"],
  });

  const { data: consultations = [] } = useQuery({
    queryKey: ["/api/consultations"],
  });

  const createConsultationMutation = useMutation({
    mutationFn: async (consultationData: any) => {
      return await apiRequest("POST", "/api/consultations", consultationData);
    },
    onSuccess: () => {
      toast({
        title: "Consultation Completed",
        description: "Patient consultation has been recorded successfully.",
      });
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["/api/consultations"] });
    },
  });

  const handlePatientSearch = () => {
    if (searchQuery.trim()) {
      const foundPatient = patients.find((p: any) => 
        p.patientId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.surname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.baptismalName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      if (foundPatient) {
        setSelectedPatient(foundPatient);
        setConsultationForm(prev => ({
          ...prev,
          patientId: foundPatient.patientId
        }));
        toast({
          title: "Patient Found",
          description: `${foundPatient.surname}, ${foundPatient.baptismalName} selected for consultation.`,
        });
      } else {
        toast({
          title: "Patient Not Found",
          description: "No patient found with that criteria.",
          variant: "destructive"
        });
      }
    }
  };

  const resetForm = () => {
    setConsultationForm({
      patientId: "",
      consultationType: "",
      chiefComplaint: "",
      historyOfPresentIllness: "",
      vitalSigns: {
        temperature: "",
        bloodPressure: "",
        heartRate: "",
        respiratoryRate: "",
        weight: "",
        height: "",
        bmi: ""
      },
      physicalExamination: "",
      clinicalFindings: "",
      provisionalDiagnosis: "",
      treatmentPlan: "",
      medications: "",
      followUpInstructions: "",
      nextAppointment: "",
      doctorNotes: "",
      consultationDate: new Date().toISOString(),
      consultedBy: ""
    });
    setSelectedPatient(null);
  };

  const calculateBMI = () => {
    const weight = parseFloat(consultationForm.vitalSigns.weight);
    const height = parseFloat(consultationForm.vitalSigns.height) / 100; // Convert cm to m
    
    if (weight && height) {
      const bmi = (weight / (height * height)).toFixed(1);
      setConsultationForm(prev => ({
        ...prev,
        vitalSigns: { ...prev.vitalSigns, bmi }
      }));
    }
  };

  const handleSubmitConsultation = () => {
    if (!selectedPatient) {
      toast({
        title: "No Patient Selected",
        description: "Please search and select a patient first.",
        variant: "destructive"
      });
      return;
    }

    if (!consultationForm.chiefComplaint || !consultationForm.consultationType) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in the chief complaint and consultation type.",
        variant: "destructive"
      });
      return;
    }

    const consultationData = {
      ...consultationForm,
      patientName: `${selectedPatient.surname}, ${selectedPatient.baptismalName}`,
      patientAge: selectedPatient.age,
      patientGender: selectedPatient.gender
    };

    createConsultationMutation.mutate(consultationData);
  };

  const addMedication = () => {
    setPrescriptionForm(prev => ({
      medications: [
        ...prev.medications,
        { name: "", dosage: "", frequency: "", duration: "", instructions: "" }
      ]
    }));
  };

  const updateMedication = (index: number, field: string, value: string) => {
    setPrescriptionForm(prev => ({
      medications: prev.medications.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  const removeMedication = (index: number) => {
    setPrescriptionForm(prev => ({
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="h-screen bg-green-50 p-6">
      <div className="bg-white rounded-lg shadow-sm h-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-blue-800">Outpatient Management</h1>
              <p className="text-gray-600 mt-1">Comprehensive outpatient consultation and care management</p>
            </div>
            <div className="flex items-center gap-4">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient by ID or name..."
                className="w-80"
              />
              <Button onClick={handlePatientSearch} variant="outline">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </div>

        {/* Patient Information Header */}
        {selectedPatient && (
          <div className="px-6 py-4 bg-blue-50 border-b">
            <div className="grid grid-cols-5 gap-4 text-sm">
              <div>
                <Label className="font-medium text-gray-600">Patient Name:</Label>
                <div className="font-semibold text-blue-800">
                  {selectedPatient.surname}, {selectedPatient.baptismalName}
                </div>
              </div>
              <div>
                <Label className="font-medium text-gray-600">Patient ID:</Label>
                <div className="font-semibold">{selectedPatient.patientId}</div>
              </div>
              <div>
                <Label className="font-medium text-gray-600">Age:</Label>
                <div>{selectedPatient.age} years</div>
              </div>
              <div>
                <Label className="font-medium text-gray-600">Gender:</Label>
                <div>{selectedPatient.gender}</div>
              </div>
              <div>
                <Label className="font-medium text-gray-600">Payment Method:</Label>
                <div>{selectedPatient.paymentOption || "Not specified"}</div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="p-6 h-full overflow-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="consultation" className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4" />
                General Consultation
              </TabsTrigger>
              <TabsTrigger value="queue" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Patient Queue
              </TabsTrigger>
              <TabsTrigger value="laboratory" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Laboratory
              </TabsTrigger>
              <TabsTrigger value="prescription" className="flex items-center gap-2">
                <Pill className="h-4 w-4" />
                Prescription
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Patient History
              </TabsTrigger>
            </TabsList>

            {/* General Consultation Tab */}
            <TabsContent value="consultation" className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Left Panel - Clinical Assessment */}
                <div className="space-y-6">
                  {/* Consultation Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Consultation Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Consultation Type</Label>
                        <Select value={consultationForm.consultationType} onValueChange={(value) => setConsultationForm(prev => ({ ...prev, consultationType: value }))}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select consultation type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="routine">Routine Check-up</SelectItem>
                            <SelectItem value="follow-up">Follow-up Visit</SelectItem>
                            <SelectItem value="acute">Acute Illness</SelectItem>
                            <SelectItem value="chronic">Chronic Disease Management</SelectItem>
                            <SelectItem value="mental-health">Mental Health Consultation</SelectItem>
                            <SelectItem value="pediatric">Pediatric Care</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Chief Complaint *</Label>
                        <Textarea
                          value={consultationForm.chiefComplaint}
                          onChange={(e) => setConsultationForm(prev => ({ ...prev, chiefComplaint: e.target.value }))}
                          placeholder="Primary reason for today's visit"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-medium">History of Present Illness</Label>
                        <Textarea
                          value={consultationForm.historyOfPresentIllness}
                          onChange={(e) => setConsultationForm(prev => ({ ...prev, historyOfPresentIllness: e.target.value }))}
                          placeholder="Detailed history of current symptoms"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Consulted By</Label>
                        <Input
                          value={consultationForm.consultedBy}
                          onChange={(e) => setConsultationForm(prev => ({ ...prev, consultedBy: e.target.value }))}
                          placeholder="Doctor name and title"
                          className="mt-1"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Vital Signs */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Vital Signs</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Temperature (°C)</Label>
                          <Input
                            value={consultationForm.vitalSigns.temperature}
                            onChange={(e) => setConsultationForm(prev => ({ 
                              ...prev, 
                              vitalSigns: { ...prev.vitalSigns, temperature: e.target.value }
                            }))}
                            placeholder="36.5"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Blood Pressure</Label>
                          <Input
                            value={consultationForm.vitalSigns.bloodPressure}
                            onChange={(e) => setConsultationForm(prev => ({ 
                              ...prev, 
                              vitalSigns: { ...prev.vitalSigns, bloodPressure: e.target.value }
                            }))}
                            placeholder="120/80"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Heart Rate (BPM)</Label>
                          <Input
                            value={consultationForm.vitalSigns.heartRate}
                            onChange={(e) => setConsultationForm(prev => ({ 
                              ...prev, 
                              vitalSigns: { ...prev.vitalSigns, heartRate: e.target.value }
                            }))}
                            placeholder="72"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Respiratory Rate</Label>
                          <Input
                            value={consultationForm.vitalSigns.respiratoryRate}
                            onChange={(e) => setConsultationForm(prev => ({ 
                              ...prev, 
                              vitalSigns: { ...prev.vitalSigns, respiratoryRate: e.target.value }
                            }))}
                            placeholder="16"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Weight (kg)</Label>
                          <Input
                            value={consultationForm.vitalSigns.weight}
                            onChange={(e) => {
                              setConsultationForm(prev => ({ 
                                ...prev, 
                                vitalSigns: { ...prev.vitalSigns, weight: e.target.value }
                              }));
                              calculateBMI();
                            }}
                            placeholder="70"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Height (cm)</Label>
                          <Input
                            value={consultationForm.vitalSigns.height}
                            onChange={(e) => {
                              setConsultationForm(prev => ({ 
                                ...prev, 
                                vitalSigns: { ...prev.vitalSigns, height: e.target.value }
                              }));
                              calculateBMI();
                            }}
                            placeholder="170"
                            className="mt-1"
                          />
                        </div>
                      </div>
                      
                      {consultationForm.vitalSigns.bmi && (
                        <div className="bg-blue-50 p-3 rounded">
                          <Label className="text-sm font-medium">BMI: {consultationForm.vitalSigns.bmi}</Label>
                          <p className="text-xs text-gray-600 mt-1">
                            {parseFloat(consultationForm.vitalSigns.bmi) < 18.5 ? "Underweight" :
                             parseFloat(consultationForm.vitalSigns.bmi) < 25 ? "Normal weight" :
                             parseFloat(consultationForm.vitalSigns.bmi) < 30 ? "Overweight" : "Obese"}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Right Panel - Clinical Findings & Treatment */}
                <div className="space-y-6">
                  {/* Physical Examination */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Physical Examination</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Physical Examination Findings</Label>
                        <Textarea
                          value={consultationForm.physicalExamination}
                          onChange={(e) => setConsultationForm(prev => ({ ...prev, physicalExamination: e.target.value }))}
                          placeholder="General appearance, systematic examination findings"
                          className="mt-1 min-h-24"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Clinical Findings</Label>
                        <Textarea
                          value={consultationForm.clinicalFindings}
                          onChange={(e) => setConsultationForm(prev => ({ ...prev, clinicalFindings: e.target.value }))}
                          placeholder="Significant clinical findings and observations"
                          className="mt-1"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Diagnosis & Treatment */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Diagnosis & Treatment Plan</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Provisional Diagnosis</Label>
                        <Textarea
                          value={consultationForm.provisionalDiagnosis}
                          onChange={(e) => setConsultationForm(prev => ({ ...prev, provisionalDiagnosis: e.target.value }))}
                          placeholder="Primary and differential diagnoses"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Treatment Plan</Label>
                        <Textarea
                          value={consultationForm.treatmentPlan}
                          onChange={(e) => setConsultationForm(prev => ({ ...prev, treatmentPlan: e.target.value }))}
                          placeholder="Immediate treatment and management plan"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Medications Prescribed</Label>
                        <Textarea
                          value={consultationForm.medications}
                          onChange={(e) => setConsultationForm(prev => ({ ...prev, medications: e.target.value }))}
                          placeholder="List of prescribed medications with dosages"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Follow-up Instructions</Label>
                        <Textarea
                          value={consultationForm.followUpInstructions}
                          onChange={(e) => setConsultationForm(prev => ({ ...prev, followUpInstructions: e.target.value }))}
                          placeholder="Patient instructions and follow-up care"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Next Appointment</Label>
                        <Input
                          type="datetime-local"
                          value={consultationForm.nextAppointment}
                          onChange={(e) => setConsultationForm(prev => ({ ...prev, nextAppointment: e.target.value }))}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Doctor's Notes</Label>
                        <Textarea
                          value={consultationForm.doctorNotes}
                          onChange={(e) => setConsultationForm(prev => ({ ...prev, doctorNotes: e.target.value }))}
                          placeholder="Additional notes and observations"
                          className="mt-1"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <Button variant="outline" onClick={resetForm} className="flex-1">
                      Clear Form
                    </Button>
                    <Button 
                      onClick={handleSubmitConsultation}
                      disabled={createConsultationMutation.isPending}
                      className="flex-1 bg-blue-600 text-white"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Complete Consultation
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Patient Queue Tab */}
            <TabsContent value="queue" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Outpatient Queue</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Queue No.</TableHead>
                        <TableHead>Patient Name</TableHead>
                        <TableHead>Registration Time</TableHead>
                        <TableHead>Visit Reason</TableHead>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {outpatientQueue.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                            No patients in outpatient queue
                          </TableCell>
                        </TableRow>
                      ) : (
                        outpatientQueue.map((patient: any, index: number) => (
                          <TableRow key={patient.id}>
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            <TableCell>{patient.patientName}</TableCell>
                            <TableCell>{new Date(patient.registrationTime).toLocaleTimeString()}</TableCell>
                            <TableCell>{patient.visitReason}</TableCell>
                            <TableCell>{patient.assignedDoctor}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{patient.status}</Badge>
                            </TableCell>
                            <TableCell>
                              <Button size="sm" variant="outline">
                                Call Patient
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Laboratory Tab */}
            <TabsContent value="laboratory" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Laboratory Orders</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Test Type</Label>
                      <Select value={labForm.testType} onValueChange={(value) => setLabForm(prev => ({ ...prev, testType: value }))}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select lab test" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="blood-count">Complete Blood Count</SelectItem>
                          <SelectItem value="chemistry">Basic Metabolic Panel</SelectItem>
                          <SelectItem value="lipid">Lipid Profile</SelectItem>
                          <SelectItem value="thyroid">Thyroid Function Tests</SelectItem>
                          <SelectItem value="liver">Liver Function Tests</SelectItem>
                          <SelectItem value="urine">Urinalysis</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Urgency</Label>
                      <Select value={labForm.urgency} onValueChange={(value) => setLabForm(prev => ({ ...prev, urgency: value }))}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="routine">Routine</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                          <SelectItem value="stat">STAT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Clinical Indication</Label>
                    <Textarea
                      value={labForm.testReason}
                      onChange={(e) => setLabForm(prev => ({ ...prev, testReason: e.target.value }))}
                      placeholder="Reason for ordering this test"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Special Instructions</Label>
                    <Textarea
                      value={labForm.instructions}
                      onChange={(e) => setLabForm(prev => ({ ...prev, instructions: e.target.value }))}
                      placeholder="Fasting required, special collection instructions, etc."
                      className="mt-1"
                    />
                  </div>

                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Order Laboratory Test
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Prescription Tab */}
            <TabsContent value="prescription" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Prescription Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {prescriptionForm.medications.map((medication, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Medication {index + 1}</h4>
                        {prescriptionForm.medications.length > 1 && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => removeMedication(index)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Medication Name</Label>
                          <Input
                            value={medication.name}
                            onChange={(e) => updateMedication(index, "name", e.target.value)}
                            placeholder="e.g., Amoxicillin"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Dosage</Label>
                          <Input
                            value={medication.dosage}
                            onChange={(e) => updateMedication(index, "dosage", e.target.value)}
                            placeholder="e.g., 500mg"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Frequency</Label>
                          <Input
                            value={medication.frequency}
                            onChange={(e) => updateMedication(index, "frequency", e.target.value)}
                            placeholder="e.g., Three times daily"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Duration</Label>
                          <Input
                            value={medication.duration}
                            onChange={(e) => updateMedication(index, "duration", e.target.value)}
                            placeholder="e.g., 7 days"
                            className="mt-1"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Instructions</Label>
                        <Textarea
                          value={medication.instructions}
                          onChange={(e) => updateMedication(index, "instructions", e.target.value)}
                          placeholder="Take with food, avoid alcohol, etc."
                          className="mt-1"
                        />
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex gap-4">
                    <Button onClick={addMedication} variant="outline" className="flex-1">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Medication
                    </Button>
                    <Button className="flex-1">
                      <Save className="h-4 w-4 mr-2" />
                      Save Prescription
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Patient History Tab */}
            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Previous Consultations</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Consultation Type</TableHead>
                        <TableHead>Chief Complaint</TableHead>
                        <TableHead>Diagnosis</TableHead>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {consultations.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            No consultation history available
                          </TableCell>
                        </TableRow>
                      ) : (
                        consultations.map((consultation: any) => (
                          <TableRow key={consultation.id}>
                            <TableCell>{new Date(consultation.consultationDate).toLocaleDateString()}</TableCell>
                            <TableCell>{consultation.consultationType}</TableCell>
                            <TableCell className="max-w-xs truncate">{consultation.chiefComplaint}</TableCell>
                            <TableCell className="max-w-xs truncate">{consultation.provisionalDiagnosis}</TableCell>
                            <TableCell>{consultation.consultedBy}</TableCell>
                            <TableCell>
                              <Button size="sm" variant="outline">
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}