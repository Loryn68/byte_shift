import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, UserCheck, UserX, Key, Activity, Shield, Settings, Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

type User = {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function AdministratorDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("users");
  const [showPassword, setShowPassword] = useState(false);

  // Fetch users
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["/api/users"],
  });

  // User form state
  const [userForm, setUserForm] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    role: "staff",
    isActive: true
  });

  // User mutations
  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      return await apiRequest("POST", "/api/users", userData);
    },
    onSuccess: () => {
      toast({
        title: "User Created",
        description: "New user has been created successfully.",
      });
      setShowUserModal(false);
      resetUserForm();
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, userData }: { id: number; userData: any }) => {
      return await apiRequest("PUT", `/api/users/${id}`, userData);
    },
    onSuccess: () => {
      toast({
        title: "User Updated",
        description: "User information has been updated successfully.",
      });
      setShowUserModal(false);
      setEditingUser(null);
      resetUserForm();
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/users/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "User Deleted",
        description: "User has been removed from the system.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
  });

  const toggleUserStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
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

  const resetUserForm = () => {
    setUserForm({
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      role: "staff",
      isActive: true
    });
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setUserForm({
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      password: "",
      role: user.role,
      isActive: user.isActive
    });
    setShowUserModal(true);
  };

  const handleUserSubmit = () => {
    if (!userForm.username || !userForm.email || !userForm.firstName || !userForm.lastName) {
      toast({
        title: "Missing Information",
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

  const handleDeleteUser = (user: User) => {
    if (confirm(`Are you sure you want to delete user "${user.username}"? This action cannot be undone.`)) {
      deleteUserMutation.mutate(user.id);
    }
  };

  const handleToggleUserStatus = (user: User) => {
    const action = user.isActive ? "deactivate" : "activate";
    if (confirm(`Are you sure you want to ${action} user "${user.username}"?`)) {
      toggleUserStatusMutation.mutate({ id: user.id, isActive: !user.isActive });
    }
  };

  const getRoleBadge = (role: string) => {
    const roleColors = {
      admin: "bg-red-100 text-red-800",
      doctor: "bg-blue-100 text-blue-800",
      nurse: "bg-green-100 text-green-800",
      pharmacist: "bg-purple-100 text-purple-800",
      cashier: "bg-yellow-100 text-yellow-800",
      receptionist: "bg-gray-100 text-gray-800",
      therapist: "bg-indigo-100 text-indigo-800",
      staff: "bg-orange-100 text-orange-800"
    };
    
    return (
      <Badge className={roleColors[role as keyof typeof roleColors] || "bg-gray-100 text-gray-800"}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="h-8 w-8 text-red-600" />
            Administrator Dashboard
          </h1>
          <p className="text-gray-600">Manage system users, settings, and administrative functions</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            System Settings
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Audit Logs
          </TabsTrigger>
        </TabsList>

        {/* User Management Tab */}
        <TabsContent value="users" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">User Management</h2>
              <p className="text-gray-600">Create, edit, and manage system users and their permissions</p>
            </div>
            <Button onClick={() => {
              setEditingUser(null);
              resetUserForm();
              setShowUserModal(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add New User
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Users</CardTitle>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="text-center py-8">Loading users...</div>
              ) : users.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No users found. Create your first user to get started.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
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
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>
                          <Badge variant={user.isActive ? "default" : "secondary"}>
                            {user.isActive ? (
                              <>
                                <UserCheck className="w-3 h-3 mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <UserX className="w-3 h-3 mr-1" />
                                Inactive
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditModal(user)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant={user.isActive ? "secondary" : "default"}
                              onClick={() => handleToggleUserStatus(user)}
                            >
                              {user.isActive ? <UserX className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteUser(user)}
                            >
                              <Trash2 className="h-3 w-3" />
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

        {/* System Settings Tab */}
        <TabsContent value="system" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">System Settings</h2>
            <p className="text-gray-600">Configure system-wide settings and preferences</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Hospital Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Hospital Name</Label>
                  <Input defaultValue="Child Mental Haven" />
                </div>
                <div>
                  <Label>Address</Label>
                  <Input defaultValue="Muchai Drive Off Ngong Road" />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input defaultValue="254746170159" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input defaultValue="info@childmentalhaven.org" />
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Patient ID Format</Label>
                  <Input defaultValue="CMH-{YEAR}{MONTH}{INITIALS}{COUNTER}" disabled />
                  <p className="text-sm text-gray-500 mt-1">Current format: CMH-202501LKM001</p>
                </div>
                <div>
                  <Label>Session Timeout (minutes)</Label>
                  <Input type="number" defaultValue="30" />
                </div>
                <div>
                  <Label>Backup Frequency</Label>
                  <Select defaultValue="daily">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button>Update Settings</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value="audit" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">Audit Logs</h2>
            <p className="text-gray-600">Monitor system activity and user actions</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">User login</p>
                    <p className="text-sm text-gray-600">admin logged into the system</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Today, 7:00 AM</p>
                    <Badge variant="default">Authentication</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Patient registered</p>
                    <p className="text-sm text-gray-600">New patient added to the system</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Yesterday, 4:30 PM</p>
                    <Badge variant="secondary">Registration</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Prescription approved</p>
                    <p className="text-sm text-gray-600">Pharmacist approved medication</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Yesterday, 2:15 PM</p>
                    <Badge variant="outline">Pharmacy</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Modal */}
      <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Edit User" : "Create New User"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name *</Label>
                <Input
                  value={userForm.firstName}
                  onChange={(e) => setUserForm({...userForm, firstName: e.target.value})}
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <Label>Last Name *</Label>
                <Input
                  value={userForm.lastName}
                  onChange={(e) => setUserForm({...userForm, lastName: e.target.value})}
                  placeholder="Enter last name"
                />
              </div>
            </div>
            <div>
              <Label>Username *</Label>
              <Input
                value={userForm.username}
                onChange={(e) => setUserForm({...userForm, username: e.target.value})}
                placeholder="Enter username"
              />
            </div>
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label>Role</Label>
              <Select value={userForm.role} onValueChange={(value) => setUserForm({...userForm, role: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="nurse">Nurse</SelectItem>
                  <SelectItem value="pharmacist">Pharmacist</SelectItem>
                  <SelectItem value="cashier">Cashier</SelectItem>
                  <SelectItem value="receptionist">Receptionist</SelectItem>
                  <SelectItem value="therapist">Therapist</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Password {!editingUser && "*"}</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={userForm.password}
                  onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                  placeholder={editingUser ? "Leave blank to keep current password" : "Enter password"}
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
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowUserModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleUserSubmit} disabled={createUserMutation.isPending || updateUserMutation.isPending}>
                {createUserMutation.isPending || updateUserMutation.isPending ? "Saving..." : (editingUser ? "Update User" : "Create User")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}