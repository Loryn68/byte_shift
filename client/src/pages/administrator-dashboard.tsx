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
import { Users, UserCheck, UserX, Key, Activity, Shield, Settings, Plus, Edit, Trash2 } from "lucide-react";
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

  // User mutation
  const userMutation = useMutation({
    mutationFn: async (userData: any) => {
      if (editingUser) {
        return await apiRequest("PUT", `/api/users/${editingUser.id}`, userData);
      } else {
        return await apiRequest("POST", "/api/users", userData);
      }
    },
    onSuccess: () => {
      toast({
        title: editingUser ? "User Updated" : "User Created",
        description: `User ${editingUser ? "updated" : "created"} successfully.`,
      });
      setShowUserModal(false);
      setEditingUser(null);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: `Failed to ${editingUser ? "update" : "create"} user.`,
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return await apiRequest("DELETE", `/api/users/${userId}`);
    },
    onSuccess: () => {
      toast({
        title: "User Deleted",
        description: "User has been removed from the system.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete user.",
        variant: "destructive",
      });
    },
  });

  // Toggle user status mutation
  const toggleUserMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: number; isActive: boolean }) => {
      return await apiRequest("PUT", `/api/users/${userId}`, { isActive });
    },
    onSuccess: () => {
      toast({
        title: "User Status Updated",
        description: "User status has been changed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update user status.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
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

  const handleEditUser = (user: User) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    userMutation.mutate(userForm);
  };

  const handleDeleteUser = (userId: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      deleteUserMutation.mutate(userId);
    }
  };

  const handleToggleUser = (userId: number, currentStatus: boolean) => {
    toggleUserMutation.mutate({ userId, isActive: !currentStatus });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            Administrator Dashboard
          </h1>
          <p className="text-gray-600">Complete system administration and user management</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setEditingUser(null);
            setShowUserModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New User
        </Button>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{users.length}</div>
            <p className="text-xs text-blue-600">Registered in system</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {users.filter((user: User) => user.isActive).length}
            </div>
            <p className="text-xs text-green-600">Currently active</p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Inactive Users</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">
              {users.filter((user: User) => !user.isActive).length}
            </div>
            <p className="text-xs text-red-600">Deactivated accounts</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Administrators</CardTitle>
            <Settings className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {users.filter((user: User) => user.role === 'admin').length}
            </div>
            <p className="text-xs text-purple-600">Admin privileges</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">Registered Users</TabsTrigger>
          <TabsTrigger value="roles">User Rights</TabsTrigger>
          <TabsTrigger value="security">Password Management</TabsTrigger>
          <TabsTrigger value="activity">User Activity</TabsTrigger>
        </TabsList>

        {/* Users Management Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {users.map((user: User) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            user.isActive ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {user.isActive ? (
                              <UserCheck className="h-6 w-6 text-green-600" />
                            ) : (
                              <UserX className="h-6 w-6 text-red-600" />
                            )}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            @{user.username} | {user.email}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                              {user.role}
                            </Badge>
                            <Badge variant={user.isActive ? 'default' : 'destructive'}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant={user.isActive ? "destructive" : "default"}
                          size="sm"
                          onClick={() => handleToggleUser(user.id, user.isActive)}
                        >
                          {user.isActive ? (
                            <>
                              <UserX className="h-4 w-4 mr-2" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-4 w-4 mr-2" />
                              Activate
                            </>
                          )}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Rights Tab */}
        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-blue-600" />
                User Rights & Permissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg bg-blue-50">
                  <h3 className="font-semibold text-blue-800 mb-2">Administrator</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Full system access</li>
                    <li>• User management</li>
                    <li>• Financial controls</li>
                    <li>• Reports & analytics</li>
                    <li>• System configuration</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg bg-green-50">
                  <h3 className="font-semibold text-green-800 mb-2">Doctor</h3>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Patient consultations</li>
                    <li>• Medical records</li>
                    <li>• Prescriptions</li>
                    <li>• Laboratory orders</li>
                    <li>• Patient reports</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg bg-purple-50">
                  <h3 className="font-semibold text-purple-800 mb-2">Nurse</h3>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Patient registration</li>
                    <li>• Vital signs</li>
                    <li>• Triage assessment</li>
                    <li>• Basic patient care</li>
                    <li>• Medication administration</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg bg-orange-50">
                  <h3 className="font-semibold text-orange-800 mb-2">Cashier</h3>
                  <ul className="text-sm text-orange-700 space-y-1">
                    <li>• Payment processing</li>
                    <li>• Billing management</li>
                    <li>• Receipt generation</li>
                    <li>• Financial transactions</li>
                    <li>• Insurance processing</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg bg-cyan-50">
                  <h3 className="font-semibold text-cyan-800 mb-2">Lab Technician</h3>
                  <ul className="text-sm text-cyan-700 space-y-1">
                    <li>• Laboratory tests</li>
                    <li>• Sample processing</li>
                    <li>• Result reporting</li>
                    <li>• Equipment management</li>
                    <li>• Quality control</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg bg-pink-50">
                  <h3 className="font-semibold text-pink-800 mb-2">Therapist</h3>
                  <ul className="text-sm text-pink-700 space-y-1">
                    <li>• Therapy sessions</li>
                    <li>• Mental health assessments</li>
                    <li>• Treatment planning</li>
                    <li>• Progress tracking</li>
                    <li>• Specialist referrals</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Password Management Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-blue-600" />
                Password & Security Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-yellow-50">
                  <h3 className="font-semibold text-yellow-800 mb-2">Password Policies</h3>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Minimum 8 characters required</li>
                    <li>• Must contain uppercase, lowercase, and numbers</li>
                    <li>• Password expires every 90 days</li>
                    <li>• Cannot reuse last 5 passwords</li>
                    <li>• Account locks after 5 failed attempts</li>
                  </ul>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button className="bg-red-600 hover:bg-red-700 text-white">
                    <Key className="h-4 w-4 mr-2" />
                    Force Password Reset for All Users
                  </Button>
                  <Button variant="outline">
                    <Shield className="h-4 w-4 mr-2" />
                    Generate Security Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                User Activity Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>User activity logs will be displayed here</p>
                  <p className="text-sm">Login times, actions performed, and system access</p>
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
              {editingUser ? "Edit User" : "Add New User"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name</Label>
                <Input
                  value={userForm.firstName}
                  onChange={(e) => setUserForm({...userForm, firstName: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input
                  value={userForm.lastName}
                  onChange={(e) => setUserForm({...userForm, lastName: e.target.value})}
                  required
                />
              </div>
            </div>
            <div>
              <Label>Username</Label>
              <Input
                value={userForm.username}
                onChange={(e) => setUserForm({...userForm, username: e.target.value})}
                required
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                required
              />
            </div>
            <div>
              <Label>Password {editingUser && "(leave blank to keep current)"}</Label>
              <Input
                type="password"
                value={userForm.password}
                onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                required={!editingUser}
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
                  <SelectItem value="cashier">Cashier</SelectItem>
                  <SelectItem value="lab_tech">Lab Technician</SelectItem>
                  <SelectItem value="therapist">Therapist</SelectItem>
                  <SelectItem value="staff">General Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={userForm.isActive}
                onChange={(e) => setUserForm({...userForm, isActive: e.target.checked})}
              />
              <Label>Active User</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowUserModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={userMutation.isPending}>
                {userMutation.isPending ? "Saving..." : (editingUser ? "Update" : "Create")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}