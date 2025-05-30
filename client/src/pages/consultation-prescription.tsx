import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, FileText, Save, Send } from "lucide-react";
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

interface ConsultationPrescriptionProps {
  patient: any;
  doctorName: string;
  onClose: () => void;
  onSave: (prescriptionData: any) => void;
}

export default function ConsultationPrescription({ patient, doctorName, onClose, onSave }: ConsultationPrescriptionProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [medications, setMedications] = useState<PrescriptionMedication[]>([]);
  const [prescriptionNotes, setPrescriptionNotes] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [followUpInstructions, setFollowUpInstructions] = useState("");

  // Create prescription mutation
  const createPrescriptionMutation = useMutation({
    mutationFn: async (prescriptionData: any) => {
      return await apiRequest("POST", "/api/prescriptions", prescriptionData);
    },
    onSuccess: () => {
      toast({
        title: "Prescription Created",
        description: "Prescription has been sent to pharmacy for approval.",
      });
      onSave({
        patient,
        medications,
        diagnosis,
        prescriptionNotes,
        followUpInstructions,
        totalAmount: calculateTotal()
      });
      onClose();
      queryClient.invalidateQueries({ queryKey: ["/api/prescriptions"] });
    },
  });

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
    if (medications.length === 0) {
      toast({
        title: "No Medications",
        description: "Please add at least one medication to the prescription.",
        variant: "destructive"
      });
      return;
    }

    if (!diagnosis.trim()) {
      toast({
        title: "Missing Diagnosis",
        description: "Please enter a diagnosis for this prescription.",
        variant: "destructive"
      });
      return;
    }

    const prescriptionData = {
      patientId: patient.id,
      patientName: patient.name,
      doctorName,
      diagnosis,
      medications: medications.filter(med => med.medicationId > 0),
      prescriptionNotes,
      followUpInstructions,
      totalAmount: calculateTotal(),
      prescriptionType: "doctor",
      status: "pending",
      dateIssued: new Date().toISOString().split('T')[0],
      timeIssued: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    };

    createPrescriptionMutation.mutate(prescriptionData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            Create Prescription
          </h2>
          <p className="text-gray-600">Patient: {patient.name} ({patient.id})</p>
        </div>
      </div>

      {/* Patient and Doctor Information */}
      <Card>
        <CardHeader>
          <CardTitle>Prescription Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Patient Name</Label>
              <Input value={patient.name} disabled />
            </div>
            <div>
              <Label>Patient ID</Label>
              <Input value={patient.id} disabled />
            </div>
            <div>
              <Label>Doctor</Label>
              <Input value={doctorName} disabled />
            </div>
            <div>
              <Label>Date</Label>
              <Input value={new Date().toLocaleDateString()} disabled />
            </div>
          </div>
          <div>
            <Label>Diagnosis *</Label>
            <Textarea
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="Enter primary diagnosis..."
              rows={2}
            />
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
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medications.map((med, index) => (
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
                              <div className="flex justify-between items-center w-full">
                                <span>{medication.name}</span>
                                <Badge variant="outline" className="ml-2">
                                  Stock: {medication.stock}
                                </Badge>
                              </div>
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
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeMedication(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
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

      {/* Additional Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Prescription Notes</Label>
            <Textarea
              value={prescriptionNotes}
              onChange={(e) => setPrescriptionNotes(e.target.value)}
              placeholder="Additional notes about the prescription..."
              rows={3}
            />
          </div>
          <div>
            <Label>Follow-up Instructions</Label>
            <Textarea
              value={followUpInstructions}
              onChange={(e) => setFollowUpInstructions(e.target.value)}
              placeholder="Follow-up care instructions for the patient..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={savePrescription} disabled={createPrescriptionMutation.isPending}>
          {createPrescriptionMutation.isPending ? (
            "Sending..."
          ) : (
            <>
              <Send className="h-4 w-4 mr-1" />
              Send to Pharmacy
            </>
          )}
        </Button>
      </div>
    </div>
  );
}