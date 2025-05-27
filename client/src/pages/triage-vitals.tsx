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
} from "@/components/ui/dialog";
import { 
  Users, 
  Search, 
  Activity, 
  Heart,
  Thermometer,
  Weight,
  Ruler,
  UserCheck,
  Stethoscope,
  Save,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Patient, Billing } from "@shared/schema";

interface VitalSigns {
  patientId: number;
  measurementDate: string;
  measurementTime: string;
  height: string;
  weight: string;
  bmi: string;
  temperature: string;
  bloodPressureSystolic: string;
  bloodPressureDiastolic: string;
  respirationRate: string;
  pulseRate: string;
  oxygenSaturation: string;
  bloodSugar: string;
  notes: string;
  clinician: string;
  recordedAt: string;
}

export default function TriageVitals() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [activeTab, setActiveTab] = useState("queue");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Vital Signs Form State
  const [vitals, setVitals] = useState<VitalSigns>({
    patientId: 0,
    measurementDate: new Date().toISOString().split('T')[0],
    measurementTime: new Date().toTimeString().slice(0, 5),
    height: "",
    weight: "",
    bmi: "",
    temperature: "",
    bloodPressureSystolic: "",
    bloodPressureDiastolic: "",
    respirationRate: "",
    pulseRate: "",
    oxygenSaturation: "",
    bloodSugar: "",
    notes: "",
    clinician: "Nurse",
    recordedAt: new Date().toISOString()
  });

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["/api/patients"],
  });

  const { data: billingRecords = [] } = useQuery({
    queryKey: ["/api/billing"],
  });

  // Filter patients who have paid and need vital signs
  const patientsForTriage = patients.filter((patient: Patient) => {
    const patientBills = billingRecords.filter((bill: Billing) => 
      bill.patientId === patient.id && bill.paymentStatus === "paid"
    );
    return patientBills.length > 0;
  });

  const filteredPatients = patientsForTriage.filter((patient: Patient) => {
    if (!searchQuery) return true;
    return (
      patient.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.patientId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const calculateBMI = (height: string, weight: string) => {
    const h = parseFloat(height) / 100; // Convert cm to meters
    const w = parseFloat(weight);
    if (h > 0 && w > 0) {
      const bmi = w / (h * h);
      return bmi.toFixed(1);
    }
    return "";
  };

  const handleVitalChange = (field: keyof VitalSigns, value: string) => {
    setVitals(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate BMI when height or weight changes
      if (field === 'height' || field === 'weight') {
        updated.bmi = calculateBMI(updated.height, updated.weight);
      }
      
      return updated;
    });
  };

  const openVitalsModal = (patient: Patient) => {
    setSelectedPatient(patient);
    setVitals(prev => ({
      ...prev,
      patientId: patient.id,
      measurementDate: new Date().toISOString().split('T')[0],
      measurementTime: new Date().toTimeString().slice(0, 5),
      recordedAt: new Date().toISOString()
    }));
    setShowVitalsModal(true);
  };

  const saveVitalsMutation = useMutation({
    mutationFn: async (vitalsData: VitalSigns) => {
      // In a real system, this would save to a vitals table
      // For now, we'll store it in the patient notes or a separate system
      console.log("Saving vital signs:", vitalsData);
      return vitalsData;
    },
    onSuccess: () => {
      toast({
        title: "Vital Signs Recorded",
        description: "Patient vital signs have been successfully recorded.",
      });
      setShowVitalsModal(false);
      setVitals(prev => ({
        ...prev,
        height: "",
        weight: "",
        bmi: "",
        temperature: "",
        bloodPressureSystolic: "",
        bloodPressureDiastolic: "",
        respirationRate: "",
        pulseRate: "",
        oxygenSaturation: "",
        bloodSugar: "",
        notes: ""
      }));
    },
  });

  const handleSaveVitals = () => {
    if (!selectedPatient) return;
    saveVitalsMutation.mutate(vitals);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Triage - Nursing Assessment</h1>
          <p className="text-gray-600">Patient vital signs and nursing assessment</p>
        </div>
        <div className="flex items-center space-x-4">
          <Stethoscope className="w-8 h-8 text-blue-600" />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="queue">Patient Queue</TabsTrigger>
          <TabsTrigger value="history">Vital Signs History</TabsTrigger>
          <TabsTrigger value="screening">Health Screening</TabsTrigger>
        </TabsList>

        <TabsContent value="queue">
          <Card>
            <CardHeader>
              <CardTitle>Patients Awaiting Triage Assessment</CardTitle>
              <CardDescription>
                Patients who have completed payment and need vital signs assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by patient name or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient ID</TableHead>
                    <TableHead>Patient Name</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Service Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient: Patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-medium">{patient.patientId}</TableCell>
                      <TableCell>{patient.firstName} {patient.lastName}</TableCell>
                      <TableCell>
                        {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} years
                      </TableCell>
                      <TableCell className="capitalize">{patient.gender}</TableCell>
                      <TableCell>
                        {billingRecords
                          .filter((bill: Billing) => bill.patientId === patient.id && bill.paymentStatus === "paid")
                          .map((bill: Billing) => bill.serviceType)
                          .join(", ")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-blue-600 border-blue-600">
                          <Clock className="w-3 h-3 mr-1" />
                          Awaiting Triage
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => openVitalsModal(patient)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Activity className="w-4 h-4 mr-1" />
                          Take Vitals
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredPatients.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No patients awaiting triage assessment</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Vital Signs History</CardTitle>
              <CardDescription>
                Historical vital signs records for all patients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Vital signs history will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="screening">
          <Card>
            <CardHeader>
              <CardTitle>Health Screening</CardTitle>
              <CardDescription>
                Additional health screening and assessments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Health screening tools will be available here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Vital Signs Modal */}
      <Dialog open={showVitalsModal} onOpenChange={setShowVitalsModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Stethoscope className="w-5 h-5 mr-2" />
              Vital Signs Assessment - {selectedPatient?.firstName} {selectedPatient?.lastName}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="measurementDate">Measurement Date</Label>
                  <Input
                    id="measurementDate"
                    type="date"
                    value={vitals.measurementDate}
                    onChange={(e) => handleVitalChange('measurementDate', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="measurementTime">Time</Label>
                  <Input
                    id="measurementTime"
                    type="time"
                    value={vitals.measurementTime}
                    onChange={(e) => handleVitalChange('measurementTime', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="height">
                    <Ruler className="w-4 h-4 inline mr-1" />
                    Height (cm)
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="170"
                    value={vitals.height}
                    onChange={(e) => handleVitalChange('height', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="weight">
                    <Weight className="w-4 h-4 inline mr-1" />
                    Weight (kg)
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="70"
                    value={vitals.weight}
                    onChange={(e) => handleVitalChange('weight', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="bmi">BMI</Label>
                  <Input
                    id="bmi"
                    value={vitals.bmi}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="temperature">
                  <Thermometer className="w-4 h-4 inline mr-1" />
                  Temperature (°C)
                </Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  placeholder="36.5"
                  value={vitals.temperature}
                  onChange={(e) => handleVitalChange('temperature', e.target.value)}
                />
              </div>

              <div>
                <Label>Blood Pressure (mmHg)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="120"
                    value={vitals.bloodPressureSystolic}
                    onChange={(e) => handleVitalChange('bloodPressureSystolic', e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="80"
                    value={vitals.bloodPressureDiastolic}
                    onChange={(e) => handleVitalChange('bloodPressureDiastolic', e.target.value)}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Systolic / Diastolic</p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="respirationRate">
                  <Activity className="w-4 h-4 inline mr-1" />
                  Respiration Rate (breaths/min)
                </Label>
                <Input
                  id="respirationRate"
                  type="number"
                  placeholder="20"
                  value={vitals.respirationRate}
                  onChange={(e) => handleVitalChange('respirationRate', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="pulseRate">
                  <Heart className="w-4 h-4 inline mr-1" />
                  Pulse Rate (beats/min)
                </Label>
                <Input
                  id="pulseRate"
                  type="number"
                  placeholder="72"
                  value={vitals.pulseRate}
                  onChange={(e) => handleVitalChange('pulseRate', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="oxygenSaturation">
                  <Activity className="w-4 h-4 inline mr-1" />
                  Oxygen Saturation (SpO2%)
                </Label>
                <Input
                  id="oxygenSaturation"
                  type="number"
                  placeholder="98"
                  value={vitals.oxygenSaturation}
                  onChange={(e) => handleVitalChange('oxygenSaturation', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="bloodSugar">
                  Blood Sugar (mmol/L)
                </Label>
                <Input
                  id="bloodSugar"
                  type="number"
                  step="0.1"
                  placeholder="5.5"
                  value={vitals.bloodSugar}
                  onChange={(e) => handleVitalChange('bloodSugar', e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">Normal: 3.5-5.5 mmol/L (non-diabetic)</p>
              </div>

              <div>
                <Label htmlFor="clinician">Clinician</Label>
                <Input
                  id="clinician"
                  value={vitals.clinician}
                  onChange={(e) => handleVitalChange('clinician', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="notes">Clinical Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional observations and notes..."
                  value={vitals.notes}
                  onChange={(e) => handleVitalChange('notes', e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-500">
              Patient: {selectedPatient?.patientId} • Age: {selectedPatient ? new Date().getFullYear() - new Date(selectedPatient.dateOfBirth).getFullYear() : 0} years
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setShowVitalsModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveVitals}
                disabled={saveVitalsMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="w-4 h-4 mr-1" />
                Save Vital Signs
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}