import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Building, Users, Pill, Bed, DollarSign, Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function SystemConfiguration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("hospital");

  const [hospitalInfo, setHospitalInfo] = useState({
    name: "Child Mental Haven",
    address: "Muchai Drive Off Ngong Road",
    city: "Nairobi",
    country: "Kenya",
    phone: "254746170159",
    email: "info@childmentalhaven.org",
    website: "www.childmentalhaven.org",
    registrationNumber: "HF-001-2023",
    licenseNumber: "MED-2023-001"
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["/api/departments"],
  });

  const { data: services = [] } = useQuery({
    queryKey: ["/api/services"],
  });

  const { data: medications = [] } = useQuery({
    queryKey: ["/api/medications"],
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ["/api/rooms"],
  });

  const updateHospitalMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PUT", "/api/hospital-info", data);
    },
    onSuccess: () => {
      toast({
        title: "Hospital Information Updated",
        description: "Hospital details have been saved successfully.",
      });
    },
  });

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Settings className="h-8 w-8 text-blue-600" />
          System Configuration
        </h1>
        <p className="text-gray-600 mt-2">Configure hospital information and system masters</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="hospital">Hospital Info</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="medications">Drug Master</TabsTrigger>
          <TabsTrigger value="rooms">Rooms/Wards</TabsTrigger>
          <TabsTrigger value="insurance">Insurance</TabsTrigger>
        </TabsList>

        <TabsContent value="hospital" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Hospital Information Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Hospital Name</Label>
                  <Input
                    value={hospitalInfo.name}
                    onChange={(e) => setHospitalInfo(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Registration Number</Label>
                  <Input
                    value={hospitalInfo.registrationNumber}
                    onChange={(e) => setHospitalInfo(prev => ({ ...prev, registrationNumber: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label>Address</Label>
                <Textarea
                  value={hospitalInfo.address}
                  onChange={(e) => setHospitalInfo(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>City</Label>
                  <Input
                    value={hospitalInfo.city}
                    onChange={(e) => setHospitalInfo(prev => ({ ...prev, city: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Country</Label>
                  <Input
                    value={hospitalInfo.country}
                    onChange={(e) => setHospitalInfo(prev => ({ ...prev, country: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={hospitalInfo.phone}
                    onChange={(e) => setHospitalInfo(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={hospitalInfo.email}
                    onChange={(e) => setHospitalInfo(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Website</Label>
                  <Input
                    value={hospitalInfo.website}
                    onChange={(e) => setHospitalInfo(prev => ({ ...prev, website: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label>License Number</Label>
                <Input
                  value={hospitalInfo.licenseNumber}
                  onChange={(e) => setHospitalInfo(prev => ({ ...prev, licenseNumber: e.target.value }))}
                />
              </div>

              <Button 
                onClick={() => updateHospitalMutation.mutate(hospitalInfo)}
                disabled={updateHospitalMutation.isPending}
              >
                Save Hospital Information
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Department Management</h2>
              <p className="text-gray-600">Manage hospital departments and their configurations</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Department
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Hospital Departments</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department Name</TableHead>
                    <TableHead>Head of Department</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        No departments configured yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    departments.map((dept: any) => (
                      <TableRow key={dept.id}>
                        <TableCell className="font-medium">{dept.name}</TableCell>
                        <TableCell>{dept.headOfDepartment || "Not assigned"}</TableCell>
                        <TableCell>{dept.location}</TableCell>
                        <TableCell>
                          <Switch checked={dept.isActive} />
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="destructive">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Service Master</h2>
              <p className="text-gray-600">List of all services offered with codes and prices</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Hospital Services</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service Code</TableHead>
                    <TableHead>Service Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Price (KES)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No services configured yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    services.map((service: any) => (
                      <TableRow key={service.id}>
                        <TableCell className="font-medium">{service.code}</TableCell>
                        <TableCell>{service.name}</TableCell>
                        <TableCell>{service.department}</TableCell>
                        <TableCell>{service.price.toLocaleString()}</TableCell>
                        <TableCell>
                          <Switch checked={service.isActive} />
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="destructive">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medications" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Drug Master</h2>
              <p className="text-gray-600">List of all medications with codes, prices, and stock levels</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Medication
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5" />
                Medication Database
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Drug Code</TableHead>
                    <TableHead>Medication Name</TableHead>
                    <TableHead>Strength</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Stock Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {medications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No medications configured yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    medications.map((med: any) => (
                      <TableRow key={med.id}>
                        <TableCell className="font-medium">{med.code}</TableCell>
                        <TableCell>{med.name}</TableCell>
                        <TableCell>{med.strength}</TableCell>
                        <TableCell>{med.unitPrice.toLocaleString()}</TableCell>
                        <TableCell>{med.stockLevel}</TableCell>
                        <TableCell>
                          <Switch checked={med.isActive} />
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="destructive">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rooms" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Ward/Room Management</h2>
              <p className="text-gray-600">Manage room types, availability, and pricing</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Room
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bed className="h-5 w-5" />
                Room Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room Number</TableHead>
                    <TableHead>Room Type</TableHead>
                    <TableHead>Ward</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Daily Rate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rooms.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No rooms configured yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    rooms.map((room: any) => (
                      <TableRow key={room.id}>
                        <TableCell className="font-medium">{room.number}</TableCell>
                        <TableCell>{room.type}</TableCell>
                        <TableCell>{room.ward}</TableCell>
                        <TableCell>{room.capacity}</TableCell>
                        <TableCell>{room.dailyRate.toLocaleString()}</TableCell>
                        <TableCell>
                          <Switch checked={room.isAvailable} />
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="destructive">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insurance" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Insurance Company Management</h2>
              <p className="text-gray-600">Manage insurance providers and their configurations</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Insurance Provider
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Insurance Providers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Insurance provider configuration will be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}