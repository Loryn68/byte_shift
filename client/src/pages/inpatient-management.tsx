import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Bed, Calendar, User, MapPin, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate, formatDateTime, calculateAge } from "@/lib/utils";
import type { Patient } from "@shared/schema";

export default function InpatientManagement() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: inpatients, isLoading } = useQuery<Patient[]>({
    queryKey: ["/api/patients/inpatients"],
  });

  const filteredInpatients = inpatients?.filter(patient =>
    patient.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.wardAssignment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.bedNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const getPatientStatusBadge = (patient: Patient) => {
    const daysSinceAdmission = patient.admissionDate 
      ? Math.floor((new Date().getTime() - new Date(patient.admissionDate).getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    
    if (daysSinceAdmission === 0) return <Badge variant="default">New Admission</Badge>;
    if (daysSinceAdmission <= 3) return <Badge variant="secondary">Recent</Badge>;
    if (daysSinceAdmission <= 7) return <Badge variant="outline">Short Stay</Badge>;
    return <Badge variant="destructive">Long Stay</Badge>;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading inpatients...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inpatient Management</h1>
          <p className="text-gray-600">Manage admitted patients and ward assignments</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search inpatients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="ward-view" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ward-view" className="flex items-center space-x-2">
            <Bed className="w-4 h-4" />
            <span>Ward View</span>
          </TabsTrigger>
          <TabsTrigger value="patient-list" className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>Patient List</span>
          </TabsTrigger>
          <TabsTrigger value="statistics" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Statistics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ward-view" className="mt-6">
          <div className="grid gap-6">
            {filteredInpatients.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Bed className="w-12 h-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Inpatients Found</h3>
                  <p className="text-gray-500 text-center">
                    {searchQuery 
                      ? "No inpatients match your search criteria" 
                      : "No patients are currently admitted as inpatients"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredInpatients.map((patient) => (
                  <Card key={patient.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{patient.firstName} {patient.lastName}</CardTitle>
                          <CardDescription className="font-medium text-blue-600">
                            {patient.patientId}
                          </CardDescription>
                        </div>
                        {getPatientStatusBadge(patient)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center space-x-2 text-sm">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>Age: {calculateAge(patient.dateOfBirth)} years • {patient.gender}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>Ward: {patient.wardAssignment || "Not assigned"}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm">
                        <Bed className="w-4 h-4 text-gray-400" />
                        <span>Bed: {patient.bedNumber || "Not assigned"}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>Admitted: {patient.admissionDate ? formatDate(patient.admissionDate.toString()) : "Unknown"}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>Duration: {patient.admissionDate 
                          ? Math.floor((new Date().getTime() - new Date(patient.admissionDate).getTime()) / (1000 * 60 * 60 * 24))
                          : 0} days</span>
                      </div>

                      <div className="pt-3 border-t">
                        <Button variant="outline" size="sm" className="w-full">
                          View Patient Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="patient-list" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Inpatient List</CardTitle>
              <CardDescription>
                Detailed view of all admitted patients
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredInpatients.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No inpatients to display</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Patient</th>
                        <th className="text-left py-3 px-4 font-medium">Ward/Bed</th>
                        <th className="text-left py-3 px-4 font-medium">Admission Date</th>
                        <th className="text-left py-3 px-4 font-medium">Duration</th>
                        <th className="text-left py-3 px-4 font-medium">Status</th>
                        <th className="text-left py-3 px-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInpatients.map((patient) => (
                        <tr key={patient.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium">{patient.firstName} {patient.lastName}</div>
                              <div className="text-sm text-gray-500">{patient.patientId}</div>
                              <div className="text-sm text-gray-500">Age: {calculateAge(patient.dateOfBirth)}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium">{patient.wardAssignment || "Not assigned"}</div>
                              <div className="text-sm text-gray-500">Bed: {patient.bedNumber || "Not assigned"}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm">
                              {patient.admissionDate ? formatDateTime(patient.admissionDate.toString()) : "Unknown"}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm">
                              {patient.admissionDate 
                                ? Math.floor((new Date().getTime() - new Date(patient.admissionDate).getTime()) / (1000 * 60 * 60 * 24))
                                : 0} days
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {getPatientStatusBadge(patient)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                              <Button variant="outline" size="sm">
                                Discharge
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <User className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{filteredInpatients.length}</p>
                    <p className="text-sm text-gray-600">Total Inpatients</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {filteredInpatients.filter(p => p.admissionDate && 
                        Math.floor((new Date().getTime() - new Date(p.admissionDate).getTime()) / (1000 * 60 * 60 * 24)) === 0
                      ).length}
                    </p>
                    <p className="text-sm text-gray-600">New Admissions Today</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Clock className="w-8 h-8 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {filteredInpatients.length > 0 
                        ? Math.round(filteredInpatients.reduce((acc, p) => {
                            if (!p.admissionDate) return acc;
                            return acc + Math.floor((new Date().getTime() - new Date(p.admissionDate).getTime()) / (1000 * 60 * 60 * 24));
                          }, 0) / filteredInpatients.length)
                        : 0}
                    </p>
                    <p className="text-sm text-gray-600">Avg Length of Stay</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Bed className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {new Set(filteredInpatients.map(p => p.wardAssignment).filter(Boolean)).size}
                    </p>
                    <p className="text-sm text-gray-600">Wards in Use</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Ward Occupancy</CardTitle>
              <CardDescription>Current patient distribution by ward</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredInpatients.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No ward data available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(
                    filteredInpatients.reduce((acc, patient) => {
                      const ward = patient.wardAssignment || "Unassigned";
                      acc[ward] = (acc[ward] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([ward, count]) => (
                    <div key={ward} className="flex items-center justify-between py-2">
                      <span className="font-medium">{ward}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{count} patients</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}