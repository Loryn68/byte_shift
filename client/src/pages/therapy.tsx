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
import { Search, MessageCircle, User, Calendar, Users, Heart, Brain, FileText, AlertCircle } from "lucide-react";
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
};

type SessionData = {
  patientId: number;
  therapistName: string;
  sessionDate: string;
  sessionTime: string;
  sessionType: string;
  duration: string;
  status: string;
  goals: string;
  counselorFindings: string;
  patientResponse: string;
  riskAssessment: string;
  interventions: string;
  homework: string;
  nextSession: string;
  recommendedTreatment: string;
  referralReason: string;
  notes: string;
};

export default function TherapyPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showSessionModal, setShowSessionModal] = useState(false);

  // Fetch patients
  const { data: patients = [], isLoading: patientsLoading } = useQuery({
    queryKey: ["/api/patients"],
  });

  // Filter therapy patients
  const therapyPatients = useMemo(() => {
    return patients.filter((patient: any) => 
      patient.patientType === 'therapy' ||
      patient.serviceType === 'Counseling' ||
      patient.serviceType === 'Family Counseling' ||
      patient.serviceType === 'therapy' ||
      patient.serviceType === 'counseling'
    );
  }, [patients]);

  // Filter patients based on search
  const filteredPatients = useMemo(() => {
    return therapyPatients.filter((patient: Patient) =>
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.patientId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [therapyPatients, searchTerm]);

  // Session mutation
  const sessionMutation = useMutation({
    mutationFn: async (sessionData: SessionData) => {
      return await apiRequest("POST", "/api/therapy-sessions", sessionData);
    },
    onSuccess: () => {
      toast({
        title: "Session Saved",
        description: "Therapy session has been saved successfully.",
      });
      setShowSessionModal(false);
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save therapy session.",
        variant: "destructive",
      });
    },
  });

  function TherapySessionForm({ patient }: { patient: Patient }) {
    const [sessionData, setSessionData] = useState<SessionData>({
      patientId: patient.id,
      therapistName: "Dr. Sarah Johnson",
      sessionDate: new Date().toISOString().split('T')[0],
      sessionTime: new Date().toTimeString().slice(0, 5),
      sessionType: "individual",
      duration: "60",
      status: "in-progress",
      goals: "",
      counselorFindings: "",
      patientResponse: "",
      riskAssessment: "",
      interventions: "",
      homework: "",
      nextSession: "",
      recommendedTreatment: "",
      referralReason: "",
      notes: "",
    });

    const [referralData, setReferralData] = useState({
      consultationType: "",
      consultationAmount: 0,
      consultationName: ""
    });

    const [activeTab, setActiveTab] = useState("session");

    const handleSubmit = () => {
      sessionMutation.mutate(sessionData);
    };

    const handleReferToDoctor = async () => {
      if (!referralData.consultationType) {
        toast({
          title: "Consultation Type Required",
          description: "Please select a consultation type before referring to doctor.",
          variant: "destructive",
        });
        return;
      }

      try {
        console.log("Starting referral process for:", referralData);
        
        // First save the therapy session
        await sessionMutation.mutateAsync(sessionData);
        
        // Create billing record for the consultation
        const billingDataForReferral = {
          patientId: patient.id,
          serviceType: referralData.consultationName,
          serviceDescription: referralData.consultationName,
          amount: referralData.consultationAmount.toFixed(2),
          totalAmount: referralData.consultationAmount.toFixed(2),
          paymentStatus: "pending"
        };
        
        console.log("Creating billing record:", billingDataForReferral);
        const billingResponse = await apiRequest("POST", "/api/billing", billingDataForReferral);
        console.log("Billing record created:", billingResponse);

        // Create appointment with therapy findings
        const appointmentData = {
          patientId: patient.id,
          type: "therapy-referral",
          doctorId: 1,
          appointmentDate: new Date().toISOString().split('T')[0],
          department: "Mental Health",
          status: "pending",
          consultationType: referralData.consultationType,
          therapyFindings: sessionData.counselorFindings || "Therapy session completed",
          patientResponse: sessionData.patientResponse || "Patient participated in session",
          riskAssessment: sessionData.riskAssessment || "Assessment pending",
          recommendedTreatment: sessionData.recommendedTreatment || "Follow-up recommended",
          referralReason: sessionData.referralReason || "Therapy referral",
          notes: `THERAPY REFERRAL:\n\nCounselor Findings: ${sessionData.counselorFindings || "Session completed"}\n\nPatient Response: ${sessionData.patientResponse || "Patient engaged"}\n\nRisk Assessment: ${sessionData.riskAssessment || "Standard assessment"}\n\nRecommended Treatment: ${sessionData.recommendedTreatment || "Medical consultation"}\n\nReferral Reason: ${sessionData.referralReason || "Therapy follow-up"}\n\nReferred by: ${sessionData.therapistName}\nSession Date: ${sessionData.sessionDate}\n\nConsultation Type: ${referralData.consultationName}`
        };

        console.log("Creating appointment:", appointmentData);
        const appointmentResponse = await apiRequest("POST", "/api/appointments", appointmentData);
        console.log("Appointment created:", appointmentResponse);

        toast({
          title: "Patient Referred Successfully",
          description: `Patient referred for ${referralData.consultationName}. They must visit cashier for payment (KShs ${referralData.consultationAmount}) before consultation.`,
        });
        
        setShowSessionModal(false);
        queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
        queryClient.invalidateQueries({ queryKey: ["/api/billing"] });
        queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      } catch (error) {
        console.error("Referral error:", error);
        toast({
          title: "Referral Error",
          description: `Failed to create referral: ${error.message || "Unknown error"}`,
          variant: "destructive",
        });
      }
    };

    return (
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("session")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "session" 
                ? "bg-white text-blue-600 shadow-sm" 
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Live Session
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "notes" 
                ? "bg-white text-blue-600 shadow-sm" 
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Session Notes
          </button>
          <button
            onClick={() => setActiveTab("referral")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "referral" 
                ? "bg-white text-blue-600 shadow-sm" 
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Doctor Referral
          </button>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-2">Patient Information</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><strong>Name:</strong> {patient.firstName} {patient.lastName}</div>
            <div><strong>ID:</strong> {patient.patientId}</div>
            <div><strong>Age:</strong> {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()}</div>
            <div><strong>Type:</strong> Therapy Patient</div>
          </div>
        </div>

        {/* Live Session Tab */}
        {activeTab === "session" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Counselor Notes Section */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Counselor Notes & Observations
                </h4>
                <Textarea
                  value={sessionData.counselorFindings}
                  onChange={(e) => setSessionData(prev => ({ ...prev, counselorFindings: e.target.value }))}
                  placeholder="Record your observations, patient behavior, mood, engagement level, therapeutic progress..."
                  rows={8}
                  className="w-full resize-none"
                />
              </div>

              {/* Patient Response Section */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Patient Response & Feedback
                </h4>
                <Textarea
                  value={sessionData.patientResponse}
                  onChange={(e) => setSessionData(prev => ({ ...prev, patientResponse: e.target.value }))}
                  placeholder="Record patient's verbal responses, emotional reactions, insights shared, concerns expressed..."
                  rows={8}
                  className="w-full resize-none"
                />
              </div>
            </div>

            {/* Risk Assessment */}
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-800 mb-3 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                Risk Assessment & Safety Concerns
              </h4>
              <Textarea
                value={sessionData.riskAssessment}
                onChange={(e) => setSessionData(prev => ({ ...prev, riskAssessment: e.target.value }))}
                placeholder="Document any safety concerns, risk factors, suicidal ideation, self-harm indicators..."
                rows={4}
                className="w-full resize-none"
              />
            </div>

            {/* Session Progress */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sessionType">Session Type</Label>
                <select
                  id="sessionType"
                  value={sessionData.sessionType}
                  onChange={(e) => setSessionData(prev => ({ ...prev, sessionType: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="individual">Individual Counseling</option>
                  <option value="family">Family Counseling</option>
                  <option value="group">Group Therapy</option>
                  <option value="play">Play Therapy</option>
                  <option value="behavioral">Behavioral Therapy</option>
                  <option value="cognitive">Cognitive Behavioral Therapy</option>
                </select>
              </div>

              <div>
                <Label htmlFor="duration">Session Duration</Label>
                <select
                  id="duration"
                  value={sessionData.duration}
                  onChange={(e) => setSessionData(prev => ({ ...prev, duration: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                  <option value="90">90 minutes</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Session Notes Tab */}
        {activeTab === "notes" && (
          <div className="space-y-6">
            <div>
              <Label htmlFor="goals">Session Goals & Objectives</Label>
              <Textarea
                id="goals"
                value={sessionData.goals}
                onChange={(e) => setSessionData(prev => ({ ...prev, goals: e.target.value }))}
                placeholder="Enter session goals and objectives..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="interventions">Therapeutic Interventions & Techniques</Label>
              <Textarea
                id="interventions"
                value={sessionData.interventions}
                onChange={(e) => setSessionData(prev => ({ ...prev, interventions: e.target.value }))}
                placeholder="Enter therapeutic interventions and techniques used..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="homework">Homework & Home Exercises</Label>
              <Textarea
                id="homework"
                value={sessionData.homework}
                onChange={(e) => setSessionData(prev => ({ ...prev, homework: e.target.value }))}
                placeholder="Enter homework assignments or exercises for the patient..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="nextSession">Next Session Plan</Label>
              <Textarea
                id="nextSession"
                value={sessionData.nextSession}
                onChange={(e) => setSessionData(prev => ({ ...prev, nextSession: e.target.value }))}
                placeholder="Enter plans and goals for the next session..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="notes">Additional Session Notes</Label>
              <Textarea
                id="notes"
                value={sessionData.notes}
                onChange={(e) => setSessionData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Enter additional session notes and observations..."
                rows={4}
              />
            </div>
          </div>
        )}

        {/* Doctor Referral Tab */}
        {activeTab === "referral" && (
          <div className="space-y-6">
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <h4 className="font-semibold text-orange-800 mb-3 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Medical Referral Information
              </h4>
              <p className="text-sm text-orange-700 mb-4">
                Complete this section when referring the patient to a doctor. All therapy findings will be included in the referral.
              </p>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="consultationType">Select Consultation Type</Label>
                  <select 
                    id="consultationType"
                    value={referralData.consultationType}
                    onChange={(e) => {
                      const selectedValue = e.target.value;
                      const serviceMap: Record<string, { name: string; amount: number }> = {
                        "child-consultation": { name: "Child Consultation", amount: 200 },
                        "psychiatric-consultation-5000": { name: "Psychiatric Consultation", amount: 5000 },
                        "psychiatric-consultation-3000": { name: "Psychiatric Consultation", amount: 3000 },
                        "psychiatric-review-5000": { name: "Psychiatric Review", amount: 5000 },
                        "psychiatric-review-3000": { name: "Psychiatric Review", amount: 3000 },
                        "medical-consultation-300": { name: "Medical Consultation", amount: 300 },
                        "medical-review-300": { name: "Medical Review", amount: 300 }
                      };
                      const serviceDetails = serviceMap[selectedValue] || { name: "", amount: 0 };
                      setReferralData({
                        consultationType: selectedValue,
                        consultationAmount: serviceDetails.amount,
                        consultationName: serviceDetails.name
                      });
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">-- Select Consultation Type --</option>
                    <option value="child-consultation">Child Consultation (KShs 200)</option>
                    <option value="psychiatric-consultation-5000">Psychiatric Consultation (KShs 5,000)</option>
                    <option value="psychiatric-consultation-3000">Psychiatric Consultation (KShs 3,000)</option>
                    <option value="psychiatric-review-5000">Psychiatric Review (KShs 5,000)</option>
                    <option value="psychiatric-review-3000">Psychiatric Review (KShs 3,000)</option>
                    <option value="medical-consultation-300">Medical Consultation (KShs 300)</option>
                    <option value="medical-review-300">Medical Review (KShs 300)</option>
                  </select>
                  {referralData.consultationType && (
                    <p className="text-sm text-blue-600 mt-2">
                      Selected: {referralData.consultationName} - KShs {referralData.consultationAmount}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="recommendedTreatment">Recommended Medical Treatment</Label>
                  <Textarea
                    id="recommendedTreatment"
                    value={sessionData.recommendedTreatment}
                    onChange={(e) => setSessionData(prev => ({ ...prev, recommendedTreatment: e.target.value }))}
                    placeholder="Suggest medical treatments, medication evaluation, psychiatric assessment needs..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="referralReason">Reason for Medical Referral</Label>
                  <Textarea
                    id="referralReason"
                    value={sessionData.referralReason}
                    onChange={(e) => setSessionData(prev => ({ ...prev, referralReason: e.target.value }))}
                    placeholder="Explain why medical consultation is needed, specific concerns requiring medical attention..."
                    rows={4}
                  />
                </div>
              </div>
            </div>

            {/* Summary of Therapy Findings */}
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h4 className="font-semibold text-gray-800 mb-3">Therapy Findings Summary (Will be sent to doctor)</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <strong className="text-gray-700">Counselor Findings:</strong>
                  <p className="text-gray-600 mt-1">{sessionData.counselorFindings || "No findings recorded yet"}</p>
                </div>
                <div>
                  <strong className="text-gray-700">Patient Response:</strong>
                  <p className="text-gray-600 mt-1">{sessionData.patientResponse || "No patient response recorded yet"}</p>
                </div>
                <div>
                  <strong className="text-gray-700">Risk Assessment:</strong>
                  <p className="text-gray-600 mt-1">{sessionData.riskAssessment || "No risk assessment completed yet"}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-6 border-t">
          <div className="flex space-x-2">
            {activeTab === "referral" && (
              <Button 
                onClick={handleReferToDoctor}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={!referralData.consultationType}
              >
                <FileText className="h-4 w-4 mr-2" />
                Refer to Doctor
                {referralData.consultationType && (
                  <span className="ml-2 text-xs bg-blue-500 px-2 py-1 rounded">
                    {referralData.consultationName}
                  </span>
                )}
              </Button>
            )}
            <Button 
              onClick={() => setLocation("/therapy-forms")}
              variant="outline"
              className="border-green-200 text-green-700 hover:bg-green-50"
            >
              <Brain className="h-4 w-4 mr-2" />
              Assessment Forms
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setShowSessionModal(false)}>
              Close Session
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={sessionMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {sessionMutation.isPending ? "Saving..." : "Save Session"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Therapy Services</h1>
          <p className="text-gray-600">Comprehensive mental health counseling and therapy management</p>
        </div>
        <Button
          onClick={() => setLocation("/therapy-forms")}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Brain className="h-4 w-4 mr-2" />
          Therapy Resources
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Therapy Patients</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{therapyPatients.length}</div>
            <p className="text-xs text-muted-foreground">In therapy services</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Individual Counseling</CardTitle>
            <User className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {therapyPatients.filter((p: any) => p.serviceType?.includes('individual') || p.serviceType?.includes('Counseling')).length}
            </div>
            <p className="text-xs text-muted-foreground">Patients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Family Counseling</CardTitle>
            <Heart className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {therapyPatients.filter((p: any) => p.serviceType?.includes('family') || p.serviceType?.includes('Counseling')).length}
            </div>
            <p className="text-xs text-muted-foreground">Families</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Scheduled today</p>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search patients by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Therapy Patients List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Therapy Patients
          </CardTitle>
          <CardDescription>
            Patients receiving counseling and therapy services
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPatients.length === 0 ? (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Therapy Patients</h3>
              <p className="text-gray-600">No patients are currently scheduled for therapy services.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{patient.firstName} {patient.lastName}</h4>
                      <p className="text-sm text-gray-600">ID: {patient.patientId}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {patient.serviceType || 'Counseling'}
                        </Badge>
                        <Badge 
                          variant={patient.status === 'therapy' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {patient.status === 'therapy' ? 'In Therapy' : 'Ready for Therapy'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      className="bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                      onClick={() => {
                        setSelectedPatient(patient);
                        setShowSessionModal(true);
                      }}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Start Session
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLocation("/therapy-forms")}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Assessment Forms
                    </Button>
                    <Button variant="outline" size="sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Modal */}
      <Dialog open={showSessionModal} onOpenChange={setShowSessionModal}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-green-700">
              Therapy Session - {selectedPatient?.firstName} {selectedPatient?.lastName}
            </DialogTitle>
            <div className="text-sm text-gray-600">
              Patient ID: {selectedPatient?.patientId} | Age: {selectedPatient?.dateOfBirth ? new Date().getFullYear() - new Date(selectedPatient.dateOfBirth).getFullYear() : 'N/A'} years
            </div>
          </DialogHeader>
          {selectedPatient && <TherapySessionForm patient={selectedPatient} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}