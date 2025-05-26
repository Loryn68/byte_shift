import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Search, RotateCcw, RefreshCw, Edit, CreditCard, Stethoscope, UserCheck, Bed } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { workflowManager } from "@/lib/workflow-system";
import logoPath from "@assets/image_1748235729903.png";
import type { Patient } from "@shared/schema";

const registrationSchema = z.object({
  firstName: z.string().min(1, "Baptismal name is required"),
  middleName: z.string().min(1, "Other name is required"),
  lastName: z.string().min(1, "Surname is required"),
  phone: z.string().min(1, "Phone number is required"),
  nationalId: z.string().min(1, "ID number is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Gender is required"),
  emergencyContactName: z.string().min(1, "Next of kin name is required"),
  emergencyContactPhone: z.string().min(1, "Next of kin phone is required"),
  emergencyContactRelationship: z.string().min(1, "Relationship is required"),
  occupation: z.string().optional(),
  address: z.string().min(1, "Residence is required"),
  registerFor: z.string().min(1, "Registration type is required"),
  patientCategory: z.string().min(1, "Patient category is required"),
  paymentOption: z.string().min(1, "Payment option is required"),
  referralSource: z.string().min(1, "Referral source is required"),
});

type RegistrationData = z.infer<typeof registrationSchema>;

