import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function TriageManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  const [triageForm, setTriageForm] = useState({
    measurementDate: new Date().toISOString().split('T')[0],
    measurementTimeHH: "0",
    measurementTimeMM: "0",
    height: "",
    weight: "",
    bmi: "",
    temperature: "",
    respirationRate: "",
    pulseRate: "",
    oxygenSaturation: "",
    bloodSugar: "",
    bloodPressureSystolic: "",
    bloodPressureDiastolic: ""
  });

  const { data: patients = [] } = useQuery({
    queryKey: ["/api/patients"],
  });

  const { data: triageRecords = [] } = useQuery({
    queryKey: ["/api/triage-records"],
  });

  const createTriageRecordMutation = useMutation({
    mutationFn: async (triageData: any) => {
      return await apiRequest("POST", "/api/triage-records", triageData);
    },
    onSuccess: () => {
      toast({
        title: "Triage Data Saved",
        description: "Patient vital signs recorded successfully.",
      });
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["/api/triage-records"] });
    },
  });

  const resetForm = () => {
    setTriageForm({
      measurementDate: new Date().toISOString().split('T')[0],
      measurementTimeHH: "0",
      measurementTimeMM: "0",
      height: "",
      weight: "",
      bmi: "",
      temperature: "",
      respirationRate: "",
      pulseRate: "",
      oxygenSaturation: "",
      bloodSugar: "",
      bloodPressureSystolic: "",
      bloodPressureDiastolic: ""
    });
  };

  const calculateBMI = () => {
    const weight = parseFloat(triageForm.weight);
    const height = parseFloat(triageForm.height) / 100; // Convert cm to meters
    if (weight && height) {
      const bmi = (weight / (height * height)).toFixed(1);
      setTriageForm(prev => ({ ...prev, bmi }));
    }
  };

  const handleSearch = () => {
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
          description: `${foundPatient.surname}, ${foundPatient.baptismalName} selected for triage.`,
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

  const handleSaveTriageData = () => {
    if (!selectedPatient) {
      toast({
        title: "No Patient Selected",
        description: "Please search and select a patient first.",
        variant: "destructive"
      });
      return;
    }

    const triageData = {
      ...triageForm,
      patientId: selectedPatient.id,
      patientName: `${selectedPatient.surname}, ${selectedPatient.baptismalName}`,
      recordedBy: "Current User", // This would come from auth context
      recordedDate: new Date().toISOString()
    };

    createTriageRecordMutation.mutate(triageData);
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
    <div className="h-screen bg-gray-50">
      {/* Header Tabs */}
      <Tabs defaultValue="recordings" className="h-full">
        <TabsList className="w-full bg-blue-200 rounded-none h-12 grid grid-cols-3">
          <TabsTrigger value="recordings" className="h-full">Recordings</TabsTrigger>
          <TabsTrigger value="queue" className="h-full">Queue</TabsTrigger>
          <TabsTrigger value="served" className="h-full">Served Patients</TabsTrigger>
        </TabsList>

        <TabsContent value="recordings" className="h-full p-6">
          {/* Search Section */}
          <div className="mb-6">
            <div className="flex items-center gap-4">
              <Label className="font-medium">Search by OP. No.</Label>
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 bg-white"
                placeholder="Enter OP. No."
              />
              <Button 
                onClick={handleSearch}
                className="bg-gray-300 text-gray-700 hover:bg-gray-400"
              >
                Search
              </Button>
            </div>
            
            {selectedPatient && (
              <div className="mt-2 p-2 bg-blue-100 rounded">
                <span className="font-medium">Selected Patient: </span>
                {selectedPatient.surname}, {selectedPatient.baptismalName} - OP: {selectedPatient.patientId}
              </div>
            )}
          </div>

          {/* Main Form Grid */}
          <div className="grid grid-cols-3 gap-6">
            {/* Left Column - Date/Time/Measurements */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 items-center">
                <Label className="text-sm">Measurement Date:</Label>
                <Input
                  type="date"
                  value={triageForm.measurementDate}
                  onChange={(e) => setTriageForm(prev => ({ ...prev, measurementDate: e.target.value }))}
                  className="h-8 bg-white text-xs"
                />
              </div>

              <div className="grid grid-cols-4 gap-2 items-center">
                <Label className="text-sm">Measurement Time:</Label>
                <div className="flex items-center gap-1">
                  <span className="text-xs">HH:</span>
                  <Select value={triageForm.measurementTimeHH} onValueChange={(value) => setTriageForm(prev => ({ ...prev, measurementTimeHH: value }))}>
                    <SelectTrigger className="h-8 w-12 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({length: 24}, (_, i) => (
                        <SelectItem key={i} value={i.toString()}>{i.toString().padStart(2, '0')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs">MM:</span>
                  <Select value={triageForm.measurementTimeMM} onValueChange={(value) => setTriageForm(prev => ({ ...prev, measurementTimeMM: value }))}>
                    <SelectTrigger className="h-8 w-12 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({length: 60}, (_, i) => (
                        <SelectItem key={i} value={i.toString()}>{i.toString().padStart(2, '0')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 items-center">
                <Label className="text-sm">Height(cm):</Label>
                <Input
                  value={triageForm.height}
                  onChange={(e) => setTriageForm(prev => ({ ...prev, height: e.target.value }))}
                  onBlur={calculateBMI}
                  className="h-8 bg-white text-xs"
                  placeholder="cm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 items-center">
                <Label className="text-sm">Weight(Kg):</Label>
                <Input
                  value={triageForm.weight}
                  onChange={(e) => setTriageForm(prev => ({ ...prev, weight: e.target.value }))}
                  onBlur={calculateBMI}
                  className="h-8 bg-white text-xs"
                  placeholder="kg"
                />
              </div>

              {/* BMI Section */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2 items-center">
                  <Label className="text-sm">BMI:</Label>
                  <Input
                    value={triageForm.bmi}
                    readOnly
                    className="h-8 bg-gray-100 text-xs"
                  />
                </div>
                
                <div className="text-xs space-y-1 bg-gray-50 p-2 rounded">
                  <div>Underweight: &lt; 18.5</div>
                  <div>Normalweight: 18.5 - 24.9</div>
                  <div>Overweight: 25 - 29.9</div>
                  <div>Obesity: &gt;30</div>
                </div>
                
                {triageForm.bmi && (
                  <div className="text-xs font-medium text-blue-600">
                    {getBMIStatus(triageForm.bmi)}
                  </div>
                )}
              </div>
            </div>

            {/* Middle Column - Vital Signs */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 items-center">
                <Label className="text-sm">Temperature (Degrees Celcius):</Label>
                <Input
                  value={triageForm.temperature}
                  onChange={(e) => setTriageForm(prev => ({ ...prev, temperature: e.target.value }))}
                  className="h-8 bg-white text-xs"
                  placeholder="°C"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 items-center">
                <Label className="text-sm">Respiration Rate (Breaths per Minute):</Label>
                <Input
                  value={triageForm.respirationRate}
                  onChange={(e) => setTriageForm(prev => ({ ...prev, respirationRate: e.target.value }))}
                  className="h-8 bg-white text-xs"
                  placeholder="per min"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 items-center">
                <Label className="text-sm">Pulse Rate (Beats per Minute):</Label>
                <Input
                  value={triageForm.pulseRate}
                  onChange={(e) => setTriageForm(prev => ({ ...prev, pulseRate: e.target.value }))}
                  className="h-8 bg-white text-xs"
                  placeholder="bpm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 items-center">
                <Label className="text-sm">Oxygen Saturation (SpO2%):</Label>
                <Input
                  value={triageForm.oxygenSaturation}
                  onChange={(e) => setTriageForm(prev => ({ ...prev, oxygenSaturation: e.target.value }))}
                  className="h-8 bg-white text-xs"
                  placeholder="%"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 items-center">
                <Label className="text-sm">Blood Sugar(mmol/L):</Label>
                <Input
                  value={triageForm.bloodSugar}
                  onChange={(e) => setTriageForm(prev => ({ ...prev, bloodSugar: e.target.value }))}
                  className="h-8 bg-white text-xs"
                  placeholder="mmol/L"
                />
              </div>

              <div className="flex gap-4 mt-4">
                <Button 
                  onClick={handleSaveTriageData}
                  disabled={createTriageRecordMutation.isPending}
                  className="bg-orange-200 text-gray-700 hover:bg-orange-300 px-6"
                >
                  Save Triage Data
                </Button>
                <Button 
                  onClick={resetForm}
                  variant="outline"
                  className="px-6"
                >
                  Cancel
                </Button>
              </div>
            </div>

            {/* Right Column - Blood Pressure & Additional Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">Blood Pressure (mmHG)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Systolic:</Label>
                    <Input
                      value={triageForm.bloodPressureSystolic}
                      onChange={(e) => setTriageForm(prev => ({ ...prev, bloodPressureSystolic: e.target.value }))}
                      className="h-8 bg-white text-xs"
                      placeholder="120"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Diastolic:</Label>
                    <Input
                      value={triageForm.bloodPressureDiastolic}
                      onChange={(e) => setTriageForm(prev => ({ ...prev, bloodPressureDiastolic: e.target.value }))}
                      className="h-8 bg-white text-xs"
                      placeholder="80"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-100 p-3 rounded">
                <Label className="text-sm font-medium">Normal for person without Diabetes:</Label>
                <div className="text-xs mt-1">5.9-5.5 mmol/L</div>
              </div>

              <div className="mt-6">
                <Button 
                  variant="outline"
                  className="bg-blue-200 text-gray-700 hover:bg-blue-300 px-6"
                >
                  HTN Screening
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom Tabs */}
          <div className="mt-8">
            <Tabs defaultValue="vital-signs" className="w-full">
              <TabsList className="bg-gray-200">
                <TabsTrigger value="vital-signs">Vital Signs Hx</TabsTrigger>
                <TabsTrigger value="hypertension">Hypertension Screening Hx</TabsTrigger>
                <TabsTrigger value="covid">Covid 19 Screening</TabsTrigger>
              </TabsList>

              <TabsContent value="vital-signs" className="mt-4">
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
                        <TableHead className="text-xs">Blood Sugar(mmol/L)</TableHead>
                        <TableHead className="text-xs">Clinician</TableHead>
                        <TableHead className="text-xs">Date Recorded</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {triageRecords.map((record: any) => (
                        <TableRow key={record.id} className="text-xs">
                          <TableCell>{record.measurementTimeHH}:{record.measurementTimeMM}</TableCell>
                          <TableCell>{record.height}</TableCell>
                          <TableCell>{record.weight}</TableCell>
                          <TableCell>{record.bmi}</TableCell>
                          <TableCell>{record.bloodPressureSystolic}</TableCell>
                          <TableCell>{record.bloodPressureDiastolic}</TableCell>
                          <TableCell>-</TableCell>
                          <TableCell>{record.respirationRate}</TableCell>
                          <TableCell>{record.pulseRate}</TableCell>
                          <TableCell>{record.oxygenSaturation}</TableCell>
                          <TableCell>{record.temperature}</TableCell>
                          <TableCell>{record.bloodSugar}</TableCell>
                          <TableCell>{record.recordedBy}</TableCell>
                          <TableCell>{new Date(record.recordedDate).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="hypertension" className="mt-4">
                <div className="bg-white border rounded p-4">
                  <p className="text-gray-500">Hypertension screening history will be displayed here</p>
                </div>
              </TabsContent>

              <TabsContent value="covid" className="mt-4">
                <div className="bg-white border rounded p-4">
                  <p className="text-gray-500">COVID-19 screening data will be displayed here</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </TabsContent>

        <TabsContent value="queue" className="p-6">
          <div className="bg-white border rounded p-4">
            <p className="text-gray-500">Patient queue will be displayed here</p>
          </div>
        </TabsContent>

        <TabsContent value="served" className="p-6">
          <div className="bg-white border rounded p-4">
            <p className="text-gray-500">Served patients list will be displayed here</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}