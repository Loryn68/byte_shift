import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Search, User, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function OutpatientManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDate, setActiveDate] = useState(new Date().toISOString().split('T')[0]);

  const [vitalSigns, setVitalSigns] = useState({
    height: "",
    weight: "",
    bmi: "",
    bloodPressureSystolic: "",
    bloodPressureDiastolic: "",
    pulseRate: "",
    o2Saturation: "",
    respirationRate: "",
    temperature: ""
  });

  const { data: waitingPatients = [] } = useQuery({
    queryKey: ["/api/outpatient-queue", activeDate],
  });

  const { data: patients = [] } = useQuery({
    queryKey: ["/api/patients"],
  });

  const saveVitalSignsMutation = useMutation({
    mutationFn: async (vitalData: any) => {
      return await apiRequest("POST", "/api/vital-signs", vitalData);
    },
    onSuccess: () => {
      toast({
        title: "Vital Signs Saved",
        description: "Patient vital signs recorded successfully.",
      });
    },
  });

  const handlePatientSearch = () => {
    if (searchQuery.length > 0) {
      const foundPatient = patients.find((p: any) => 
        p.patientId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.surname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.baptismalName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (foundPatient) {
        setSelectedPatient(foundPatient);
        toast({
          title: "Patient Found",
          description: `${foundPatient.surname}, ${foundPatient.baptismalName} selected.`,
        });
      } else {
        toast({
          title: "Not Found",
          description: "No patient found with that OP. No.",
          variant: "destructive"
        });
      }
    }
  };

  const handleSelectFromQueue = (patient: any) => {
    setSelectedPatient(patient);
  };

  const calculateBMI = () => {
    const weight = parseFloat(vitalSigns.weight);
    const height = parseFloat(vitalSigns.height) / 100;
    if (weight && height) {
      const bmi = (weight / (height * height)).toFixed(1);
      setVitalSigns(prev => ({ ...prev, bmi }));
    }
  };

  const handleSaveVitalSigns = () => {
    if (!selectedPatient) {
      toast({
        title: "No Patient Selected",
        description: "Please select a patient first.",
        variant: "destructive"
      });
      return;
    }

    const vitalData = {
      ...vitalSigns,
      patientId: selectedPatient.id,
      recordedDate: new Date().toISOString()
    };

    saveVitalSignsMutation.mutate(vitalData);
  };

  const getBMIStatus = (bmi: string) => {
    const bmiValue = parseFloat(bmi);
    if (bmiValue < 18.5) return "Underweight: < 18.5";
    if (bmiValue >= 18.5 && bmiValue <= 24.9) return "Normalweight: 18.5 - 24.9";
    if (bmiValue >= 25 && bmiValue <= 29.9) return "Overweight: 25 - 29.9";
    if (bmiValue >= 30) return "Obesity: >30";
    return "";
  };

  return (
    <div className="h-screen bg-green-50">
      {/* Header Tabs */}
      <Tabs defaultValue="general" className="h-full">
        <TabsList className="w-full bg-blue-100 rounded-none h-12 grid grid-cols-4">
          <TabsTrigger value="general" className="h-full">General Consultation</TabsTrigger>
          <TabsTrigger value="attended" className="h-full">Patients Attended to</TabsTrigger>
          <TabsTrigger value="referrals" className="h-full">Referrals</TabsTrigger>
          <TabsTrigger value="counselling" className="h-full">Counselling</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="h-full">
          <div className="flex h-full">
            {/* Left Panel - Patient Queue */}
            <div className="w-80 bg-blue-50 border-r border-blue-200">
              <div className="p-4">
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">PATIENT'S QUEUE</h3>
                  <div className="text-sm text-gray-600 mb-2">Waiting List from Triage</div>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <Label className="text-sm">Date:</Label>
                    <Input
                      type="date"
                      value={activeDate}
                      onChange={(e) => setActiveDate(e.target.value)}
                      className="w-32 h-8 text-xs"
                    />
                  </div>
                </div>

                {/* Queue Table */}
                <div className="bg-white border rounded">
                  <div className="grid grid-cols-4 bg-gray-100 border-b text-xs font-medium">
                    <div className="p-2 border-r">OP.NO</div>
                    <div className="p-2 border-r">Patient Name</div>
                    <div className="p-2 border-r">Reg. Time</div>
                    <div className="p-2">Visit Reason</div>
                  </div>
                  
                  <div className="h-64 overflow-y-auto">
                    {waitingPatients.map((patient: any) => (
                      <div 
                        key={patient.id} 
                        className="grid grid-cols-4 border-b text-xs hover:bg-blue-50 cursor-pointer"
                        onClick={() => handleSelectFromQueue(patient)}
                      >
                        <div className="p-2 border-r">{patient.patientId}</div>
                        <div className="p-2 border-r">{patient.surname}, {patient.baptismalName}</div>
                        <div className="p-2 border-r">{patient.registrationTime}</div>
                        <div className="p-2">{patient.visitReason}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 text-xs text-gray-600">
                  Drag a column here to group by this column.
                </div>

                {/* Bottom Queue Section */}
                <div className="mt-6">
                  <div className="text-sm font-medium mb-2">Waiting List From</div>
                  <div className="bg-white border rounded">
                    <div className="grid grid-cols-3 bg-gray-100 border-b text-xs font-medium">
                      <div className="p-2 border-r">Patient Name</div>
                      <div className="p-2 border-r">Doctor</div>
                      <div className="p-2">Time Recorded</div>
                    </div>
                    
                    <div className="h-32 overflow-y-auto">
                      {/* Additional queue items would be rendered here */}
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center mt-4">
                  <Button size="sm" variant="outline">
                    <ChevronLeft className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Panel - Patient Data */}
            <div className="flex-1 bg-white">
              <div className="p-6">
                {/* Patient Search and Info */}
                <div className="mb-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Label className="font-medium">PATIENT DATA</Label>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Search by OP NO:</Label>
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-48 h-8"
                        placeholder="Enter OP. No."
                      />
                      <Button onClick={handlePatientSearch} size="sm">
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Patient Info Display */}
                  {selectedPatient ? (
                    <div className="grid grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <span className="font-medium">Full Name:</span>
                          <span>{selectedPatient.surname}, {selectedPatient.baptismalName} {selectedPatient.otherName}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <span className="font-medium">Allergies:</span>
                          <span>{selectedPatient.allergies || "-"}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <span className="font-medium">Medical Conditions:</span>
                          <span>{selectedPatient.medicalHistory || "-"}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <span className="font-medium">Payment Method:</span>
                          <span>{selectedPatient.paymentOption || "-"}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <span className="font-medium">Gender:</span>
                          <span>{selectedPatient.gender || "-"}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <span className="font-medium">Age:</span>
                          <span>{selectedPatient.age || "-"}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-center">
                        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                          <User className="w-12 h-12 text-gray-400" />
                        </div>
                        <Button size="sm" className="mb-2 bg-gray-800 text-white">
                          Return Patient to Queue
                        </Button>
                        <Button size="sm" variant="outline">
                          Patient not Available
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Select a patient from the queue or search by OP. No.
                    </div>
                  )}
                </div>

                {/* Tabs for Patient Details */}
                <Tabs defaultValue="vital-signs" className="mt-6">
                  <TabsList className="bg-blue-100">
                    <TabsTrigger value="vital-signs">Vital Signs</TabsTrigger>
                    <TabsTrigger value="outpatient-notes">Outpatient Doctor Notes</TabsTrigger>
                    <TabsTrigger value="patient-history">Patient History</TabsTrigger>
                    <TabsTrigger value="refer-facility">Refer to Another Facility</TabsTrigger>
                    <TabsTrigger value="admit-patient">Admit Patient</TabsTrigger>
                    <TabsTrigger value="patient-history-tab">Patient History</TabsTrigger>
                    <TabsTrigger value="laboratory">Laboratory</TabsTrigger>
                    <TabsTrigger value="prescription">Prescription</TabsTrigger>
                  </TabsList>

                  <TabsContent value="vital-signs" className="mt-4">
                    <div className="grid grid-cols-3 gap-6">
                      {/* Left Column - Measurements */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-2 items-center">
                          <Label className="text-sm">Height(cm):</Label>
                          <Input
                            value={vitalSigns.height}
                            onChange={(e) => setVitalSigns(prev => ({ ...prev, height: e.target.value }))}
                            onBlur={calculateBMI}
                            className="h-8"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 items-center">
                          <Label className="text-sm">Weight(Kg):</Label>
                          <Input
                            value={vitalSigns.weight}
                            onChange={(e) => setVitalSigns(prev => ({ ...prev, weight: e.target.value }))}
                            onBlur={calculateBMI}
                            className="h-8"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2 items-center">
                          <Label className="text-sm">Blood Pressure (mmHG)</Label>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Systolic:</Label>
                            <Input
                              value={vitalSigns.bloodPressureSystolic}
                              onChange={(e) => setVitalSigns(prev => ({ ...prev, bloodPressureSystolic: e.target.value }))}
                              className="h-8"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Diastolic:</Label>
                            <Input
                              value={vitalSigns.bloodPressureDiastolic}
                              onChange={(e) => setVitalSigns(prev => ({ ...prev, bloodPressureDiastolic: e.target.value }))}
                              className="h-8"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 items-center">
                          <Label className="text-sm">Pulse(bpm):</Label>
                          <Input
                            value={vitalSigns.pulseRate}
                            onChange={(e) => setVitalSigns(prev => ({ ...prev, pulseRate: e.target.value }))}
                            className="h-8"
                          />
                        </div>
                      </div>

                      {/* Middle Column - BMI and Additional Vitals */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-sm">BMI</Label>
                          <Input
                            value={vitalSigns.bmi}
                            readOnly
                            className="h-8 bg-gray-50"
                          />
                          <div className="text-xs space-y-1">
                            <div>Underweight: &lt; 18.5</div>
                            <div>Normalweight: 18.5 - 24.9</div>
                            <div>Overweight: 25 - 29.9</div>
                            <div>Obesity: &gt;30</div>
                          </div>
                          {vitalSigns.bmi && (
                            <div className="text-xs font-medium text-blue-600">
                              {getBMIStatus(vitalSigns.bmi)}
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 items-center">
                          <Label className="text-sm">O2 Saturation:</Label>
                          <Input
                            value={vitalSigns.o2Saturation}
                            onChange={(e) => setVitalSigns(prev => ({ ...prev, o2Saturation: e.target.value }))}
                            className="h-8"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2 items-center">
                          <Label className="text-sm">Resp(bpm):</Label>
                          <Input
                            value={vitalSigns.respirationRate}
                            onChange={(e) => setVitalSigns(prev => ({ ...prev, respirationRate: e.target.value }))}
                            className="h-8"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2 items-center">
                          <Label className="text-sm">Temp(deg. C):</Label>
                          <Input
                            value={vitalSigns.temperature}
                            onChange={(e) => setVitalSigns(prev => ({ ...prev, temperature: e.target.value }))}
                            className="h-8"
                          />
                        </div>

                        <Button 
                          onClick={handleSaveVitalSigns}
                          className="bg-orange-200 text-gray-700 hover:bg-orange-300"
                        >
                          Save Triage Data
                        </Button>
                      </div>

                      {/* Right Column - HTN Screening */}
                      <div>
                        <Button className="bg-orange-200 text-gray-700 hover:bg-orange-300">
                          HTN Screening
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="outpatient-notes" className="mt-4">
                    <div className="space-y-4">
                      <Textarea 
                        placeholder="Enter outpatient doctor notes..."
                        className="min-h-32"
                      />
                      <Button>Save Notes</Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="patient-history" className="mt-4">
                    <div className="text-gray-500">Patient history will be displayed here</div>
                  </TabsContent>

                  <TabsContent value="refer-facility" className="mt-4">
                    <div className="text-gray-500">Referral form will be displayed here</div>
                  </TabsContent>

                  <TabsContent value="admit-patient" className="mt-4">
                    <div className="text-gray-500">Patient admission form will be displayed here</div>
                  </TabsContent>

                  <TabsContent value="laboratory" className="mt-4">
                    <div className="text-gray-500">Laboratory orders will be displayed here</div>
                  </TabsContent>

                  <TabsContent value="prescription" className="mt-4">
                    <div className="text-gray-500">Prescription form will be displayed here</div>
                  </TabsContent>
                </Tabs>

                {/* Bottom History Tables */}
                <div className="mt-8">
                  <Tabs defaultValue="vital-history" className="w-full">
                    <TabsList className="bg-gray-100">
                      <TabsTrigger value="vital-history">Vital Signs Record</TabsTrigger>
                      <TabsTrigger value="htn-history">HTN Screening Record</TabsTrigger>
                      <TabsTrigger value="covid-screening">Covid 19 Screening</TabsTrigger>
                    </TabsList>

                    <TabsContent value="vital-history" className="mt-4">
                      <div className="bg-white border rounded">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50">
                              <TableHead className="text-xs">Measurement Time</TableHead>
                              <TableHead className="text-xs">Height (cm)</TableHead>
                              <TableHead className="text-xs">Weight (kg)</TableHead>
                              <TableHead className="text-xs">BMI</TableHead>
                              <TableHead className="text-xs">Systolic</TableHead>
                              <TableHead className="text-xs">Diastolic</TableHead>
                              <TableHead className="text-xs">HT Status</TableHead>
                              <TableHead className="text-xs">Respiration Rate (bpm)</TableHead>
                              <TableHead className="text-xs">Pulse Rate (bpm)</TableHead>
                              <TableHead className="text-xs">SpO2%</TableHead>
                              <TableHead className="text-xs">Temperature (Deg. C)</TableHead>
                              <TableHead className="text-xs">Clinician</TableHead>
                              <TableHead className="text-xs">Date Recorded</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {/* Vital signs history records would be rendered here */}
                          </TableBody>
                        </Table>
                      </div>
                    </TabsContent>

                    <TabsContent value="htn-history" className="mt-4">
                      <div className="bg-white border rounded p-4">
                        <p className="text-gray-500">HTN screening history will be displayed here</p>
                      </div>
                    </TabsContent>

                    <TabsContent value="covid-screening" className="mt-4">
                      <div className="bg-white border rounded p-4">
                        <p className="text-gray-500">COVID-19 screening data will be displayed here</p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Bottom Action Buttons */}
                <div className="flex justify-center gap-4 mt-6">
                  <Button className="bg-gray-400 text-white">Go to General Section</Button>
                  <Button className="bg-orange-300 text-gray-700">Go to Gynaecologist Section</Button>
                  <Button className="bg-blue-500 text-white">Go to Psychiatric Section</Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="attended" className="p-6">
          <div className="bg-white border rounded p-4">
            <p className="text-gray-500">Patients attended to will be displayed here</p>
          </div>
        </TabsContent>

        <TabsContent value="referrals" className="p-6">
          <div className="bg-white border rounded p-4">
            <p className="text-gray-500">Patient referrals will be displayed here</p>
          </div>
        </TabsContent>

        <TabsContent value="counselling" className="p-6">
          <div className="bg-white border rounded p-4">
            <p className="text-gray-500">Counselling sessions will be displayed here</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}