export default function PatientRegistration() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showPatientList, setShowPatientList] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [referralFacility, setReferralFacility] = useState("");
  const [communityUnit, setCommunityUnit] = useState("");
  const [labRequestFile, setLabRequestFile] = useState<File | null>(null);
  const [requestedLabs, setRequestedLabs] = useState<string[]>([]);
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [prescribedMedications, setPrescribedMedications] = useState<string[]>([]);
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [currentWorkflowStep, setCurrentWorkflowStep] = useState<'cashier' | 'triage' | 'outpatient' | 'inpatient' | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query to get appointments for the patient
  const { data: patientAppointments = [] } = useQuery({
    queryKey: ["/api/appointments", selectedPatient?.id],
    enabled: !!selectedPatient?.id,
  });

  // Function to get patient visit history from real appointment data
  const getPatientVisitHistory = (patientId: number) => {
    if (!selectedPatient || selectedPatient.id !== patientId) return [];
    
    // Transform appointments data into visit history format
    return patientAppointments
      .filter((apt: any) => apt.patientId === patientId)
      .map((apt: any) => ({
        date: new Date(apt.appointmentDate).toLocaleDateString(),
        type: apt.type || "Consultation",
        doctor: `Dr. ${apt.doctorName || "Unknown"}`,
        status: apt.status,
        department: apt.department
      }))
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const form = useForm<RegistrationData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      phone: "",
      nationalId: "",
      dateOfBirth: "",
      gender: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      emergencyContactRelationship: "",
      occupation: "",
      address: "",
      registerFor: "",
      patientCategory: "",
      paymentOption: "",
      referralSource: "",
    },
  });

  const createPatientMutation = useMutation({
    mutationFn: async (data: RegistrationData) => {
      const patientData = {
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        phone: data.phone,
        email: null,
        address: data.address,
        emergencyContactName: data.emergencyContactName,
        emergencyContactPhone: data.emergencyContactPhone,
        emergencyContactRelationship: data.emergencyContactRelationship,
        bloodType: null,
        insuranceProvider: null,
        policyNumber: null,
        isActive: true,
      };
      
      return apiRequest("POST", "/api/patients", patientData);
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful",
        description: "Patient registered successfully. Ready for consultation billing.",
      });
      form.reset();
      setShowWorkflow(true);
      setCurrentWorkflowStep('cashier');
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
    },
    onError: () => {
      toast({
        title: "Registration Failed",
        description: "Unable to register patient. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegistrationData) => {
    createPatientMutation.mutate(data);
  };

  const { data: registeredPatients = [] } = useQuery({
    queryKey: ["/api/patients"],
  });

  // Search function
  const handleSearch = () => {
    const query = searchQuery.toLowerCase();
    return (registeredPatients as Patient[])
      .filter((patient: Patient) => 
        patient.lastName.toLowerCase().includes(query) ||
        patient.patientId.toLowerCase().includes(query) ||
        patient.phone.includes(query) ||
        patient.nationalId?.includes(query)
      )
      .sort((a, b) => a.lastName.localeCompare(b.lastName));
  };

  // Capitalize input function
  const capitalizeInput = (value: string) => {
    return value.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  // Update patient mutation
  const updatePatientMutation = useMutation({
    mutationFn: async (data: { id: number; patient: Partial<Patient> }) => {
      return await apiRequest("PUT", `/api/patients/${data.id}`, data.patient);
    },
    onSuccess: () => {
      toast({
        title: "Patient Updated",
        description: "Patient record has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      setEditingPatient(null);
      form.reset();
    },
  });

  // Load patient for editing
  const loadPatientForEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setSelectedPatient(patient);
    form.reset({
      firstName: patient.firstName,
      middleName: patient.middleName || "",
      lastName: patient.lastName,
      phone: patient.phone,
      nationalId: patient.nationalId || "",
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      emergencyContactName: patient.emergencyContactName,
      emergencyContactPhone: patient.emergencyContactPhone,
      emergencyContactRelationship: patient.emergencyContactRelationship || "",
      occupation: patient.occupation || "",
      address: patient.address,
      registerFor: "outpatient",
      patientCategory: "self-pay",
      paymentOption: "cash",
      referralSource: "walk-in",
    });
  };

  // Reset form
  const resetForm = () => {
    form.reset();
    setEditingPatient(null);
    setSearchQuery("");
  };

  // Refresh data
  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
    toast({
      title: "Data Refreshed",
      description: "Patient list has been refreshed.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm border mb-4 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={logoPath} alt="Child Mental Haven Logo" className="h-16 w-16 object-contain" />
            <div>
              <h1 className="text-xl font-bold text-blue-800">CHILD MENTAL HAVEN - [PATIENTS REGISTRY]</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {/* Left Sidebar */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          {/* Patient List */}
          <div className="mt-2">
            <Button 
              onClick={() => setShowPatientList(!showPatientList)}
              className="w-full mb-3 bg-yellow-500 hover:bg-yellow-600 text-black font-medium text-xs sm:text-sm px-1 sm:px-2 py-2 h-auto leading-tight"
            >
              <span className="break-words text-center">Load List of Registered Patients</span>
            </Button>
            
            {showPatientList && (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-2 gap-2 text-xs font-medium bg-gray-50 p-2">
                  <span>OP. No.</span>
                  <span>Patient Name</span>
                </div>
                {(searchQuery ? handleSearch() : (registeredPatients as Patient[]).sort((a, b) => a.lastName.localeCompare(b.lastName)))
                  .map((patient: Patient) => (
                    <div 
                      key={patient.id} 
                      className="grid grid-cols-2 gap-2 text-xs p-2 border rounded hover:bg-blue-50 cursor-pointer"
                      onClick={() => loadPatientForEdit(patient)}
                    >
                      <span className="font-medium">{patient.patientId}</span>
                      <span>{patient.firstName} {patient.lastName}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Registration Form */}
        <div className="col-span-2 bg-white rounded-lg shadow-sm border">
          <div className="bg-blue-100 p-3 border-b">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Add New Patient</h3>
              <div className="text-sm">Search by Surname/ID/Tel/OP-No:</div>
            </div>
            <div className="flex gap-2 mt-2">
              <Input 
                className="flex-1" 
                placeholder="Search by Surname/ID/Tel/OP-No..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowPatientList(true)}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                <Search className="w-4 h-4 mr-1" />
                Search
              </Button>
            </div>
          </div>

          <div className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Contact Numbers */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Tel. No: *</Label>
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input {...field} className="mt-1" required />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">ID/NO: *</Label>
                    <FormField
                      control={form.control}
                      name="nationalId"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input {...field} className="mt-1" required />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Names */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Baptismal Name: *</Label>
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              {...field} 
                              className="mt-1" 
                              required 
                              onChange={(e) => field.onChange(capitalizeInput(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Other Name: *</Label>
                    <FormField
                      control={form.control}
                      name="middleName"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              {...field} 
                              className="mt-1" 
                              required 
                              onChange={(e) => field.onChange(capitalizeInput(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Surname: *</Label>
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              {...field} 
                              className="mt-1" 
                              required 
                              onChange={(e) => field.onChange(capitalizeInput(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Date of Birth and Gender */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium">D.O.B: *</Label>
                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input type="date" {...field} className="mt-1" required />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Gender: *</Label>
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <Select onValueChange={field.onChange} defaultValue={field.value} required>
                            <FormControl>
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="--Select--" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Reg. Date: *</Label>
                    <Input type="date" value={new Date().toISOString().split('T')[0]} disabled className="mt-1" />
                  </div>
                </div>

                {/* Next of Kin Section */}
                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-medium text-gray-700">Next of Kin</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Full Name: *</Label>
                      <FormField
                        control={form.control}
                        name="emergencyContactName"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input {...field} className="mt-1" required />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Tel. Number: *</Label>
                      <FormField
                        control={form.control}
                        name="emergencyContactPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input {...field} className="mt-1" required />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Relationship: *</Label>
                      <FormField
                        control={form.control}
                        name="emergencyContactRelationship"
                        render={({ field }) => (
                          <FormItem>
                            <Select onValueChange={field.onChange} defaultValue={field.value} required>
                              <FormControl>
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="Select relationship" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="parent">Parent</SelectItem>
                                <SelectItem value="spouse">Spouse</SelectItem>
                                <SelectItem value="sibling">Sibling</SelectItem>
                                <SelectItem value="child">Child</SelectItem>
                                <SelectItem value="guardian">Guardian</SelectItem>
                                <SelectItem value="friend">Friend</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Occupation:</Label>
                      <FormField
                        control={form.control}
                        name="occupation"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input {...field} className="mt-1" placeholder="Enter occupation (optional)" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Residence: *</Label>
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input {...field} className="mt-1" required />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Registration Categories */}
                <div className="space-y-4 border-t pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Register For: *</Label>
                      <FormField
                        control={form.control}
                        name="registerFor"
                        render={({ field }) => (
                          <FormItem>
                            <Select onValueChange={field.onChange} defaultValue={field.value} required>
                              <FormControl>
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="Select service" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="child-consultation">Child Consultation - KSh 200</SelectItem>
                                <SelectItem value="psychiatric-consultation-5000">Psychiatric Consultation - KSh 5,000</SelectItem>
                                <SelectItem value="psychiatric-consultation-3000">Psychiatric Consultation - KSh 3,000</SelectItem>
                                <SelectItem value="psychiatric-review-5000">Psychiatric Review - KSh 5,000</SelectItem>
                                <SelectItem value="psychiatric-review-3000">Psychiatric Review - KSh 3,000</SelectItem>
                                <SelectItem value="medical-consultation-300">Medical Consultation - KSh 300</SelectItem>
                                <SelectItem value="medical-review-300">Medical Review - KSh 300</SelectItem>
                                <SelectItem value="counseling-3000">Counseling - KSh 3,000</SelectItem>
                                <SelectItem value="family-counseling-3000">Family Counseling - KSh 3,000</SelectItem>
                                <SelectItem value="injection-service-200">Injection Service - KSh 200</SelectItem>
                                <SelectItem value="laboratory-only">Laboratory Only</SelectItem>
                                <SelectItem value="pharmacy-only">Pharmacy Only</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  {/* Laboratory Upload Section - appears when Laboratory Only is selected */}
                  {form.watch("registerFor") === "laboratory-only" && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-4">
                      <h4 className="font-medium text-gray-800">Laboratory Request Upload</h4>
                      
                      {/* File Upload */}
                      <div>
                        <Label className="text-sm font-medium">Upload Lab Request Form: *</Label>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setLabRequestFile(file);
                              toast({
                                title: "File Uploaded",
                                description: `${file.name} has been uploaded successfully.`,
                              });
                            }
                          }}
                          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <p className="text-xs text-gray-600 mt-1">Accepted formats: PDF, JPG, PNG, DOC, DOCX</p>
                      </div>

                      {/* Lab Selection */}
                      <div>
                        <Label className="text-sm font-medium">Select Requested Lab Tests:</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto">
                          {[
                            "Full Blood Count - KSh 800",
                            "Liver Function Tests - KSh 1,200", 
                            "Kidney Function Tests - KSh 1,000",
                            "Thyroid Function Tests - KSh 1,500",
                            "Blood Sugar - KSh 300",
                            "Lipid Profile - KSh 1,000",
                            "Urine Analysis - KSh 400",
                            "Hepatitis B Surface Antigen - KSh 600",
                            "HIV Test - KSh 500",
                            "Pregnancy Test - KSh 200",
                            "Malaria Test - KSh 300",
                            "Syphilis Test - KSh 400"
                          ].map((lab) => (
                            <label key={lab} className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={requestedLabs.includes(lab)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setRequestedLabs([...requestedLabs, lab]);
                                  } else {
                                    setRequestedLabs(requestedLabs.filter(l => l !== lab));
                                  }
                                }}
                                className="rounded"
                              />
                              <span>{lab}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Summary */}
                      {requestedLabs.length > 0 && (
                        <div className="bg-white border rounded p-3">
                          <h5 className="font-medium text-sm mb-2">Selected Tests ({requestedLabs.length}):</h5>
                          <div className="text-xs space-y-1">
                            {requestedLabs.map((lab, index) => (
                              <div key={index} className="text-gray-700">• {lab}</div>
                            ))}
                          </div>
                          <div className="mt-2 pt-2 border-t text-sm font-medium">
                            Total Estimated Cost: KSh {requestedLabs.reduce((total, lab) => {
                              const price = parseInt(lab.match(/(\d+,?\d*)/)?.[1]?.replace(',', '') || '0');
                              return total + price;
                            }, 0).toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Pharmacy Upload Section - appears when Pharmacy Only is selected */}
                  {form.watch("registerFor") === "pharmacy-only" && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-4">
                      <h4 className="font-medium text-gray-800">Prescription Upload</h4>
                      
                      {/* File Upload */}
                      <div>
                        <Label className="text-sm font-medium">Upload Prescription Form: *</Label>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setPrescriptionFile(file);
                              toast({
                                title: "Prescription Uploaded",
                                description: `${file.name} has been uploaded successfully.`,
                              });
                            }
                          }}
                          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                        />
                        <p className="text-xs text-gray-600 mt-1">Accepted formats: PDF, JPG, PNG, DOC, DOCX</p>
                      </div>

                      {/* Medication Selection */}
                      <div>
                        <Label className="text-sm font-medium">Select Prescribed Medications:</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto">
                          {[
                            "Paracetamol 500mg - KSh 50",
                            "Amoxicillin 250mg - KSh 120",
                            "Ibuprofen 400mg - KSh 80",
                            "Omeprazole 20mg - KSh 150",
                            "Metformin 500mg - KSh 200",
                            "Amlodipine 5mg - KSh 180",
                            "Atorvastatin 20mg - KSh 300",
                            "Losartan 50mg - KSh 250",
                            "Cetirizine 10mg - KSh 60",
                            "Fluoxetine 20mg - KSh 400",
                            "Risperidone 2mg - KSh 500",
                            "Lorazepam 1mg - KSh 350",
                            "Haloperidol 5mg - KSh 280",
                            "Carbamazepine 200mg - KSh 320"
                          ].map((medication) => (
                            <label key={medication} className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={prescribedMedications.includes(medication)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setPrescribedMedications([...prescribedMedications, medication]);
                                  } else {
                                    setPrescribedMedications(prescribedMedications.filter(m => m !== medication));
                                  }
                                }}
                                className="rounded"
                              />
                              <span>{medication}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Summary */}
                      {prescribedMedications.length > 0 && (
                        <div className="bg-white border rounded p-3">
                          <h5 className="font-medium text-sm mb-2">Selected Medications ({prescribedMedications.length}):</h5>
                          <div className="text-xs space-y-1">
                            {prescribedMedications.map((medication, index) => (
                              <div key={index} className="text-gray-700">• {medication}</div>
                            ))}
                          </div>
                          <div className="mt-2 pt-2 border-t text-sm font-medium">
                            Total Estimated Cost: KSh {prescribedMedications.reduce((total, medication) => {
                              const price = parseInt(medication.match(/(\d+,?\d*)/)?.[1]?.replace(',', '') || '0');
                              return total + price;
                            }, 0).toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Patient Categorization: *</Label>
                      <FormField
                        control={form.control}
                        name="patientCategory"
                        render={({ field }) => (
                          <FormItem>
                            <Select onValueChange={field.onChange} defaultValue={field.value} required>
                              <FormControl>
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="general">General</SelectItem>
                                <SelectItem value="pediatric">Pediatric</SelectItem>
                                <SelectItem value="geriatric">Geriatric</SelectItem>
                                <SelectItem value="mental-health">Mental Health</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Payment Option: *</Label>
                    <FormField
                      control={form.control}
                      name="paymentOption"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex gap-4 mt-2">
                            <label className="flex items-center gap-2">
                              <input 
                                type="radio" 
                                value="cash" 
                                checked={field.value === "cash"}
                                onChange={() => field.onChange("cash")}
                                required 
                              />
                              <span className="text-sm">Cash/Credit Card/Mobile Money</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input 
                                type="radio" 
                                value="insurance" 
                                checked={field.value === "insurance"}
                                onChange={() => field.onChange("insurance")}
                                required 
                              />
                              <span className="text-sm">Insurance</span>
                            </label>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Other Details: *</Label>
                    <FormField
                      control={form.control}
                      name="referralSource"
                      render={({ field }) => (
                        <FormItem>
                          <div className="space-y-2 mt-2">
                            <label className="flex items-center gap-2">
                              <input 
                                type="radio" 
                                value="other-facility" 
                                checked={field.value === "other-facility"}
                                onChange={() => {
                                  field.onChange("other-facility");
                                  setReferralFacility("");
                                }}
                                required 
                              />
                              <span className="text-sm">Referral from other Health Facility</span>
                            </label>
                            {field.value === "other-facility" && (
                              <div className="ml-6 mt-2">
                                <Input
                                  placeholder="Enter name of referring health facility"
                                  value={referralFacility}
                                  onChange={(e) => setReferralFacility(e.target.value)}
                                  className="text-sm"
                                />
                              </div>
                            )}
                            <label className="flex items-center gap-2">
                              <input 
                                type="radio" 
                                value="community" 
                                checked={field.value === "community"}
                                onChange={() => {
                                  field.onChange("community");
                                  setCommunityUnit("");
                                }}
                                required 
                              />
                              <span className="text-sm">Referral from Community Unit</span>
                            </label>
                            {field.value === "community" && (
                              <div className="ml-6 mt-2">
                                <Input
                                  placeholder="Enter name of community unit"
                                  value={communityUnit}
                                  onChange={(e) => setCommunityUnit(e.target.value)}
                                  className="text-sm"
                                />
                              </div>
                            )}
                            <label className="flex items-center gap-2">
                              <input 
                                type="radio" 
                                value="not-referred" 
                                checked={field.value === "not-referred"}
                                onChange={() => field.onChange("not-referred")}
                                required 
                              />
                              <span className="text-sm">Not Referred</span>
                            </label>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Essential Action Buttons */}
                <div className="flex justify-center gap-4 pt-6 border-t">
                  <Button 
                    type="submit" 
                    disabled={createPatientMutation.isPending} 
                    className="bg-green-600 text-white hover:bg-green-700 px-6"
                  >
                    {editingPatient ? (updatePatientMutation.isPending ? "Updating..." : "Update Record") : (createPatientMutation.isPending ? "Registering..." : "Register Patient")}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="bg-blue-600 text-white hover:bg-blue-700 px-6" 
                    onClick={resetForm}
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Reset Form
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="bg-purple-600 text-white hover:bg-purple-700 px-6"
                    onClick={refreshData}
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Refresh
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>

        {/* Right Sidebar - Earlier Visit Dates */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h4 className="font-medium text-center bg-blue-100 p-2 rounded mb-4">Earlier Visit Dates</h4>
          <div className="max-h-96 overflow-y-auto">
            {selectedPatient ? (
              <div className="space-y-2">
                {getPatientVisitHistory(selectedPatient.id).map((visit: any, index: number) => (
                  <div key={index} className="p-3 border rounded-lg bg-gray-50 text-sm">
                    <div className="font-semibold text-blue-700 mb-1">{visit.date}</div>
                    <div className="text-gray-700 font-medium">{visit.type}</div>
                    {visit.doctor && <div className="text-gray-600 text-xs mt-1">{visit.doctor}</div>}
                    {visit.department && <div className="text-gray-500 text-xs">{visit.department}</div>}
                    {visit.status && (
                      <div className={`text-xs mt-1 px-2 py-1 rounded ${
                        visit.status === 'completed' ? 'bg-green-100 text-green-700' :
                        visit.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                        visit.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {visit.status.charAt(0).toUpperCase() + visit.status.slice(1)}
                      </div>
                    )}
                  </div>
                ))}
                {getPatientVisitHistory(selectedPatient.id).length === 0 && (
                  <div className="text-center text-gray-500 text-sm p-4">
                    <div className="text-gray-400 mb-2">📋</div>
                    <div>No previous visits recorded</div>
                    <div className="text-xs mt-1">This patient is new to the system</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 text-sm p-4">
                <div className="text-gray-400 mb-2">👤</div>
                <div>Select a patient to view visit history</div>
                <div className="text-xs mt-1">Click on a patient from the list</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Workflow Sequence - appears after successful registration */}
      {showWorkflow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4">
            <h3 className="text-xl font-bold text-center mb-6">Patient Workflow Management</h3>
            
            {/* Workflow Steps */}
            <div className="flex justify-between items-center mb-8">
              {[
                { step: 'cashier', label: 'Cashier', icon: CreditCard, description: 'Payment Processing' },
                { step: 'triage', label: 'Triage', icon: Stethoscope, description: 'Initial Assessment' },
                { step: 'outpatient', label: 'Outpatient', icon: UserCheck, description: 'Outpatient Care' },
                { step: 'inpatient', label: 'Inpatient', icon: Bed, description: 'Inpatient Care' }
              ].map((item, index) => {
                const Icon = item.icon;
                const isActive = currentWorkflowStep === item.step;
                const isCompleted = ['cashier', 'triage', 'outpatient', 'inpatient'].indexOf(currentWorkflowStep || '') > index;
                
                return (
                  <div key={item.step} className="flex flex-col items-center">
                    <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center mb-2 ${
                      isActive ? 'bg-blue-500 border-blue-500 text-white' :
                      isCompleted ? 'bg-green-500 border-green-500 text-white' :
                      'bg-gray-100 border-gray-300 text-gray-400'
                    }`}>
                      <Icon className="w-8 h-8" />
                    </div>
                    <div className={`text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-600'}`}>
                      {item.label}
                    </div>
                    <div className="text-xs text-gray-500 text-center">{item.description}</div>
                    {index < 3 && (
                      <div className={`w-12 h-0.5 mt-2 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-300'
                      }`} style={{ marginLeft: '50px', position: 'absolute' }} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Current Step Actions */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              {currentWorkflowStep === 'cashier' && (
                <div className="text-center">
                  <h4 className="font-semibold mb-2">Cashier - Payment Processing</h4>
                  <p className="text-sm text-gray-600 mb-4">Process consultation fees and generate receipt</p>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                    onClick={() => setCurrentWorkflowStep('triage')}
                  >
                    Complete Payment & Continue to Triage
                  </Button>
                </div>
              )}
              
              {currentWorkflowStep === 'triage' && (
                <div className="text-center">
                  <h4 className="font-semibold mb-2">Triage - Initial Assessment</h4>
                  <p className="text-sm text-gray-600 mb-4">Conduct initial patient assessment and vital signs</p>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                    onClick={() => setCurrentWorkflowStep('outpatient')}
                  >
                    Complete Triage & Continue to Outpatient
                  </Button>
                </div>
              )}
              
              {currentWorkflowStep === 'outpatient' && (
                <div className="text-center">
                  <h4 className="font-semibold mb-2">Outpatient Management</h4>
                  <p className="text-sm text-gray-600 mb-4">Manage outpatient consultations and treatments</p>
                  <div className="flex gap-3 justify-center">
                    <Button 
                      className="bg-green-600 hover:bg-green-700 text-white px-6"
                      onClick={() => {
                        setShowWorkflow(false);
                        setCurrentWorkflowStep(null);
                        toast({
                          title: "Workflow Complete",
                          description: "Patient processed through outpatient care successfully.",
                        });
                      }}
                    >
                      Complete Outpatient Care
                    </Button>
                    <Button 
                      variant="outline"
                      className="border-red-500 text-red-600 hover:bg-red-50 px-6"
                      onClick={() => setCurrentWorkflowStep('inpatient')}
                    >
                      Transfer to Inpatient
                    </Button>
                  </div>
                </div>
              )}
              
              {currentWorkflowStep === 'inpatient' && (
                <div className="text-center">
                  <h4 className="font-semibold mb-2">Inpatient Management</h4>
                  <p className="text-sm text-gray-600 mb-4">Manage inpatient admission and care</p>
                  <Button 
                    className="bg-green-600 hover:bg-green-700 text-white px-6"
                    onClick={() => {
                      setShowWorkflow(false);
                      setCurrentWorkflowStep(null);
                      toast({
                        title: "Workflow Complete",
                        description: "Patient admitted to inpatient care successfully.",
                      });
                    }}
                  >
                    Complete Inpatient Admission
                  </Button>
                </div>
              )}
            </div>

            {/* Close Button */}
            <div className="text-center">
              <Button 
                variant="outline"
                onClick={() => {
                  setShowWorkflow(false);
                  setCurrentWorkflowStep(null);
                }}
              >
                Close Workflow
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}