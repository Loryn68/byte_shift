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
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["/api/patients", searchQuery],
    queryFn: ({ queryKey }) => {
      const [url, search] = queryKey;
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      return fetch(`${url}${params}`, { credentials: "include" }).then(res => res.json());
    },
  });

  const getPatientAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleExportPatients = () => {
    const csvContent = [
      ["Patient ID", "Name", "Date of Birth", "Gender", "Phone", "Email", "Registration Date"].join(","),
      ...patients.map((patient: Patient) => [
        patient.patientId,
        `${patient.firstName} ${patient.lastName}`,
        patient.dateOfBirth,
        patient.gender,
        patient.phone,
        patient.email || "",
        new Date(patient.registrationDate).toLocaleDateString()
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `childhaven-patients-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Patient Registration</h2>
            <p className="text-gray-600">Manage patient information and registration records</p>
          </div>
          <Button 
            onClick={() => setShowModal(true)}
            className="bg-primary text-white hover:bg-blue-700 flex items-center space-x-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register New Patient</span>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search patients by name, ID, or phone number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExportPatients}
            className="flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Registered Patients ({patients.length})
          </h3>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Age/Gender</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Blood Type</TableHead>
              <TableHead>Registration Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </TableCell>
                </TableRow>
              ))
            ) : patients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="text-gray-500">
                    {searchQuery ? "No patients found matching your search" : "No patients registered yet"}
                  </div>
                  {!searchQuery && (
                    <Button 
                      onClick={() => setShowModal(true)}
                      className="mt-2" 
                      size="sm"
                    >
                      Register First Patient
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              patients.map((patient: Patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium text-primary">
                    {patient.patientId}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                      {patient.emergencyContactName && (
                        <p className="text-sm text-gray-500">
                          Emergency: {patient.emergencyContactName}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p>{getPatientAge(patient.dateOfBirth)} years</p>
                      <p className="text-sm text-gray-500 capitalize">{patient.gender}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p>{patient.phone}</p>
                      {patient.email && (
                        <p className="text-sm text-gray-500">{patient.email}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {patient.bloodType ? (
                      <Badge variant="outline">{patient.bloodType}</Badge>
                    ) : (
                      <span className="text-gray-400">Not specified</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(patient.registrationDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={patient.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                      {patient.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Patient Registration Modal */}
      <PatientRegistrationModal
        open={showModal}
        onOpenChange={setShowModal}
      />
    </div>
  );
}
