import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  FileText, 
  Stethoscope, 
  Activity, 
  User, 
  Calendar, 
  Pill,
  Save,
  UserPlus,
  FlaskRound,
  Bed,
  Brain,
  CheckCircle,
  DollarSign
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import ConsultationPrescription from "@/pages/consultation-prescription";

interface ConsultationProps {
  params: { patientId: string };
}

export default function OutpatientConsultationWithWorkflow({ params }: ConsultationProps) {
  const { patientId } = params;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Consultation state
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [historyOfPresentIllness, setHistoryOfPresentIllness] = useState("");
  const [examination, setExamination] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatmentPlan, setTreatmentPlan] = useState("");
  const [consultationNotes, setConsultationNotes] = useState("");
  
  // Workflow state
  const [showWorkflowDialog, setShowWorkflowDialog] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState("");
  const [workflowNotes, setWorkflowNotes] = useState("");
  const [showPrescriptionDialog, setShowPrescriptionDialog] = useState(false);

  // Get patient data
  const { data: patient } = useQuery({
    queryKey: ["/api/patients", patientId],
  });

  // Get patient vitals from triage
  const getPatientVitals = (patientId: string) => {
    try {
      const vitalsData = JSON.parse(localStorage.getItem('patientVitals') || '[]');
      return vitalsData.find((vital: any) => vital.patientId === patientId);
    } catch {
      return null;
    }
  };

  const vitals = getPatientVitals(patientId);

  // Save consultation mutation
  const saveConsultationMutation = useMutation({
    mutationFn: async (consultationData: any) => {
      return await apiRequest("POST", "/api/consultations", consultationData);
    },
    onSuccess: () => {
      toast({
        title: "Consultation Saved",
        description: "Patient consultation has been recorded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/consultations"] });
    },
  });

  // Workflow routing mutation
  const routePatientMutation = useMutation({
    mutationFn: async (routingData: any) => {
      return await apiRequest("POST", "/api/patient-routing", routingData);
    },
    onSuccess: (data, variables) => {
      const workflowNames: { [key: string]: string } = {
        "therapy": "therapy",
        "laboratory": "laboratory",
        "admit": "inpatient admission",
        "pharmacy": "pharmacy",
        "complete": "consultation completion"
      };
      
      toast({
        title: "Patient Routed",
        description: `Patient has been routed to ${workflowNames[variables.workflow] || variables.workflow}.`,
      });
      
      // Navigate based on workflow
      if (variables.workflow === "complete") {
        setLocation("/outpatient-flow");
      }
    },
  });

  const saveConsultation = () => {
    if (!chiefComplaint.trim() || !diagnosis.trim()) {
      toast({
        title: "Incomplete Information",
        description: "Please enter chief complaint and diagnosis before proceeding.",
        variant: "destructive"
      });
      return;
    }

    const consultationData = {
      patientId,
      doctorName: "Dr. Sarah Johnson", // From auth context
      chiefComplaint,
      historyOfPresentIllness,
      examination,
      diagnosis,
      treatmentPlan,
      consultationNotes,
      dateTime: new Date().toISOString(),
      status: "in-progress"
    };

    saveConsultationMutation.mutate(consultationData);
    setShowWorkflowDialog(true);
  };

  const handleWorkflowSelection = () => {
    if (!selectedWorkflow) {
      toast({
        title: "Select Next Step",
        description: "Please select where to route the patient next.",
        variant: "destructive"
      });
      return;
    }

    const routingData = {
      patientId,
      currentLocation: "outpatient",
      nextLocation: selectedWorkflow,
      consultationId: `CONS-${Date.now()}`,
      routingNotes: workflowNotes,
      routedBy: "Dr. Sarah Johnson",
      routingDate: new Date().toISOString().split('T')[0],
      routingTime: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    };

    routePatientMutation.mutate({ ...routingData, workflow: selectedWorkflow });
    setShowWorkflowDialog(false);
  };

  const handlePrescriptionSave = (prescriptionData: any) => {
    setShowPrescriptionDialog(false);
    toast({
      title: "Prescription Created",
      description: "Prescription sent to pharmacy for approval as per outpatient workflow.",
    });
  };

  const getWorkflowIcon = (workflow: string) => {
    switch (workflow) {
      case "therapy": return <Brain className="h-4 w-4" />;
      case "laboratory": return <FlaskRound className="h-4 w-4" />;
      case "admit": return <Bed className="h-4 w-4" />;
      case "pharmacy": return <Pill className="h-4 w-4" />;
      case "complete": return <CheckCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (!patient) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <p>Loading patient information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => setLocation("/outpatient-flow")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Outpatient
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Stethoscope className="h-8 w-8 text-blue-600" />
              Outpatient Consultation
            </h1>
            <p className="text-gray-600">
              Registry → Cashier → Triage → Outpatient → Next Step
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowPrescriptionDialog(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Pill className="h-4 w-4 mr-2" />
            Create Prescription
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Patient Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-gray-500">Full Name</Label>
                <p className="font-medium">{patient.firstName} {patient.lastName}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Patient ID</Label>
                <p className="font-medium">{patient.patientId}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Age</Label>
                <p className="font-medium">
                  {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} years
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Gender</Label>
                <p className="font-medium">{patient.gender}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Phone</Label>
                <p className="font-medium">{patient.phoneNumber}</p>
              </div>
            </CardContent>
          </Card>

          {/* Vital Signs from Triage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Vital Signs (Triage)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {vitals ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Blood Pressure</Label>
                      <p className="font-medium">{vitals.bloodPressure}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Heart Rate</Label>
                      <p className="font-medium">{vitals.heartRate} bpm</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Temperature</Label>
                      <p className="font-medium">{vitals.temperature}°C</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Weight</Label>
                      <p className="font-medium">{vitals.weight} kg</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Nurse Notes</Label>
                    <p className="text-sm">{vitals.notes || "No additional notes"}</p>
                  </div>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <Activity className="w-3 h-3 mr-1" />
                    Triage Completed
                  </Badge>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Badge variant="secondary">No triage data</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Consultation Form */}
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Outpatient Consultation Record
              </CardTitle>
              <CardDescription>
                Document consultation findings and determine next step in patient flow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label>Chief Complaint *</Label>
                  <Textarea
                    value={chiefComplaint}
                    onChange={(e) => setChiefComplaint(e.target.value)}
                    placeholder="Patient's main concern or reason for visit..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label>History of Present Illness</Label>
                  <Textarea
                    value={historyOfPresentIllness}
                    onChange={(e) => setHistoryOfPresentIllness(e.target.value)}
                    placeholder="Detailed history of the current problem..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label>Physical Examination</Label>
                  <Textarea
                    value={examination}
                    onChange={(e) => setExamination(e.target.value)}
                    placeholder="Physical examination findings..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label>Diagnosis *</Label>
                  <Textarea
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="Primary and secondary diagnoses..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Treatment Plan</Label>
                  <Textarea
                    value={treatmentPlan}
                    onChange={(e) => setTreatmentPlan(e.target.value)}
                    placeholder="Recommended treatment and management..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label>Additional Notes</Label>
                  <Textarea
                    value={consultationNotes}
                    onChange={(e) => setConsultationNotes(e.target.value)}
                    placeholder="Any additional observations or notes..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={saveConsultation} disabled={saveConsultationMutation.isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    {saveConsultationMutation.isPending ? "Saving..." : "Save & Route Patient"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Patient Routing Dialog - Following Outpatient Flow Chart */}
      <Dialog open={showWorkflowDialog} onOpenChange={setShowWorkflowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Route Patient - Next Step in Outpatient Flow</DialogTitle>
            <DialogDescription>
              Select where to route the patient according to the outpatient administration flow chart
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                Current Flow: <strong>Registry → Cashier → Triage → Outpatient → [Next Step]</strong>
              </p>
            </div>

            <div>
              <Label>Select Next Step *</Label>
              <Select value={selectedWorkflow} onValueChange={setSelectedWorkflow}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose patient's next destination" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="therapy">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      Refer to Therapy
                    </div>
                  </SelectItem>
                  <SelectItem value="laboratory">
                    <div className="flex items-center gap-2">
                      <FlaskRound className="h-4 w-4" />
                      Refer to Laboratory
                    </div>
                  </SelectItem>
                  <SelectItem value="admit">
                    <div className="flex items-center gap-2">
                      <Bed className="h-4 w-4" />
                      Admit Patient (Inpatient)
                    </div>
                  </SelectItem>
                  <SelectItem value="pharmacy">
                    <div className="flex items-center gap-2">
                      <Pill className="h-4 w-4" />
                      Send to Pharmacy
                    </div>
                  </SelectItem>
                  <SelectItem value="complete">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Complete Consultation
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Routing Notes</Label>
              <Textarea
                value={workflowNotes}
                onChange={(e) => setWorkflowNotes(e.target.value)}
                placeholder="Instructions for the next department..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => setShowWorkflowDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleWorkflowSelection} disabled={routePatientMutation.isPending}>
                {routePatientMutation.isPending ? (
                  "Routing..."
                ) : (
                  <>
                    {getWorkflowIcon(selectedWorkflow)}
                    <span className="ml-2">Route Patient</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Prescription Dialog */}
      <Dialog open={showPrescriptionDialog} onOpenChange={setShowPrescriptionDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Prescription</DialogTitle>
            <DialogDescription>
              Create prescription that will flow to pharmacy for approval
            </DialogDescription>
          </DialogHeader>
          <ConsultationPrescription
            patient={patient}
            doctorName="Dr. Sarah Johnson"
            onClose={() => setShowPrescriptionDialog(false)}
            onSave={handlePrescriptionSave}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}