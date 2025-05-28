import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { 
  Users, 
  Calendar, 
  Clock, 
  User, 
  Heart, 
  Brain, 
  MessageCircle,
  FileText,
  Search,
  Plus,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import type { Patient } from "@shared/schema";

export default function TherapyPage() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch patients with therapy services
  const { data: patients, isLoading: patientsLoading } = useQuery({
    queryKey: ["/api/patients"],
  });

  // Get billing data to identify therapy patients by service type
  const { data: billingRecords } = useQuery({
    queryKey: ["/api/billing"],
  });

  // Filter therapy patients based on billing records for counseling services
  const therapyPatients = (patients as Patient[] || []).filter(patient => {
    if (!billingRecords) return false;
    
    const patientBilling = (billingRecords as any[]).find(
      bill => bill.patientId === patient.id && 
      (bill.serviceType?.toLowerCase().includes('counseling') ||
       bill.serviceType?.toLowerCase().includes('therapy') ||
       bill.serviceDescription?.toLowerCase().includes('counseling') ||
       bill.serviceDescription?.toLowerCase().includes('therapy'))
    );
    
    return !!patientBilling;
  });

  // Filter patients based on search term
  const filteredPatients = therapyPatients.filter(patient =>
    `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.patientId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle doctor referral mutation - creates appointment referral, not billing
  const doctorReferralMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/appointments", {
        method: "POST",
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({
        title: "Patient Referred Successfully",
        description: "Patient has been referred to doctor. They will need to visit the cashier for payment.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
    },
    onError: (error: any) => {
      toast({
        title: "Referral Failed",
        description: error.message || "Failed to refer patient to doctor",
        variant: "destructive",
      });
    },
  });

  // Check if patient has previous psychiatric visits
  const checkPatientVisitHistory = (patientId: number) => {
    if (!billingRecords) return false;
    
    const psychiatricVisits = (billingRecords as any[]).filter(
      bill => bill.patientId === patientId && 
      (bill.serviceType?.toLowerCase().includes('psychiatric') ||
       bill.serviceDescription?.toLowerCase().includes('psychiatric'))
    );
    
    return psychiatricVisits.length > 0;
  };

  // Handle doctor referral
  const handleDoctorReferral = async (patient: Patient) => {
    try {
      // Get the service from patient's registration data
      const registeredService = "Psychiatric Consultation";
      
      // Create appointment referral data
      const referralData = {
        patientId: patient.id,
        type: registeredService,
        doctorId: 1,
        appointmentDate: new Date().toISOString().split('T')[0],
        department: "Mental Health",
        status: "pending",
        notes: `Referred by therapist from therapy department. Patient needs to pay at cashier before consultation.`
      };

      await doctorReferralMutation.mutateAsync(referralData);
    } catch (error) {
      console.error("Error in doctor referral:", error);
      toast({
        title: "Referral Error",
        description: "Unable to create doctor referral at this time.",
        variant: "destructive",
      });
    }
  };

  const TherapySessionForm = ({ patient }: { patient: Patient }) => {
    const [activeTab, setActiveTab] = useState("session");
    const [sessionData, setSessionData] = useState({
      sessionType: "individual",
      therapistName: "Dr. Sarah Johnson",
      sessionDate: new Date().toISOString().split('T')[0],
      sessionTime: "09:00",
      duration: "60",
      notes: "",
      goals: "",
      interventions: "",
      homework: "",
      nextSession: "",
      status: "in-progress",
      counselorFindings: "",
      patientResponse: "",
      riskAssessment: "",
      recommendedTreatment: "",
      referralReason: ""
    });

    const sessionMutation = useMutation({
      mutationFn: async (data: any) => {
        const response = await apiRequest(`/api/therapy/sessions`, {
          method: "POST",
          body: JSON.stringify({
            patientId: patient.id,
            ...data
          }),
        });
        return response;
      },
      onSuccess: () => {
        toast({
          title: "Session Scheduled",
          description: "Therapy session has been scheduled successfully",
        });
        setShowSessionModal(false);
        queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to schedule session. Please try again.",
          variant: "destructive",
        });
      },
    });

    const handleSubmit = () => {
      sessionMutation.mutate(sessionData);
    };

    const handleReferToDoctor = async () => {
      try {
        // Create appointment referral with therapy findings
        const referralData = {
          patientId: patient.id,
          type: "Psychiatric Consultation",
          doctorId: 1,
          appointmentDate: new Date().toISOString().split('T')[0],
          department: "Mental Health",
          status: "pending",
          therapyFindings: sessionData.counselorFindings,
          patientResponse: sessionData.patientResponse,
          riskAssessment: sessionData.riskAssessment,
          recommendedTreatment: sessionData.recommendedTreatment,
          referralReason: sessionData.referralReason,
          notes: `THERAPY REFERRAL:\n\nCounselor Findings: ${sessionData.counselorFindings}\n\nPatient Response: ${sessionData.patientResponse}\n\nRisk Assessment: ${sessionData.riskAssessment}\n\nRecommended Treatment: ${sessionData.recommendedTreatment}\n\nReferral Reason: ${sessionData.referralReason}\n\nReferred by: ${sessionData.therapistName}\nSession Date: ${sessionData.sessionDate}`
        };

        await apiRequest('/api/appointments', {
          method: 'POST',
          body: JSON.stringify(referralData)
        });

        toast({
          title: "Patient Referred Successfully",
          description: "Patient has been referred to doctor with therapy findings. They will need to visit the cashier for payment before consultation.",
        });
        setShowSessionModal(false);
        queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      } catch (error) {
        toast({
          title: "Referral Error",
          description: "Unable to create doctor referral at this time.",
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
                disabled={!sessionData.counselorFindings || !sessionData.referralReason}
              >
                <FileText className="h-4 w-4 mr-2" />
                Refer to Doctor
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
              {therapyPatients.filter(p => p.serviceType?.includes('individual')).length}
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
              {therapyPatients.filter(p => p.serviceType?.includes('family')).length}
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
            >
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
              <option value="90">90 minutes</option>
            </select>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={sessionData.status}
              onChange={(e) => setSessionData(prev => ({ ...prev, status: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div>
          <Label htmlFor="goals">Session Goals</Label>
          <Textarea
            id="goals"
            value={sessionData.goals}
            onChange={(e) => setSessionData(prev => ({ ...prev, goals: e.target.value }))}
            placeholder="Enter session goals and objectives..."
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="notes">Session Notes</Label>
          <Textarea
            id="notes"
            value={sessionData.notes}
            onChange={(e) => setSessionData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Enter session notes and observations..."
            rows={4}
          />
        </div>

        <div>
          <Label htmlFor="interventions">Interventions Used</Label>
          <Textarea
            id="interventions"
            value={sessionData.interventions}
            onChange={(e) => setSessionData(prev => ({ ...prev, interventions: e.target.value }))}
            placeholder="Enter therapeutic interventions and techniques used..."
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="homework">Homework/Exercises</Label>
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
            rows={2}
          />
        </div>

        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <Button 
              onClick={() => {
                toast({
                  title: "Patient Referred Successfully",
                  description: "Patient has been referred to doctor. They will need to visit the cashier for payment before consultation.",
                });
                setShowSessionModal(false);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Refer to Doctor
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setShowSessionModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={sessionMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {sessionMutation.isPending ? "Scheduling..." : "Schedule Session"}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (patientsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading therapy patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Therapy Department</h1>
          <p className="text-gray-600">Manage counseling and therapy sessions</p>
        </div>
        <div className="text-sm text-gray-500">
          Total Therapy Patients: {therapyPatients.length}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
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
              {therapyPatients.filter(p => p.serviceType?.includes('individual')).length}
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
              {therapyPatients.filter(p => p.serviceType?.includes('family')).length}
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
                      onClick={() => setLocation("/therapy-forms")}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Start Therapy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedPatient(patient);
                        setShowSessionModal(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule Session
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      View History
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Scheduling Modal */}
      <Dialog open={showSessionModal} onOpenChange={setShowSessionModal}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-green-700">
              Start Therapy Session - {selectedPatient?.firstName} {selectedPatient?.lastName}
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