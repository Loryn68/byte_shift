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
      return apiRequest("/api/appointments", "POST", data);
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
    // Get the service from patient's registration data
    const registeredService = (patient as any).registerFor || "Psychiatric Consultation";
    
    // Create appointment referral data
    const referralData = {
      patientId: patient.id,
      type: registeredService,
      doctorId: 1, // Default doctor - this should be selected by the patient/receptionist
      appointmentDate: new Date().toISOString().split('T')[0], // Today's date
      department: "Mental Health",
      status: "pending",
      notes: `Referred by therapist from therapy department. Patient registered for: ${registeredService}. Patient needs to pay at cashier before consultation.`
    };

    await doctorReferralMutation.mutateAsync(referralData);
  };

  const TherapySessionForm = ({ patient }: { patient: Patient }) => {
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
      status: "scheduled"
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

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">Schedule Therapy Session</h3>
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
            <Label htmlFor="therapistName">Therapist</Label>
            <select
              id="therapistName"
              value={sessionData.therapistName}
              onChange={(e) => setSessionData(prev => ({ ...prev, therapistName: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="Dr. Sarah Johnson">Dr. Sarah Johnson - Child Psychologist</option>
              <option value="Dr. Michael Chen">Dr. Michael Chen - Family Therapist</option>
              <option value="Dr. Emily White">Dr. Emily White - Play Therapist</option>
              <option value="Dr. James Brown">Dr. James Brown - Behavioral Specialist</option>
            </select>
          </div>

          <div>
            <Label htmlFor="sessionDate">Session Date</Label>
            <Input
              id="sessionDate"
              type="date"
              value={sessionData.sessionDate}
              onChange={(e) => setSessionData(prev => ({ ...prev, sessionDate: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="sessionTime">Session Time</Label>
            <Input
              id="sessionTime"
              type="time"
              value={sessionData.sessionTime}
              onChange={(e) => setSessionData(prev => ({ ...prev, sessionTime: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="duration">Duration (minutes)</Label>
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
              onClick={() => handleDoctorReferral(patient)}
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
                      onClick={() => {
                        setSelectedPatient(patient);
                        setShowSessionModal(true);
                      }}
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