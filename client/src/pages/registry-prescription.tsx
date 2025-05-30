import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, FileText, Save, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Available medications from inventory
const availableMedications = [
  { id: 1, name: "Paracetamol 500mg", unitPrice: 5, category: "Analgesics", stock: 500 },
  { id: 2, name: "Tramadol 50mg", unitPrice: 100, category: "Analgesics", stock: 200 },
  { id: 3, name: "Risperidone 2mg", unitPrice: 80, category: "Antipsychotics", stock: 120 },
  { id: 4, name: "Risperidone 1mg", unitPrice: 60, category: "Antipsychotics", stock: 150 },
  { id: 5, name: "Quetiapine 100mg", unitPrice: 70, category: "Antipsychotics", stock: 80 },
  { id: 6, name: "Sertraline 50mg", unitPrice: 75, category: "Antidepressants", stock: 120 },
  { id: 7, name: "Fluoxetine 20mg", unitPrice: 40, category: "Antidepressants", stock: 100 },
  { id: 8, name: "Escitalopram 10mg", unitPrice: 115, category: "Antidepressants", stock: 90 },
  { id: 9, name: "Olanzapine 10mg", unitPrice: 50, category: "Antipsychotics", stock: 75 },
  { id: 10, name: "Lamotrigine 100mg", unitPrice: 80, category: "Mood Stabilizers", stock: 80 },
  { id: 11, name: "Diazepam 5mg", unitPrice: 10, category: "CNS Drugs", stock: 150 },
  { id: 12, name: "Omeprazole 20mg", unitPrice: 15, category: "Gastrointestinal", stock: 200 },
  { id: 13, name: "Amoxicillin 500mg", unitPrice: 15, category: "Anti-infectives", stock: 300 },
  { id: 14, name: "Ciprofloxacin 500mg", unitPrice: 300, category: "Anti-infectives", stock: 200 },
  { id: 15, name: "Cetirizine 10mg", unitPrice: 10, category: "Antihistamines", stock: 300 }
];

interface PrescriptionMedication {
  medicationId: number;
  medicationName: string;
  quantity: number;
  instructions: string;
  unitPrice: number;
  total: number;
}

