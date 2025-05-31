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
import { Textarea } from "@/components/ui/textarea";
import { UserPlus, Search, Users, CreditCard, User, Phone, Mail, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function PatientRegistry() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("register");
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [patientForm, setPatientForm] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    phoneNumber: "",
    email: "",
    address: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
    insuranceProvider: "",
    insurancePolicyNumber: "",
    nationalId: "",
    occupation: "",
    maritalStatus: "",
    nextOfKin: "",
    allergies: "",
    chronicConditions: "",
    currentMedications: ""
  });

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["/api/patients"],
  });

  const registerPatientMutation = useMutation({
    mutationFn: async (patientData: any) => {
      return await apiRequest("POST", "/api/patients", patientData);
    },
    onSuccess: (data) => {
      toast({
        title: "Patient Registered Successfully",
        description: `Patient ID: ${data.patientId} has been created.`,
      });
      setShowPatientModal(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
    },
  });

  const resetForm = () => {
    setPatientForm({
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "",
      phoneNumber: "",
      email: "",
      address: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      emergencyContactRelation: "",
      insuranceProvider: "",
      insurancePolicyNumber: "",
      nationalId: "",
      occupation: "",
      maritalStatus: "",
      nextOfKin: "",
      allergies: "",
      chronicConditions: "",
      currentMedications: ""
    });
  };

  const handleSubmit = () => {
    // Validate mandatory fields as per hospital guidelines
    if (!patientForm.firstName || !patientForm.lastName || !patientForm.dateOfBirth || !patientForm.phoneNumber) {
      toast({
        title: "Missing Required Fields",
        description: "Name, Date of Birth, and Phone are mandatory for patient registration.",
        variant: "destructive"
      });
      return;
    }

    // Check for existing patient (business logic as per guidelines)
    const existingPatient = patients.find((p: any) => 
      p.firstName.toLowerCase() === patientForm.firstName.toLowerCase() &&
      p.lastName.toLowerCase() === patientForm.lastName.toLowerCase() &&
      p.dateOfBirth === patientForm.dateOfBirth
    );

    if (existingPatient) {
      toast({
        title: "Patient Already Exists",
        description: `Patient already registered with ID: ${existingPatient.patientId}`,
        variant: "destructive"
      });
      return;
    }

    registerPatientMutation.mutate(patientForm);
  };

  const filteredPatients = patients.filter((patient: any) =>
    patient.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.patientId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.phoneNumber?.includes(searchQuery)
  );

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <UserPlus className="h-8 w-8 text-blue-600" />
          Patient Registry
        </h1>
        <p className="text-gray-600 mt-2">Patient registration and management system for Child Mental Haven</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="register">New Registration</TabsTrigger>
          <TabsTrigger value="search">Search Patients</TabsTrigger>
          <TabsTrigger value="directory">Patient Directory</TabsTrigger>
        </TabsList>

        <TabsContent value="register" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Patient Registration Form
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Demographics Section */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Demographics</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>First Name *</Label>
                      <Input
                        value={patientForm.firstName}
                        onChange={(e) => setPatientForm(prev => ({ ...prev, firstName: e.target.value }))}
                        placeholder="Enter first name"
                      />
                    </div>
                    <div>
                      <Label>Last Name *</Label>
                      <Input
                        value={patientForm.lastName}
                        onChange={(e) => setPatientForm(prev => ({ ...prev, lastName: e.target.value }))}
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Date of Birth *</Label>
                      <Input
                        type="date"
                        value={patientForm.dateOfBirth}
                        onChange={(e) => setPatientForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Gender</Label>
                      <Select value={patientForm.gender} onValueChange={(value) => setPatientForm(prev => ({ ...prev, gender: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>National ID</Label>
                    <Input
                      value={patientForm.nationalId}
                      onChange={(e) => setPatientForm(prev => ({ ...prev, nationalId: e.target.value }))}
                      placeholder="Enter national ID number"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Marital Status</Label>
                      <Select value={patientForm.maritalStatus} onValueChange={(value) => setPatientForm(prev => ({ ...prev, maritalStatus: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">Single</SelectItem>
                          <SelectItem value="married">Married</SelectItem>
                          <SelectItem value="divorced">Divorced</SelectItem>
                          <SelectItem value="widowed">Widowed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Occupation</Label>
                      <Input
                        value={patientForm.occupation}
                        onChange={(e) => setPatientForm(prev => ({ ...prev, occupation: e.target.value }))}
                        placeholder="Enter occupation"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Contact Information</h3>
                  
                  <div>
                    <Label>Phone Number *</Label>
                    <Input
                      value={patientForm.phoneNumber}
                      onChange={(e) => setPatientForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div>
                    <Label>Email Address</Label>
                    <Input
                      type="email"
                      value={patientForm.email}
                      onChange={(e) => setPatientForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter email address"
                    />
                  </div>

                  <div>
                    <Label>Physical Address</Label>
                    <Textarea
                      value={patientForm.address}
                      onChange={(e) => setPatientForm(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Enter physical address"
                      rows={3}
                    />
                  </div>

                  <h4 className="font-medium text-md border-b pb-1">Emergency Contact</h4>
                  
                  <div>
                    <Label>Emergency Contact Name</Label>
                    <Input
                      value={patientForm.emergencyContactName}
                      onChange={(e) => setPatientForm(prev => ({ ...prev, emergencyContactName: e.target.value }))}
                      placeholder="Enter emergency contact name"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Emergency Contact Phone</Label>
                      <Input
                        value={patientForm.emergencyContactPhone}
                        onChange={(e) => setPatientForm(prev => ({ ...prev, emergencyContactPhone: e.target.value }))}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div>
                      <Label>Relationship</Label>
                      <Input
                        value={patientForm.emergencyContactRelation}
                        onChange={(e) => setPatientForm(prev => ({ ...prev, emergencyContactRelation: e.target.value }))}
                        placeholder="e.g., Parent, Spouse"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Insurance Information */}
              <div className="mt-6 space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Insurance Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Insurance Provider</Label>
                    <Select value={patientForm.insuranceProvider} onValueChange={(value) => setPatientForm(prev => ({ ...prev, insuranceProvider: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select insurance provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nhif">NHIF</SelectItem>
                        <SelectItem value="aap">AAP Insurance</SelectItem>
                        <SelectItem value="jubilee">Jubilee Insurance</SelectItem>
                        <SelectItem value="britam">Britam Insurance</SelectItem>
                        <SelectItem value="madison">Madison Insurance</SelectItem>
                        <SelectItem value="self_pay">Self Pay</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Policy Number</Label>
                    <Input
                      value={patientForm.insurancePolicyNumber}
                      onChange={(e) => setPatientForm(prev => ({ ...prev, insurancePolicyNumber: e.target.value }))}
                      placeholder="Enter policy number"
                    />
                  </div>
                </div>
              </div>

              {/* Medical History */}
              <div className="mt-6 space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Medical History</h3>
                <div className="space-y-4">
                  <div>
                    <Label>Known Allergies</Label>
                    <Textarea
                      value={patientForm.allergies}
                      onChange={(e) => setPatientForm(prev => ({ ...prev, allergies: e.target.value }))}
                      placeholder="List any known allergies"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label>Chronic Conditions</Label>
                    <Textarea
                      value={patientForm.chronicConditions}
                      onChange={(e) => setPatientForm(prev => ({ ...prev, chronicConditions: e.target.value }))}
                      placeholder="List any chronic conditions"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label>Current Medications</Label>
                    <Textarea
                      value={patientForm.currentMedications}
                      onChange={(e) => setPatientForm(prev => ({ ...prev, currentMedications: e.target.value }))}
                      placeholder="List current medications"
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-4">
                <Button variant="outline" onClick={resetForm}>
                  Clear Form
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={registerPatientMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {registerPatientMutation.isPending ? "Registering..." : "Register Patient"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Existing Patients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by name, patient ID, or phone number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {searchQuery && (
                  <div className="space-y-2">
                    {filteredPatients.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No patients found matching your search.</p>
                    ) : (
                      filteredPatients.map((patient: any) => (
                        <div key={patient.id} className="p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{patient.firstName} {patient.lastName}</h4>
                              <p className="text-sm text-gray-600">Patient ID: {patient.patientId}</p>
                              <p className="text-sm text-gray-600">Phone: {patient.phoneNumber}</p>
                              <p className="text-sm text-gray-600">DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}</p>
                            </div>
                            <Button size="sm">View Details</Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="directory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Patient Directory
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading patients...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Insurance</TableHead>
                      <TableHead>Registered</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patients.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          No patients registered yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      patients.map((patient: any) => (
                        <TableRow key={patient.id}>
                          <TableCell className="font-medium">{patient.patientId}</TableCell>
                          <TableCell>{patient.firstName} {patient.lastName}</TableCell>
                          <TableCell>
                            {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {patient.phoneNumber}
                              </div>
                              {patient.email && (
                                <div className="flex items-center gap-1 text-gray-500">
                                  <Mail className="h-3 w-3" />
                                  {patient.email}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{patient.insuranceProvider || "Self Pay"}</TableCell>
                          <TableCell>
                            {new Date(patient.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">View</Button>
                              <Button size="sm" variant="outline">Edit</Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}