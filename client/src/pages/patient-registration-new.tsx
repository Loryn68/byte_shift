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
import { Search, RotateCcw, RefreshCw, Edit } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { workflowManager } from "@/lib/workflow-system";
import logoPath from "@assets/image_1748113978202.png";
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
  occupation: z.string().min(1, "Occupation is required"),
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
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
              className="w-full mb-3 bg-yellow-500 hover:bg-yellow-600 text-black font-medium text-sm px-2 py-2 h-auto"
            >
              Load List of Registered Patients
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
                      <Label className="text-sm font-medium">Occupation: *</Label>
                      <FormField
                        control={form.control}
                        name="occupation"
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
                                <SelectItem value="outpatient">Outpatient</SelectItem>
                                <SelectItem value="inpatient">Inpatient</SelectItem>
                                <SelectItem value="emergency">Emergency</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
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
                                onChange={() => field.onChange("other-facility")}
                                required 
                              />
                              <span className="text-sm">Referral from other Health Facility</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input 
                                type="radio" 
                                value="community" 
                                checked={field.value === "community"}
                                onChange={() => field.onChange("community")}
                                required 
                              />
                              <span className="text-sm">Referral from Community Unit</span>
                            </label>
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
          <div className="text-center text-gray-500 text-sm">
            No previous visits
          </div>
          
          {/* Cost Display */}
          <div className="mt-8 text-center">
            <div className="text-3xl font-bold text-orange-600">Kshs: 20</div>
            <div className="text-sm text-gray-600 mt-2">Registration Fee</div>
          </div>
        </div>
      </div>
    </div>
  );
}