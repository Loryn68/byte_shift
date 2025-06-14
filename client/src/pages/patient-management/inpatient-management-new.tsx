import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Printer, Save, Plus, Edit3, Search, User, FileDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import DischargeSummaryForm from "@/components/forms/DischargeSummaryForm";
import TreatmentRecordForm from "@/components/forms/TreatmentRecordForm";

export default function InpatientManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [admissionNotes, setAdmissionNotes] = useState([]);
  const [newNote, setNewNote] = useState({
    date: new Date().toISOString().split('T')[0],
    description: "",
    enteredBy: ""
  });

  const { data: patients = [] } = useQuery({
    queryKey: ["/api/patients"],
  });

  const { data: inpatients = [] } = useQuery({
    queryKey: ["/api/inpatients"],
  });

  const addNoteMutation = useMutation({
    mutationFn: async (noteData: any) => {
      return await apiRequest("POST", "/api/admission-notes", noteData);
    },
    onSuccess: () => {
      toast({
        title: "Note Added",
        description: "Admission note has been recorded successfully.",
      });
      setNewNote({
        date: new Date().toISOString().split('T')[0],
        description: "",
        enteredBy: ""
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admission-notes"] });
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
          description: `${foundPatient.surname}, ${foundPatient.baptismalName} selected for inpatient care.`,
        });
      } else {
        toast({
          title: "Not Found",
          description: "No patient found with that criteria.",
          variant: "destructive"
        });
      }
    }
  };

  const handleAddNote = () => {
    if (!selectedPatient) {
      toast({
        title: "No Patient Selected",
        description: "Please search and select a patient first.",
        variant: "destructive"
      });
      return;
    }

    if (!newNote.description.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a description for the admission note.",
        variant: "destructive"
      });
      return;
    }

    const noteData = {
      ...newNote,
      patientId: selectedPatient.id,
      patientName: `${selectedPatient.surname}, ${selectedPatient.baptismalName}`,
      opNo: selectedPatient.patientId
    };

    addNoteMutation.mutate(noteData);
  };

  return (
    <div className="h-screen bg-green-50 p-6">
      <div className="bg-white rounded-lg shadow-sm h-full">
        {/* Patient Search and Information Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-4">
                <Label className="text-sm font-medium">Search Patient:</Label>
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 h-8"
                  placeholder="Enter Patient ID or Name"
                />
                <Button onClick={handlePatientSearch} size="sm" className="h-8">
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {selectedPatient ? (
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <Label className="font-medium text-gray-600">Patient Name:</Label>
                    <div className="font-semibold text-blue-600">
                      {selectedPatient.surname}, {selectedPatient.baptismalName} {selectedPatient.otherName}
                    </div>
                  </div>
                  <div>
                    <Label className="font-medium text-gray-600">Patient ID:</Label>
                    <div className="font-semibold text-blue-600">{selectedPatient.patientId}</div>
                  </div>
                  <div>
                    <Label className="font-medium text-gray-600">Gender:</Label>
                    <div>{selectedPatient.gender}</div>
                  </div>
                  <div>
                    <Label className="font-medium text-gray-600">Age:</Label>
                    <div>{selectedPatient.age} years</div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 py-4">
                  Search and select a patient to begin inpatient management
                </div>
              )}
            </div>

            {/* Patient Photo */}
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                <User className="w-12 h-12 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Patient Information Tabs */}
        <div className="p-6">
          <Tabs defaultValue="medical-history" className="w-full">
            <TabsList className="bg-gray-100 mb-4">
              <TabsTrigger value="medical-history" className="bg-blue-500 text-white data-[state=active]:bg-blue-600">
                Medical History
              </TabsTrigger>
              <TabsTrigger value="diagnosis" className="bg-orange-500 text-white data-[state=active]:bg-orange-600">
                Diagnosis
              </TabsTrigger>
              <TabsTrigger value="allergies" className="bg-red-500 text-white data-[state=active]:bg-red-600">
                Allergies
              </TabsTrigger>
              <TabsTrigger value="other-conditions" className="bg-orange-400 text-white data-[state=active]:bg-orange-500">
                Other Underlying Medical Conditions
              </TabsTrigger>
              <TabsTrigger value="documents" className="bg-blue-400 text-white data-[state=active]:bg-blue-500">
                Documents
              </TabsTrigger>
            </TabsList>

            <TabsContent value="medical-history" className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <Textarea
                    placeholder="Enter patient's medical history, previous admissions, chronic conditions, surgeries, etc."
                    className="min-h-32"
                    value={selectedPatient?.medicalHistory || ""}
                    readOnly={!selectedPatient}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="diagnosis" className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <Textarea
                    placeholder="Enter current diagnosis, primary and secondary conditions"
                    className="min-h-32"
                    value={selectedPatient?.currentDiagnosis || ""}
                    readOnly={!selectedPatient}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="allergies" className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <Textarea
                    placeholder="List known allergies, drug reactions, food allergies"
                    className="min-h-32"
                    value={selectedPatient?.allergies || "None"}
                    readOnly={!selectedPatient}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="other-conditions" className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <Textarea
                    placeholder="Enter other underlying medical conditions, comorbidities"
                    className="min-h-32"
                    value={selectedPatient?.otherConditions || ""}
                    readOnly={!selectedPatient}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Button size="sm" variant="outline">
                        <FileText className="h-4 w-4 mr-2" />
                        Upload Document
                      </Button>
                      <Input type="file" className="hidden" id="document-upload" />
                    </div>
                    <div className="text-sm text-gray-500">
                      Upload medical reports, lab results, imaging studies, referral letters
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Admission Notes Section */}
        <div className="px-6 pb-6">
          <div className="border rounded-lg">
            <div className="bg-gray-100 p-3 border-b">
              <h3 className="font-semibold text-sm">Admission Notes</h3>
              <div className="text-xs text-gray-600 mt-1">Doctor/Nurse/Counsellor Notes</div>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-2 gap-6">
                {/* Left Panel - Admission Notes List */}
                <div>
                  <div className="bg-gray-50 p-3 mb-4">
                    <h4 className="font-medium text-sm mb-3">Admission Notes</h4>
                    
                    <div className="border rounded">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-100">
                            <TableHead className="text-xs p-2">Date</TableHead>
                            <TableHead className="text-xs p-2">Description</TableHead>
                            <TableHead className="text-xs p-2">EnteredBy</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {admissionNotes.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={3} className="text-center text-gray-500 py-4 text-xs">
                                No admission notes recorded yet
                              </TableCell>
                            </TableRow>
                          ) : (
                            admissionNotes.map((note: any, index) => (
                              <TableRow key={index} className="text-xs">
                                <TableCell className="p-2">{note.date}</TableCell>
                                <TableCell className="p-2">{note.description}</TableCell>
                                <TableCell className="p-2">{note.enteredBy}</TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" className="text-xs">
                        <FileText className="h-3 w-3 mr-1" />
                        Templates
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs" onClick={handleAddNote}>
                        <Plus className="h-3 w-3 mr-1" />
                        Add New
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs">
                        <Edit3 className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs">
                        <Printer className="h-3 w-3 mr-1" />
                        Print
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Right Panel - Note Entry */}
                <div>
                  <div className="bg-gray-800 text-white p-4 rounded">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <Button size="sm" variant="outline" className="text-xs">
                          <Printer className="h-3 w-3 mr-1" />
                          Print
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs">
                          <FileText className="h-3 w-3 mr-1" />
                          File
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs">
                          <Save className="h-3 w-3 mr-1" />
                          Save
                        </Button>
                      </div>
                      <div className="text-xs">
                        Page 1 of 1
                      </div>
                    </div>

                    <div className="bg-white text-black p-4 rounded min-h-64">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs font-medium">Date:</Label>
                            <Input
                              type="date"
                              value={newNote.date}
                              onChange={(e) => setNewNote(prev => ({ ...prev, date: e.target.value }))}
                              className="h-8 text-xs"
                            />
                          </div>
                          <div>
                            <Label className="text-xs font-medium">Entered By:</Label>
                            <Input
                              value={newNote.enteredBy}
                              onChange={(e) => setNewNote(prev => ({ ...prev, enteredBy: e.target.value }))}
                              placeholder="Doctor/Nurse/Counsellor name"
                              className="h-8 text-xs"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-xs font-medium">Description:</Label>
                          <Textarea
                            value={newNote.description}
                            onChange={(e) => setNewNote(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Enter detailed admission notes, observations, treatment plan, and progress notes..."
                            className="min-h-40 text-xs mt-1"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center gap-2 mt-4">
                      <div className="flex items-center gap-1 text-xs">
                        <span>100%</span>
                        <Button size="sm" variant="outline" className="h-6 w-6 p-0">+</Button>
                        <Button size="sm" variant="outline" className="h-6 w-6 p-0">-</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}