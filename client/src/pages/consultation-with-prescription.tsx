import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Plus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import ConsultationPrescription from "@/pages/consultation-prescription";

interface ConsultationProps {
  params: { patientId: string };
}

export default function ConsultationWithPrescription({ params }: ConsultationProps) {
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
  const [showPrescriptionDialog, setShowPrescriptionDialog] = useState(false);

  // Get patient data
  const { data: patient } = useQuery({
    queryKey: ["/api/patients", patientId],
  });

  // Get patient vitals
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

  const saveConsultation = () => {
    if (!chiefComplaint.trim() || !diagnosis.trim()) {
      toast({
        title: "Incomplete Information",
        description: "Please enter chief complaint and diagnosis.",
        variant: "destructive"
      });
      return;
    }

    const consultationData = {
      patientId,
      doctorName: "Dr. Smith", // This would come from auth context
      chiefComplaint,
      historyOfPresentIllness,
      examination,
      diagnosis,
      treatmentPlan,
      consultationNotes,
      dateTime: new Date().toISOString(),
      status: "completed"
    };

    saveConsultationMutation.mutate(consultationData);
  };

  const handlePrescriptionSave = (prescriptionData: any) => {
    // Prescription has been saved, consultation can continue
    setShowPrescriptionDialog(false);
    toast({
      title: "Prescription Created",
      description: "Prescription has been sent to pharmacy for approval.",
    });
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
            onClick={() => setLocation("/outpatient-consultation")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Patients
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Stethoscope className="h-8 w-8 text-blue-600" />
              Patient Consultation
            </h1>
            <p className="text-gray-600">
              Consulting with {patient.firstName} {patient.lastName} ({patient.patientId})
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
          <Button onClick={saveConsultation} disabled={saveConsultationMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {saveConsultationMutation.isPending ? "Saving..." : "Save Consultation"}
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
              <div>
                <Label className="text-sm font-medium text-gray-500">Registration Date</Label>
                <p className="font-medium">
                  {new Date(patient.registrationDate).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Vital Signs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Vital Signs
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
                    Vitals Complete
                  </Badge>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Badge variant="secondary">No vitals recorded</Badge>
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
                Consultation Record
              </CardTitle>
              <CardDescription>
                Document the patient consultation details
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
                    placeholder="Recommended treatment and follow-up care..."
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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Prescription Dialog */}
      <Dialog open={showPrescriptionDialog} onOpenChange={setShowPrescriptionDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Prescription</DialogTitle>
            <DialogDescription>
              Create a prescription for {patient.firstName} {patient.lastName}
            </DialogDescription>
          </DialogHeader>
          <ConsultationPrescription
            patient={patient}
            doctorName="Dr. Smith" // This would come from auth context
            onClose={() => setShowPrescriptionDialog(false)}
            onSave={handlePrescriptionSave}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}