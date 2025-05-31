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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Users, 
  UserCheck, 
  UserX, 
  Key, 
  Activity, 
  Shield, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Crown,
  Award,
  BarChart3,
  Database,
  Lock,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Server,
  Download,
  Upload,
  RefreshCw,
  Bell
} from "lucide-react";
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
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
};

export default function AdministratorDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [showPassword, setShowPassword] = useState(false);

  // Fetch users
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["/api/users"],
  });

  // System statistics (in a real app, this would come from API)
  const systemStats = {
    totalUsers: users.length,
    activeUsers: users.filter((u: any) => u.isActive).length,
    totalPatients: 247,
    activeAppointments: 18,
    systemUptime: "99.9%",
    lastBackup: "2025-05-30 06:00:00",
    diskUsage: "68%",
    memoryUsage: "42%"
  };

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

  // Hospital settings state
  const [hospitalSettings, setHospitalSettings] = useState({
    name: "Child Mental Haven",
    tagline: "Where Young Minds Evolve",
    address: "Muchai Drive Off Ngong Road",
    poBox: "P.O Box 41622-00100",
    phone: "254746170159",
    email: "info@childmentalhaven.org",
    website: "www.childmentalhaven.org",
    license: "HF-001-2023",
    sessionTimeout: 30,
    maxLoginAttempts: 3,
    backupFrequency: "daily",
    maintenanceMode: false,
    emailNotifications: true,
    smsNotifications: false
  });

  // User mutations
  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      return await apiRequest("POST", "/api/users", userData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "New user created successfully with secure access credentials.",
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
        title: "Success",
        description: "User information updated successfully.",
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
        title: "User Removed",
        description: "User has been permanently removed from the system.",
        variant: "destructive"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
  });

  const toggleUserStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      return await apiRequest("PATCH", `/api/users/${id}/status`, { isActive });
    },
    onSuccess: (_, variables) => {
      toast({
        title: variables.isActive ? "User Activated" : "User Deactivated",
        description: `User access has been ${variables.isActive ? "granted" : "revoked"}.`,
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
        title: "Validation Error",
        description: "Please complete all required fields before proceeding.",
        variant: "destructive"
      });
      return;
    }

    if (!editingUser && !userForm.password) {
      toast({
        title: "Security Requirement",
        description: "A secure password is required for new user accounts.",
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
    if (confirm(`⚠️ CRITICAL ACTION: Delete user "${user.firstName} ${user.lastName}"?\n\nThis action is permanent and cannot be undone. The user will lose all system access immediately.`)) {
      deleteUserMutation.mutate(user.id);
    }
  };

  const handleToggleUserStatus = (user: User) => {
    const action = user.isActive ? "deactivate" : "activate";
    if (confirm(`${action.toUpperCase()} user "${user.firstName} ${user.lastName}"?\n\nThis will ${user.isActive ? "revoke" : "grant"} their system access.`)) {
      toggleUserStatusMutation.mutate({ id: user.id, isActive: !user.isActive });
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { color: "bg-gradient-to-r from-red-500 to-red-600 text-white", icon: Crown },
      doctor: { color: "bg-gradient-to-r from-blue-500 to-blue-600 text-white", icon: Shield },
      nurse: { color: "bg-gradient-to-r from-green-500 to-green-600 text-white", icon: UserCheck },
      pharmacist: { color: "bg-gradient-to-r from-purple-500 to-purple-600 text-white", icon: Award },
      cashier: { color: "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white", icon: BarChart3 },
      receptionist: { color: "bg-gradient-to-r from-gray-500 to-gray-600 text-white", icon: Users },
      therapist: { color: "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white", icon: Activity },
      staff: { color: "bg-gradient-to-r from-orange-500 to-orange-600 text-white", icon: Users }
    };
    
    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.staff;
    const IconComponent = config.icon;
    
    return (
      <Badge className={`${config.color} shadow-lg border-0 px-3 py-1`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  const getStatusBadge = (isActive: boolean, lastLogin?: string) => {
    if (isActive) {
      return (
        <div className="flex items-center space-x-2">
          <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg border-0">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
          {lastLogin && (
            <span className="text-xs text-gray-500">
              Last: {new Date(lastLogin).toLocaleDateString()}
            </span>
          )}
        </div>
      );
    } else {
      return (
        <Badge className="bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg border-0">
          <UserX className="w-3 h-3 mr-1" />
          Inactive
        </Badge>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Premium Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <Crown className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">
                    Administrator Command Center
                  </h1>
                  <p className="text-blue-100 text-lg">
                    Advanced system management and user administration
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white/80 text-sm">System Status</div>
                <div className="flex items-center space-x-2 text-white">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="font-semibold">Operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl p-1 shadow-lg">
            <TabsTrigger 
              value="overview" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all duration-200"
            >
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="users" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all duration-200"
            >
              <Users className="h-4 w-4" />
              User Management
            </TabsTrigger>
            <TabsTrigger 
              value="system" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all duration-200"
            >
              <Settings className="h-4 w-4" />
              System Settings
            </TabsTrigger>
            <TabsTrigger 
              value="audit" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all duration-200"
            >
              <Activity className="h-4 w-4" />
              Audit & Logs
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-8">
            <div className="grid grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Total Users</p>
                      <p className="text-3xl font-bold">{systemStats.totalUsers}</p>
                    </div>
                    <Users className="h-10 w-10 text-blue-200" />
                  </div>
                  <div className="mt-4">
                    <div className="text-xs text-blue-100">
                      {systemStats.activeUsers} active • {systemStats.totalUsers - systemStats.activeUsers} inactive
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Total Patients</p>
                      <p className="text-3xl font-bold">{systemStats.totalPatients}</p>
                    </div>
                    <Activity className="h-10 w-10 text-green-200" />
                  </div>
                  <div className="mt-4">
                    <div className="text-xs text-green-100">
                      {systemStats.activeAppointments} active appointments
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">System Uptime</p>
                      <p className="text-3xl font-bold">{systemStats.systemUptime}</p>
                    </div>
                    <Server className="h-10 w-10 text-purple-200" />
                  </div>
                  <div className="mt-4">
                    <div className="text-xs text-purple-100">
                      Excellent reliability
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Storage Used</p>
                      <p className="text-3xl font-bold">{systemStats.diskUsage}</p>
                    </div>
                    <Database className="h-10 w-10 text-orange-200" />
                  </div>
                  <div className="mt-4">
                    <div className="text-xs text-orange-100">
                      Memory: {systemStats.memoryUsage}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Award className="h-6 w-6 text-gold-500" />
                  Quick Administrative Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <Button className="h-20 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg">
                    <div className="text-center">
                      <Plus className="h-6 w-6 mx-auto mb-2" />
                      <div>Add New User</div>
                    </div>
                  </Button>
                  <Button className="h-20 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg">
                    <div className="text-center">
                      <Download className="h-6 w-6 mx-auto mb-2" />
                      <div>Backup System</div>
                    </div>
                  </Button>
                  <Button className="h-20 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg">
                    <div className="text-center">
                      <Settings className="h-6 w-6 mx-auto mb-2" />
                      <div>System Settings</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-6 mt-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                <p className="text-gray-600">Manage system users with advanced security controls</p>
              </div>
              <Button 
                onClick={() => {
                  setEditingUser(null);
                  resetUserForm();
                  setShowUserModal(true);
                }}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg px-6 py-3"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create New User
              </Button>
            </div>

            <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-3">
                    <Shield className="h-6 w-6 text-blue-600" />
                    System Users Directory
                  </span>
                  <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
                    {users.length} Total Users
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="text-center py-12">
                    <RefreshCw className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
                    <p className="text-gray-500">Loading user directory...</p>
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
                    <p className="text-gray-500 mb-6">Create your first administrative user to begin.</p>
                    <Button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Create First User
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-xl border border-gray-200">
                    <Table>
                      <TableHeader className="bg-gray-50">
                        <TableRow>
                          <TableHead className="font-semibold">User Profile</TableHead>
                          <TableHead className="font-semibold">Contact Information</TableHead>
                          <TableHead className="font-semibold">Role & Permissions</TableHead>
                          <TableHead className="font-semibold">Account Status</TableHead>
                          <TableHead className="font-semibold">Registration Date</TableHead>
                          <TableHead className="font-semibold text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user: any) => (
                          <TableRow key={user.id} className="hover:bg-gray-50/50 transition-colors">
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {user.firstName} {user.lastName}
                                  </div>
                                  <div className="text-sm text-gray-500">@{user.username}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center text-sm text-gray-600">
                                  <Mail className="h-3 w-3 mr-2" />
                                  {user.email}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{getRoleBadge(user.role)}</TableCell>
                            <TableCell>{getStatusBadge(user.isActive, user.lastLogin)}</TableCell>
                            <TableCell>
                              <div className="flex items-center text-sm text-gray-600">
                                <Calendar className="h-3 w-3 mr-2" />
                                {new Date(user.createdAt).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openEditModal(user)}
                                  className="hover:bg-blue-50 hover:border-blue-300"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant={user.isActive ? "outline" : "default"}
                                  onClick={() => handleToggleUserStatus(user)}
                                  className={user.isActive ? "hover:bg-yellow-50 hover:border-yellow-300" : "bg-green-600 hover:bg-green-700"}
                                >
                                  {user.isActive ? <UserX className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteUser(user)}
                                  className="hover:bg-red-50 hover:border-red-300 text-red-600"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings Tab */}
          <TabsContent value="system" className="space-y-6 mt-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">System Configuration</h2>
              <p className="text-gray-600">Configure hospital information and system parameters</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <MapPin className="h-6 w-6 text-blue-600" />
                    Hospital Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Hospital Name</Label>
                    <Input 
                      value={hospitalSettings.name}
                      onChange={(e) => setHospitalSettings({...hospitalSettings, name: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Tagline</Label>
                    <Input 
                      value={hospitalSettings.tagline}
                      onChange={(e) => setHospitalSettings({...hospitalSettings, tagline: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Address</Label>
                    <Textarea 
                      value={hospitalSettings.address}
                      onChange={(e) => setHospitalSettings({...hospitalSettings, address: e.target.value})}
                      className="mt-1"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">P.O Box</Label>
                    <Input 
                      value={hospitalSettings.poBox}
                      onChange={(e) => setHospitalSettings({...hospitalSettings, poBox: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Phone</Label>
                      <Input 
                        value={hospitalSettings.phone}
                        onChange={(e) => setHospitalSettings({...hospitalSettings, phone: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">License No.</Label>
                      <Input 
                        value={hospitalSettings.license}
                        onChange={(e) => setHospitalSettings({...hospitalSettings, license: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Email</Label>
                    <Input 
                      value={hospitalSettings.email}
                      onChange={(e) => setHospitalSettings({...hospitalSettings, email: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                    Save Hospital Information
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Settings className="h-6 w-6 text-green-600" />
                    Security & System Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Session Timeout (minutes)</Label>
                    <Input 
                      type="number" 
                      value={hospitalSettings.sessionTimeout}
                      onChange={(e) => setHospitalSettings({...hospitalSettings, sessionTimeout: parseInt(e.target.value)})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Max Login Attempts</Label>
                    <Input 
                      type="number" 
                      value={hospitalSettings.maxLoginAttempts}
                      onChange={(e) => setHospitalSettings({...hospitalSettings, maxLoginAttempts: parseInt(e.target.value)})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Backup Frequency</Label>
                    <Select 
                      value={hospitalSettings.backupFrequency} 
                      onValueChange={(value) => setHospitalSettings({...hospitalSettings, backupFrequency: value})}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Every Hour</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-semibold text-gray-700">Maintenance Mode</Label>
                        <p className="text-xs text-gray-500">Restrict system access during maintenance</p>
                      </div>
                      <Switch 
                        checked={hospitalSettings.maintenanceMode}
                        onCheckedChange={(checked) => setHospitalSettings({...hospitalSettings, maintenanceMode: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-semibold text-gray-700">Email Notifications</Label>
                        <p className="text-xs text-gray-500">Send system alerts via email</p>
                      </div>
                      <Switch 
                        checked={hospitalSettings.emailNotifications}
                        onCheckedChange={(checked) => setHospitalSettings({...hospitalSettings, emailNotifications: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-semibold text-gray-700">SMS Notifications</Label>
                        <p className="text-xs text-gray-500">Send critical alerts via SMS</p>
                      </div>
                      <Switch 
                        checked={hospitalSettings.smsNotifications}
                        onCheckedChange={(checked) => setHospitalSettings({...hospitalSettings, smsNotifications: checked})}
                      />
                    </div>
                  </div>
                  
                  <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white">
                    Update System Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="audit" className="space-y-6 mt-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">System Audit & Activity Logs</h2>
              <p className="text-gray-600">Monitor system activity and security events</p>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-6">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Login Events</p>
                      <p className="text-2xl font-bold">156</p>
                    </div>
                    <Lock className="h-8 w-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">System Changes</p>
                      <p className="text-2xl font-bold">23</p>
                    </div>
                    <Settings className="h-8 w-8 text-green-200" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Security Alerts</p>
                      <p className="text-2xl font-bold">2</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-orange-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Activity className="h-6 w-6 text-orange-600" />
                  Recent System Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      type: "login",
                      user: "admin",
                      action: "Successful login",
                      time: "2 minutes ago",
                      severity: "info",
                      icon: CheckCircle,
                      color: "text-green-600"
                    },
                    {
                      type: "user",
                      user: "admin",
                      action: "Created new user account for Dr. Sarah Johnson",
                      time: "15 minutes ago",
                      severity: "info",
                      icon: UserCheck,
                      color: "text-blue-600"
                    },
                    {
                      type: "security",
                      user: "system",
                      action: "Failed login attempt from IP 192.168.1.100",
                      time: "1 hour ago",
                      severity: "warning",
                      icon: AlertTriangle,
                      color: "text-orange-600"
                    },
                    {
                      type: "backup",
                      user: "system",
                      action: "Daily backup completed successfully",
                      time: "6 hours ago",
                      severity: "info",
                      icon: Database,
                      color: "text-green-600"
                    },
                    {
                      type: "prescription",
                      user: "pharmacist",
                      action: "Approved prescription RX-001 for patient CMH-202501LKM001",
                      time: "Yesterday",
                      severity: "info",
                      icon: CheckCircle,
                      color: "text-purple-600"
                    }
                  ].map((log, index) => {
                    const IconComponent = log.icon;
                    return (
                      <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50/50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-lg bg-gray-100`}>
                            <IconComponent className={`h-5 w-5 ${log.color}`} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{log.action}</p>
                            <p className="text-sm text-gray-500">by {log.user}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">{log.time}</p>
                          <Badge 
                            variant={log.severity === "warning" ? "destructive" : "secondary"}
                            className={`text-xs ${log.severity === "warning" ? "bg-orange-100 text-orange-800" : "bg-blue-100 text-blue-800"}`}
                          >
                            {log.type}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Premium User Modal */}
      <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
        <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-sm border border-gray-200 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              {editingUser ? "Edit User Account" : "Create New User Account"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold text-gray-700">First Name *</Label>
                <Input
                  value={userForm.firstName}
                  onChange={(e) => setUserForm({...userForm, firstName: e.target.value})}
                  placeholder="Enter first name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700">Last Name *</Label>
                <Input
                  value={userForm.lastName}
                  onChange={(e) => setUserForm({...userForm, lastName: e.target.value})}
                  placeholder="Enter last name"
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-semibold text-gray-700">Username *</Label>
              <Input
                value={userForm.username}
                onChange={(e) => setUserForm({...userForm, username: e.target.value})}
                placeholder="Enter unique username"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label className="text-sm font-semibold text-gray-700">Email Address *</Label>
              <Input
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                placeholder="Enter email address"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label className="text-sm font-semibold text-gray-700">System Role</Label>
              <Select value={userForm.role} onValueChange={(value) => setUserForm({...userForm, role: value})}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-red-600" />
                      Administrator
                    </div>
                  </SelectItem>
                  <SelectItem value="doctor">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-600" />
                      Doctor
                    </div>
                  </SelectItem>
                  <SelectItem value="nurse">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-green-600" />
                      Nurse
                    </div>
                  </SelectItem>
                  <SelectItem value="pharmacist">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-purple-600" />
                      Pharmacist
                    </div>
                  </SelectItem>
                  <SelectItem value="cashier">Cashier</SelectItem>
                  <SelectItem value="receptionist">Receptionist</SelectItem>
                  <SelectItem value="therapist">Therapist</SelectItem>
                  <SelectItem value="staff">General Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm font-semibold text-gray-700">
                Password {!editingUser && "*"}
              </Label>
              <div className="relative mt-1">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={userForm.password}
                  onChange={(e) => setUserForm({...userForm, password: e.target.value})}
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
              {!editingUser && (
                <p className="text-xs text-gray-500 mt-1">
                  Password should be at least 8 characters with uppercase, lowercase, and numbers
                </p>
              )}
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <Switch
                checked={userForm.isActive}
                onCheckedChange={(checked) => setUserForm({...userForm, isActive: checked})}
              />
              <div>
                <Label className="text-sm font-semibold text-gray-700">Account Active</Label>
                <p className="text-xs text-gray-500">User can access the system when active</p>
              </div>
            </div>
            
            <div className="flex justify-end gap-4 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowUserModal(false)}
                className="px-6"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUserSubmit} 
                disabled={createUserMutation.isPending || updateUserMutation.isPending}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6"
              >
                {createUserMutation.isPending || updateUserMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    {editingUser ? "Updating..." : "Creating..."}
                  </div>
                ) : (
                  editingUser ? "Update User" : "Create User"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}