import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Search, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function TherapyManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [therapyForm, setTherapyForm] = useState({
    category: "",
    description: "",
    results: "",
    options: "",
    enterResults: "",
    comments: "",
    otherRemarks: ""
  });

  const { data: patients = [] } = useQuery({
    queryKey: ["/api/patients"],
  });

  const { data: therapySessions = [] } = useQuery({
    queryKey: ["/api/therapy-sessions"],
  });

  const saveTherapySessionMutation = useMutation({
    mutationFn: async (sessionData: any) => {
      return await apiRequest("POST", "/api/therapy-sessions", sessionData);
    },
    onSuccess: () => {
      toast({
        title: "Therapy Session Saved",
        description: "Therapy session has been recorded successfully.",
      });
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["/api/therapy-sessions"] });
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
          description: `${foundPatient.surname}, ${foundPatient.baptismalName} selected for therapy.`,
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

  const resetForm = () => {
    setTherapyForm({
      category: "",
      description: "",
      results: "",
      options: "",
      enterResults: "",
      comments: "",
      otherRemarks: ""
    });
  };

  const handleSave = () => {
    if (!selectedPatient) {
      toast({
        title: "No Patient Selected",
        description: "Please search and select a patient first.",
        variant: "destructive"
      });
      return;
    }

    if (!therapyForm.description) {
      toast({
        title: "Missing Information",
        description: "Please enter a description for the therapy session.",
        variant: "destructive"
      });
      return;
    }

    const sessionData = {
      ...therapyForm,
      patientId: selectedPatient.id,
      patientName: `${selectedPatient.surname}, ${selectedPatient.baptismalName}`,
      sessionDate: new Date().toISOString(),
      therapistId: "current-user" // This would come from auth context
    };

    saveTherapySessionMutation.mutate(sessionData);
  };

  const handleCancel = () => {
    resetForm();
    setSelectedPatient(null);
    setSearchQuery("");
  };

  return (
    <div className="h-screen bg-green-50 p-6">
      <div className="bg-white rounded-lg shadow-sm h-full">
        {/* Patient Data Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-4">
              <div>
                <Label className="font-semibold text-lg">PATIENT DATA</Label>
              </div>
              
              <div className="flex items-center gap-4">
                <Label className="text-sm font-medium">Search by OP NO:</Label>
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 h-8"
                  placeholder="Enter OP. No."
                />
                <Button onClick={handlePatientSearch} size="sm" className="h-8">
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {selectedPatient ? (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-medium">Full Name:</span>
                      <span>{selectedPatient.surname}, {selectedPatient.baptismalName} {selectedPatient.otherName}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-medium">Allergies:</span>
                      <span>{selectedPatient.allergies || "-"}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-medium">Medical Conditions:</span>
                      <span>{selectedPatient.medicalHistory || "-"}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-medium">Payment Method:</span>
                      <span>{selectedPatient.paymentOption || "-"}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-medium">Gender:</span>
                      <span>{selectedPatient.gender || "-"}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-medium">Age:</span>
                      <span>{selectedPatient.age || "-"}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 py-4">
                  Search and select a patient to begin therapy session
                </div>
              )}
            </div>

            {/* Patient Photo */}
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                <User className="w-12 h-12 text-gray-400" />
              </div>
              <div className="w-32 h-2 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>

        {/* Therapy Session Tabs */}
        <div className="p-6">
          <Tabs defaultValue="notes-entry" className="w-full">
            <TabsList className="bg-blue-100 mb-4">
              <TabsTrigger value="notes-entry">Notes Entry</TabsTrigger>
              <TabsTrigger value="counselling-history">Counselling History</TabsTrigger>
            </TabsList>

            <TabsContent value="notes-entry" className="space-y-4">
              {/* Category Selection */}
              <div className="bg-orange-100 p-4 rounded">
                <div className="flex items-center gap-4">
                  <Label className="text-sm font-medium">Notes entry, pick category here</Label>
                  <Select value={therapyForm.category} onValueChange={(value) => setTherapyForm(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger className="w-64 h-8 bg-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual-therapy">Individual Therapy</SelectItem>
                      <SelectItem value="group-therapy">Group Therapy</SelectItem>
                      <SelectItem value="family-therapy">Family Therapy</SelectItem>
                      <SelectItem value="cognitive-behavioral">Cognitive Behavioral Therapy</SelectItem>
                      <SelectItem value="play-therapy">Play Therapy</SelectItem>
                      <SelectItem value="art-therapy">Art Therapy</SelectItem>
                      <SelectItem value="behavioral-intervention">Behavioral Intervention</SelectItem>
                      <SelectItem value="crisis-intervention">Crisis Intervention</SelectItem>
                      <SelectItem value="assessment">Assessment</SelectItem>
                      <SelectItem value="follow-up">Follow-up Session</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Therapy Session Table */}
              <div className="bg-orange-50 rounded">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-orange-100">
                      <TableHead className="text-sm font-medium w-1/5">Description</TableHead>
                      <TableHead className="text-sm font-medium w-1/5">Results</TableHead>
                      <TableHead className="text-sm font-medium w-1/5">Options</TableHead>
                      <TableHead className="text-sm font-medium w-1/5">Enter Results</TableHead>
                      <TableHead className="text-sm font-medium w-1/5">Comments</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="p-2">
                        <Textarea
                          value={therapyForm.description}
                          onChange={(e) => setTherapyForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe the therapy session, interventions, and patient response"
                          className="min-h-32 text-xs"
                        />
                      </TableCell>
                      <TableCell className="p-2">
                        <Textarea
                          value={therapyForm.results}
                          onChange={(e) => setTherapyForm(prev => ({ ...prev, results: e.target.value }))}
                          placeholder="Session outcomes and patient progress"
                          className="min-h-32 text-xs"
                        />
                      </TableCell>
                      <TableCell className="p-2">
                        <Textarea
                          value={therapyForm.options}
                          onChange={(e) => setTherapyForm(prev => ({ ...prev, options: e.target.value }))}
                          placeholder="Treatment options discussed or recommended"
                          className="min-h-32 text-xs"
                        />
                      </TableCell>
                      <TableCell className="p-2">
                        <Textarea
                          value={therapyForm.enterResults}
                          onChange={(e) => setTherapyForm(prev => ({ ...prev, enterResults: e.target.value }))}
                          placeholder="Detailed results and measurements"
                          className="min-h-32 text-xs"
                        />
                      </TableCell>
                      <TableCell className="p-2">
                        <Textarea
                          value={therapyForm.comments}
                          onChange={(e) => setTherapyForm(prev => ({ ...prev, comments: e.target.value }))}
                          placeholder="Additional comments and observations"
                          className="min-h-32 text-xs"
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                {/* Other Remarks Section */}
                <div className="p-4 border-t">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Other Remarks:</Label>
                    <Textarea
                      value={therapyForm.otherRemarks}
                      onChange={(e) => setTherapyForm(prev => ({ ...prev, otherRemarks: e.target.value }))}
                      placeholder="Additional remarks, follow-up plans, or recommendations for future sessions"
                      className="min-h-20 bg-white"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-4 border-t flex justify-center gap-4">
                  <Button 
                    onClick={handleSave}
                    disabled={saveTherapySessionMutation.isPending}
                    className="bg-blue-500 text-white px-8"
                  >
                    Save
                  </Button>
                  <Button 
                    onClick={handleCancel}
                    variant="outline"
                    className="px-8"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="counselling-history" className="space-y-4">
              <div className="bg-white border rounded">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-blue-100">
                      <TableHead className="text-sm">Date</TableHead>
                      <TableHead className="text-sm">Category</TableHead>
                      <TableHead className="text-sm">Description</TableHead>
                      <TableHead className="text-sm">Results</TableHead>
                      <TableHead className="text-sm">Therapist</TableHead>
                      <TableHead className="text-sm">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {therapySessions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          No therapy sessions recorded yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      therapySessions.map((session: any) => (
                        <TableRow key={session.id} className="text-sm">
                          <TableCell>{new Date(session.sessionDate).toLocaleDateString()}</TableCell>
                          <TableCell>{session.category}</TableCell>
                          <TableCell className="max-w-xs truncate">{session.description}</TableCell>
                          <TableCell className="max-w-xs truncate">{session.results}</TableCell>
                          <TableCell>{session.therapistName}</TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline">View</Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}