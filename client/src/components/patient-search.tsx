import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, User, Calendar, Phone, MapPin, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Patient } from "@shared/schema";

interface PatientSearchProps {
  onPatientSelect: (patient: Patient) => void;
  selectedPatient: Patient | null;
}

export function PatientSearch({ onPatientSelect, selectedPatient }: PatientSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  // Fetch all patients
  const { data: patients = [] } = useQuery({
    queryKey: ["/api/patients"],
  });

  // Fetch patient history data
  const { data: billingHistory = [] } = useQuery({
    queryKey: ["/api/billing"],
  });

  const { data: therapySessions = [] } = useQuery({
    queryKey: ["/api/therapy-sessions"],
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ["/api/appointments"],
  });

  // Filter patients based on search query
  const filteredPatients = patients.filter((patient: any) => {
    if (!searchQuery.trim()) return false;
    const query = searchQuery.toLowerCase();
    return (
      patient.firstName?.toLowerCase().includes(query) ||
      patient.lastName?.toLowerCase().includes(query) ||
      patient.middleName?.toLowerCase().includes(query) ||
      patient.patientId?.toLowerCase().includes(query) ||
      patient.phone?.includes(query) ||
      patient.nationalId?.toLowerCase().includes(query)
    );
  });

  const handleSearch = () => {
    setShowResults(true);
  };

  const handlePatientSelect = (patient: Patient) => {
    onPatientSelect(patient);
    setShowResults(false);
    setSearchQuery(`${patient.firstName} ${patient.lastName}`);
  };

  // Get patient history summaries
  const getPatientSummary = (patientId: number) => {
    const patientBilling = billingHistory.filter((bill: any) => bill.patientId === patientId);
    const patientSessions = therapySessions.filter((session: any) => session.patientId === patientId);

    return {
      totalVisits: patientBilling.length,
      lastVisit: patientBilling.length > 0 ? 
        new Date(Math.max(...patientBilling.map((b: any) => new Date(b.createdAt).getTime()))).toLocaleDateString() : 
        "No visits",
      therapySessions: patientSessions.length,
      totalSpent: patientBilling
        .filter((bill: any) => bill.paymentStatus === "paid")
        .reduce((sum: number, bill: any) => sum + parseFloat(bill.totalAmount || "0"), 0)
    };
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, ID, phone, or national ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch} variant="outline">
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>

      {showResults && filteredPatients.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Search Results ({filteredPatients.length} patients found)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredPatients.map((patient: any) => {
                const summary = getPatientSummary(patient.id);
                return (
                  <div
                    key={patient.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handlePatientSelect(patient)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-blue-600" />
                          <h3 className="font-semibold text-lg">
                            {patient.firstName} {patient.middleName} {patient.lastName}
                          </h3>
                          <Badge variant="outline">{patient.patientId}</Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {patient.phone}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Age: {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {patient.address}
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {patient.gender}
                          </div>
                        </div>

                        <div className="mt-3 flex gap-4 text-xs">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {summary.totalVisits} Visits
                          </span>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                            {summary.therapySessions} Therapy Sessions
                          </span>
                          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">
                            Last Visit: {summary.lastVisit}
                          </span>
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                            Total: KShs {summary.totalSpent.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {showResults && filteredPatients.length === 0 && searchQuery && (
        <Card>
          <CardContent className="py-8 text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No patients found matching "{searchQuery}"</p>
            <p className="text-sm text-gray-500 mt-2">
              Try searching by name, patient ID, phone number, or national ID
            </p>
          </CardContent>
        </Card>
      )}

      {selectedPatient && (
        <PatientHistoryTabs patient={selectedPatient} />
      )}
    </div>
  );
}

interface PatientHistoryTabsProps {
  patient: Patient;
}

function PatientHistoryTabs({ patient }: PatientHistoryTabsProps) {
  // Fetch patient-specific history
  const { data: billingHistory = [] } = useQuery({
    queryKey: ["/api/billing"],
  });

  const { data: therapySessions = [] } = useQuery({
    queryKey: ["/api/therapy-sessions"],
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ["/api/appointments"],
  });

  const patientBilling = billingHistory.filter((bill: any) => bill.patientId === patient.id);
  const patientSessions = therapySessions.filter((session: any) => session.patientId === patient.id);
  const patientAppointments = appointments.filter((apt: any) => apt.patientId === patient.id);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">
          Patient History: {patient.firstName} {patient.lastName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="billing">Billing History</TabsTrigger>
            <TabsTrigger value="therapy">Therapy History</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="medical">Medical Records</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Patient Information</h4>
                <div className="text-sm space-y-1">
                  <p><strong>Patient ID:</strong> {patient.patientId}</p>
                  <p><strong>Phone:</strong> {patient.phone}</p>
                  <p><strong>Email:</strong> {patient.email || "Not provided"}</p>
                  <p><strong>Address:</strong> {patient.address}</p>
                  <p><strong>Emergency Contact:</strong> {patient.emergencyContactName} ({patient.emergencyContactPhone})</p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Medical Summary</h4>
                <div className="text-sm space-y-1">
                  <p><strong>Blood Type:</strong> {patient.bloodType || "Unknown"}</p>
                  <p><strong>Allergies:</strong> {patient.allergies || "None recorded"}</p>
                  <p><strong>Insurance:</strong> {patient.insuranceProvider || "None"}</p>
                  <p><strong>Registration Date:</strong> {new Date(patient.registrationDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="billing" className="space-y-4">
            <h4 className="font-semibold">Billing History ({patientBilling.length} records)</h4>
            {patientBilling.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {patientBilling
                  .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((bill: any) => (
                    <div key={bill.id} className="border rounded p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{bill.serviceType}</p>
                          <p className="text-sm text-gray-600">{bill.serviceDescription}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(bill.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">KShs {bill.totalAmount}</p>
                          <Badge 
                            variant={bill.paymentStatus === "paid" ? "default" : "secondary"}
                          >
                            {bill.paymentStatus}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-500">No billing records found</p>
            )}
          </TabsContent>

          <TabsContent value="therapy" className="space-y-4">
            <h4 className="font-semibold">Therapy History ({patientSessions.length} sessions)</h4>
            {patientSessions.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {patientSessions
                  .sort((a: any, b: any) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime())
                  .map((session: any) => (
                    <div key={session.id} className="border rounded p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{session.sessionType} Session</p>
                          <p className="text-sm text-gray-600">
                            Therapist: {session.therapistName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {session.sessionDate} at {session.sessionTime}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">{session.duration} minutes</p>
                          <Badge variant="outline">{session.status}</Badge>
                        </div>
                      </div>
                      {session.counselorFindings && (
                        <div className="mt-2 text-sm">
                          <p className="font-medium">Findings:</p>
                          <p className="text-gray-600">{session.counselorFindings}</p>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-500">No therapy sessions found</p>
            )}
          </TabsContent>

          <TabsContent value="appointments" className="space-y-4">
            <h4 className="font-semibold">Appointment History ({patientAppointments.length} appointments)</h4>
            {patientAppointments.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {patientAppointments
                  .sort((a: any, b: any) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime())
                  .map((appointment: any) => (
                    <div key={appointment.id} className="border rounded p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{appointment.type}</p>
                          <p className="text-sm text-gray-600">
                            Department: {appointment.department}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(appointment.appointmentDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge 
                          variant={appointment.status === "completed" ? "default" : "secondary"}
                        >
                          {appointment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-500">No appointments found</p>
            )}
          </TabsContent>

          <TabsContent value="medical" className="space-y-4">
            <h4 className="font-semibold">Medical Records</h4>
            <div className="grid grid-cols-1 gap-4">
              <div className="border rounded p-3">
                <h5 className="font-medium mb-2">Medical History</h5>
                <p className="text-sm text-gray-600">
                  {patient.medicalHistory || "No medical history recorded"}
                </p>
              </div>
              <div className="border rounded p-3">
                <h5 className="font-medium mb-2">Known Allergies</h5>
                <p className="text-sm text-gray-600">
                  {patient.allergies || "No allergies recorded"}
                </p>
              </div>
              <div className="border rounded p-3">
                <h5 className="font-medium mb-2">Insurance Information</h5>
                <div className="text-sm text-gray-600">
                  <p><strong>Provider:</strong> {patient.insuranceProvider || "None"}</p>
                  <p><strong>Policy Number:</strong> {patient.policyNumber || "N/A"}</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}