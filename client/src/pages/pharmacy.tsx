import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { insertMedicationSchema, insertPrescriptionSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pill, Search, Filter, Package, Plus, AlertTriangle, Loader2 } from "lucide-react";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { Medication, Prescription, Patient, User } from "@shared/schema";

const medicationFormSchema = insertMedicationSchema;
const prescriptionFormSchema = insertPrescriptionSchema;

type MedicationFormData = z.infer<typeof medicationFormSchema>;
type PrescriptionFormData = z.infer<typeof prescriptionFormSchema>;

export default function Pharmacy() {
  const [showMedicationModal, setShowMedicationModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("inventory");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: medications = [], isLoading: medicationsLoading } = useQuery({
    queryKey: ["/api/medications", searchQuery],
    queryFn: ({ queryKey }) => {
      const [url, search] = queryKey;
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      return fetch(`${url}${params}`, { credentials: "include" }).then(res => res.json());
    },
  });

  const { data: prescriptions = [], isLoading: prescriptionsLoading } = useQuery({
    queryKey: ["/api/prescriptions"],
  });

  const { data: patients = [] } = useQuery({
    queryKey: ["/api/patients"],
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
    queryFn: () => {
      // Mock users - in production this would be a real API
      return Promise.resolve([
        { id: 1, firstName: "Sarah", lastName: "Johnson", role: "admin" },
        { id: 2, firstName: "Michael", lastName: "Chen", role: "doctor" },
        { id: 3, firstName: "Emily", lastName: "Davis", role: "doctor" },
      ]);
    }
  });

  const medicationForm = useForm<MedicationFormData>({
    resolver: zodResolver(medicationFormSchema),
    defaultValues: {
      name: "",
      genericName: "",
      dosageForm: "",
      strength: "",
      manufacturer: "",
      category: "",
      stockQuantity: 0,
      unitPrice: "0",
      reorderLevel: 10,
      expiryDate: "",
      batchNumber: "",
      isActive: true,
    },
  });

  const prescriptionForm = useForm<PrescriptionFormData>({
    resolver: zodResolver(prescriptionFormSchema),
    defaultValues: {
      patientId: 0,
      medicationId: 0,
      prescribedBy: 1,
      dosage: "",
      frequency: "",
      duration: "",
      quantity: 0,
      instructions: "",
      status: "active",
    },
  });

  const createMedicationMutation = useMutation({
    mutationFn: async (data: MedicationFormData) => {
      return await apiRequest("POST", "/api/medications", data);
    },
    onSuccess: async (response) => {
      const medication = await response.json();
      toast({
        title: "Medication Added",
        description: `${medication.name} has been added to inventory.`,
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/medications"] });
      medicationForm.reset();
      setShowMedicationModal(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to Add Medication",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const createPrescriptionMutation = useMutation({
    mutationFn: async (data: PrescriptionFormData) => {
      return await apiRequest("POST", "/api/prescriptions", data);
    },
    onSuccess: async (response) => {
      const prescription = await response.json();
      toast({
        title: "Prescription Created",
        description: `Prescription ${prescription.prescriptionId} has been created.`,
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/prescriptions"] });
      prescriptionForm.reset();
      setShowPrescriptionModal(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to Create Prescription",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const onMedicationSubmit = (data: MedicationFormData) => {
    createMedicationMutation.mutate(data);
  };

  const onPrescriptionSubmit = (data: PrescriptionFormData) => {
    createPrescriptionMutation.mutate(data);
  };

  const getPatientName = (patientId: number) => {
    const patient = patients.find((p: Patient) => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : "Unknown Patient";
  };

  const getPrescribedByName = (prescribedBy: number) => {
    const user = users.find((u: User) => u.id === prescribedBy);
    return user ? `Dr. ${user.firstName} ${user.lastName}` : "Unknown Doctor";
  };

  const getMedicationName = (medicationId: number) => {
    const medication = medications.find((m: Medication) => m.id === medicationId);
    return medication ? medication.name : "Unknown Medication";
  };

  const getLowStockMedications = () => {
    return medications.filter((med: Medication) => med.stockQuantity <= med.reorderLevel);
  };

  const getExpiringMedications = () => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    return medications.filter((med: Medication) => 
      med.expiryDate && new Date(med.expiryDate) <= thirtyDaysFromNow
    );
  };

  const dosageForms = ["Tablet", "Capsule", "Liquid", "Injection", "Topical", "Inhaler"];
  const categories = ["Antibiotics", "Pain Relief", "Heart Disease", "Diabetes", "Vitamins", "Other"];
  const frequencies = ["Once daily", "Twice daily", "Three times daily", "Four times daily", "As needed"];

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Pharmacy</h2>
            <p className="text-gray-600">Manage medication inventory and prescriptions</p>
          </div>
          <div className="flex items-center space-x-3">
            <Dialog open={showMedicationModal} onOpenChange={setShowMedicationModal}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center space-x-2">
                  <Package className="w-4 h-4" />
                  <span>Add Medication</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Medication</DialogTitle>
                </DialogHeader>
                
                <Form {...medicationForm}>
                  <form onSubmit={medicationForm.handleSubmit(onMedicationSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={medicationForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Medication Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Brand name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={medicationForm.control}
                        name="genericName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Generic Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Generic name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={medicationForm.control}
                        name="dosageForm"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dosage Form *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select form" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {dosageForms.map((form) => (
                                  <SelectItem key={form} value={form}>
                                    {form}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={medicationForm.control}
                        name="strength"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Strength *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 500mg" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={medicationForm.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories.map((category) => (
                                  <SelectItem key={category} value={category}>
                                    {category}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={medicationForm.control}
                        name="manufacturer"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Manufacturer</FormLabel>
                            <FormControl>
                              <Input placeholder="Manufacturer name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={medicationForm.control}
                        name="batchNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Batch Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Batch/Lot number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      <FormField
                        control={medicationForm.control}
                        name="stockQuantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stock Quantity *</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="0"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={medicationForm.control}
                        name="reorderLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Reorder Level *</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="10"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={medicationForm.control}
                        name="unitPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unit Price *</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01"
                                placeholder="0.00"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={medicationForm.control}
                        name="expiryDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expiry Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setShowMedicationModal(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createMedicationMutation.isPending}>
                        {createMedicationMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          "Add Medication"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            <Dialog open={showPrescriptionModal} onOpenChange={setShowPrescriptionModal}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-white hover:bg-blue-700 flex items-center space-x-2">
                  <Pill className="w-4 h-4" />
                  <span>New Prescription</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Prescription</DialogTitle>
                </DialogHeader>
                
                <Form {...prescriptionForm}>
                  <form onSubmit={prescriptionForm.handleSubmit(onPrescriptionSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={prescriptionForm.control}
                        name="patientId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Patient *</FormLabel>
                            <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select patient" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {patients.map((patient: Patient) => (
                                  <SelectItem key={patient.id} value={patient.id.toString()}>
                                    {patient.firstName} {patient.lastName} ({patient.patientId})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={prescriptionForm.control}
                        name="medicationId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Medication *</FormLabel>
                            <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select medication" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {medications.map((medication: Medication) => (
                                  <SelectItem key={medication.id} value={medication.id.toString()}>
                                    {medication.name} - {medication.strength}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={prescriptionForm.control}
                        name="dosage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dosage *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 1 tablet" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={prescriptionForm.control}
                        name="frequency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Frequency *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {frequencies.map((freq) => (
                                  <SelectItem key={freq} value={freq}>
                                    {freq}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={prescriptionForm.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duration *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 7 days" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={prescriptionForm.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Number of units"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={prescriptionForm.control}
                      name="instructions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instructions</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Special instructions for the patient"
                              className="resize-none"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setShowPrescriptionModal(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createPrescriptionMutation.isPending}>
                        {createPrescriptionMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          "Create Prescription"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Alerts for Low Stock and Expiring Medications */}
      {(getLowStockMedications().length > 0 || getExpiringMedications().length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {getLowStockMedications().length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-red-800">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-medium">Low Stock Alert</h3>
              </div>
              <p className="text-sm text-red-600 mt-1">
                {getLowStockMedications().length} medication(s) are running low on stock
              </p>
            </div>
          )}
          
          {getExpiringMedications().length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-yellow-800">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-medium">Expiry Alert</h3>
              </div>
              <p className="text-sm text-yellow-600 mt-1">
                {getExpiringMedications().length} medication(s) will expire within 30 days
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="inventory">Medication Inventory</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-6">
          {/* Search */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search medications by name, category, or manufacturer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="flex items-center space-x-2">
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </Button>
            </div>
          </div>

          {/* Medications Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Medication Inventory ({medications.length})
              </h3>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medication</TableHead>
                  <TableHead>Generic Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medicationsLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <TableCell key={j}>
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : medications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="text-gray-500">
                        {searchQuery ? "No medications found matching your search" : "No medications in inventory yet"}
                      </div>
                      <Button 
                        onClick={() => setShowMedicationModal(true)}
                        className="mt-2" 
                        size="sm"
                      >
                        <Package className="w-4 h-4 mr-2" />
                        Add First Medication
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  medications.map((medication: Medication) => {
                    const isLowStock = medication.stockQuantity <= medication.reorderLevel;
                    const isExpiring = medication.expiryDate && 
                      new Date(medication.expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                    
                    return (
                      <TableRow key={medication.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{medication.name}</p>
                            <p className="text-sm text-gray-500">{medication.strength}</p>
                          </div>
                        </TableCell>
                        <TableCell>{medication.genericName || "N/A"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{medication.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className={isLowStock ? "text-red-600 font-medium" : ""}>
                              {medication.stockQuantity}
                            </span>
                            {isLowStock && <AlertTriangle className="w-4 h-4 text-red-500" />}
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(Number(medication.unitPrice))}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className={isExpiring ? "text-yellow-600 font-medium" : ""}>
                              {medication.expiryDate ? formatDate(medication.expiryDate) : "N/A"}
                            </span>
                            {isExpiring && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={medication.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                            {medication.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="prescriptions" className="space-y-6">
          {/* Prescriptions Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Prescriptions ({prescriptions.length})
              </h3>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Prescription ID</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Medication</TableHead>
                  <TableHead>Dosage</TableHead>
                  <TableHead>Prescribed By</TableHead>
                  <TableHead>Date Issued</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prescriptionsLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <TableCell key={j}>
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : prescriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="text-gray-500">No prescriptions created yet</div>
                      <Button 
                        onClick={() => setShowPrescriptionModal(true)}
                        className="mt-2" 
                        size="sm"
                      >
                        <Pill className="w-4 h-4 mr-2" />
                        Create First Prescription
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  prescriptions.map((prescription: Prescription) => (
                    <TableRow key={prescription.id}>
                      <TableCell className="font-medium text-primary">
                        {prescription.prescriptionId}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{getPatientName(prescription.patientId)}</p>
                          <p className="text-sm text-gray-500">
                            {patients.find((p: Patient) => p.id === prescription.patientId)?.patientId}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{getMedicationName(prescription.medicationId)}</p>
                          <p className="text-sm text-gray-500">Qty: {prescription.quantity}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{prescription.dosage}</p>
                          <p className="text-sm text-gray-500">{prescription.frequency}</p>
                          <p className="text-sm text-gray-500">Duration: {prescription.duration}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getPrescribedByName(prescription.prescribedBy)}</TableCell>
                      <TableCell>{formatDate(prescription.dateIssued)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(prescription.status)}>
                          {prescription.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {prescription.status === "active" && (
                            <Button variant="ghost" size="sm">
                              Dispense
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </div>
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
  );
}
