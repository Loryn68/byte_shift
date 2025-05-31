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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, User, Clock, FileText, Save, Plus, Stethoscope, Pill, Activity, FileDown, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import ClinicalSummaryForm from "@/components/forms/ClinicalSummaryForm";
import ReferralOutForm from "@/components/forms/ReferralOutForm";

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

  const [referralForm, setReferralForm] = useState({
    referralType: "",
    facilityName: "",
    reasonForReferral: "",
    chiefComplaint: "",
    onObservation: ""
  });

  const [showReferralForm, setShowReferralForm] = useState(false);

  const [admissionForm, setAdmissionForm] = useState({
    modeOfAdmission: "",
    allegation: "",
    patientReaction: "",
    onset: "",
    duration: "",
    department: "",
    ward: "",
    bed: "",
    dailyCharges: "",
    dateOfAdmission: new Date().toISOString().slice(0, 16),
    patientPhoto: null as File | null
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
            <TabsList className="grid w-full grid-cols-8 mb-6">
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
              <TabsTrigger value="referral" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Referral
              </TabsTrigger>
              <TabsTrigger value="admit" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Admit Patient
              </TabsTrigger>
              <TabsTrigger value="forms" className="flex items-center gap-2">
                <FileDown className="h-4 w-4" />
                Clinical Forms
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

            {/* Referral Tab */}
            <TabsContent value="referral" className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-8">
                    {/* Left Column - Referral Options */}
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            id="community"
                            name="referralType"
                            value="community"
                            checked={referralForm.referralType === "community"}
                            onChange={(e) => setReferralForm(prev => ({ ...prev, referralType: e.target.value }))}
                            className="h-4 w-4 text-blue-600"
                          />
                          <Label htmlFor="community" className="text-sm font-medium">
                            Refer to Community Unit
                          </Label>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            id="facility"
                            name="referralType"
                            value="facility"
                            checked={referralForm.referralType === "facility"}
                            onChange={(e) => setReferralForm(prev => ({ ...prev, referralType: e.target.value }))}
                            className="h-4 w-4 text-blue-600"
                          />
                          <Label htmlFor="facility" className="text-sm font-medium">
                            Refer to Another Health Facility
                          </Label>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Referral Facility Name</Label>
                        <Input
                          value={referralForm.facilityName}
                          onChange={(e) => setReferralForm(prev => ({ ...prev, facilityName: e.target.value }))}
                          placeholder="Enter facility name"
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Reason for Referral</Label>
                        <Textarea
                          value={referralForm.reasonForReferral}
                          onChange={(e) => setReferralForm(prev => ({ ...prev, reasonForReferral: e.target.value }))}
                          placeholder="Enter reason for referral"
                          className="w-full h-32 resize-none"
                        />
                      </div>
                    </div>

                    {/* Right Column - Clinical Information */}
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Chief Complaint:</Label>
                        <Textarea
                          value={referralForm.chiefComplaint}
                          onChange={(e) => setReferralForm(prev => ({ ...prev, chiefComplaint: e.target.value }))}
                          placeholder="Enter chief complaint"
                          className="w-full h-20 resize-none"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-medium">On Observation:</Label>
                        <Textarea
                          value={referralForm.onObservation}
                          onChange={(e) => setReferralForm(prev => ({ ...prev, onObservation: e.target.value }))}
                          placeholder="Enter clinical observations"
                          className="w-full h-20 resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-8 flex justify-center gap-4">
                    <Button 
                      className="px-12 py-2 bg-gray-300 text-gray-700 hover:bg-gray-400"
                      onClick={() => {
                        if (!selectedPatient) {
                          toast({
                            title: "No Patient Selected",
                            description: "Please search and select a patient first.",
                            variant: "destructive"
                          });
                          return;
                        }
                        
                        if (!referralForm.referralType || !referralForm.facilityName || !referralForm.reasonForReferral) {
                          toast({
                            title: "Required Fields Missing",
                            description: "Please fill in all required referral information.",
                            variant: "destructive"
                          });
                          return;
                        }

                        toast({
                          title: "Referral Notes Saved",
                          description: "Patient referral information has been saved successfully.",
                        });
                      }}
                    >
                      Save Referral Notes
                    </Button>
                    
                    <Button 
                      className="px-8 py-2 bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
                      onClick={() => {
                        if (!selectedPatient) {
                          toast({
                            title: "No Patient Selected",
                            description: "Please search and select a patient first.",
                            variant: "destructive"
                          });
                          return;
                        }
                        
                        if (!referralForm.facilityName || !referralForm.reasonForReferral) {
                          toast({
                            title: "Required Information Missing",
                            description: "Please fill in facility name and reason for referral.",
                            variant: "destructive"
                          });
                          return;
                        }

                        setShowReferralForm(true);
                      }}
                    >
                      <Printer className="h-4 w-4" />
                      Generate Referral Form
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Admit Patient Tab */}
            <TabsContent value="admit" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Patient Admission</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Mode of Admission:</Label>
                        <Select
                          value={admissionForm.modeOfAdmission}
                          onValueChange={(value) => setAdmissionForm(prev => ({ ...prev, modeOfAdmission: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select mode of admission" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="emergency">Emergency</SelectItem>
                            <SelectItem value="planned">Planned</SelectItem>
                            <SelectItem value="transfer">Transfer</SelectItem>
                            <SelectItem value="referral">Referral</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Allegation:</Label>
                        <Textarea
                          value={admissionForm.allegation}
                          onChange={(e) => setAdmissionForm(prev => ({ ...prev, allegation: e.target.value }))}
                          placeholder="Enter allegation details"
                          className="h-16 resize-none"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Patient Reaction:</Label>
                        <Select
                          value={admissionForm.patientReaction}
                          onValueChange={(value) => setAdmissionForm(prev => ({ ...prev, patientReaction: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select patient reaction" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cooperative">Cooperative</SelectItem>
                            <SelectItem value="anxious">Anxious</SelectItem>
                            <SelectItem value="agitated">Agitated</SelectItem>
                            <SelectItem value="confused">Confused</SelectItem>
                            <SelectItem value="withdrawn">Withdrawn</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Onset:</Label>
                        <Select
                          value={admissionForm.onset}
                          onValueChange={(value) => setAdmissionForm(prev => ({ ...prev, onset: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select onset" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="acute">Acute</SelectItem>
                            <SelectItem value="gradual">Gradual</SelectItem>
                            <SelectItem value="chronic">Chronic</SelectItem>
                            <SelectItem value="sudden">Sudden</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Duration:</Label>
                        <Input
                          value={admissionForm.duration}
                          onChange={(e) => setAdmissionForm(prev => ({ ...prev, duration: e.target.value }))}
                          placeholder="Enter duration"
                        />
                      </div>

                      {/* Large text area for additional notes */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Additional Notes:</Label>
                        <Textarea
                          placeholder="Enter additional admission notes..."
                          className="h-32 resize-none"
                        />
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Department:</Label>
                        <Select
                          value={admissionForm.department}
                          onValueChange={(value) => setAdmissionForm(prev => ({ ...prev, department: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="psychiatry">Psychiatry</SelectItem>
                            <SelectItem value="psychology">Psychology</SelectItem>
                            <SelectItem value="addiction">Addiction Services</SelectItem>
                            <SelectItem value="therapy">Therapy Unit</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Ward:</Label>
                        <Select
                          value={admissionForm.ward}
                          onValueChange={(value) => setAdmissionForm(prev => ({ ...prev, ward: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select ward" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male-ward">Male Ward</SelectItem>
                            <SelectItem value="female-ward">Female Ward</SelectItem>
                            <SelectItem value="pediatric-ward">Pediatric Ward</SelectItem>
                            <SelectItem value="intensive-care">Intensive Care</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Bed:</Label>
                        <Select
                          value={admissionForm.bed}
                          onValueChange={(value) => setAdmissionForm(prev => ({ ...prev, bed: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select bed" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bed-1">Bed 1</SelectItem>
                            <SelectItem value="bed-2">Bed 2</SelectItem>
                            <SelectItem value="bed-3">Bed 3</SelectItem>
                            <SelectItem value="bed-4">Bed 4</SelectItem>
                            <SelectItem value="bed-5">Bed 5</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <Label className="text-sm font-medium">Daily Charges:</Label>
                          <div className="flex">
                            <span className="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                              KSh
                            </span>
                            <Input
                              value={admissionForm.dailyCharges}
                              onChange={(e) => setAdmissionForm(prev => ({ ...prev, dailyCharges: e.target.value }))}
                              placeholder="0.00"
                              className="rounded-l-none"
                            />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <Label className="text-sm font-medium">Date of Admission:</Label>
                          <Input
                            type="datetime-local"
                            value={admissionForm.dateOfAdmission}
                            onChange={(e) => setAdmissionForm(prev => ({ ...prev, dateOfAdmission: e.target.value }))}
                          />
                        </div>
                      </div>

                      {/* Patient Photo Section */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Patient Photo:</Label>
                        <div className="flex flex-col items-center p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                            <User className="h-12 w-12 text-gray-400" />
                          </div>
                          <Button variant="outline" size="sm">
                            Upload Image
                          </Button>
                        </div>
                      </div>

                      {/* Save Button */}
                      <div className="pt-4">
                        <Button 
                          className="w-full bg-gray-300 text-gray-700 hover:bg-gray-400"
                          onClick={() => {
                            if (!selectedPatient) {
                              toast({
                                title: "No Patient Selected",
                                description: "Please search and select a patient first.",
                                variant: "destructive"
                              });
                              return;
                            }
                            
                            if (!admissionForm.modeOfAdmission || !admissionForm.department || !admissionForm.ward || !admissionForm.bed) {
                              toast({
                                title: "Required Fields Missing",
                                description: "Please fill in all required admission information.",
                                variant: "destructive"
                              });
                              return;
                            }

                            toast({
                              title: "Admission Details Saved",
                              description: "Patient admission information has been saved successfully.",
                            });
                          }}
                        >
                          Save Admission Details
                        </Button>
                      </div>
                    </div>
                  </div>
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

            {/* Clinical Forms Tab */}
            <TabsContent value="forms" className="space-y-4">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-4">Clinical Forms - Child Mental Haven</h3>
                <p className="text-gray-600 mb-6">Generate, print, and download clinical documentation forms with Child Mental Haven branding</p>
                
                {selectedPatient ? (
                  <ClinicalSummaryForm 
                    patientData={selectedPatient} 
                    consultationData={consultationForm} 
                  />
                ) : (
                  <Card className="max-w-md mx-auto">
                    <CardContent className="p-6 text-center">
                      <FileDown className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h4 className="text-lg font-medium mb-2">No Patient Selected</h4>
                      <p className="text-gray-600">Please search and select a patient to generate clinical forms.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Patient History Tab */}
            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  {selectedPatient ? (
                    <div className="space-y-4">
                      {/* Show Patient History Button */}
                      <div className="text-center">
                        <Button className="bg-gray-400 text-white px-8 py-2 hover:bg-gray-500">
                          Show Patient History
                        </Button>
                      </div>
                      
                      {/* Grouping Instructions */}
                      <div className="text-center text-sm text-gray-600 italic">
                        Drag a column here to group by this column.
                      </div>
                      
                      {/* Patient History Table */}
                      <div className="border rounded-lg">
                        <Table>
                          <TableHeader className="bg-blue-100">
                            <TableRow>
                              <TableHead className="text-center border-r">
                                <div className="flex items-center justify-center gap-2">
                                  Visit Date
                                  <div className="flex flex-col">
                                    <span className="text-xs">▲</span>
                                    <span className="text-xs">▼</span>
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  Contains: ⚙
                                </div>
                              </TableHead>
                              <TableHead className="text-center border-r">
                                <div className="flex items-center justify-center gap-2">
                                  Visit Reason
                                  <div className="flex flex-col">
                                    <span className="text-xs">▲</span>
                                    <span className="text-xs">▼</span>
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  Contains: ⚙
                                </div>
                              </TableHead>
                              <TableHead className="text-center border-r">
                                <div className="flex items-center justify-center gap-2">
                                  Symptoms
                                  <div className="flex flex-col">
                                    <span className="text-xs">▲</span>
                                    <span className="text-xs">▼</span>
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  Contains: ⚙
                                </div>
                              </TableHead>
                              <TableHead className="text-center border-r">
                                <div className="flex items-center justify-center gap-2">
                                  Impression
                                  <div className="flex flex-col">
                                    <span className="text-xs">▲</span>
                                    <span className="text-xs">▼</span>
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  Contains: ⚙
                                </div>
                              </TableHead>
                              <TableHead className="text-center border-r">
                                <div className="flex items-center justify-center gap-2">
                                  Diagnosis
                                  <div className="flex flex-col">
                                    <span className="text-xs">▲</span>
                                    <span className="text-xs">▼</span>
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  Contains: ⚙
                                </div>
                              </TableHead>
                              <TableHead className="text-center border-r">
                                <div className="flex items-center justify-center gap-2">
                                  Age
                                  <div className="flex flex-col">
                                    <span className="text-xs">▲</span>
                                    <span className="text-xs">▼</span>
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  Contains: ⚙
                                </div>
                              </TableHead>
                              <TableHead className="text-center border-r">
                                <div className="flex items-center justify-center gap-2">
                                  Doctor
                                  <div className="flex flex-col">
                                    <span className="text-xs">▲</span>
                                    <span className="text-xs">▼</span>
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  Contains: ⚙
                                </div>
                              </TableHead>
                              <TableHead className="text-center">
                                <div className="flex items-center justify-center gap-2">
                                  Admitted
                                  <div className="flex flex-col">
                                    <span className="text-xs">▲</span>
                                    <span className="text-xs">▼</span>
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  Contains: ⚙
                                </div>
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                                No patient history records found. Patient visit history will appear here when available.
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500 text-lg">Please search and select a patient to view their medical history</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Referral Form Modal */}
      <Dialog open={showReferralForm} onOpenChange={setShowReferralForm}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Referral Out Form</DialogTitle>
          </DialogHeader>
          <ReferralOutForm 
            patientData={selectedPatient} 
            referralData={referralForm}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}