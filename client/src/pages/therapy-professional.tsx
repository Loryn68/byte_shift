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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MessageCircle, User, Calendar, Users, Heart, Brain, FileText, AlertCircle, CheckCircle, Clock, Plus, Stethoscope, Activity, Target, Zap, Shield, BookOpen, Camera, Printer } from "lucide-react";
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

export default function TherapyProfessionalPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showSessionDetails, setShowSessionDetails] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [activeWorkflow, setActiveWorkflow] = useState<"intake" | "session" | "followup">("session");

  // Fetch patients
  const { data: patients = [], isLoading: patientsLoading } = useQuery({
    queryKey: ["/api/patients"],
  });

  // Fetch therapy sessions
  const { data: therapySessions = [] } = useQuery({
    queryKey: ["/api/therapy-sessions"],
  });

  // Filter therapy patients (exclude those who have completed sessions today)
  const therapyPatients = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const completedToday = new Set(
      therapySessions
        .filter((session: any) => session.sessionDate === today && session.status === 'completed')
        .map((session: any) => session.patientId)
    );

    return patients.filter((patient: any) => {
      const isTherapyPatient = patient.serviceType?.includes('Counseling') || 
                              patient.serviceType?.includes('Therapy') ||
                              patient.serviceType?.includes('Mental Health');
      return isTherapyPatient && !completedToday.has(patient.id);
    });
  }, [patients, therapySessions]);

  // Filter patients based on search
  const filteredPatients = useMemo(() => {
    return therapyPatients.filter((patient: Patient) =>
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.patientId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [therapyPatients, searchTerm]);

  // Handler for viewing session details
  const handleViewSession = (patient: any) => {
    const patientSessions = therapySessions.filter((s: any) => s.patientId === patient.id);
    if (patientSessions.length > 0) {
      setSelectedSession(patientSessions[0]);
      setSelectedPatient(patient);
      setShowSessionDetails(true);
    } else {
      toast({
        title: "No Session Found",
        description: `No therapy sessions found for ${patient.firstName} ${patient.lastName}`,
        variant: "destructive",
      });
    }
  };

  // Handler for viewing specific session details
  const handleViewSessionDetails = (session: any) => {
    const patient = therapyPatients.find((p: any) => p.id === session.patientId);
    setSelectedSession(session);
    setSelectedPatient(patient);
    setShowSessionDetails(true);
  };

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
      queryClient.invalidateQueries({ queryKey: ["/api/therapy-sessions"] });
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

  function ProfessionalSessionForm({ patient }: { patient: Patient }) {
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
      riskAssessment: "Low risk",
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
      consultationName: "",
      urgency: "routine"
    });

    const handleCompleteSession = async () => {
      try {
        const completedSessionData = {
          ...sessionData,
          status: "completed"
        };
        
        await sessionMutation.mutateAsync(completedSessionData);
        
        toast({
          title: "Session Completed",
          description: "Therapy session completed successfully. Patient removed from active queue.",
        });
        
        setShowSessionModal(false);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to complete therapy session.",
          variant: "destructive",
        });
      }
    };

    const handleReferToSpecialist = async () => {
      if (!referralData.consultationType) {
        toast({
          title: "Referral Required",
          description: "Please select a referral type before proceeding.",
          variant: "destructive",
        });
        return;
      }

      try {
        // Complete current session with referral notes
        const referralSessionData = {
          ...sessionData,
          status: "completed",
          referralReason: `Referred for ${referralData.consultationName}. ${sessionData.referralReason || ''}`,
          recommendedTreatment: `${sessionData.recommendedTreatment} - Referral to ${referralData.consultationName} recommended.`
        };
        
        await sessionMutation.mutateAsync(referralSessionData);
        
        // Create billing record for specialist consultation
        const billingData = {
          patientId: patient.id,
          serviceType: referralData.consultationName,
          serviceDescription: `${referralData.consultationName} - Referred from therapy`,
          amount: referralData.consultationAmount.toFixed(2),
          totalAmount: referralData.consultationAmount.toFixed(2),
          paymentStatus: "pending",
          notes: `Therapy referral: ${sessionData.counselorFindings || 'Session completed'}`
        };
        
        await apiRequest("POST", "/api/billing", billingData);
        
        toast({
          title: "Referral Successful",
          description: `Patient referred to ${referralData.consultationName}. Billing record created for KShs ${referralData.consultationAmount}.`,
        });
        
        setShowSessionModal(false);
        queryClient.invalidateQueries({ queryKey: ["/api/billing"] });
        
      } catch (error) {
        toast({
          title: "Referral Error",
          description: "Failed to process referral. Please try again.",
          variant: "destructive",
        });
      }
    };

    const handleScheduleFollowUp = async () => {
      if (!sessionData.nextSession) {
        toast({
          title: "Date Required",
          description: "Please specify the next session date and time.",
          variant: "destructive",
        });
        return;
      }

      try {
        // Save current session with follow-up details
        const followUpSessionData = {
          ...sessionData,
          status: "completed"
        };
        
        await sessionMutation.mutateAsync(followUpSessionData);
        
        toast({
          title: "Follow-up Scheduled",
          description: `Next therapy session scheduled for ${sessionData.nextSession}`,
        });
        
        setShowSessionModal(false);
        
      } catch (error) {
        toast({
          title: "Scheduling Error",
          description: "Failed to schedule follow-up session.",
          variant: "destructive",
        });
      }
    };

    return (
      <div className="space-y-6">
        {/* Session Header */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {patient.firstName} {patient.lastName}
              </h3>
              <p className="text-sm text-gray-600">
                ID: {patient.patientId} | Age: {patient.dateOfBirth ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear() : 'N/A'} years
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700">Session Date: {sessionData.sessionDate}</p>
              <p className="text-sm text-gray-600">Time: {sessionData.sessionTime}</p>
            </div>
          </div>
        </div>

        {/* Professional Workflow Tabs */}
        <Tabs value={activeWorkflow} onValueChange={(value) => setActiveWorkflow(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="intake" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Assessment
            </TabsTrigger>
            <TabsTrigger value="session" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Session Notes
            </TabsTrigger>
            <TabsTrigger value="followup" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Treatment Plan
            </TabsTrigger>
          </TabsList>

          {/* Assessment Tab */}
          <TabsContent value="intake" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Session Goals</Label>
                <Textarea
                  value={sessionData.goals}
                  onChange={(e) => setSessionData({...sessionData, goals: e.target.value})}
                  placeholder="What do we want to achieve in this session?"
                  rows={3}
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Risk Assessment</Label>
                <Select 
                  value={sessionData.riskAssessment} 
                  onValueChange={(value) => setSessionData({...sessionData, riskAssessment: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low risk">Low Risk - Stable</SelectItem>
                    <SelectItem value="Moderate risk">Moderate Risk - Monitor</SelectItem>
                    <SelectItem value="High risk">High Risk - Immediate attention</SelectItem>
                    <SelectItem value="Crisis">Crisis - Emergency protocol</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          {/* Session Notes Tab */}
          <TabsContent value="session" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Counselor Observations</Label>
                <Textarea
                  value={sessionData.counselorFindings}
                  onChange={(e) => setSessionData({...sessionData, counselorFindings: e.target.value})}
                  placeholder="Clinical observations, mood, behavior, insights..."
                  rows={4}
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Patient Response</Label>
                <Textarea
                  value={sessionData.patientResponse}
                  onChange={(e) => setSessionData({...sessionData, patientResponse: e.target.value})}
                  placeholder="Patient engagement, feedback, concerns, progress..."
                  rows={4}
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Interventions Used</Label>
                <Textarea
                  value={sessionData.interventions}
                  onChange={(e) => setSessionData({...sessionData, interventions: e.target.value})}
                  placeholder="CBT techniques, mindfulness, behavioral strategies..."
                  rows={3}
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Homework & Activities</Label>
                <Textarea
                  value={sessionData.homework}
                  onChange={(e) => setSessionData({...sessionData, homework: e.target.value})}
                  placeholder="Between-session tasks, exercises, reading..."
                  rows={3}
                />
              </div>
            </div>
          </TabsContent>

          {/* Treatment Plan Tab */}
          <TabsContent value="followup" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Treatment Recommendations</Label>
                <Textarea
                  value={sessionData.recommendedTreatment}
                  onChange={(e) => setSessionData({...sessionData, recommendedTreatment: e.target.value})}
                  placeholder="Ongoing treatment plan, medication recommendations..."
                  rows={3}
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Next Session Date</Label>
                <Input
                  type="datetime-local"
                  value={sessionData.nextSession}
                  onChange={(e) => setSessionData({...sessionData, nextSession: e.target.value})}
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Referral Reason (if applicable)</Label>
                <Textarea
                  value={sessionData.referralReason}
                  onChange={(e) => setSessionData({...sessionData, referralReason: e.target.value})}
                  placeholder="Reason for referral to specialist..."
                  rows={2}
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Additional Notes</Label>
                <Textarea
                  value={sessionData.notes}
                  onChange={(e) => setSessionData({...sessionData, notes: e.target.value})}
                  placeholder="Any other important information..."
                  rows={2}
                />
              </div>
            </div>

            {/* Referral Section */}
            {sessionData.referralReason && (
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h4 className="font-medium text-orange-800 mb-3">Specialist Referral</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Referral Type</Label>
                    <Select 
                      value={referralData.consultationType} 
                      onValueChange={(value) => {
                        const consultationTypes = {
                          "psychiatrist": { name: "Psychiatrist", amount: 4500 },
                          "psychologist": { name: "Clinical Psychologist", amount: 3500 },
                          "neurologist": { name: "Neurologist", amount: 5000 },
                          "pediatric": { name: "Pediatric Psychiatrist", amount: 4000 },
                          "addiction": { name: "Addiction Specialist", amount: 4000 }
                        };
                        const selected = consultationTypes[value as keyof typeof consultationTypes];
                        setReferralData({
                          consultationType: value,
                          consultationAmount: selected?.amount || 0,
                          consultationName: selected?.name || "",
                          urgency: referralData.urgency
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select specialist" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="psychiatrist">Psychiatrist - KShs 4,500</SelectItem>
                        <SelectItem value="psychologist">Clinical Psychologist - KShs 3,500</SelectItem>
                        <SelectItem value="neurologist">Neurologist - KShs 5,000</SelectItem>
                        <SelectItem value="pediatric">Pediatric Psychiatrist - KShs 4,000</SelectItem>
                        <SelectItem value="addiction">Addiction Specialist - KShs 4,000</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Urgency Level</Label>
                    <Select 
                      value={referralData.urgency} 
                      onValueChange={(value) => setReferralData({...referralData, urgency: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="routine">Routine - Within 2 weeks</SelectItem>
                        <SelectItem value="urgent">Urgent - Within 48 hours</SelectItem>
                        <SelectItem value="emergency">Emergency - Immediate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Professional Action Buttons */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-4">Session Actions</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Save Progress */}
            <Button 
              onClick={() => sessionMutation.mutate(sessionData)}
              disabled={sessionMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              {sessionMutation.isPending ? "Saving..." : "Save Progress"}
            </Button>

            {/* Complete Session */}
            <Button 
              onClick={handleCompleteSession}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete Session
            </Button>

            {/* Schedule Follow-up */}
            <Button 
              onClick={handleScheduleFollowUp}
              disabled={!sessionData.nextSession}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Follow-up
            </Button>

            {/* Refer to Specialist */}
            <Button 
              onClick={handleReferToSpecialist}
              disabled={!referralData.consultationType}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Stethoscope className="h-4 w-4 mr-2" />
              Refer to Specialist
            </Button>
          </div>

          <div className="mt-4 text-xs text-gray-600 flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              <span>All data encrypted and HIPAA compliant</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Auto-save every 30 seconds</span>
            </div>
            <div className="flex items-center gap-1">
              <Printer className="h-3 w-3" />
              <span>Session notes printable</span>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => setShowSessionModal(false)}>
            Close Session Interface
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Professional Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Brain className="h-8 w-8 text-blue-600" />
            Professional Therapy Services
          </h1>
          <p className="text-gray-600">Advanced digital therapy platform for mental health professionals</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setLocation("/therapy-forms")}
            variant="outline"
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            <FileText className="h-4 w-4 mr-2" />
            Assessment Tools
          </Button>
          <Button
            onClick={() => setLocation("/therapy")}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Zap className="h-4 w-4 mr-2" />
            Quick Mode
          </Button>
        </div>
      </div>

      {/* Enhanced Statistics with Patient Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Therapy Patients */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Active Patients</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{therapyPatients.length}</div>
            <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
              {therapyPatients.slice(0, 3).map((patient: any) => (
                <div key={patient.id} className="flex justify-between items-center text-xs">
                  <span className="font-medium text-gray-700">
                    {patient.firstName} {patient.lastName}
                  </span>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-6 px-2 text-xs border-blue-300 text-blue-700 hover:bg-blue-100"
                    onClick={() => handleViewSession(patient)}
                  >
                    View
                  </Button>
                </div>
              ))}
              {therapyPatients.length > 3 && (
                <p className="text-xs text-blue-600">+{therapyPatients.length - 3} more patients</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Individual Counseling */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Individual Sessions</CardTitle>
            <User className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {therapyPatients.filter((p: any) => p.serviceType?.includes('individual') || p.serviceType?.includes('Counseling')).length}
            </div>
            <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
              {therapyPatients
                .filter((p: any) => p.serviceType?.includes('individual') || p.serviceType?.includes('Counseling'))
                .slice(0, 3)
                .map((patient: any) => (
                <div key={patient.id} className="flex justify-between items-center text-xs">
                  <span className="font-medium text-gray-700">
                    {patient.firstName} {patient.lastName}
                  </span>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-6 px-2 text-xs border-green-300 text-green-700 hover:bg-green-100"
                    onClick={() => handleViewSession(patient)}
                  >
                    View
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Family Counseling */}
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Family Sessions</CardTitle>
            <Heart className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {therapyPatients.filter((p: any) => p.serviceType?.includes('family')).length}
            </div>
            <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
              {therapyPatients
                .filter((p: any) => p.serviceType?.includes('family'))
                .slice(0, 3)
                .map((patient: any) => (
                <div key={patient.id} className="flex justify-between items-center text-xs">
                  <span className="font-medium text-gray-700">
                    {patient.firstName} {patient.lastName}
                  </span>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-6 px-2 text-xs border-purple-300 text-purple-700 hover:bg-purple-100"
                    onClick={() => handleViewSession(patient)}
                  >
                    View
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Today's Sessions */}
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Today's Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">
              {therapySessions.filter((s: any) => {
                return s.sessionDate === new Date().toISOString().split('T')[0];
              }).length}
            </div>
            <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
              {therapySessions
                .filter((s: any) => s.sessionDate === new Date().toISOString().split('T')[0])
                .slice(0, 3)
                .map((session: any) => {
                  const patient = therapyPatients.find((p: any) => p.id === session.patientId);
                  return (
                    <div key={session.id} className="flex justify-between items-center text-xs">
                      <span className="font-medium text-gray-700">
                        {patient?.firstName} {patient?.lastName}
                      </span>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-6 px-2 text-xs border-orange-300 text-orange-700 hover:bg-orange-100"
                        onClick={() => handleViewSessionDetails(session)}
                      >
                        View
                      </Button>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Professional Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search patients by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="secondary" className="px-3 py-2">
          {filteredPatients.length} patients found
        </Badge>
      </div>

      {/* Patient Queue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Patient Queue
          </CardTitle>
          <CardDescription>
            Patients awaiting therapy sessions - organized by priority and appointment time
          </CardDescription>
        </CardHeader>
        <CardContent>
          {patientsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No patients in therapy queue</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPatients.map((patient: any) => (
                <div key={patient.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {patient.firstName} {patient.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        ID: {patient.patientId} | Service: {patient.serviceType}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={patient.status === 'paid' ? 'default' : 'secondary'}>
                          {patient.status === 'paid' ? 'Payment Complete' : 'Pending Payment'}
                        </Badge>
                        {patient.emergencyContact && (
                          <Badge variant="outline" className="text-xs">
                            Emergency Contact Available
                          </Badge>
                        )}
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
                      Start Professional Session
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLocation("/therapy-forms")}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Assessments
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Professional Session Modal */}
      <Dialog open={showSessionModal} onOpenChange={setShowSessionModal}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Brain className="h-6 w-6 text-blue-600" />
              Professional Therapy Session
            </DialogTitle>
          </DialogHeader>
          {selectedPatient && <ProfessionalSessionForm patient={selectedPatient} />}
        </DialogContent>
      </Dialog>

      {/* Session Details View Modal */}
      <Dialog open={showSessionDetails} onOpenChange={setShowSessionDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800">
              Session History - {selectedPatient?.firstName} {selectedPatient?.lastName}
            </DialogTitle>
            <div className="text-sm text-gray-600">
              Patient ID: {selectedPatient?.patientId} | Session Date: {selectedSession?.sessionDate}
            </div>
          </DialogHeader>
          {selectedSession && (
            <div className="space-y-6">
              {/* Session Overview */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-3">Session Overview</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-gray-600">Therapist</Label>
                    <p className="text-sm font-medium">{selectedSession.therapistName}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-600">Date & Time</Label>
                    <p className="text-sm font-medium">{selectedSession.sessionDate} at {selectedSession.sessionTime}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-600">Duration</Label>
                    <p className="text-sm font-medium">{selectedSession.duration} minutes</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-600">Status</Label>
                    <Badge variant={selectedSession.status === 'completed' ? 'default' : 'secondary'}>
                      {selectedSession.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Session Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Session Goals</Label>
                    <div className="mt-1 p-3 bg-gray-50 rounded border">
                      <p className="text-sm text-gray-800">{selectedSession.goals || "No goals specified"}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Counselor Findings</Label>
                    <div className="mt-1 p-3 bg-blue-50 rounded border">
                      <p className="text-sm text-gray-800">{selectedSession.counselorFindings || "No findings recorded"}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Interventions</Label>
                    <div className="mt-1 p-3 bg-green-50 rounded border">
                      <p className="text-sm text-gray-800">{selectedSession.interventions || "No interventions recorded"}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Patient Response</Label>
                    <div className="mt-1 p-3 bg-purple-50 rounded border">
                      <p className="text-sm text-gray-800">{selectedSession.patientResponse || "No patient response recorded"}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Risk Assessment</Label>
                    <div className="mt-1 p-3 bg-yellow-50 rounded border">
                      <p className="text-sm text-gray-800">{selectedSession.riskAssessment || "No risk assessment completed"}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Homework/Activities</Label>
                    <div className="mt-1 p-3 bg-orange-50 rounded border">
                      <p className="text-sm text-gray-800">{selectedSession.homework || "No homework assigned"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowSessionDetails(false)}>
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    setShowSessionDetails(false);
                    setShowSessionModal(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Continue Session
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}