import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function PatientRegistry() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  const [patientForm, setPatientForm] = useState({
    telNo: "",
    idNo: "",
    baptismalName: "",
    otherName: "",
    surname: "",
    dateOfBirth: "",
    gender: "",
    registrationDate: new Date().toISOString().split('T')[0],
    nextOfKinFullName: "",
    nextOfKinRelationship: "",
    nextOfKinTelNumber: "",
    residence: "",
    occupation: "",
    registerFor: "",
    patientCategorization: "",
    paymentOption: "",
    referralSource: "",
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

  const resetForm = () => {
    setPatientForm({
      telNo: "",
      idNo: "",
      baptismalName: "",
      otherName: "",
      surname: "",
      dateOfBirth: "",
      gender: "",
      registrationDate: new Date().toISOString().split('T')[0],
      nextOfKinFullName: "",
      nextOfKinRelationship: "",
      nextOfKinTelNumber: "",
      residence: "",
      occupation: "",
      registerFor: "",
      patientCategorization: "",
      paymentOption: "",
      referralSource: "",
      issueCard: false
    });
  };

  const handleSearch = () => {
    if (searchQuery.length > 2) {
      const foundPatient = patients.find((p: any) => 
        p.surname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.patientId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.telNo?.includes(searchQuery) ||
        p.idNo?.includes(searchQuery)
      );
      if (foundPatient) {
        setSelectedPatient(foundPatient);
        setPatientForm({
          telNo: foundPatient.telNo || "",
          idNo: foundPatient.idNo || "",
          baptismalName: foundPatient.baptismalName || "",
          otherName: foundPatient.otherName || "",
          surname: foundPatient.surname || "",
          dateOfBirth: foundPatient.dateOfBirth || "",
          gender: foundPatient.gender || "",
          registrationDate: foundPatient.registrationDate || "",
          nextOfKinFullName: foundPatient.nextOfKinFullName || "",
          nextOfKinRelationship: foundPatient.nextOfKinRelationship || "",
          nextOfKinTelNumber: foundPatient.nextOfKinTelNumber || "",
          residence: foundPatient.residence || "",
          occupation: foundPatient.occupation || "",
          registerFor: foundPatient.registerFor || "",
          patientCategorization: foundPatient.patientCategorization || "",
          paymentOption: foundPatient.paymentOption || "",
          referralSource: foundPatient.referralSource || "",
          issueCard: foundPatient.issueCard || false
        });
      } else {
        toast({
          title: "Not Found",
          description: "No patient found with that search criteria.",
          variant: "destructive"
        });
      }
    }
  };

  const handleSelectPatient = (patient: any) => {
    setSelectedPatient(patient);
    setPatientForm({
      telNo: patient.telNo || "",
      idNo: patient.idNo || "",
      baptismalName: patient.baptismalName || "",
      otherName: patient.otherName || "",
      surname: patient.surname || "",
      dateOfBirth: patient.dateOfBirth || "",
      gender: patient.gender || "",
      registrationDate: patient.registrationDate || "",
      nextOfKinFullName: patient.nextOfKinFullName || "",
      nextOfKinRelationship: patient.nextOfKinRelationship || "",
      nextOfKinTelNumber: patient.nextOfKinTelNumber || "",
      residence: patient.residence || "",
      occupation: patient.occupation || "",
      registerFor: patient.registerFor || "",
      patientCategorization: patient.patientCategorization || "",
      paymentOption: patient.paymentOption || "",
      referralSource: patient.referralSource || "",
      issueCard: patient.issueCard || false
    });
  };

  const handleRegisterPatient = () => {
    if (!patientForm.surname || !patientForm.dateOfBirth) {
      toast({
        title: "Missing Information",
        description: "Please fill in required fields (Surname and Date of Birth).",
        variant: "destructive"
      });
      return;
    }

    createPatientMutation.mutate(patientForm);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Panel - Patient List */}
      <div className="w-80 bg-orange-100 border-r border-gray-300">
        <div className="p-4">
          <Button 
            className="w-full mb-4 bg-gray-300 text-gray-700 hover:bg-gray-400 text-sm"
            onClick={handleRefresh}
          >
            load List of Registered Patients
          </Button>
          
          <div className="bg-white border border-gray-300">
            <div className="grid grid-cols-2 bg-gray-100 border-b">
              <div className="p-2 text-center border-r font-medium text-sm">OP. No.</div>
              <div className="p-2 text-center font-medium text-sm">Patient Name</div>
            </div>
            <div className="h-96 overflow-y-auto">
              {patients.map((patient: any) => (
                <div key={patient.id} className="grid grid-cols-2 border-b hover:bg-blue-50 cursor-pointer" onClick={() => handleSelectPatient(patient)}>
                  <div className="p-2 text-center border-r text-xs">{patient.patientId || patient.id}</div>
                  <div className="p-2 text-xs">{patient.surname}, {patient.baptismalName} {patient.otherName}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Patient Registration Form */}
      <div className="flex-1 bg-blue-100">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4 text-center">Add New Patient</h2>
          
          {/* Search Section */}
          <div className="mb-6 bg-blue-200 p-3 rounded">
            <div className="flex items-center gap-4">
              <Label className="font-medium text-sm">Search by Surname/ ID/Tel/OP-No.</Label>
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 bg-white h-8"
                placeholder="Enter search term"
              />
              <Button 
                onClick={handleSearch}
                className="bg-gray-300 text-gray-700 hover:bg-gray-400 h-8 px-4 text-sm"
              >
                Search
              </Button>
            </div>
          </div>

          {/* Main Form */}
          <div className="grid grid-cols-3 gap-4">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 items-center">
                <Label className="text-sm">Tel. No:</Label>
                <Input
                  value={patientForm.telNo}
                  onChange={(e) => setPatientForm(prev => ({ ...prev, telNo: e.target.value }))}
                  className="h-8 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 items-center">
                <Label className="text-sm">Baptismal Name:</Label>
                <Input
                  value={patientForm.baptismalName}
                  onChange={(e) => setPatientForm(prev => ({ ...prev, baptismalName: e.target.value }))}
                  className="h-8 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 items-center">
                <Label className="text-sm">D.O.B:</Label>
                <Input
                  type="date"
                  value={patientForm.dateOfBirth}
                  onChange={(e) => setPatientForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  className="h-8 bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Next of Kin</Label>
                <div className="grid grid-cols-2 gap-2 items-center">
                  <Label className="text-xs">Full Name:</Label>
                  <Input
                    value={patientForm.nextOfKinFullName}
                    onChange={(e) => setPatientForm(prev => ({ ...prev, nextOfKinFullName: e.target.value }))}
                    className="h-8 bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 items-center">
                  <Label className="text-xs">Relationship:</Label>
                  <Select value={patientForm.nextOfKinRelationship} onValueChange={(value) => setPatientForm(prev => ({ ...prev, nextOfKinRelationship: value }))}>
                    <SelectTrigger className="h-8 bg-white">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spouse">Spouse</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="sibling">Sibling</SelectItem>
                      <SelectItem value="child">Child</SelectItem>
                      <SelectItem value="guardian">Guardian</SelectItem>
                      <SelectItem value="friend">Friend</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2 items-center">
                  <Label className="text-xs">Residence:</Label>
                  <Input
                    value={patientForm.residence}
                    onChange={(e) => setPatientForm(prev => ({ ...prev, residence: e.target.value }))}
                    className="h-8 bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 items-center">
                  <Label className="text-xs">Register For:</Label>
                  <Select value={patientForm.registerFor} onValueChange={(value) => setPatientForm(prev => ({ ...prev, registerFor: value }))}>
                    <SelectTrigger className="h-8 bg-white">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="outpatient">Outpatient</SelectItem>
                      <SelectItem value="inpatient">Inpatient</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="consultation">Consultation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2 items-center">
                  <Label className="text-xs">Patient Categorization:</Label>
                  <Select value={patientForm.patientCategorization} onValueChange={(value) => setPatientForm(prev => ({ ...prev, patientCategorization: value }))}>
                    <SelectTrigger className="h-8 bg-white">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pediatric">Pediatric</SelectItem>
                      <SelectItem value="adult">Adult</SelectItem>
                      <SelectItem value="geriatric">Geriatric</SelectItem>
                      <SelectItem value="mental-health">Mental Health</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Middle Column */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 items-center">
                <Label className="text-sm">IDNO:</Label>
                <Input
                  value={patientForm.idNo}
                  onChange={(e) => setPatientForm(prev => ({ ...prev, idNo: e.target.value }))}
                  className="h-8 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 items-center">
                <Label className="text-sm">Other Name:</Label>
                <Input
                  value={patientForm.otherName}
                  onChange={(e) => setPatientForm(prev => ({ ...prev, otherName: e.target.value }))}
                  className="h-8 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 items-center">
                <Label className="text-sm">Gender:</Label>
                <Select value={patientForm.gender} onValueChange={(value) => setPatientForm(prev => ({ ...prev, gender: value }))}>
                  <SelectTrigger className="h-8 bg-white">
                    <SelectValue placeholder="--Select--" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2 items-center">
                <Label className="text-sm">Tel. Number:</Label>
                <Input
                  value={patientForm.nextOfKinTelNumber}
                  onChange={(e) => setPatientForm(prev => ({ ...prev, nextOfKinTelNumber: e.target.value }))}
                  className="h-8 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 items-center">
                <Label className="text-sm">Occupation:</Label>
                <Input
                  value={patientForm.occupation}
                  onChange={(e) => setPatientForm(prev => ({ ...prev, occupation: e.target.value }))}
                  className="h-8 bg-white"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="issueCard" 
                  checked={patientForm.issueCard}
                  onCheckedChange={(checked) => setPatientForm(prev => ({ ...prev, issueCard: checked as boolean }))}
                />
                <Label htmlFor="issueCard" className="text-sm">Issue Card</Label>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 items-center">
                <Label className="text-sm">Surname:</Label>
                <Input
                  value={patientForm.surname}
                  onChange={(e) => setPatientForm(prev => ({ ...prev, surname: e.target.value }))}
                  className="h-8 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 items-center">
                <Label className="text-sm">Reg. Date:</Label>
                <Input
                  type="date"
                  value={patientForm.registrationDate}
                  onChange={(e) => setPatientForm(prev => ({ ...prev, registrationDate: e.target.value }))}
                  className="h-8 bg-white"
                />
              </div>

              <div className="bg-white p-3 rounded border">
                <Label className="text-sm font-semibold">Earlier Visit Dates</Label>
                <div className="mt-2 h-24 bg-gray-50 border rounded p-2">
                  {/* Visit dates would be displayed here */}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Options */}
          <div className="mt-6 space-y-3">
            <Label className="text-sm font-semibold">Payment Option</Label>
            <RadioGroup value={patientForm.paymentOption} onValueChange={(value) => setPatientForm(prev => ({ ...prev, paymentOption: value }))}>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash" className="text-sm">Cash/Credit/Card/Mobile Money</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="insurance" id="insurance" />
                  <Label htmlFor="insurance" className="text-sm">Insurance</Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Other Details */}
          <div className="mt-6 space-y-3">
            <Label className="text-sm font-semibold">Other Details</Label>
            <RadioGroup value={patientForm.referralSource} onValueChange={(value) => setPatientForm(prev => ({ ...prev, referralSource: value }))}>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other-facility" id="other-facility" />
                  <Label htmlFor="other-facility" className="text-sm">Referral from other Health Facility</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="community" id="community" />
                  <Label htmlFor="community" className="text-sm">Referral from Community Unit</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="not-referred" id="not-referred" />
                  <Label htmlFor="not-referred" className="text-sm">Not Referred</Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-center space-x-4">
            <Button 
              onClick={handleRegisterPatient}
              disabled={createPatientMutation.isPending}
              className="bg-gray-300 text-gray-700 hover:bg-gray-400 px-6"
            >
              Register Patient
            </Button>
            <Button 
              variant="outline"
              className="px-6"
            >
              Update Record
            </Button>
            <Button 
              onClick={resetForm}
              variant="outline"
              className="px-6"
            >
              Reset Form
            </Button>
            <Button 
              onClick={handleRefresh}
              variant="outline"
              className="px-6"
            >
              Refresh
            </Button>
            <Button 
              variant="outline"
              className="px-6"
            >
              Close Form
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}