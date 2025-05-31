import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Users, UserPlus, Shield, Activity, Key, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const ROLES = [
  { value: "admin", label: "Administrator", permissions: ["full_access"] },
  { value: "doctor", label: "Doctor", permissions: ["patient_manage", "consultation", "prescription"] },
  { value: "nurse", label: "Nurse", permissions: ["patient_view", "vitals", "care_plans"] },
  { value: "pharmacist", label: "Pharmacist", permissions: ["pharmacy_manage", "prescription_dispense"] },
  { value: "lab_tech", label: "Lab Technician", permissions: ["lab_tests", "results"] },
  { value: "receptionist", label: "Receptionist", permissions: ["patient_register", "appointments"] },
  { value: "accountant", label: "Accountant", permissions: ["billing", "financial_reports"] }
];

const DEPARTMENTS = [
  "General Medicine", "Pediatrics", "Surgery", "Emergency", "Laboratory", 
  "Pharmacy", "Administration", "Finance", "IT Support"
];

export default function UserManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("users");
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [userForm, setUserForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    role: "",
    department: "",
    employeeId: "",
    phoneNumber: "",
    qualifications: "",
    isActive: true
  });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["/api/users"],
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      return await apiRequest("POST", "/api/users", userData);
    },
    onSuccess: () => {
      toast({
        title: "User Created",
        description: "New user has been registered successfully.",
      });
      setShowUserModal(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, userData }: { id: string; userData: any }) => {
      return await apiRequest("PUT", `/api/users/${id}`, userData);
    },
    onSuccess: () => {
      toast({
        title: "User Updated",
        description: "User information has been updated successfully.",
      });
      setShowUserModal(false);
      setEditingUser(null);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
  });

  const deactivateUserMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return await apiRequest("PATCH", `/api/users/${id}/status`, { isActive });
    },
    onSuccess: () => {
      toast({
        title: "User Status Updated",
        description: "User access status has been changed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
  });

  const resetForm = () => {
    setUserForm({
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      role: "",
      department: "",
      employeeId: "",
      phoneNumber: "",
      qualifications: "",
      isActive: true
    });
  };

  const handleSubmit = () => {
    if (!userForm.firstName || !userForm.lastName || !userForm.username || !userForm.email || !userForm.role) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (!editingUser && !userForm.password) {
      toast({
        title: "Password Required",
        description: "Password is required for new users.",
        variant: "destructive"
      });
      return;
    }

    if (editingUser) {
      updateUserMutation.mutate({ id: editingUser.id, userData: userForm });
    } else {
      createUserMutation.mutate(userForm);
    }
  };

  const openEditModal = (user: any) => {
    setEditingUser(user);
    setUserForm({
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      password: "",
      role: user.role,
      department: user.department || "",
      employeeId: user.employeeId || "",
      phoneNumber: user.phoneNumber || "",
      qualifications: user.qualifications || "",
      isActive: user.isActive
    });
    setShowUserModal(true);
  };

  const getRoleBadge = (role: string) => {
    const roleObj = ROLES.find(r => r.value === role);
    const colors = {
      admin: "bg-red-100 text-red-800",
      doctor: "bg-blue-100 text-blue-800",
      nurse: "bg-green-100 text-green-800",
      pharmacist: "bg-purple-100 text-purple-800",
      lab_tech: "bg-yellow-100 text-yellow-800",
      receptionist: "bg-gray-100 text-gray-800",
      accountant: "bg-orange-100 text-orange-800"
    };
    
    return (
      <Badge className={colors[role as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {roleObj?.label || role}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Users className="h-8 w-8 text-blue-600" />
          Advanced User & Role Management
        </h1>
        <p className="text-gray-600 mt-2">Comprehensive user registration and role-based access control following hospital workflow standards</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">User Registry</TabsTrigger>
          <TabsTrigger value="roles">Role Management</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="audit">Audit Trails</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Hospital Staff Directory</h2>
              <p className="text-gray-600">Manage hospital staff accounts with multi-factor authentication and security policies</p>
            </div>
            <Button onClick={() => {
              setEditingUser(null);
              resetForm();
              setShowUserModal(true);
            }}>
              <UserPlus className="h-4 w-4 mr-2" />
              Register New Staff
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Registered Users</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading users...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee Details</TableHead>
                      <TableHead>Contact Information</TableHead>
                      <TableHead>Role & Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.firstName} {user.lastName}</div>
                            <div className="text-sm text-gray-500">@{user.username}</div>
                            {user.employeeId && (
                              <div className="text-xs text-gray-400">ID: {user.employeeId}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm">{user.email}</div>
                            {user.phoneNumber && (
                              <div className="text-sm text-gray-500">{user.phoneNumber}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {getRoleBadge(user.role)}
                            {user.department && (
                              <div className="text-xs text-gray-500">{user.department}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.isActive ? "default" : "secondary"}>
                            {user.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => openEditModal(user)}>
                              Edit
                            </Button>
                            <Button 
                              size="sm" 
                              variant={user.isActive ? "secondary" : "default"}
                              onClick={() => deactivateUserMutation.mutate({ 
                                id: user.id, 
                                isActive: !user.isActive 
                              })}
                            >
                              {user.isActive ? "Deactivate" : "Activate"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Role Definitions & Security Policy Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ROLES.map((role) => (
                  <Card key={role.value} className="p-4">
                    <div className="space-y-2">
                      <div className="font-semibold">{role.label}</div>
                      <div className="text-sm text-gray-600">
                        Permissions: {role.permissions.join(", ")}
                      </div>
                      <div className="text-xs text-gray-500">
                        Users: {users.filter((u: any) => u.role === role.value).length}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Advanced Permission Matrix & Access Control
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Role-based access control matrix with multi-factor authentication
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Comprehensive Audit Trail & Security Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Complete audit trail logging for all user activities and security events
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Edit User" : "Register New Staff Member"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name *</Label>
                <Input
                  value={userForm.firstName}
                  onChange={(e) => setUserForm(prev => ({ ...prev, firstName: e.target.value }))}
                />
              </div>
              <div>
                <Label>Last Name *</Label>
                <Input
                  value={userForm.lastName}
                  onChange={(e) => setUserForm(prev => ({ ...prev, lastName: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Username *</Label>
                <Input
                  value={userForm.username}
                  onChange={(e) => setUserForm(prev => ({ ...prev, username: e.target.value }))}
                />
              </div>
              <div>
                <Label>Employee ID</Label>
                <Input
                  value={userForm.employeeId}
                  onChange={(e) => setUserForm(prev => ({ ...prev, employeeId: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label>Email Address *</Label>
              <Input
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div>
              <Label>Phone Number</Label>
              <Input
                value={userForm.phoneNumber}
                onChange={(e) => setUserForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>System Role *</Label>
                <Select value={userForm.role} onValueChange={(value) => setUserForm(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Department</Label>
                <Select value={userForm.department} onValueChange={(value) => setUserForm(prev => ({ ...prev, department: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Qualifications & Credentials</Label>
              <Input
                value={userForm.qualifications}
                onChange={(e) => setUserForm(prev => ({ ...prev, qualifications: e.target.value }))}
                placeholder="Degrees, certifications, licenses"
              />
            </div>

            <div>
              <Label>Password {!editingUser && "*"}</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={userForm.password}
                  onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder={editingUser ? "Leave blank to keep current password" : "Enter secure password"}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={userForm.isActive}
                onCheckedChange={(checked) => setUserForm(prev => ({ ...prev, isActive: checked }))}
              />
              <Label>Account Active</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowUserModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={createUserMutation.isPending || updateUserMutation.isPending}>
                {editingUser ? "Update User" : "Register User"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}