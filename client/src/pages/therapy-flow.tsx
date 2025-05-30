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
import { Search, MessageCircle, User, Calendar, Users, Heart, Brain, FileText, AlertCircle, CheckCircle, Clock, Plus, ArrowRight, Phone } from "lucide-react";
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
};

type TherapySession = {
  id: number;
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

export default function TherapyFlow() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFlow, setSelectedFlow] = useState<string>("waiting");
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [activeSession, setActiveSession] = useState<TherapySession | null>(null);
  const [activePatient, setActivePatient] = useState<Patient | null>(null);

  // Fetch therapy patients (family counselling and counselling only)
  const { data: therapyPatients = [] } = useQuery({
    queryKey: ["/api/patients/therapy"],
    queryFn: async () => {
      const response = await fetch("/api/patients");
      const allPatients = await response.json();
      return allPatients.filter((patient: Patient) => 
        patient.serviceType?.toLowerCase().includes('counselling') ||
        patient.serviceType?.toLowerCase().includes('therapy')
      );
    }
  });

  // Fetch therapy sessions
  const { data: therapySessions = [] } = useQuery({
    queryKey: ["/api/therapy-sessions"],
  });

  // Fetch appointments for scheduled sessions
  const { data: scheduledSessions = [] } = useQuery({
    queryKey: ["/api/appointments/therapy"],
    queryFn: async () => {
      const response = await fetch("/api/appointments");
      const allAppointments = await response.json();
      return allAppointments.filter((appointment: any) => 
        appointment.appointmentType?.toLowerCase().includes('therapy') ||
        appointment.appointmentType?.toLowerCase().includes('counselling')
      );
    }
  });

  // Filter patients based on flow and payment status
  const filteredPatients = useMemo(() => {
    let patients = therapyPatients;

    // Apply search filter
    if (searchTerm) {
      patients = patients.filter((patient: Patient) =>
        `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.patientId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply flow filter
    switch (selectedFlow) {
      case "waiting":
        return patients.filter((patient: Patient) => 
          patient.paymentStatus === 'paid' && 
          !therapySessions.some((session: TherapySession) => 
            session.patientId === patient.id && 
            session.status === 'in_progress'
          )
        );
      
      case "active":
        return patients.filter((patient: Patient) =>
          therapySessions.some((session: TherapySession) => 
            session.patientId === patient.id && 
            session.status === 'in_progress'
          )
        );
      
      case "completed":
        return patients.filter((patient: Patient) =>
          therapySessions.some((session: TherapySession) => 
            session.patientId === patient.id && 
            session.status === 'completed'
          )
        );
      
      case "referred":
        return patients.filter((patient: Patient) =>
          therapySessions.some((session: TherapySession) => 
            session.patientId === patient.id && 
            session.status === 'referred_to_doctor'
          )
        );
      
      default:
        return patients;
    }
  }, [therapyPatients, searchTerm, selectedFlow, therapySessions]);

  // Session form state
  const [sessionForm, setSessionForm] = useState({
    therapistName: "",
    sessionType: "",
    duration: "60",
    goals: "",
    counselorFindings: "",
    patientResponse: "",
    riskAssessment: "low",
    interventions: "",
    homework: "",
    notes: ""
  });

  // Referral form state
  const [referralForm, setReferralForm] = useState({
    referralType: "",
    referralReason: "",
    urgency: "routine",
    notes: ""
  });

  // Schedule form state
  const [scheduleForm, setScheduleForm] = useState({
    nextSessionDate: "",
    nextSessionTime: "",
    sessionType: "",
    notes: "",
    sendSMS: true
  });

  // Start therapy session
  const startSessionMutation = useMutation({
    mutationFn: async ({ patientId, sessionData }: { patientId: number; sessionData: any }) => {
      return await apiRequest("POST", "/api/therapy-sessions", {
        patientId,
        ...sessionData,
        sessionDate: new Date().toISOString().split('T')[0],
        sessionTime: new Date().toLocaleTimeString('en-US', { hour12: false }),
        status: "in_progress"
      });
    },
    onSuccess: () => {
      toast({
        title: "Session Started",
        description: "Therapy session has been initiated successfully.",
      });
      setShowSessionModal(false);
      queryClient.invalidateQueries({ queryKey: ["/api/therapy-sessions"] });
    },
  });

  // End session
  const endSessionMutation = useMutation({
    mutationFn: async ({ sessionId }: { sessionId: number }) => {
      return await apiRequest("PUT", `/api/therapy-sessions/${sessionId}`, {
        status: "completed"
      });
    },
    onSuccess: () => {
      toast({
        title: "Session Ended",
        description: "Therapy session has been completed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/therapy-sessions"] });
    },
  });

  // Refer to doctor
  const referToDoctorMutation = useMutation({
    mutationFn: async ({ patientId, sessionId, referralData }: { patientId: number; sessionId: number; referralData: any }) => {
      // Update session status
      await apiRequest("PUT", `/api/therapy-sessions/${sessionId}`, {
        status: "referred_to_doctor",
        referralReason: referralData.referralReason
      });
      
      // Create appointment referral (they need to pay again at cashier)
      return await apiRequest("POST", "/api/appointments", {
        patientId,
        appointmentType: referralData.referralType,
        appointmentDate: new Date().toISOString().split('T')[0],
        status: "referred_from_therapy",
        notes: `Referred from therapy: ${referralData.referralReason}`,
        paymentRequired: true
      });
    },
    onSuccess: () => {
      toast({
        title: "Patient Referred to Doctor",
        description: "Patient must visit cashier for payment before seeing doctor.",
      });
      setShowReferralModal(false);
      queryClient.invalidateQueries({ queryKey: ["/api/therapy-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
    },
  });

  // Schedule next session
  const scheduleNextMutation = useMutation({
    mutationFn: async ({ patientId, scheduleData }: { patientId: number; scheduleData: any }) => {
      // Create appointment for next session
      const appointment = await apiRequest("POST", "/api/appointments", {
        patientId,
        appointmentType: `Therapy - ${scheduleData.sessionType}`,
        appointmentDate: scheduleData.nextSessionDate,
        appointmentTime: scheduleData.nextSessionTime,
        status: "scheduled",
        notes: scheduleData.notes
      });

      // Send SMS notification if enabled
      if (scheduleData.sendSMS) {
        // This would integrate with SMS service
        console.log("SMS notification would be sent here");
      }

      return appointment;
    },
    onSuccess: () => {
      toast({
        title: "Next Session Scheduled",
        description: "Patient will receive SMS notification and appear under appointments.",
      });
      setShowScheduleModal(false);
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
    },
  });

  const handleStartSession = (patient: Patient) => {
    setActivePatient(patient);
    setShowSessionModal(true);
  };

  const handleEndSession = (sessionId: number) => {
    endSessionMutation.mutate({ sessionId });
  };

  const handleReferToDoctor = (patient: Patient, session: TherapySession) => {
    setActivePatient(patient);
    setActiveSession(session);
    setShowReferralModal(true);
  };

  const handleScheduleNext = (patient: Patient) => {
    setActivePatient(patient);
    setShowScheduleModal(true);
  };

  const submitSession = () => {
    if (!activePatient) return;
    startSessionMutation.mutate({
      patientId: activePatient.id,
      sessionData: sessionForm
    });
  };

  const submitReferral = () => {
    if (!activePatient || !activeSession) return;
    referToDoctorMutation.mutate({
      patientId: activePatient.id,
      sessionId: activeSession.id,
      referralData: referralForm
    });
  };

  const submitSchedule = () => {
    if (!activePatient) return;
    scheduleNextMutation.mutate({
      patientId: activePatient.id,
      scheduleData: scheduleForm
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with Flow Chart Reference */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Heart className="h-8 w-8 text-purple-600" />
            Therapy Flow Management
          </h1>
          <p className="text-gray-600">Following Patient Administration Flow Chart for Therapy</p>
        </div>
      </div>

      {/* Flow Chart Visual */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-800">Therapy Patient Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 rounded-lg">
              <User className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-800">Patient Registry</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <div className="flex items-center gap-2 px-3 py-2 bg-green-100 rounded-lg">
              <FileText className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-800">Cashier</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <div className="flex items-center gap-2 px-3 py-2 bg-purple-100 rounded-lg">
              <Heart className="h-4 w-4 text-purple-600" />
              <span className="font-medium text-purple-800">Therapy</span>
            </div>
          </div>
          <div className="mt-4 flex justify-center gap-8">
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 rounded-lg text-sm">
              <span className="font-medium text-blue-800">Refer to Doctor → Cashier → Outpatient</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-green-100 rounded-lg text-sm">
              <span className="font-medium text-green-800">End Session</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-orange-100 rounded-lg text-sm">
              <Phone className="h-4 w-4 text-orange-600" />
              <span className="font-medium text-orange-800">Schedule Next → SMS → Appointments</span>
            </div>
          </div>
        </CardContent>
      </Card>

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
            <SelectItem value="waiting">Waiting for Session</SelectItem>
            <SelectItem value="active">Active Sessions</SelectItem>
            <SelectItem value="completed">Completed Today</SelectItem>
            <SelectItem value="referred">Referred to Doctor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Patient Lists Based on Flow */}
      <div className="grid grid-cols-1 gap-6">
        {selectedFlow === "waiting" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Patients Ready for Therapy (Paid - Family Counselling & Counselling)
              </CardTitle>
              <CardDescription>
                Patients who have completed payment and are ready for therapy sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredPatients.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No patients waiting for therapy sessions</p>
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
                          <Badge variant="default">Paid</Badge>
                        </div>
                      </div>
                      <Button 
                        onClick={() => handleStartSession(patient)}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        Start Session
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
                <Brain className="h-5 w-5 text-green-600" />
                Active Therapy Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredPatients.map((patient: Patient) => {
                  const activeSession = therapySessions.find((session: TherapySession) => 
                    session.patientId === patient.id && session.status === 'in_progress'
                  );
                  if (!activeSession) return null;

                  return (
                    <div key={patient.id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {patient.firstName} {patient.lastName}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Therapist: {activeSession.therapistName}</span>
                          <span>Type: {activeSession.sessionType}</span>
                          <Badge variant="default" className="bg-green-600">In Session</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleEndSession(activeSession.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          End Session
                        </Button>
                        <Button 
                          onClick={() => handleReferToDoctor(patient, activeSession)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Refer to Doctor
                        </Button>
                        <Button 
                          onClick={() => handleScheduleNext(patient)}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          Schedule Next Session
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Scheduled Sessions (from appointments) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              Scheduled Therapy Sessions (From SMS Notifications)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scheduledSessions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No scheduled therapy sessions</p>
                </div>
              ) : (
                scheduledSessions.map((appointment: any) => {
                  const patient = therapyPatients.find((p: Patient) => p.id === appointment.patientId);
                  if (!patient) return null;

                  return (
                    <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg bg-orange-50">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {patient.firstName} {patient.lastName}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Date: {appointment.appointmentDate}</span>
                          <span>Time: {appointment.appointmentTime}</span>
                          <span>Type: {appointment.appointmentType}</span>
                          <Badge variant="outline">Scheduled</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleStartSession(patient)}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          Start Session
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Start Session Modal */}
      <Dialog open={showSessionModal} onOpenChange={setShowSessionModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Start Therapy Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Therapist Name</Label>
                <Input
                  value={sessionForm.therapistName}
                  onChange={(e) => setSessionForm({...sessionForm, therapistName: e.target.value})}
                  placeholder="Enter therapist name"
                />
              </div>
              <div>
                <Label>Session Type</Label>
                <Select value={sessionForm.sessionType} onValueChange={(value) => setSessionForm({...sessionForm, sessionType: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select session type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual Counselling</SelectItem>
                    <SelectItem value="family">Family Counselling</SelectItem>
                    <SelectItem value="group">Group Therapy</SelectItem>
                    <SelectItem value="assessment">Assessment Session</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Session Goals</Label>
              <Textarea
                value={sessionForm.goals}
                onChange={(e) => setSessionForm({...sessionForm, goals: e.target.value})}
                placeholder="Enter session objectives and goals"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowSessionModal(false)}>
                Cancel
              </Button>
              <Button onClick={submitSession} disabled={startSessionMutation.isPending}>
                {startSessionMutation.isPending ? "Starting..." : "Start Session"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Refer to Doctor Modal */}
      <Dialog open={showReferralModal} onOpenChange={setShowReferralModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Refer Patient to Doctor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Referral Type</Label>
              <Select value={referralForm.referralType} onValueChange={(value) => setReferralForm({...referralForm, referralType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select consultation type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="psychiatrist">Psychiatrist Consultation</SelectItem>
                  <SelectItem value="psychologist">Psychologist Consultation</SelectItem>
                  <SelectItem value="pediatric">Pediatric Psychiatrist</SelectItem>
                  <SelectItem value="general">General Medical Consultation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Referral Reason</Label>
              <Textarea
                value={referralForm.referralReason}
                onChange={(e) => setReferralForm({...referralForm, referralReason: e.target.value})}
                placeholder="Reason for referral and findings"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowReferralModal(false)}>
                Cancel
              </Button>
              <Button onClick={submitReferral} disabled={referToDoctorMutation.isPending}>
                {referToDoctorMutation.isPending ? "Referring..." : "Refer to Doctor"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Next Session Modal */}
      <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Next Therapy Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Next Session Date</Label>
                <Input
                  type="date"
                  value={scheduleForm.nextSessionDate}
                  onChange={(e) => setScheduleForm({...scheduleForm, nextSessionDate: e.target.value})}
                />
              </div>
              <div>
                <Label>Next Session Time</Label>
                <Input
                  type="time"
                  value={scheduleForm.nextSessionTime}
                  onChange={(e) => setScheduleForm({...scheduleForm, nextSessionTime: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label>Session Type</Label>
              <Select value={scheduleForm.sessionType} onValueChange={(value) => setScheduleForm({...scheduleForm, sessionType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select session type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="follow-up">Follow-up Session</SelectItem>
                  <SelectItem value="individual">Individual Counselling</SelectItem>
                  <SelectItem value="family">Family Counselling</SelectItem>
                  <SelectItem value="assessment">Progress Assessment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={scheduleForm.sendSMS}
                onChange={(e) => setScheduleForm({...scheduleForm, sendSMS: e.target.checked})}
              />
              <Label>Send SMS notification to patient</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowScheduleModal(false)}>
                Cancel
              </Button>
              <Button onClick={submitSchedule} disabled={scheduleNextMutation.isPending}>
                {scheduleNextMutation.isPending ? "Scheduling..." : "Schedule & Send SMS"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}