export default function RegistryPrescription() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [patientId, setPatientId] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [prescriptionDate, setPrescriptionDate] = useState("");
  const [medications, setMedications] = useState<PrescriptionMedication[]>([]);
  const [prescriptionNotes, setPrescriptionNotes] = useState("");
  const [registryNotes, setRegistryNotes] = useState("");

  const { data: patients = [] } = useQuery({
    queryKey: ["/api/patients"],
  });

  // Create prescription mutation
  const createPrescriptionMutation = useMutation({
    mutationFn: async (prescriptionData: any) => {
      return await apiRequest("POST", "/api/prescriptions", prescriptionData);
    },
    onSuccess: () => {
      toast({
        title: "External Prescription Registered",
        description: "Prescription has been registered and sent to pharmacy for approval.",
      });
      // Reset form
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["/api/prescriptions"] });
    },
  });

  const resetForm = () => {
    setPatientId("");
    setPatientName("");
    setPatientPhone("");
    setDoctorName("");
    setClinicName("");
    setPrescriptionDate("");
    setMedications([]);
    setPrescriptionNotes("");
    setRegistryNotes("");
  };

  const selectExistingPatient = (selectedPatientId: string) => {
    const patient = patients.find((p: any) => p.id === selectedPatientId);
    if (patient) {
      setPatientId(patient.id);
      setPatientName(patient.name);
      setPatientPhone(patient.phone || "");
    }
  };

  const addMedication = () => {
    setMedications([...medications, {
      medicationId: 0,
      medicationName: "",
      quantity: 1,
      instructions: "",
      unitPrice: 0,
      total: 0
    }]);
  };

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const updateMedication = (index: number, field: keyof PrescriptionMedication, value: any) => {
    const updated = [...medications];
    updated[index] = { ...updated[index], [field]: value };
    
    // Auto-calculate total when quantity or medication changes
    if (field === 'quantity' || field === 'medicationId') {
      updated[index].total = updated[index].quantity * updated[index].unitPrice;
    }
    
    setMedications(updated);
  };

  const selectMedication = (index: number, medicationId: number) => {
    const selectedMed = availableMedications.find(med => med.id === medicationId);
    if (selectedMed) {
      updateMedication(index, 'medicationId', medicationId);
      updateMedication(index, 'medicationName', selectedMed.name);
      updateMedication(index, 'unitPrice', selectedMed.unitPrice);
      updateMedication(index, 'total', medications[index].quantity * selectedMed.unitPrice);
    }
  };

  const calculateTotal = () => {
    return medications.reduce((sum, med) => sum + med.total, 0);
  };

  const savePrescription = () => {
    if (!patientName.trim() || !doctorName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter patient name and doctor name.",
        variant: "destructive"
      });
      return;
    }

    if (medications.length === 0) {
      toast({
        title: "No Medications",
        description: "Please add at least one medication to the prescription.",
        variant: "destructive"
      });
      return;
    }

    if (!prescriptionDate) {
      toast({
        title: "Missing Date",
        description: "Please enter the prescription date.",
        variant: "destructive"
      });
      return;
    }

    const prescriptionData = {
      patientId: patientId || `EXT-${Date.now()}`,
      patientName,
      patientPhone,
      doctorName,
      clinicName,
      prescriptionDate,
      medications: medications.filter(med => med.medicationId > 0),
      prescriptionNotes,
      registryNotes,
      totalAmount: calculateTotal(),
      prescriptionType: "registry",
      status: "pending",
      dateIssued: new Date().toISOString().split('T')[0],
      timeIssued: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    };

    createPrescriptionMutation.mutate(prescriptionData);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Upload className="h-8 w-8 text-orange-600" />
            Register External Prescription
          </h1>
          <p className="text-gray-600">Enter prescription details from external doctor/clinic</p>
        </div>
      </div>

      {/* Patient Information */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Information</CardTitle>
          <CardDescription>Enter patient details or select existing patient</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Select Existing Patient (Optional)</Label>
            <Select onValueChange={selectExistingPatient}>
              <SelectTrigger>
                <SelectValue placeholder="Search existing patients..." />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient: any) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name} ({patient.id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Patient ID (if known)</Label>
              <Input
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="Leave blank for new patients"
              />
            </div>
            <div>
              <Label>Patient Name *</Label>
              <Input
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Enter patient full name"
              />
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                placeholder="Patient contact number"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prescription Source */}
      <Card>
        <CardHeader>
          <CardTitle>Prescription Source</CardTitle>
          <CardDescription>Details about the prescribing doctor and clinic</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Doctor Name *</Label>
              <Input
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                placeholder="Dr. John Smith"
              />
            </div>
            <div>
              <Label>Clinic/Hospital Name</Label>
              <Input
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                placeholder="External Medical Center"
              />
            </div>
            <div>
              <Label>Prescription Date *</Label>
              <Input
                type="date"
                value={prescriptionDate}
                onChange={(e) => setPrescriptionDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Prescribed Medications
            <Button onClick={addMedication} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Medication
            </Button>
          </CardTitle>
          <CardDescription>
            Enter the medications as written on the external prescription
          </CardDescription>
        </CardHeader>
        <CardContent>
          {medications.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No medications added yet. Click "Add Medication" to start.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medication</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Instructions</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medications.map((med, index) => {
                  const selectedMedication = availableMedications.find(m => m.id === med.medicationId);
                  return (
                    <TableRow key={index}>
                      <TableCell>
                        <Select 
                          value={med.medicationId.toString()} 
                          onValueChange={(value) => selectMedication(index, parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select medication" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableMedications.map((medication) => (
                              <SelectItem key={medication.id} value={medication.id.toString()}>
                                {medication.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          value={med.quantity}
                          onChange={(e) => updateMedication(index, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={med.instructions}
                          onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                          placeholder="e.g., Take 1 tablet twice daily"
                        />
                      </TableCell>
                      <TableCell>KShs {med.unitPrice}</TableCell>
                      <TableCell>KShs {med.total}</TableCell>
                      <TableCell>
                        {selectedMedication && (
                          <Badge variant={selectedMedication.stock > 0 ? "default" : "destructive"}>
                            {selectedMedication.stock > 0 ? `${selectedMedication.stock} available` : "Out of stock"}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeMedication(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
          
          {medications.length > 0 && (
            <div className="mt-4 text-right">
              <div className="text-lg font-bold">
                Total Amount: KShs {calculateTotal().toLocaleString()}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Original Prescription Notes</Label>
            <Textarea
              value={prescriptionNotes}
              onChange={(e) => setPrescriptionNotes(e.target.value)}
              placeholder="Notes from the original prescription..."
              rows={3}
            />
          </div>
          <div>
            <Label>Registry Notes</Label>
            <Textarea
              value={registryNotes}
              onChange={(e) => setRegistryNotes(e.target.value)}
              placeholder="Internal notes about prescription registration..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={resetForm}>
          Clear Form
        </Button>
        <Button onClick={savePrescription} disabled={createPrescriptionMutation.isPending}>
          {createPrescriptionMutation.isPending ? (
            "Registering..."
          ) : (
            <>
              <Save className="h-4 w-4 mr-1" />
              Register Prescription
            </>
          )}
        </Button>
      </div>
    </div>
  );
}