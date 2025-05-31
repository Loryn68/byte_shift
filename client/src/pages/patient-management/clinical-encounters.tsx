import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Stethoscope, 
  FileText, 
  Activity, 
  User, 
  Clock,
  Plus,
  Eye,
  Edit,
  AlertTriangle,
  CheckCircle,
  Pill,
  FlaskRound,
  Scan,
  Heart,
  Thermometer,
  Scale
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function ClinicalEncounters() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("encounters");
  const [showEncounterModal, setShowEncounterModal] = useState(false);
  const [selectedEncounter, setSelectedEncounter] = useState<any>(null);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  const [encounterForm, setEncounterForm] = useState({
    patientId: "",
    doctorId: "",
    encounterType: "consultation",
    chiefComplaint: "",
    historyOfPresentIllness: "",
    pastMedicalHistory: "",
    socialHistory: "",
    familyHistory: "",
    allergies: "",
    currentMedications: "",
    physicalExamination: "",
    assessment: "",
    plan: "",
    diagnosis: "",
    followUpInstructions: "",
    nextAppointment: "",
    vitals: {
      temperature: "",
      bloodPressure: "",
      heartRate: "",
      respiratoryRate: "",
      oxygenSaturation: "",
      weight: "",
      height: "",
      bmi: ""
    },
    orders: {
      labTests: [],
      medications: [],
      imaging: [],
      procedures: []
    }
  });

  const [vitalsForm, setVitalsForm] = useState({
    temperature: "",
    bloodPressure: "",
    heartRate: "",
    respiratoryRate: "",
    oxygenSaturation: "",
    weight: "",
    height: "",
    bmi: ""
  });

  const { data: encounters = [], isLoading: encountersLoading } = useQuery({
    queryKey: ["/api/clinical-encounters"],
  });

  const { data: patients = [] } = useQuery({
    queryKey: ["/api/patients"],
  });

  const { data: doctors = [] } = useQuery({
    queryKey: ["/api/doctors"],
  });

  const { data: medications = [] } = useQuery({
    queryKey: ["/api/medications"],
  });

  const { data: labTests = [] } = useQuery({
    queryKey: ["/api/lab-tests"],
  });

  const createEncounterMutation = useMutation({
    mutationFn: async (encounterData: any) => {
      return await apiRequest("POST", "/api/clinical-encounters", encounterData);
    },
    onSuccess: () => {
      toast({
        title: "Clinical Encounter Recorded",
        description: "Patient encounter has been documented successfully.",
      });
      setShowEncounterModal(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["/api/clinical-encounters"] });
    },
  });

  const updateEncounterMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest("PUT", `/api/clinical-encounters/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Encounter Updated",
        description: "Clinical encounter has been updated successfully.",
      });
      setShowEncounterModal(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["/api/clinical-encounters"] });
    },
  });

  const resetForm = () => {
    setEncounterForm({
      patientId: "",
      doctorId: "",
      encounterType: "consultation",
      chiefComplaint: "",
      historyOfPresentIllness: "",
      pastMedicalHistory: "",
      socialHistory: "",
      familyHistory: "",
      allergies: "",
      currentMedications: "",
      physicalExamination: "",
      assessment: "",
      plan: "",
      diagnosis: "",
      followUpInstructions: "",
      nextAppointment: "",
      vitals: {
        temperature: "",
        bloodPressure: "",
        heartRate: "",
        respiratoryRate: "",
        oxygenSaturation: "",
        weight: "",
        height: "",
        bmi: ""
      },
      orders: {
        labTests: [],
        medications: [],
        imaging: [],
        procedures: []
      }
    });
    setVitalsForm({
      temperature: "",
      bloodPressure: "",
      heartRate: "",
      respiratoryRate: "",
      oxygenSaturation: "",
      weight: "",
      height: "",
      bmi: ""
    });
    setSelectedPatient(null);
    setSelectedEncounter(null);
  };

  const calculateBMI = () => {
    const weight = parseFloat(vitalsForm.weight);
    const height = parseFloat(vitalsForm.height) / 100; // Convert cm to meters
    if (weight && height) {
      const bmi = (weight / (height * height)).toFixed(1);
      setVitalsForm(prev => ({ ...prev, bmi }));
      setEncounterForm(prev => ({
        ...prev,
        vitals: { ...prev.vitals, bmi }
      }));
    }
  };

  const handleSubmitEncounter = () => {
    if (!encounterForm.patientId || !encounterForm.doctorId || !encounterForm.chiefComplaint) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const encounterData = {
      ...encounterForm,
      vitals: vitalsForm,
      encounterDate: new Date().toISOString()
    };

    if (selectedEncounter) {
      updateEncounterMutation.mutate({ id: selectedEncounter.id, data: encounterData });
    } else {
      createEncounterMutation.mutate(encounterData);
    }
  };

  const openEncounter = (encounter?: any) => {
    if (encounter) {
      setSelectedEncounter(encounter);
      setEncounterForm({
        patientId: encounter.patientId,
        doctorId: encounter.doctorId,
        encounterType: encounter.encounterType,
        chiefComplaint: encounter.chiefComplaint || "",
        historyOfPresentIllness: encounter.historyOfPresentIllness || "",
        pastMedicalHistory: encounter.pastMedicalHistory || "",
        socialHistory: encounter.socialHistory || "",
        familyHistory: encounter.familyHistory || "",
        allergies: encounter.allergies || "",
        currentMedications: encounter.currentMedications || "",
        physicalExamination: encounter.physicalExamination || "",
        assessment: encounter.assessment || "",
        plan: encounter.plan || "",
        diagnosis: encounter.diagnosis || "",
        followUpInstructions: encounter.followUpInstructions || "",
        nextAppointment: encounter.nextAppointment || "",
        vitals: encounter.vitals || {},
        orders: encounter.orders || { labTests: [], medications: [], imaging: [], procedures: [] }
      });
      setVitalsForm(encounter.vitals || {});
    } else {
      resetForm();
    }
    setShowEncounterModal(true);
  };

  const getEncounterTypeBadge = (type: string) => {
    const typeColors = {
      consultation: "bg-blue-100 text-blue-800",
      "follow-up": "bg-green-100 text-green-800",
      emergency: "bg-red-100 text-red-800",
      procedure: "bg-purple-100 text-purple-800",
      therapy: "bg-orange-100 text-orange-800"
    };
    
    return (
      <Badge className={typeColors[type as keyof typeof typeColors] || "bg-gray-100 text-gray-800"}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Stethoscope className="h-8 w-8 text-blue-600" />
          Clinical Encounters
        </h1>
        <p className="text-gray-600 mt-2">Comprehensive patient consultation and clinical documentation system</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="encounters">Patient Encounters</TabsTrigger>
          <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
          <TabsTrigger value="orders">Orders & Prescriptions</TabsTrigger>
          <TabsTrigger value="history">Medical History</TabsTrigger>
        </TabsList>

        <TabsContent value="encounters" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Clinical Encounters</h2>
              <p className="text-gray-600">Document patient consultations and clinical findings</p>
            </div>
            <Button onClick={() => openEncounter()}>
              <Plus className="h-4 w-4 mr-2" />
              New Encounter
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Encounters</CardTitle>
            </CardHeader>
            <CardContent>
              {encountersLoading ? (
                <div className="text-center py-8">Loading encounters...</div>
              ) : encounters.length === 0 ? (
                <div className="text-center py-8">
                  <Stethoscope className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No clinical encounters recorded yet.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Chief Complaint</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {encounters.map((encounter: any) => (
                      <TableRow key={encounter.id}>
                        <TableCell>
                          {new Date(encounter.encounterDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{encounter.patientName}</div>
                            <div className="text-sm text-gray-500">{encounter.patientId}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{encounter.doctorName}</div>
                            <div className="text-sm text-gray-500">{encounter.department}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getEncounterTypeBadge(encounter.encounterType)}</TableCell>
                        <TableCell className="max-w-xs truncate">{encounter.chiefComplaint}</TableCell>
                        <TableCell>
                          <Badge variant={encounter.isCompleted ? "default" : "secondary"}>
                            {encounter.isCompleted ? "Completed" : "In Progress"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => openEncounter(encounter)}>
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vitals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Vital Signs Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Thermometer className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium">Temperature</span>
                  </div>
                  <div className="text-2xl font-bold">98.6°F</div>
                  <div className="text-xs text-gray-500">Normal range</div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium">Blood Pressure</span>
                  </div>
                  <div className="text-2xl font-bold">120/80</div>
                  <div className="text-xs text-gray-500">Optimal</div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Heart Rate</span>
                  </div>
                  <div className="text-2xl font-bold">72 BPM</div>
                  <div className="text-xs text-gray-500">Normal</div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Scale className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">BMI</span>
                  </div>
                  <div className="text-2xl font-bold">22.5</div>
                  <div className="text-xs text-gray-500">Normal weight</div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FlaskRound className="h-5 w-5" />
                  Laboratory Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Laboratory test orders and results tracking
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5" />
                  Prescriptions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Medication prescriptions and dispensing
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Patient Medical History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Comprehensive patient medical history and timeline
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Clinical Encounter Modal */}
      <Dialog open={showEncounterModal} onOpenChange={setShowEncounterModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedEncounter ? "Edit Clinical Encounter" : "New Clinical Encounter"}
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="examination">Examination</TabsTrigger>
              <TabsTrigger value="assessment">Assessment</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Patient</Label>
                  <Select value={encounterForm.patientId} onValueChange={(value) => setEncounterForm(prev => ({ ...prev, patientId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient: any) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.firstName} {patient.lastName} - {patient.patientId}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Doctor</Label>
                  <Select value={encounterForm.doctorId} onValueChange={(value) => setEncounterForm(prev => ({ ...prev, doctorId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doctor: any) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          Dr. {doctor.firstName} {doctor.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Encounter Type</Label>
                <Select value={encounterForm.encounterType} onValueChange={(value) => setEncounterForm(prev => ({ ...prev, encounterType: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="follow-up">Follow-up</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="procedure">Procedure</SelectItem>
                    <SelectItem value="therapy">Therapy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Chief Complaint *</Label>
                <Textarea
                  value={encounterForm.chiefComplaint}
                  onChange={(e) => setEncounterForm(prev => ({ ...prev, chiefComplaint: e.target.value }))}
                  placeholder="Patient's main concern or reason for visit"
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Vital Signs</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label>Temperature (°F)</Label>
                    <Input
                      value={vitalsForm.temperature}
                      onChange={(e) => {
                        setVitalsForm(prev => ({ ...prev, temperature: e.target.value }));
                        setEncounterForm(prev => ({ ...prev, vitals: { ...prev.vitals, temperature: e.target.value } }));
                      }}
                      placeholder="98.6"
                    />
                  </div>
                  <div>
                    <Label>Blood Pressure</Label>
                    <Input
                      value={vitalsForm.bloodPressure}
                      onChange={(e) => {
                        setVitalsForm(prev => ({ ...prev, bloodPressure: e.target.value }));
                        setEncounterForm(prev => ({ ...prev, vitals: { ...prev.vitals, bloodPressure: e.target.value } }));
                      }}
                      placeholder="120/80"
                    />
                  </div>
                  <div>
                    <Label>Heart Rate (BPM)</Label>
                    <Input
                      value={vitalsForm.heartRate}
                      onChange={(e) => {
                        setVitalsForm(prev => ({ ...prev, heartRate: e.target.value }));
                        setEncounterForm(prev => ({ ...prev, vitals: { ...prev.vitals, heartRate: e.target.value } }));
                      }}
                      placeholder="72"
                    />
                  </div>
                  <div>
                    <Label>Respiratory Rate</Label>
                    <Input
                      value={vitalsForm.respiratoryRate}
                      onChange={(e) => {
                        setVitalsForm(prev => ({ ...prev, respiratoryRate: e.target.value }));
                        setEncounterForm(prev => ({ ...prev, vitals: { ...prev.vitals, respiratoryRate: e.target.value } }));
                      }}
                      placeholder="16"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label>O2 Saturation (%)</Label>
                    <Input
                      value={vitalsForm.oxygenSaturation}
                      onChange={(e) => {
                        setVitalsForm(prev => ({ ...prev, oxygenSaturation: e.target.value }));
                        setEncounterForm(prev => ({ ...prev, vitals: { ...prev.vitals, oxygenSaturation: e.target.value } }));
                      }}
                      placeholder="98"
                    />
                  </div>
                  <div>
                    <Label>Weight (kg)</Label>
                    <Input
                      value={vitalsForm.weight}
                      onChange={(e) => {
                        setVitalsForm(prev => ({ ...prev, weight: e.target.value }));
                        setEncounterForm(prev => ({ ...prev, vitals: { ...prev.vitals, weight: e.target.value } }));
                      }}
                      placeholder="70"
                      onBlur={calculateBMI}
                    />
                  </div>
                  <div>
                    <Label>Height (cm)</Label>
                    <Input
                      value={vitalsForm.height}
                      onChange={(e) => {
                        setVitalsForm(prev => ({ ...prev, height: e.target.value }));
                        setEncounterForm(prev => ({ ...prev, vitals: { ...prev.vitals, height: e.target.value } }));
                      }}
                      placeholder="175"
                      onBlur={calculateBMI}
                    />
                  </div>
                  <div>
                    <Label>BMI</Label>
                    <Input
                      value={vitalsForm.bmi}
                      readOnly
                      placeholder="Calculated"
                      className="bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div>
                <Label>History of Present Illness</Label>
                <Textarea
                  value={encounterForm.historyOfPresentIllness}
                  onChange={(e) => setEncounterForm(prev => ({ ...prev, historyOfPresentIllness: e.target.value }))}
                  placeholder="Detailed description of current illness"
                  rows={4}
                />
              </div>
              <div>
                <Label>Past Medical History</Label>
                <Textarea
                  value={encounterForm.pastMedicalHistory}
                  onChange={(e) => setEncounterForm(prev => ({ ...prev, pastMedicalHistory: e.target.value }))}
                  placeholder="Previous medical conditions, surgeries, hospitalizations"
                  rows={3}
                />
              </div>
              <div>
                <Label>Current Medications</Label>
                <Textarea
                  value={encounterForm.currentMedications}
                  onChange={(e) => setEncounterForm(prev => ({ ...prev, currentMedications: e.target.value }))}
                  placeholder="List of current medications and dosages"
                  rows={3}
                />
              </div>
              <div>
                <Label>Allergies</Label>
                <Textarea
                  value={encounterForm.allergies}
                  onChange={(e) => setEncounterForm(prev => ({ ...prev, allergies: e.target.value }))}
                  placeholder="Known allergies and reactions"
                  rows={2}
                />
              </div>
            </TabsContent>

            <TabsContent value="examination" className="space-y-4">
              <div>
                <Label>Physical Examination</Label>
                <Textarea
                  value={encounterForm.physicalExamination}
                  onChange={(e) => setEncounterForm(prev => ({ ...prev, physicalExamination: e.target.value }))}
                  placeholder="Detailed physical examination findings"
                  rows={6}
                />
              </div>
            </TabsContent>

            <TabsContent value="assessment" className="space-y-4">
              <div>
                <Label>Assessment/Diagnosis</Label>
                <Textarea
                  value={encounterForm.assessment}
                  onChange={(e) => setEncounterForm(prev => ({ ...prev, assessment: e.target.value }))}
                  placeholder="Clinical assessment and diagnosis"
                  rows={4}
                />
              </div>
              <div>
                <Label>Treatment Plan</Label>
                <Textarea
                  value={encounterForm.plan}
                  onChange={(e) => setEncounterForm(prev => ({ ...prev, plan: e.target.value }))}
                  placeholder="Treatment plan and interventions"
                  rows={4}
                />
              </div>
              <div>
                <Label>Follow-up Instructions</Label>
                <Textarea
                  value={encounterForm.followUpInstructions}
                  onChange={(e) => setEncounterForm(prev => ({ ...prev, followUpInstructions: e.target.value }))}
                  placeholder="Patient instructions and follow-up care"
                  rows={3}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowEncounterModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitEncounter} disabled={createEncounterMutation.isPending || updateEncounterMutation.isPending}>
              {selectedEncounter ? "Update Encounter" : "Save Encounter"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}