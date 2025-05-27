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

  // Helper function to get patient vitals from localStorage
  const getPatientVitals = (patientId: number) => {
    const vitalsKey = `patient-vitals-${patientId}`;
    const saved = localStorage.getItem(vitalsKey);
    return saved ? JSON.parse(saved) : null;
  };

  // Filter patients who have paid and need vital signs
  const patientsForTriage = patients.filter((patient: Patient) => {
    const patientBills = billingRecords.filter((bill: Billing) => 
      bill.patientId === patient.id && bill.paymentStatus === "paid"
    );
    return patientBills.length > 0;
  });

  // Get patients who haven't been triaged yet (Patient Queue)
  const getPendingTriagePatients = () => {
    return patientsForTriage.filter((patient: Patient) => {
      const vitalsData = getPatientVitals(patient.id);
      return !vitalsData; // No vitals recorded = pending triage
    });
  };

  // Get patients who have completed triage (Served Patients)
  const getServedPatients = () => {
    return patientsForTriage.filter((patient: Patient) => {
      const vitalsData = getPatientVitals(patient.id);
      return vitalsData; // Vitals recorded = triage complete
    });
  };

  const filteredPatients = getPendingTriagePatients().filter((patient: Patient) => {
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

  // Store saved vital signs for printing
  const [savedVitals, setSavedVitals] = useState<VitalSigns | null>(null);

  const saveVitalsMutation = useMutation({
    mutationFn: async (vitalsData: VitalSigns) => {
      // Save vital signs and mark patient as triaged
      console.log("Saving vital signs:", vitalsData);
      
      // Store vital signs in localStorage for this session
      const existingVitals = JSON.parse(localStorage.getItem('patientVitals') || '[]');
      const newVitalRecord = {
        ...vitalsData,
        id: Date.now(),
        status: 'triaged'
      };
      existingVitals.push(newVitalRecord);
      localStorage.setItem('patientVitals', JSON.stringify(existingVitals));
      
      return vitalsData;
    },
    onSuccess: (savedData) => {
      // Store the saved data for printing
      setSavedVitals(savedData);
      
      toast({
        title: "Vital Signs Recorded",
        description: "Patient has been triaged and will appear in outpatient queue.",
      });
      
      // Invalidate queries to refresh patient lists
      queryClient.invalidateQueries({ queryKey: ['/api/patients'] });
      
      // Don't close the modal immediately, let user print if needed
      // setShowVitalsModal(false);
    },
  });

  const handleSaveVitals = () => {
    if (!selectedPatient) return;
    saveVitalsMutation.mutate(vitals);
  };

  const generateTriageReportContent = (patient: Patient, vitalsData: VitalSigns) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: white;">
        <!-- Header with Logo and Hospital Details -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; border-bottom: 2px solid #4CAF50; padding-bottom: 15px;">
          <div style="flex: 1;">
            <svg width="80" height="70" viewBox="0 0 300 200">
              <!-- Colorful brain -->
              <path d="M150 40 C130 35, 110 45, 115 60 C105 65, 110 80, 125 85 C120 95, 135 100, 145 95 C155 100, 170 95, 165 85 C180 80, 185 65, 175 60 C190 45, 170 35, 150 40 Z" fill="#4CAF50"/>
              <path d="M155 45 C175 40, 185 50, 180 60 C190 65, 185 75, 175 75 C180 85, 165 90, 160 85 C155 90, 145 85, 150 80 C135 75, 135 65, 145 60 C135 50, 145 40, 155 45 Z" fill="#2196F3"/>
              <path d="M160 50 C170 55, 175 65, 165 70 C175 75, 170 85, 160 80 C165 90, 155 95, 150 90 C145 95, 135 90, 140 80 C130 85, 125 75, 135 70 C125 65, 130 55, 140 60 C135 50, 145 45, 160 50 Z" fill="#FF5722"/>
              <path d="M145 55 C155 60, 160 70, 150 75 C160 80, 155 90, 145 85 C150 95, 140 100, 135 95 C130 100, 120 95, 125 85 C115 90, 110 80, 120 75 C110 70, 115 60, 125 65 C120 55, 130 50, 145 55 Z" fill="#9C27B0"/>
              <path d="M150 60 C160 65, 165 75, 155 80 C165 85, 160 95, 150 90 C155 100, 145 105, 140 100 C135 105, 125 100, 130 90 C120 95, 115 85, 125 80 C115 75, 120 65, 130 70 C125 60, 135 55, 150 60 Z" fill="#FF9800"/>
              
              <!-- Two children figures -->
              <g transform="translate(100, 120)">
                <circle cx="20" cy="20" r="12" fill="#4CAF50"/>
                <path d="M8 35 L8 70 L16 70 L16 50 L24 50 L24 70 L32 70 L32 35 C32 28, 28 20, 20 20 C12 20, 8 28, 8 35 Z" fill="#4CAF50"/>
                <path d="M4 55 L4 75 L12 75 L12 55 Z" fill="#4CAF50"/>
                <path d="M28 55 L28 75 L36 75 L36 55 Z" fill="#4CAF50"/>
              </g>
              
              <g transform="translate(160, 120)">
                <circle cx="20" cy="20" r="12" fill="#4CAF50"/>
                <path d="M8 35 L8 70 L16 70 L16 50 L24 50 L24 70 L32 70 L32 35 C32 28, 28 20, 20 20 C12 20, 8 28, 8 35 Z" fill="#4CAF50"/>
                <path d="M4 55 L4 75 L12 75 L12 55 Z" fill="#4CAF50"/>
                <path d="M28 55 L28 75 L36 75 L36 55 Z" fill="#4CAF50"/>
              </g>
              
              <line x1="120" y1="175" x2="160" y2="175" stroke="#4CAF50" stroke-width="4"/>
            </svg>
          </div>
          
          <div style="flex: 2; text-align: center;">
            <h1 style="color: #4CAF50; margin: 0; font-size: 24px; font-weight: bold;">CHILD MENTAL HAVEN</h1>
            <p style="color: #333; margin: 2px 0; font-size: 14px; font-style: italic;">Where Young Minds Evolve</p>
            <div style="font-size: 12px; color: #666; margin-top: 8px; line-height: 1.4;">
              <div>Muchai Drive Off Ngong Road</div>
              <div>P.O Box 41622-00100, Nairobi, Kenya</div>
              <div>Tel: +254 746 170 159</div>
              <div>Email: info@childmentalhaven.org</div>
            </div>
          </div>
          
          <div style="flex: 1; text-align: right; font-size: 12px; color: #666;">
            <div style="border: 1px solid #ddd; padding: 10px; background: #f9f9f9;">
              <strong>Report ID:</strong><br>
              TRG-${Math.random().toString(36).substr(2, 9).toUpperCase()}<br><br>
              <strong>Date:</strong><br>
              ${new Date().toLocaleDateString()}<br><br>
              <strong>Time:</strong><br>
              ${new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
        
        <!-- Report Title -->
        <div style="text-align: center; margin-bottom: 25px;">
          <h2 style="color: #333; margin: 0; font-size: 18px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;">
            TRIAGE ASSESSMENT REPORT
          </h2>
          <div style="width: 100px; height: 3px; background: #4CAF50; margin: 10px auto;"></div>
        </div>

        <!-- Patient Information -->
        <div style="margin-bottom: 25px;">
          <h3 style="background-color: #4CAF50; color: white; padding: 8px; margin: 0; font-size: 16px;">PATIENT INFORMATION</h3>
          <div style="border: 1px solid #4CAF50; padding: 15px; background-color: #f9f9f9;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div>
                <strong>Name:</strong> ${patient.firstName} ${patient.middleName ? patient.middleName + ' ' : ''}${patient.lastName}<br>
                <strong>Date of Birth:</strong> ${new Date(patient.dateOfBirth).toLocaleDateString()}<br>
                <strong>Age:</strong> ${new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} years<br>
                <strong>Gender:</strong> ${patient.gender}<br>
                <strong>Address:</strong> ${patient.address}
              </div>
              <div>
                <strong>National ID:</strong> ${patient.nationalId || 'Not provided'}<br>
                <strong>Occupation:</strong> ${patient.occupation || 'Not specified'}<br>
                <strong>Email:</strong> ${patient.email || 'Not provided'}<br>
                <strong>Insurance Provider:</strong> ${patient.insuranceProvider || 'None'}<br>
                <strong>Registration Date:</strong> ${new Date(patient.registrationDate).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        <!-- Assessment Details -->
        <div style="margin-bottom: 25px;">
          <h3 style="background-color: #2196F3; color: white; padding: 8px; margin: 0; font-size: 16px;">ASSESSMENT DETAILS</h3>
          <div style="border: 1px solid #2196F3; padding: 15px; background-color: #f9f9f9;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div>
                <strong>Assessment Date:</strong> ${vitalsData.measurementDate}<br>
                <strong>Assessment Time:</strong> ${vitalsData.measurementTime}<br>
                <strong>Assessed By:</strong> ${vitalsData.clinician}
              </div>
              <div>
                <strong>Report Generated:</strong> ${new Date().toLocaleString()}<br>
                <strong>Department:</strong> Triage/Nursing
              </div>
            </div>
          </div>
        </div>

        <!-- Vital Signs -->
        <div style="margin-bottom: 25px;">
          <h3 style="background-color: #FF5722; color: white; padding: 8px; margin: 0; font-size: 16px;">VITAL SIGNS MEASUREMENTS</h3>
          <div style="border: 1px solid #FF5722; padding: 15px; background-color: #f9f9f9;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 8px; font-weight: bold; width: 30%;">Measurement</td>
                <td style="padding: 8px; font-weight: bold; width: 30%;">Value</td>
                <td style="padding: 8px; font-weight: bold; width: 40%;">Normal Range</td>
              </tr>
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 8px;">Height</td>
                <td style="padding: 8px;">${vitalsData.height} cm</td>
                <td style="padding: 8px;">Varies by age</td>
              </tr>
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 8px;">Weight</td>
                <td style="padding: 8px;">${vitalsData.weight} kg</td>
                <td style="padding: 8px;">Varies by age/height</td>
              </tr>
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 8px;">BMI</td>
                <td style="padding: 8px;">${vitalsData.bmi}</td>
                <td style="padding: 8px;">18.5-24.9 (adults)</td>
              </tr>
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 8px;">Temperature</td>
                <td style="padding: 8px;">${vitalsData.temperature}°C</td>
                <td style="padding: 8px;">36.1-37.2°C</td>
              </tr>
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 8px;">Blood Pressure</td>
                <td style="padding: 8px;">${vitalsData.bloodPressureSystolic}/${vitalsData.bloodPressureDiastolic} mmHg</td>
                <td style="padding: 8px;">90-120/60-80 mmHg</td>
              </tr>
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 8px;">Pulse Rate</td>
                <td style="padding: 8px;">${vitalsData.pulseRate} bpm</td>
                <td style="padding: 8px;">60-100 bpm (adults)</td>
              </tr>
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 8px;">Respiration Rate</td>
                <td style="padding: 8px;">${vitalsData.respirationRate} breaths/min</td>
                <td style="padding: 8px;">12-20 breaths/min</td>
              </tr>
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 8px;">Oxygen Saturation</td>
                <td style="padding: 8px;">${vitalsData.oxygenSaturation}%</td>
                <td style="padding: 8px;">95-100%</td>
              </tr>
              <tr>
                <td style="padding: 8px;">Blood Sugar</td>
                <td style="padding: 8px;">${vitalsData.bloodSugar} mmol/L</td>
                <td style="padding: 8px;">3.5-5.5 mmol/L</td>
              </tr>
            </table>
          </div>
        </div>

        <!-- Clinical Notes -->
        ${vitalsData.notes ? `
        <div style="margin-bottom: 25px;">
          <h3 style="background-color: #9C27B0; color: white; padding: 8px; margin: 0; font-size: 16px;">CLINICAL NOTES & OBSERVATIONS</h3>
          <div style="border: 1px solid #9C27B0; padding: 15px; background-color: #f9f9f9; min-height: 60px;">
            ${vitalsData.notes}
          </div>
        </div>
        ` : ''}

        <!-- Recommendations -->
        <div style="margin-bottom: 25px;">
          <h3 style="background-color: #FF9800; color: white; padding: 8px; margin: 0; font-size: 16px;">TRIAGE RECOMMENDATIONS</h3>
          <div style="border: 1px solid #FF9800; padding: 15px; background-color: #f9f9f9;">
            <p style="margin: 5px 0;">☐ Proceed to Doctor Consultation</p>
            <p style="margin: 5px 0;">☐ Urgent Medical Attention Required</p>
            <p style="margin: 5px 0;">☐ Monitor Vital Signs</p>
            <p style="margin: 5px 0;">☐ Additional Assessment Needed</p>
            <p style="margin: 5px 0;">☐ Follow-up Required</p>
          </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #4CAF50; font-size: 12px; color: #666;">
          <p style="margin: 5px 0;"><strong>Child Mental Haven</strong> - Where Young Minds Evolve</p>
          <p style="margin: 5px 0;">Professional Pediatric Mental Health Services</p>
          <p style="margin: 10px 0;">This is a computer-generated medical report</p>
          <p style="margin: 5px 0;">Generated on: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `;
  };

  const printTriageReport = () => {
    if (!selectedPatient) return;
    
    // Use saved vitals data if available, otherwise current form data
    const vitalsToUse = savedVitals || vitals;
    
    // Check if vitals have been recorded
    if (!vitalsToUse.height || !vitalsToUse.weight) {
      toast({
        title: "No Vital Signs Recorded",
        description: "Please record vital signs before printing the report.",
        variant: "destructive"
      });
      return;
    }
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Triage Assessment - ${selectedPatient.firstName} ${selectedPatient.lastName}</title>
            <style>
              @media print {
                body { margin: 0; }
                @page { margin: 1cm; }
              }
            </style>
          </head>
          <body>
            ${generateTriageReportContent(selectedPatient, vitalsToUse)}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const downloadTriagePDF = () => {
    if (!selectedPatient) return;
    
    // Use saved vitals data if available, otherwise current form data
    const vitalsToUse = savedVitals || vitals;
    
    // Check if vitals have been recorded
    if (!vitalsToUse.height || !vitalsToUse.weight) {
      toast({
        title: "No Vital Signs Recorded",
        description: "Please record vital signs before downloading the PDF.",
        variant: "destructive"
      });
      return;
    }
    
    const pdfWindow = window.open('', '_blank');
    if (pdfWindow) {
      pdfWindow.document.write(`
        <html>
          <head>
            <title>Triage Assessment - ${selectedPatient.firstName} ${selectedPatient.lastName}</title>
            <style>
              body { margin: 0; font-family: Arial, sans-serif; }
            </style>
          </head>
          <body>
            ${generateTriageReportContent(selectedPatient, vitalsToUse)}
            <script>
              window.onload = function() {
                window.print();
              }
            </script>
          </body>
        </html>
      `);
      pdfWindow.document.close();
    }
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
          <TabsTrigger value="served">Served Patients</TabsTrigger>
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

        <TabsContent value="served">
          <Card>
            <CardHeader>
              <CardTitle>Served Patients</CardTitle>
              <CardDescription>
                Patients who have completed nursing assessment and vital signs recording
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search served patients..."
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
                    <TableHead>Triage Status</TableHead>
                    <TableHead>Assessment Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getServedPatients().filter((patient: Patient) => {
                    if (!searchQuery) return true;
                    return (
                      patient.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      patient.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      patient.patientId.toLowerCase().includes(searchQuery.toLowerCase())
                    );
                  }).map((patient: Patient) => {
                    const vitalsData = getPatientVitals(patient.id);
                    return (
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
                          <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Triage Complete
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {vitalsData ? new Date(vitalsData.recordedAt).toLocaleDateString() : "-"}
                        </TableCell>
                        <TableCell className="space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedPatient(patient);
                              const savedData = getPatientVitals(patient.id);
                              if (savedData) {
                                setSavedVitals(savedData);
                                printTriageReport();
                              }
                            }}
                            className="text-blue-600 border-blue-600 hover:bg-blue-50"
                          >
                            Print Report
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedPatient(patient);
                              const savedData = getPatientVitals(patient.id);
                              if (savedData) {
                                setSavedVitals(savedData);
                                downloadTriagePDF();
                              }
                            }}
                            className="text-green-600 border-green-600 hover:bg-green-50"
                          >
                            Download PDF
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {getServedPatients().length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <UserCheck className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No patients have completed triage assessment yet</p>
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
              <Button variant="outline" onClick={() => {
                setShowVitalsModal(false);
                setSavedVitals(null); // Reset saved vitals when closing
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
              }}>
                {savedVitals ? 'Close' : 'Cancel'}
              </Button>
              
              {savedVitals && (
                <>
                  <Button 
                    variant="outline"
                    onClick={printTriageReport}
                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                  >
                    <Activity className="w-4 h-4 mr-1" />
                    Print Report
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={downloadTriagePDF}
                    className="text-purple-600 border-purple-600 hover:bg-purple-50"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Download PDF
                  </Button>
                </>
              )}
              
              {!savedVitals && (
                <Button 
                  onClick={handleSaveVitals}
                  disabled={saveVitalsMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="w-4 h-4 mr-1" />
                  {saveVitalsMutation.isPending ? 'Saving...' : 'Save Vital Signs'}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}