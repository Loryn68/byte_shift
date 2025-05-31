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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Settings, 
  Building, 
  Users, 
  Pill, 
  Bed, 
  DollarSign, 
  Plus, 
  Edit, 
  Trash2,
  Shield,
  FlaskRound,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function SystemConfiguration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("hospital");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [editingItem, setEditingItem] = useState<any>(null);

  const [hospitalInfo, setHospitalInfo] = useState({
    name: "Child Mental Haven",
    tagline: "Where Young Minds Evolve",
    address: "Muchai Drive Off Ngong Road",
    poBox: "P.O Box 41622-00100",
    city: "Nairobi",
    county: "Nairobi",
    country: "Kenya",
    phone: "254746170159",
    email: "info@childmentalhaven.org",
    website: "www.childmentalhaven.org",
    registrationNumber: "HF-001-2023",
    licenseNumber: "MED-2023-001",
    establishedYear: "2023",
    bedCapacity: "50",
    accreditation: "Ministry of Health - Kenya"
  });

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    price: "",
    category: "",
    isActive: true
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

  const { data: insuranceProviders = [] } = useQuery({
    queryKey: ["/api/insurance-providers"],
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

  const createItemMutation = useMutation({
    mutationFn: async ({ type, data }: { type: string; data: any }) => {
      return await apiRequest("POST", `/api/${type}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Item Created",
        description: "New item has been added successfully.",
      });
      setShowModal(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: [`/api/${modalType}`] });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ type, id, data }: { type: string; id: string; data: any }) => {
      return await apiRequest("PUT", `/api/${type}/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Item Updated",
        description: "Item has been updated successfully.",
      });
      setShowModal(false);
      setEditingItem(null);
      resetForm();
      queryClient.invalidateQueries({ queryKey: [`/api/${modalType}`] });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async ({ type, id }: { type: string; id: string }) => {
      return await apiRequest("DELETE", `/api/${type}/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Item Deleted",
        description: "Item has been removed successfully.",
        variant: "destructive"
      });
      queryClient.invalidateQueries({ queryKey: [`/api/${modalType}`] });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
      price: "",
      category: "",
      isActive: true
    });
  };

  const openModal = (type: string, item?: any) => {
    setModalType(type);
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name || "",
        code: item.code || "",
        description: item.description || "",
        price: item.price || "",
        category: item.category || "",
        isActive: item.isActive !== false
      });
    } else {
      setEditingItem(null);
      resetForm();
    }
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!formData.name) {
      toast({
        title: "Validation Error",
        description: "Name is required.",
        variant: "destructive"
      });
      return;
    }

    if (editingItem) {
      updateItemMutation.mutate({ 
        type: modalType, 
        id: editingItem.id, 
        data: formData 
      });
    } else {
      createItemMutation.mutate({ 
        type: modalType, 
        data: formData 
      });
    }
  };

  const handleDelete = (type: string, id: string) => {
    if (confirm("Are you sure you want to delete this item? This action cannot be undone.")) {
      deleteItemMutation.mutate({ type, id });
    }
  };

  const getModalTitle = () => {
    const action = editingItem ? "Edit" : "Add";
    const itemType = modalType.charAt(0).toUpperCase() + modalType.slice(1, -1);
    return `${action} ${itemType}`;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Settings className="h-8 w-8 text-blue-600" />
          System Configuration
        </h1>
        <p className="text-gray-600 mt-2">Configure hospital information and system master data</p>
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
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Hospital Name</Label>
                  <Input
                    value={hospitalInfo.name}
                    onChange={(e) => setHospitalInfo(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Tagline</Label>
                  <Input
                    value={hospitalInfo.tagline}
                    onChange={(e) => setHospitalInfo(prev => ({ ...prev, tagline: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label>Physical Address</Label>
                <Textarea
                  value={hospitalInfo.address}
                  onChange={(e) => setHospitalInfo(prev => ({ ...prev, address: e.target.value }))}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>P.O Box</Label>
                  <Input
                    value={hospitalInfo.poBox}
                    onChange={(e) => setHospitalInfo(prev => ({ ...prev, poBox: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>City</Label>
                  <Input
                    value={hospitalInfo.city}
                    onChange={(e) => setHospitalInfo(prev => ({ ...prev, city: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>County/State</Label>
                  <Input
                    value={hospitalInfo.county}
                    onChange={(e) => setHospitalInfo(prev => ({ ...prev, county: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
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
                <div>
                  <Label>Established Year</Label>
                  <Input
                    value={hospitalInfo.establishedYear}
                    onChange={(e) => setHospitalInfo(prev => ({ ...prev, establishedYear: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Registration Number</Label>
                  <Input
                    value={hospitalInfo.registrationNumber}
                    onChange={(e) => setHospitalInfo(prev => ({ ...prev, registrationNumber: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>License Number</Label>
                  <Input
                    value={hospitalInfo.licenseNumber}
                    onChange={(e) => setHospitalInfo(prev => ({ ...prev, licenseNumber: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Bed Capacity</Label>
                  <Input
                    value={hospitalInfo.bedCapacity}
                    onChange={(e) => setHospitalInfo(prev => ({ ...prev, bedCapacity: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label>Accreditation</Label>
                <Input
                  value={hospitalInfo.accreditation}
                  onChange={(e) => setHospitalInfo(prev => ({ ...prev, accreditation: e.target.value }))}
                />
              </div>

              <Button 
                onClick={() => updateHospitalMutation.mutate(hospitalInfo)}
                disabled={updateHospitalMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
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
            <Button onClick={() => openModal("departments")}>
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
                    <TableHead>Department Code</TableHead>
                    <TableHead>Department Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Head of Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No departments configured yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    departments.map((dept: any) => (
                      <TableRow key={dept.id}>
                        <TableCell className="font-medium">{dept.code}</TableCell>
                        <TableCell>{dept.name}</TableCell>
                        <TableCell>{dept.description}</TableCell>
                        <TableCell>{dept.headOfDepartment || "Not assigned"}</TableCell>
                        <TableCell>
                          <Switch checked={dept.isActive} />
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => openModal("departments", dept)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete("departments", dept.id)}>
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
            <Button onClick={() => openModal("services")}>
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
                    <TableHead>Category</TableHead>
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
                        <TableCell>{service.category}</TableCell>
                        <TableCell>{service.price ? service.price.toLocaleString() : "N/A"}</TableCell>
                        <TableCell>
                          <Switch checked={service.isActive} />
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => openModal("services", service)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete("services", service.id)}>
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
            <Button onClick={() => openModal("medications")}>
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
                    <TableHead>Category</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {medications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No medications configured yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    medications.map((med: any) => (
                      <TableRow key={med.id}>
                        <TableCell className="font-medium">{med.code}</TableCell>
                        <TableCell>{med.name}</TableCell>
                        <TableCell>{med.category}</TableCell>
                        <TableCell>{med.price ? med.price.toLocaleString() : "N/A"}</TableCell>
                        <TableCell>
                          <Switch checked={med.isActive} />
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => openModal("medications", med)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete("medications", med.id)}>
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
            <Button onClick={() => openModal("rooms")}>
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
                    <TableHead>Room Code</TableHead>
                    <TableHead>Room Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Daily Rate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rooms.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No rooms configured yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    rooms.map((room: any) => (
                      <TableRow key={room.id}>
                        <TableCell className="font-medium">{room.code}</TableCell>
                        <TableCell>{room.name}</TableCell>
                        <TableCell>{room.category}</TableCell>
                        <TableCell>{room.price ? room.price.toLocaleString() : "N/A"}</TableCell>
                        <TableCell>
                          <Switch checked={room.isActive} />
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => openModal("rooms", room)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete("rooms", room.id)}>
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
            <Button onClick={() => openModal("insurance-providers")}>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Provider Code</TableHead>
                    <TableHead>Provider Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {insuranceProviders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        No insurance providers configured yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    insuranceProviders.map((provider: any) => (
                      <TableRow key={provider.id}>
                        <TableCell className="font-medium">{provider.code}</TableCell>
                        <TableCell>{provider.name}</TableCell>
                        <TableCell>{provider.category}</TableCell>
                        <TableCell>
                          <Switch checked={provider.isActive} />
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => openModal("insurance-providers", provider)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete("insurance-providers", provider.id)}>
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
      </Tabs>

      {/* Universal Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{getModalTitle()}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Code</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                placeholder="Enter code"
              />
            </div>
            <div>
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter name"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter description"
                rows={2}
              />
            </div>
            <div>
              <Label>Category</Label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="Enter category"
              />
            </div>
            {(modalType === "services" || modalType === "medications" || modalType === "rooms") && (
              <div>
                <Label>Price (KES)</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="Enter price"
                />
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label>Active</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={createItemMutation.isPending || updateItemMutation.isPending}>
                {editingItem ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}