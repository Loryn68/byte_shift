import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, AlertTriangle, Clock, User, Save, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function TriageManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("triage");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  const [triageForm, setTriageForm] = useState({
    patientId: "",
    chiefComplaint: "",
    currentSymptoms: "",
    painScale: "",
    vitalSigns: {
      temperature: "",
      bloodPressure: "",
      heartRate: "",
      respiratoryRate: "",
      oxygenSaturation: "",
      weight: "",
      height: ""
    },
    allergies: "",
    currentMedications: "",
    medicalHistory: "",
    triagePriority: "",
    triageNotes: "",
    nurseAssessment: "",
    recommendedAction: "",
    assignedTo: "",
    triageDate: new Date().toISOString(),
    triageBy: ""
  });

  const { data: patients = [] } = useQuery({
    queryKey: ["/api/patients"],
  });

  const { data: triageRecords = [] } = useQuery({
    queryKey: ["/api/triage-records"],
  });

  const createTriageMutation = useMutation({
    mutationFn: async (triageData: any) => {
      return await apiRequest("POST", "/api/triage-records", triageData);
    },
    onSuccess: () => {
      toast({
        title: "Triage Completed",
        description: "Patient triage assessment has been recorded successfully.",
      });
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["/api/triage-records"] });
    },
  });

  const handlePatientSearch = () => {
    if (searchQuery.trim()) {
      const foundPatient = patients.find((p: any) => 
        p.patientId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.surname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.baptismalName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      if (foundPatient) {
        setSelectedPatient(foundPatient);
        setTriageForm(prev => ({
          ...prev,
          patientId: foundPatient.patientId,
          allergies: foundPatient.allergies || "",
          medicalHistory: foundPatient.medicalHistory || ""
        }));
        toast({
          title: "Patient Found",
          description: `${foundPatient.surname}, ${foundPatient.baptismalName} selected for triage.`,
        });
      } else {
        toast({
          title: "Patient Not Found",
          description: "No patient found with that criteria.",
          variant: "destructive"
        });
      }
    }
  };

  const resetForm = () => {
    setTriageForm({
      patientId: "",
      chiefComplaint: "",
      currentSymptoms: "",
      painScale: "",
      vitalSigns: {
        temperature: "",
        bloodPressure: "",
        heartRate: "",
        respiratoryRate: "",
        oxygenSaturation: "",
        weight: "",
        height: ""
      },
      allergies: "",
      currentMedications: "",
      medicalHistory: "",
      triagePriority: "",
      triageNotes: "",
      nurseAssessment: "",
      recommendedAction: "",
      assignedTo: "",
      triageDate: new Date().toISOString(),
      triageBy: ""
    });
    setSelectedPatient(null);
  };

  const handleSubmitTriage = () => {
    if (!selectedPatient) {
      toast({
        title: "No Patient Selected",
        description: "Please search and select a patient first.",
        variant: "destructive"
      });
      return;
    }

    if (!triageForm.chiefComplaint || !triageForm.triagePriority) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in the chief complaint and triage priority.",
        variant: "destructive"
      });
      return;
    }

    const triageData = {
      ...triageForm,
      patientName: `${selectedPatient.surname}, ${selectedPatient.baptismalName}`,
      patientAge: selectedPatient.age,
      patientGender: selectedPatient.gender
    };

    createTriageMutation.mutate(triageData);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "critical": return "bg-red-500 text-white";
      case "urgent": return "bg-orange-500 text-white";
      case "less urgent": return "bg-yellow-500 text-black";
      case "non-urgent": return "bg-green-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getPriorityNumber = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "critical": return "1";
      case "urgent": return "2";
      case "less urgent": return "3";
      case "non-urgent": return "4";
      default: return "5";
    }
  };

  return (
    <div className="h-screen bg-green-50 p-6">
      <div className="bg-white rounded-lg shadow-sm h-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-blue-800">Triage Management</h1>
              <p className="text-gray-600 mt-1">Patient assessment and priority classification system</p>
            </div>
            <div className="flex items-center gap-4">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient by ID or name..."
                className="w-80"
              />
              <Button onClick={handlePatientSearch} variant="outline">
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
              <TabsTrigger value="triage" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Triage Assessment
              </TabsTrigger>
              <TabsTrigger value="queue" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Triage Queue ({triageRecords.length})
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Reports
              </TabsTrigger>
            </TabsList>

            {/* Triage Assessment Tab */}
            <TabsContent value="triage" className="space-y-6">
              {/* Patient Information Header */}
              {selectedPatient && (
                <Card className="bg-blue-50">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <Label className="font-medium text-gray-600">Patient Name:</Label>
                        <div className="font-semibold text-blue-800">
                          {selectedPatient.surname}, {selectedPatient.baptismalName}
                        </div>
                      </div>
                      <div>
                        <Label className="font-medium text-gray-600">Patient ID:</Label>
                        <div className="font-semibold">{selectedPatient.patientId}</div>
                      </div>
                      <div>
                        <Label className="font-medium text-gray-600">Age:</Label>
                        <div>{selectedPatient.age} years</div>
                      </div>
                      <div>
                        <Label className="font-medium text-gray-600">Gender:</Label>
                        <div>{selectedPatient.gender}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-2 gap-6">
                {/* Left Panel - Assessment Form */}
                <div className="space-y-6">
                  {/* Chief Complaint */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Chief Complaint & Symptoms</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Chief Complaint *</Label>
                        <Textarea
                          value={triageForm.chiefComplaint}
                          onChange={(e) => setTriageForm(prev => ({ ...prev, chiefComplaint: e.target.value }))}
                          placeholder="Primary reason for visit (what brought the patient in today?)"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Current Symptoms</Label>
                        <Textarea
                          value={triageForm.currentSymptoms}
                          onChange={(e) => setTriageForm(prev => ({ ...prev, currentSymptoms: e.target.value }))}
                          placeholder="Detailed description of current symptoms, onset, duration, severity"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Pain Scale (0-10)</Label>
                        <Select value={triageForm.painScale} onValueChange={(value) => setTriageForm(prev => ({ ...prev, painScale: value }))}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Rate pain level" />
                          </SelectTrigger>
                          <SelectContent>
                            {[0,1,2,3,4,5,6,7,8,9,10].map(num => (
                              <SelectItem key={num} value={num.toString()}>
                                {num} - {num === 0 ? "No pain" : num <= 3 ? "Mild" : num <= 6 ? "Moderate" : "Severe"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Vital Signs */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Vital Signs</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Temperature (°C)</Label>
                          <Input
                            value={triageForm.vitalSigns.temperature}
                            onChange={(e) => setTriageForm(prev => ({ 
                              ...prev, 
                              vitalSigns: { ...prev.vitalSigns, temperature: e.target.value }
                            }))}
                            placeholder="36.5"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Blood Pressure</Label>
                          <Input
                            value={triageForm.vitalSigns.bloodPressure}
                            onChange={(e) => setTriageForm(prev => ({ 
                              ...prev, 
                              vitalSigns: { ...prev.vitalSigns, bloodPressure: e.target.value }
                            }))}
                            placeholder="120/80"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Heart Rate (BPM)</Label>
                          <Input
                            value={triageForm.vitalSigns.heartRate}
                            onChange={(e) => setTriageForm(prev => ({ 
                              ...prev, 
                              vitalSigns: { ...prev.vitalSigns, heartRate: e.target.value }
                            }))}
                            placeholder="72"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Respiratory Rate</Label>
                          <Input
                            value={triageForm.vitalSigns.respiratoryRate}
                            onChange={(e) => setTriageForm(prev => ({ 
                              ...prev, 
                              vitalSigns: { ...prev.vitalSigns, respiratoryRate: e.target.value }
                            }))}
                            placeholder="16"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Oxygen Saturation (%)</Label>
                          <Input
                            value={triageForm.vitalSigns.oxygenSaturation}
                            onChange={(e) => setTriageForm(prev => ({ 
                              ...prev, 
                              vitalSigns: { ...prev.vitalSigns, oxygenSaturation: e.target.value }
                            }))}
                            placeholder="98"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Weight (kg)</Label>
                          <Input
                            value={triageForm.vitalSigns.weight}
                            onChange={(e) => setTriageForm(prev => ({ 
                              ...prev, 
                              vitalSigns: { ...prev.vitalSigns, weight: e.target.value }
                            }))}
                            placeholder="70"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Medical Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Medical Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Known Allergies</Label>
                        <Textarea
                          value={triageForm.allergies}
                          onChange={(e) => setTriageForm(prev => ({ ...prev, allergies: e.target.value }))}
                          placeholder="List all known allergies"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Current Medications</Label>
                        <Textarea
                          value={triageForm.currentMedications}
                          onChange={(e) => setTriageForm(prev => ({ ...prev, currentMedications: e.target.value }))}
                          placeholder="List current medications and dosages"
                          className="mt-1"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Panel - Triage Assessment */}
                <div className="space-y-6">
                  {/* Triage Priority */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Triage Priority Assessment
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Triage Priority *</Label>
                        <Select value={triageForm.triagePriority} onValueChange={(value) => setTriageForm(prev => ({ ...prev, triagePriority: value }))}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select priority level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="critical">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                Level 1 - Critical (Immediate)
                              </div>
                            </SelectItem>
                            <SelectItem value="urgent">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                Level 2 - Urgent (10-15 min)
                              </div>
                            </SelectItem>
                            <SelectItem value="less urgent">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                Level 3 - Less Urgent (30-60 min)
                              </div>
                            </SelectItem>
                            <SelectItem value="non-urgent">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                Level 4 - Non-Urgent (1-2 hours)
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Nurse Assessment</Label>
                        <Textarea
                          value={triageForm.nurseAssessment}
                          onChange={(e) => setTriageForm(prev => ({ ...prev, nurseAssessment: e.target.value }))}
                          placeholder="Professional nursing assessment and observations"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Recommended Action</Label>
                        <Select value={triageForm.recommendedAction} onValueChange={(value) => setTriageForm(prev => ({ ...prev, recommendedAction: value }))}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select recommended action" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="immediate-doctor">See Doctor Immediately</SelectItem>
                            <SelectItem value="urgent-care">Urgent Care Required</SelectItem>
                            <SelectItem value="routine-consultation">Routine Consultation</SelectItem>
                            <SelectItem value="specialist-referral">Specialist Referral</SelectItem>
                            <SelectItem value="discharge-advice">Discharge with Advice</SelectItem>
                            <SelectItem value="return-if-worse">Return if Symptoms Worsen</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Assign to Department/Doctor</Label>
                        <Select value={triageForm.assignedTo} onValueChange={(value) => setTriageForm(prev => ({ ...prev, assignedTo: value }))}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select assignment" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="emergency">Emergency Department</SelectItem>
                            <SelectItem value="general">General Medicine</SelectItem>
                            <SelectItem value="pediatrics">Pediatrics</SelectItem>
                            <SelectItem value="psychiatry">Psychiatry</SelectItem>
                            <SelectItem value="surgery">Surgery</SelectItem>
                            <SelectItem value="obs-gyn">Obstetrics & Gynecology</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Triage Notes</Label>
                        <Textarea
                          value={triageForm.triageNotes}
                          onChange={(e) => setTriageForm(prev => ({ ...prev, triageNotes: e.target.value }))}
                          placeholder="Additional triage notes and observations"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Triaged By</Label>
                        <Input
                          value={triageForm.triageBy}
                          onChange={(e) => setTriageForm(prev => ({ ...prev, triageBy: e.target.value }))}
                          placeholder="Nurse name and ID"
                          className="mt-1"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <Button variant="outline" onClick={resetForm} className="flex-1">
                      Clear Form
                    </Button>
                    <Button 
                      onClick={handleSubmitTriage}
                      disabled={createTriageMutation.isPending}
                      className="flex-1 bg-blue-600 text-white"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Complete Triage
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Triage Queue Tab */}
            <TabsContent value="queue" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Current Triage Queue</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Priority</TableHead>
                        <TableHead>Patient Name</TableHead>
                        <TableHead>Chief Complaint</TableHead>
                        <TableHead>Triage Time</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {triageRecords.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                            No patients in triage queue
                          </TableCell>
                        </TableRow>
                      ) : (
                        triageRecords
                          .sort((a: any, b: any) => getPriorityNumber(a.triagePriority) - getPriorityNumber(b.triagePriority))
                          .map((record: any) => (
                            <TableRow key={record.id}>
                              <TableCell>
                                <Badge className={getPriorityColor(record.triagePriority)}>
                                  {record.triagePriority}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium">{record.patientName}</TableCell>
                              <TableCell className="max-w-xs truncate">{record.chiefComplaint}</TableCell>
                              <TableCell>{new Date(record.triageDate).toLocaleString()}</TableCell>
                              <TableCell>{record.assignedTo}</TableCell>
                              <TableCell>
                                <Badge variant="outline">Waiting</Badge>
                              </TableCell>
                              <TableCell>
                                <Button size="sm" variant="outline">
                                  View Details
                                </Button>
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
              <div className="grid grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <h3 className="font-medium text-gray-600">Total Triaged Today</h3>
                      <p className="text-2xl font-bold text-blue-600">
                        {triageRecords.filter((r: any) => 
                          new Date(r.triageDate).toDateString() === new Date().toDateString()
                        ).length}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <h3 className="font-medium text-gray-600">Critical Cases</h3>
                      <p className="text-2xl font-bold text-red-600">
                        {triageRecords.filter((r: any) => r.triagePriority === 'critical').length}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <h3 className="font-medium text-gray-600">Average Wait Time</h3>
                      <p className="text-2xl font-bold text-green-600">15 min</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Triage Reports</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <Button variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Daily Triage Report
                    </Button>
                    <Button variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Priority Analysis
                    </Button>
                    <Button variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Department Workload
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