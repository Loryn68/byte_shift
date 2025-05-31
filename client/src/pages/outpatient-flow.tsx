import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Stethoscope, User, Calendar, Heart, FlaskConical, Pill, Building, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

type Patient = {
  id: number;
  patientId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  contactNumber?: string;
  emergencyContact?: string;
  medicalHistory?: string;
  currentMedications?: string;
  allergies?: string;
  serviceType?: string;
  status?: string;
  paymentStatus?: string;
  currentStatus?: string;
  flowStep?: string;
};

type Consultation = {
  id: number;
  patientId: number;
  doctorName: string;
  consultationDate: string;
  consultationTime: string;
  consultationType: string;
  chiefComplaint: string;
  diagnosis: string;
  treatment: string;
  prescriptions: string;
  followUpDate: string;
  status: string;
  referralType?: string;
  referralReason?: string;
  notes: string;
};

export default function OutpatientFlow() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFlow, setSelectedFlow] = useState<string>("waiting");
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [activePatient, setActivePatient] = useState<Patient | null>(null);
  const [activeConsultation, setActiveConsultation] = useState<Consultation | null>(null);

  // Fetch outpatient eligible patients (strict flow enforcement)
  const { data: outpatients = [] } = useQuery({
    queryKey: ["/api/patients/outpatient"],
    queryFn: async () => {
      const response = await fetch("/api/patients");
      const allPatients = await response.json();
      // STRICT FLOW: Only patients who completed registry → cashier → triage
      return allPatients.filter((patient: Patient) => 
        // Must be review or consultation service
        (patient.serviceType?.toLowerCase().includes('review') || 
         patient.serviceType?.toLowerCase().includes('consultation')) &&
        // Must have completed payment at cashier
        patient.paymentStatus === 'paid' &&
        // Must have completed triage (vitals taken)
        (patient.currentStatus === 'triage_completed' || patient.flowStep === 'outpatient_ready')
      );
    }
  });

  // Fetch consultations
  const { data: consultations = [] } = useQuery({
    queryKey: ["/api/consultations"],
  });

  // Filter patients based on flow
  const filteredPatients = useMemo(() => {
    let patients = outpatients;

    if (searchTerm) {
      patients = patients.filter((patient: Patient) =>
        `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.patientId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    switch (selectedFlow) {
      case "waiting":
        return patients.filter((patient: Patient) => 
          !consultations.some((consultation: Consultation) => 
            consultation.patientId === patient.id && 
            consultation.status === 'in_progress'
          )
        );
      
      case "active":
        return patients.filter((patient: Patient) =>
          consultations.some((consultation: Consultation) => 
            consultation.patientId === patient.id && 
            consultation.status === 'in_progress'
          )
        );
      
      case "completed":
        return patients.filter((patient: Patient) =>
          consultations.some((consultation: Consultation) => 
            consultation.patientId === patient.id && 
            consultation.status === 'completed'
          )
        );
      
      default:
        return patients;
    }
  }, [outpatients, searchTerm, selectedFlow, consultations]);

  // Consultation form state
  const [consultationForm, setConsultationForm] = useState({
    doctorName: "",
    consultationType: "",
    chiefComplaint: "",
    diagnosis: "",
    treatment: "",
    prescriptions: "",
    followUpDate: "",
    notes: ""
  });

  // Referral form state
  const [referralForm, setReferralForm] = useState({
    referralType: "",
    referralReason: "",
    urgency: "routine",
    notes: ""
  });

  // Start consultation
  const startConsultationMutation = useMutation({
    mutationFn: async ({ patientId, consultationData }: { patientId: number; consultationData: any }) => {
      // Verify patient completed triage
      const patient = await fetch(`/api/patients/${patientId}`).then(res => res.json());
      if (patient.currentStatus !== 'triage_completed') {
        throw new Error("Patient must complete triage before outpatient consultation");
      }

      return await apiRequest("POST", "/api/consultations", {
        patientId,
        ...consultationData,
        consultationDate: new Date().toISOString().split('T')[0],
        consultationTime: new Date().toLocaleTimeString('en-US', { hour12: false }),
        status: "in_progress"
      });
    },
    onSuccess: () => {
      toast({
        title: "Consultation Started",
        description: "Outpatient consultation has been initiated.",
      });
      setShowConsultationModal(false);
      queryClient.invalidateQueries({ queryKey: ["/api/consultations"] });
    },
  });

  // Complete consultation
  const completeConsultationMutation = useMutation({
    mutationFn: async ({ consultationId }: { consultationId: number }) => {
      return await apiRequest("PUT", `/api/consultations/${consultationId}`, {
        status: "completed"
      });
    },
    onSuccess: () => {
      toast({
        title: "Consultation Completed",
        description: "Patient consultation has been finished.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/consultations"] });
    },
  });

  // Refer to therapy (strict flow: outpatient → therapy → cashier → therapy)
  const referToTherapyMutation = useMutation({
    mutationFn: async ({ patientId, consultationId, referralData }: { patientId: number; consultationId: number; referralData: any }) => {
      // FLOW ENFORCEMENT: Update consultation status
      await apiRequest("PUT", `/api/consultations/${consultationId}`, {
        status: "referred_to_therapy",
        referralReason: referralData.referralReason
      });
      
      // FLOW ENFORCEMENT: Reset patient status to require cashier payment for therapy
      await apiRequest("PUT", `/api/patients/${patientId}`, {
        currentStatus: "referred_to_therapy",
        flowStep: "cashier_required",
        paymentStatus: "pending",
        serviceType: `${referralData.referralType} (Referred from Outpatient)`
      });
      
      // Create billing requirement for therapy
      return await apiRequest("POST", "/api/billing", {
        patientId,
        serviceType: referralData.referralType,
        totalAmount: referralData.referralType.includes("family") ? 2500 : 2000,
        paymentStatus: "pending",
        billType: "therapy",
        notes: `Outpatient referral: ${referralData.referralReason}`
      });
    },
    onSuccess: () => {
      toast({
        title: "Patient Referred to Therapy",
        description: "Patient must visit cashier for payment before therapy session.",
      });
      setShowReferralModal(false);
      queryClient.invalidateQueries({ queryKey: ["/api/consultations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
    },
  });

  // Refer to laboratory (strict flow: outpatient → laboratory → cashier → laboratory)
  const referToLabMutation = useMutation({
    mutationFn: async ({ patientId, consultationId, referralData }: { patientId: number; consultationId: number; referralData: any }) => {
      // FLOW ENFORCEMENT: Update consultation status
      await apiRequest("PUT", `/api/consultations/${consultationId}`, {
        status: "referred_to_lab",
        referralReason: referralData.referralReason
      });
      
      // FLOW ENFORCEMENT: Reset patient to require cashier payment for lab tests
      await apiRequest("PUT", `/api/patients/${patientId}`, {
        currentStatus: "referred_to_lab",
        flowStep: "cashier_required",
        paymentStatus: "pending",
        serviceType: `${referralData.referralType} (Lab Referral)`
      });
      
      // Create billing requirement for lab tests
      return await apiRequest("POST", "/api/billing", {
        patientId,
        serviceType: referralData.referralType,
        totalAmount: 1500,
        paymentStatus: "pending",
        billType: "laboratory",
        notes: `Lab referral: ${referralData.referralReason}`
      });
    },
    onSuccess: () => {
      toast({
        title: "Patient Referred to Laboratory",
        description: "Patient must visit cashier for payment before lab tests.",
      });
      setShowReferralModal(false);
      queryClient.invalidateQueries({ queryKey: ["/api/consultations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
    },
  });

  // Admit patient (strict flow: outpatient → admit → inpatient)
  const admitPatientMutation = useMutation({
    mutationFn: async ({ patientId, consultationId, admissionData }: { patientId: number; consultationId: number; admissionData: any }) => {
      // FLOW ENFORCEMENT: Update consultation status
      await apiRequest("PUT", `/api/consultations/${consultationId}`, {
        status: "patient_admitted",
        referralReason: admissionData.admissionReason
      });
      
      // FLOW ENFORCEMENT: Change patient type to inpatient
      await apiRequest("PUT", `/api/patients/${patientId}`, {
        patientType: "inpatient",
        currentStatus: "admitted",
        flowStep: "inpatient_care",
        wardAssignment: admissionData.ward,
        bedNumber: admissionData.bedNumber
      });
      
      // Create admission record
      return await apiRequest("POST", "/api/admissions", {
        patientId,
        ward: admissionData.ward,
        bedNumber: admissionData.bedNumber,
        admissionReason: admissionData.admissionReason,
        admissionDate: new Date().toISOString().split('T')[0],
        status: "active"
      });
    },
    onSuccess: () => {
      toast({
        title: "Patient Admitted",
        description: "Patient has been admitted to inpatient care.",
      });
      setShowReferralModal(false);
      queryClient.invalidateQueries({ queryKey: ["/api/consultations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
    },
  });

  // Send to pharmacy (strict flow: outpatient → pharmacy → cashier → pharmacy)
  const sendToPharmacyMutation = useMutation({
    mutationFn: async ({ patientId, consultationId, prescriptions }: { patientId: number; consultationId: number; prescriptions: string }) => {
      // FLOW ENFORCEMENT: Update consultation status
      await apiRequest("PUT", `/api/consultations/${consultationId}`, {
        status: "sent_to_pharmacy",
        prescriptions: prescriptions
      });
      
      // FLOW ENFORCEMENT: Set patient to require pharmacy payment
      await apiRequest("PUT", `/api/patients/${patientId}`, {
        currentStatus: "prescription_issued",
        flowStep: "cashier_required",
        paymentStatus: "pending",
        serviceType: "Pharmacy (Prescription)"
      });
      
      // Create billing for pharmacy
      return await apiRequest("POST", "/api/billing", {
        patientId,
        serviceType: "Pharmacy - Prescription",
        totalAmount: 800,
        paymentStatus: "pending",
        billType: "pharmacy",
        notes: `Prescription: ${prescriptions}`
      });
    },
    onSuccess: () => {
      toast({
        title: "Prescription Issued",
        description: "Patient must visit cashier before collecting medication.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/consultations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
    },
  });

  const handleStartConsultation = (patient: Patient) => {
    setActivePatient(patient);
    setShowConsultationModal(true);
  };

  const handleReferral = (patient: Patient, consultation: Consultation, type: string) => {
    setActivePatient(patient);
    setActiveConsultation(consultation);
    setReferralForm({ ...referralForm, referralType: type });
    setShowReferralModal(true);
  };

  const submitConsultation = () => {
    if (!activePatient) return;
    startConsultationMutation.mutate({
      patientId: activePatient.id,
      consultationData: consultationForm
    });
  };

  const submitReferral = () => {
    if (!activePatient || !activeConsultation) return;
    
    const { referralType } = referralForm;
    
    if (referralType.includes("therapy")) {
      referToTherapyMutation.mutate({
        patientId: activePatient.id,
        consultationId: activeConsultation.id,
        referralData: referralForm
      });
    } else if (referralType.includes("lab")) {
      referToLabMutation.mutate({
        patientId: activePatient.id,
        consultationId: activeConsultation.id,
        referralData: referralForm
      });
    } else if (referralType.includes("admit")) {
      admitPatientMutation.mutate({
        patientId: activePatient.id,
        consultationId: activeConsultation.id,
        admissionData: {
          ward: referralForm.notes,
          bedNumber: "TBD",
          admissionReason: referralForm.referralReason
        }
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Stethoscope className="h-8 w-8 text-blue-600" />
            Outpatient Management
          </h1>
          <p className="text-gray-600">Outpatient consultations and medical care</p>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search patients by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={selectedFlow} onValueChange={setSelectedFlow}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="waiting">Waiting for Consultation</SelectItem>
            <SelectItem value="active">Active Consultations</SelectItem>
            <SelectItem value="completed">Completed Today</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Patient Lists */}
      <div className="grid grid-cols-1 gap-6">
        {selectedFlow === "waiting" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Patients Ready for Outpatient Consultation
              </CardTitle>
              <CardDescription>
                Patients ready for outpatient consultation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredPatients.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Stethoscope className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No patients waiting for consultation</p>
                  </div>
                ) : (
                  filteredPatients.map((patient: Patient) => (
                    <div key={patient.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {patient.firstName} {patient.lastName}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>ID: {patient.patientId}</span>
                          <span>Service: {patient.serviceType}</span>
                          <Badge variant="default">Triage Completed</Badge>
                        </div>
                      </div>
                      <Button 
                        onClick={() => handleStartConsultation(patient)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Start Consultation
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedFlow === "active" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-green-600" />
                Active Consultations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredPatients.map((patient: Patient) => {
                  const activeConsultation = consultations.find((consultation: Consultation) => 
                    consultation.patientId === patient.id && consultation.status === 'in_progress'
                  );
                  if (!activeConsultation) return null;

                  return (
                    <div key={patient.id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {patient.firstName} {patient.lastName}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Doctor: {activeConsultation.doctorName}</span>
                          <span>Type: {activeConsultation.consultationType}</span>
                          <Badge variant="default" className="bg-green-600">In Consultation</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => completeConsultationMutation.mutate({ consultationId: activeConsultation.id })}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Complete Consultation
                        </Button>
                        <Button 
                          onClick={() => handleReferral(patient, activeConsultation, "therapy")}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          Refer to Therapy
                        </Button>
                        <Button 
                          onClick={() => handleReferral(patient, activeConsultation, "laboratory")}
                          className="bg-orange-600 hover:bg-orange-700"
                        >
                          Refer to Lab
                        </Button>
                        <Button 
                          onClick={() => sendToPharmacyMutation.mutate({ 
                            patientId: patient.id, 
                            consultationId: activeConsultation.id, 
                            prescriptions: "Prescribed medications" 
                          })}
                          className="bg-cyan-600 hover:bg-cyan-700"
                        >
                          Send to Pharmacy
                        </Button>
                        <Button 
                          onClick={() => handleReferral(patient, activeConsultation, "admit")}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Admit Patient
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Start Consultation Modal */}
      <Dialog open={showConsultationModal} onOpenChange={setShowConsultationModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Start Outpatient Consultation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Doctor Name</Label>
                <Input
                  value={consultationForm.doctorName}
                  onChange={(e) => setConsultationForm({...consultationForm, doctorName: e.target.value})}
                  placeholder="Enter doctor name"
                />
              </div>
              <div>
                <Label>Consultation Type</Label>
                <Select value={consultationForm.consultationType} onValueChange={(value) => setConsultationForm({...consultationForm, consultationType: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select consultation type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Consultation</SelectItem>
                    <SelectItem value="review">Medical Review</SelectItem>
                    <SelectItem value="follow-up">Follow-up Visit</SelectItem>
                    <SelectItem value="specialist">Specialist Consultation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Chief Complaint</Label>
              <Textarea
                value={consultationForm.chiefComplaint}
                onChange={(e) => setConsultationForm({...consultationForm, chiefComplaint: e.target.value})}
                placeholder="Patient's main concern or symptoms"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowConsultationModal(false)}>
                Cancel
              </Button>
              <Button onClick={submitConsultation} disabled={startConsultationMutation.isPending}>
                {startConsultationMutation.isPending ? "Starting..." : "Start Consultation"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Referral Modal */}
      <Dialog open={showReferralModal} onOpenChange={setShowReferralModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Patient Referral</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Referral Type</Label>
              <Select value={referralForm.referralType} onValueChange={(value) => setReferralForm({...referralForm, referralType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select referral type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual-therapy">Individual Therapy</SelectItem>
                  <SelectItem value="family-therapy">Family Therapy</SelectItem>
                  <SelectItem value="lab-blood-test">Blood Tests</SelectItem>
                  <SelectItem value="lab-urine-test">Urine Tests</SelectItem>
                  <SelectItem value="admit-general">General Ward Admission</SelectItem>
                  <SelectItem value="admit-icu">ICU Admission</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Referral Reason</Label>
              <Textarea
                value={referralForm.referralReason}
                onChange={(e) => setReferralForm({...referralForm, referralReason: e.target.value})}
                placeholder="Reason for referral and clinical findings"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowReferralModal(false)}>
                Cancel
              </Button>
              <Button onClick={submitReferral}>
                Submit Referral
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}