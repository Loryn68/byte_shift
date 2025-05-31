import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Calendar, 
  Clock, 
  Search, 
  Plus, 
  User, 
  Stethoscope,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle,
  Edit,
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function AppointmentScheduling() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("schedule");
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchPatient, setSearchPatient] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  const [appointmentForm, setAppointmentForm] = useState({
    patientId: "",
    doctorId: "",
    appointmentDate: "",
    appointmentTime: "",
    reasonForVisit: "",
    appointmentType: "consultation",
    department: "",
    priority: "normal",
    notes: "",
    reminderSms: true,
    reminderEmail: true
  });

  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery({
    queryKey: ["/api/appointments", selectedDate],
  });

  const { data: doctors = [] } = useQuery({
    queryKey: ["/api/doctors"],
  });

  const { data: patients = [] } = useQuery({
    queryKey: ["/api/patients"],
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["/api/departments"],
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: any) => {
      return await apiRequest("POST", "/api/appointments", appointmentData);
    },
    onSuccess: () => {
      toast({
        title: "Appointment Scheduled",
        description: "Appointment has been successfully scheduled.",
      });
      setShowAppointmentModal(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
    },
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest("PUT", `/api/appointments/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Appointment Updated",
        description: "Appointment has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
    },
  });

  const resetForm = () => {
    setAppointmentForm({
      patientId: "",
      doctorId: "",
      appointmentDate: "",
      appointmentTime: "",
      reasonForVisit: "",
      appointmentType: "consultation",
      department: "",
      priority: "normal",
      notes: "",
      reminderSms: true,
      reminderEmail: true
    });
    setSelectedPatient(null);
  };

  const handlePatientSearch = (query: string) => {
    setSearchPatient(query);
    if (query.length > 2) {
      const foundPatient = patients.find((p: any) => 
        p.firstName.toLowerCase().includes(query.toLowerCase()) ||
        p.lastName.toLowerCase().includes(query.toLowerCase()) ||
        p.patientId.toLowerCase().includes(query.toLowerCase())
      );
      if (foundPatient) {
        setSelectedPatient(foundPatient);
        setAppointmentForm(prev => ({ ...prev, patientId: foundPatient.id }));
      }
    }
  };

  const handleScheduleAppointment = () => {
    if (!appointmentForm.patientId || !appointmentForm.doctorId || !appointmentForm.appointmentDate || !appointmentForm.appointmentTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // Check doctor availability (business logic from guidelines)
    const existingAppointment = appointments.find((apt: any) => 
      apt.doctorId === appointmentForm.doctorId &&
      apt.appointmentDate === appointmentForm.appointmentDate &&
      apt.appointmentTime === appointmentForm.appointmentTime &&
      apt.status !== "cancelled"
    );

    if (existingAppointment) {
      toast({
        title: "Time Slot Unavailable",
        description: "The selected time slot is not available for this doctor.",
        variant: "destructive"
      });
      return;
    }

    createAppointmentMutation.mutate(appointmentForm);
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      scheduled: "bg-blue-100 text-blue-800",
      confirmed: "bg-green-100 text-green-800",
      completed: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
      "no-show": "bg-orange-100 text-orange-800"
    };
    
    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityColors = {
      emergency: "bg-red-100 text-red-800",
      urgent: "bg-orange-100 text-orange-800",
      normal: "bg-blue-100 text-blue-800",
      routine: "bg-gray-100 text-gray-800"
    };
    
    return (
      <Badge className={priorityColors[priority as keyof typeof priorityColors] || "bg-gray-100 text-gray-800"}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Calendar className="h-8 w-8 text-blue-600" />
          Appointment Scheduling
        </h1>
        <p className="text-gray-600 mt-2">Doctor availability management and appointment booking system</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="schedule">Schedule Appointment</TabsTrigger>
          <TabsTrigger value="calendar">Today's Schedule</TabsTrigger>
          <TabsTrigger value="patients">Patient Search</TabsTrigger>
          <TabsTrigger value="availability">Doctor Availability</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">New Appointment</h2>
              <p className="text-gray-600">Book appointments with real-time availability checking</p>
            </div>
            <Button onClick={() => setShowAppointmentModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule New Appointment
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Patient Search</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search by name or patient ID..."
                      value={searchPatient}
                      onChange={(e) => handlePatientSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  {selectedPatient && (
                    <div className="p-4 border rounded-lg bg-blue-50">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">Selected Patient</span>
                      </div>
                      <div>
                        <div className="font-semibold">{selectedPatient.firstName} {selectedPatient.lastName}</div>
                        <div className="text-sm text-gray-600">ID: {selectedPatient.patientId}</div>
                        <div className="text-sm text-gray-600">Phone: {selectedPatient.phoneNumber}</div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    View Today's Schedule
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Clock className="h-4 w-4 mr-2" />
                    Check Doctor Availability
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <User className="h-4 w-4 mr-2" />
                    Register New Patient
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Today's Appointments</h2>
              <p className="text-gray-600">View and manage scheduled appointments for {selectedDate}</p>
            </div>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-48"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Appointment Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              {appointmentsLoading ? (
                <div className="text-center py-8">Loading appointments...</div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No appointments scheduled for this date.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((appointment: any) => (
                      <TableRow key={appointment.id}>
                        <TableCell className="font-medium">
                          {appointment.appointmentTime}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{appointment.patientName}</div>
                            <div className="text-sm text-gray-500">{appointment.patientId}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{appointment.doctorName}</div>
                            <div className="text-sm text-gray-500">{appointment.department}</div>
                          </div>
                        </TableCell>
                        <TableCell>{appointment.appointmentType}</TableCell>
                        <TableCell>{getPriorityBadge(appointment.priority)}</TableCell>
                        <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Patient Directory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search patients..."
                    className="pl-10"
                  />
                </div>
                
                <div className="space-y-2">
                  {patients.slice(0, 10).map((patient: any) => (
                    <div key={patient.id} className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{patient.firstName} {patient.lastName}</h4>
                          <p className="text-sm text-gray-600">ID: {patient.patientId}</p>
                          <p className="text-sm text-gray-600">Phone: {patient.phoneNumber}</p>
                        </div>
                        <Button size="sm" onClick={() => {
                          setSelectedPatient(patient);
                          setAppointmentForm(prev => ({ ...prev, patientId: patient.id }));
                          setShowAppointmentModal(true);
                        }}>
                          Schedule
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="availability" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Doctor Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Doctor availability matrix and schedule management will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Appointment Modal */}
      <Dialog open={showAppointmentModal} onOpenChange={setShowAppointmentModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule New Appointment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedPatient && (
              <div className="p-4 border rounded-lg bg-blue-50">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Patient Information</span>
                </div>
                <div>
                  <div className="font-semibold">{selectedPatient.firstName} {selectedPatient.lastName}</div>
                  <div className="text-sm text-gray-600">ID: {selectedPatient.patientId}</div>
                  <div className="text-sm text-gray-600">Phone: {selectedPatient.phoneNumber}</div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Department</Label>
                <Select value={appointmentForm.department} onValueChange={(value) => setAppointmentForm(prev => ({ ...prev, department: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept: any) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Doctor</Label>
                <Select value={appointmentForm.doctorId} onValueChange={(value) => setAppointmentForm(prev => ({ ...prev, doctorId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor: any) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        Dr. {doctor.firstName} {doctor.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Appointment Date</Label>
                <Input
                  type="date"
                  value={appointmentForm.appointmentDate}
                  onChange={(e) => setAppointmentForm(prev => ({ ...prev, appointmentDate: e.target.value }))}
                />
              </div>
              <div>
                <Label>Appointment Time</Label>
                <Select value={appointmentForm.appointmentTime} onValueChange={(value) => setAppointmentForm(prev => ({ ...prev, appointmentTime: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Appointment Type</Label>
                <Select value={appointmentForm.appointmentType} onValueChange={(value) => setAppointmentForm(prev => ({ ...prev, appointmentType: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="follow-up">Follow-up</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="procedure">Procedure</SelectItem>
                    <SelectItem value="therapy">Therapy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={appointmentForm.priority} onValueChange={(value) => setAppointmentForm(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="routine">Routine</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Reason for Visit</Label>
              <Textarea
                value={appointmentForm.reasonForVisit}
                onChange={(e) => setAppointmentForm(prev => ({ ...prev, reasonForVisit: e.target.value }))}
                placeholder="Describe the reason for this appointment"
                rows={2}
              />
            </div>

            <div>
              <Label>Additional Notes</Label>
              <Textarea
                value={appointmentForm.notes}
                onChange={(e) => setAppointmentForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional notes or special instructions"
                rows={2}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAppointmentModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleScheduleAppointment} disabled={createAppointmentMutation.isPending}>
                {createAppointmentMutation.isPending ? "Scheduling..." : "Schedule Appointment"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
