import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Edit, Trash2, FileText, Save, User, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function PatientRegistry() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("registration");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingPatient, setEditingPatient] = useState<any>(null);

  const [patientForm, setPatientForm] = useState({
    // Basic Information
    surname: "",
    baptismalName: "",
    otherName: "",
    dateOfBirth: "",
    gender: "",
    idNo: "",
    telNo: "",
    
    // Registration Details
    registrationDate: new Date().toISOString().split('T')[0],
    patientCategorization: "",
    registerFor: "",
    paymentOption: "",
    
    // Contact Information
    residence: "",
    occupation: "",
    emergencyContact: "",
    
    // Next of Kin
    nextOfKinFullName: "",
    nextOfKinRelationship: "",
    nextOfKinTelNumber: "",
    
    // Medical Information
    medicalHistory: "",
    allergies: "",
    referralSource: "",
    
    // Card Options
    issueCard: false
  });

  const { data: patients = [] } = useQuery({
    queryKey: ["/api/patients"],
  });

  const createPatientMutation = useMutation({
    mutationFn: async (patientData: any) => {
      return await apiRequest("POST", "/api/patients", patientData);
    },
    onSuccess: (response) => {
      toast({
        title: "Patient Registered",
        description: `Patient registered successfully with ID: ${response.patientId}`,
      });
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
    },
  });

  const updatePatientMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest("PUT", `/api/patients/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Patient Updated",
        description: "Patient information updated successfully.",
      });
      setEditingPatient(null);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
    },
  });

  const resetForm = () => {
    setPatientForm({
      surname: "",
      baptismalName: "",
      otherName: "",
      dateOfBirth: "",
      gender: "",
      idNo: "",
      telNo: "",
      registrationDate: new Date().toISOString().split('T')[0],
      patientCategorization: "",
      registerFor: "",
      paymentOption: "",
      residence: "",
      occupation: "",
      emergencyContact: "",
      nextOfKinFullName: "",
      nextOfKinRelationship: "",
      nextOfKinTelNumber: "",
      medicalHistory: "",
      allergies: "",
      referralSource: "",
      issueCard: false
    });
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const foundPatients = patients.filter((p: any) => 
        p.surname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.baptismalName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.patientId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.idNo?.includes(searchQuery)
      );
      
      if (foundPatients.length > 0) {
        setActiveTab("patients");
      } else {
        toast({
          title: "Not Found",
          description: "No patients found matching your search.",
          variant: "destructive"
        });
      }
    }
  };

  const handleEdit = (patient: any) => {
    setEditingPatient(patient);
    setPatientForm(patient);
    setActiveTab("registration");
  };

  const handleSubmit = () => {
    if (!patientForm.surname || !patientForm.baptismalName || !patientForm.dateOfBirth) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in all required fields (Name, Date of Birth).",
        variant: "destructive"
      });
      return;
    }

    if (editingPatient) {
      updatePatientMutation.mutate({ id: editingPatient.id, data: patientForm });
    } else {
      createPatientMutation.mutate(patientForm);
    }
  };

  const filteredPatients = patients.filter((p: any) => 
    !searchQuery || 
    p.surname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.baptismalName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.patientId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen bg-green-50 p-6">
      <div className="bg-white rounded-lg shadow-sm h-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-blue-800">Patient Registry</h1>
              <p className="text-gray-600 mt-1">Comprehensive patient registration and management system</p>
            </div>
            <div className="flex items-center gap-4">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, ID, or patient number..."
                className="w-80"
              />
              <Button onClick={handleSearch} variant="outline">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 h-full overflow-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="registration" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {editingPatient ? "Edit Patient" : "New Registration"}
              </TabsTrigger>
              <TabsTrigger value="patients" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Patient Records ({patients.length})
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Registration Reports
              </TabsTrigger>
            </TabsList>

            {/* Registration Form Tab */}
            <TabsContent value="registration" className="space-y-6">
              <div className="grid grid-cols-3 gap-6">
                {/* Form Fields */}
                <div className="col-span-2 space-y-6">
                  {editingPatient && (
                    <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Editing Patient Record</h3>
                        <p className="text-sm text-gray-600">
                          Patient ID: {editingPatient.patientId}
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setEditingPatient(null);
                          resetForm();
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel Edit
                      </Button>
                    </div>
                  )}

                  {/* Personal Information Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Surname *</Label>
                          <Input
                            value={patientForm.surname}
                            onChange={(e) => setPatientForm(prev => ({ ...prev, surname: e.target.value }))}
                            placeholder="Enter surname"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">First Name *</Label>
                          <Input
                            value={patientForm.baptismalName}
                            onChange={(e) => setPatientForm(prev => ({ ...prev, baptismalName: e.target.value }))}
                            placeholder="Enter first name"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Other Names</Label>
                          <Input
                            value={patientForm.otherName}
                            onChange={(e) => setPatientForm(prev => ({ ...prev, otherName: e.target.value }))}
                            placeholder="Middle names"
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Date of Birth *</Label>
                          <Input
                            type="date"
                            value={patientForm.dateOfBirth}
                            onChange={(e) => setPatientForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Gender</Label>
                          <Select value={patientForm.gender} onValueChange={(value) => setPatientForm(prev => ({ ...prev, gender: value }))}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">ID Number</Label>
                          <Input
                            value={patientForm.idNo}
                            onChange={(e) => setPatientForm(prev => ({ ...prev, idNo: e.target.value }))}
                            placeholder="National ID or Birth Certificate"
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Phone Number</Label>
                          <Input
                            value={patientForm.telNo}
                            onChange={(e) => setPatientForm(prev => ({ ...prev, telNo: e.target.value }))}
                            placeholder="Primary contact number"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Emergency Contact</Label>
                          <Input
                            value={patientForm.emergencyContact}
                            onChange={(e) => setPatientForm(prev => ({ ...prev, emergencyContact: e.target.value }))}
                            placeholder="Emergency contact number"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Registration Details Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Registration Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Registration Date</Label>
                          <Input
                            type="date"
                            value={patientForm.registrationDate}
                            onChange={(e) => setPatientForm(prev => ({ ...prev, registrationDate: e.target.value }))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Patient Category</Label>
                          <Select value={patientForm.patientCategorization} onValueChange={(value) => setPatientForm(prev => ({ ...prev, patientCategorization: value }))}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="child">Child (0-12 years)</SelectItem>
                              <SelectItem value="adolescent">Adolescent (13-17 years)</SelectItem>
                              <SelectItem value="adult">Adult (18+ years)</SelectItem>
                              <SelectItem value="emergency">Emergency</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Register For</Label>
                          <Select value={patientForm.registerFor} onValueChange={(value) => setPatientForm(prev => ({ ...prev, registerFor: value }))}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select service" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="outpatient">Outpatient Services</SelectItem>
                              <SelectItem value="inpatient">Inpatient Admission</SelectItem>
                              <SelectItem value="therapy">Therapy Services</SelectItem>
                              <SelectItem value="consultation">Consultation</SelectItem>
                              <SelectItem value="emergency">Emergency Care</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Payment Option</Label>
                          <Select value={patientForm.paymentOption} onValueChange={(value) => setPatientForm(prev => ({ ...prev, paymentOption: value }))}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select payment method" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cash">Cash Payment</SelectItem>
                              <SelectItem value="insurance">Insurance</SelectItem>
                              <SelectItem value="nhif">NHIF</SelectItem>
                              <SelectItem value="corporate">Corporate</SelectItem>
                              <SelectItem value="charity">Charity/Free Care</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Referral Source</Label>
                          <Input
                            value={patientForm.referralSource}
                            onChange={(e) => setPatientForm(prev => ({ ...prev, referralSource: e.target.value }))}
                            placeholder="Referring facility or doctor"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Contact Information Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Contact & Next of Kin</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Residence/Address</Label>
                          <Textarea
                            value={patientForm.residence}
                            onChange={(e) => setPatientForm(prev => ({ ...prev, residence: e.target.value }))}
                            placeholder="Full address"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Occupation</Label>
                          <Input
                            value={patientForm.occupation}
                            onChange={(e) => setPatientForm(prev => ({ ...prev, occupation: e.target.value }))}
                            placeholder="Patient's occupation"
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Next of Kin Name</Label>
                          <Input
                            value={patientForm.nextOfKinFullName}
                            onChange={(e) => setPatientForm(prev => ({ ...prev, nextOfKinFullName: e.target.value }))}
                            placeholder="Full name"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Relationship</Label>
                          <Input
                            value={patientForm.nextOfKinRelationship}
                            onChange={(e) => setPatientForm(prev => ({ ...prev, nextOfKinRelationship: e.target.value }))}
                            placeholder="e.g., Parent, Spouse, Sibling"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Next of Kin Phone</Label>
                          <Input
                            value={patientForm.nextOfKinTelNumber}
                            onChange={(e) => setPatientForm(prev => ({ ...prev, nextOfKinTelNumber: e.target.value }))}
                            placeholder="Contact number"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Medical Information Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Medical Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Medical History</Label>
                        <Textarea
                          value={patientForm.medicalHistory}
                          onChange={(e) => setPatientForm(prev => ({ ...prev, medicalHistory: e.target.value }))}
                          placeholder="Previous medical conditions, surgeries, hospitalizations"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Known Allergies</Label>
                        <Textarea
                          value={patientForm.allergies}
                          onChange={(e) => setPatientForm(prev => ({ ...prev, allergies: e.target.value }))}
                          placeholder="Drug allergies, food allergies, environmental allergies"
                          className="mt-1"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center pt-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="issue-card"
                        checked={patientForm.issueCard}
                        onCheckedChange={(checked) => setPatientForm(prev => ({ ...prev, issueCard: checked as boolean }))}
                      />
                      <Label htmlFor="issue-card" className="text-sm">Issue Patient Card</Label>
                    </div>
                    
                    <div className="flex gap-4">
                      <Button variant="outline" onClick={resetForm}>
                        Clear Form
                      </Button>
                      <Button 
                        onClick={handleSubmit}
                        disabled={createPatientMutation.isPending || updatePatientMutation.isPending}
                        className="bg-blue-600 text-white"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {editingPatient ? "Update Patient" : "Register Patient"}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Patient Photo and Card Preview */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Patient Photo</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center space-y-4">
                      <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                        <User className="w-16 h-16 text-gray-400" />
                      </div>
                      <Button variant="outline" size="sm">
                        Upload Photo
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Registration Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div><strong>Name:</strong> {patientForm.surname} {patientForm.baptismalName}</div>
                      <div><strong>Date of Birth:</strong> {patientForm.dateOfBirth}</div>
                      <div><strong>Gender:</strong> {patientForm.gender}</div>
                      <div><strong>Service:</strong> {patientForm.registerFor}</div>
                      <div><strong>Payment:</strong> {patientForm.paymentOption}</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Patient Records Tab */}
            <TabsContent value="patients" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Registered Patients</span>
                    <span className="text-sm font-normal text-gray-600">
                      Total: {filteredPatients.length} patients
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Date of Birth</TableHead>
                        <TableHead>Gender</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Registration Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPatients.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                            No patients registered yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredPatients.map((patient: any) => (
                          <TableRow key={patient.id}>
                            <TableCell className="font-medium">{patient.patientId}</TableCell>
                            <TableCell>{patient.surname}, {patient.baptismalName}</TableCell>
                            <TableCell>{patient.dateOfBirth}</TableCell>
                            <TableCell>{patient.gender}</TableCell>
                            <TableCell>{patient.telNo}</TableCell>
                            <TableCell>{patient.registrationDate}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleEdit(patient)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <FileText className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Registration Reports</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-medium text-blue-800">Total Registrations</h3>
                      <p className="text-2xl font-bold text-blue-600">{patients.length}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-medium text-green-800">Today's Registrations</h3>
                      <p className="text-2xl font-bold text-green-600">
                        {patients.filter((p: any) => p.registrationDate === new Date().toISOString().split('T')[0]).length}
                      </p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h3 className="font-medium text-orange-800">Pending Cards</h3>
                      <p className="text-2xl font-bold text-orange-600">
                        {patients.filter((p: any) => p.issueCard).length}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <Button variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Daily Report
                    </Button>
                    <Button variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Monthly Report
                    </Button>
                    <Button variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Export Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}