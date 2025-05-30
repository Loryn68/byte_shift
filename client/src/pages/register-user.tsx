import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Shield, Eye, EyeOff, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function RegisterUser() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [userForm, setUserForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    isActive: true,
    department: "",
    phoneNumber: "",
    employeeId: ""
  });

  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  // Password validation function
  const validatePassword = (password: string) => {
    const validation = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    setPasswordValidation(validation);
    return Object.values(validation).every(Boolean);
  };

  // User registration mutation
  const registerUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const { confirmPassword, ...userDataToSend } = userData;
      return await apiRequest("POST", "/api/users/register", userDataToSend);
    },
    onSuccess: () => {
      toast({
        title: "User Registered Successfully",
        description: "New staff member has been added to the system.",
      });
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register user. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setUserForm({
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "",
      isActive: true,
      department: "",
      phoneNumber: "",
      employeeId: ""
    });
    setPasswordValidation({
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false
    });
  };

  const handlePasswordChange = (password: string) => {
    setUserForm({ ...userForm, password });
    validatePassword(password);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation checks
    if (!userForm.firstName || !userForm.lastName || !userForm.username || !userForm.email || !userForm.password || !userForm.role) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!validatePassword(userForm.password)) {
      toast({
        title: "Password Requirements",
        description: "Password must meet all security requirements.",
        variant: "destructive",
      });
      return;
    }

    if (userForm.password !== userForm.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Password and confirm password do not match.",
        variant: "destructive",
      });
      return;
    }

    registerUserMutation.mutate(userForm);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <UserPlus className="h-8 w-8 text-blue-600" />
          Register New User
        </h1>
        <p className="text-gray-600">Add new staff members to the Child Mental Haven system</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Registration Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                User Registration Form
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={userForm.firstName}
                        onChange={(e) => setUserForm({...userForm, firstName: e.target.value})}
                        placeholder="Enter first name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={userForm.lastName}
                        onChange={(e) => setUserForm({...userForm, lastName: e.target.value})}
                        placeholder="Enter last name"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={userForm.email}
                        onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                        placeholder="user@childmentalhaven.org"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        value={userForm.phoneNumber}
                        onChange={(e) => setUserForm({...userForm, phoneNumber: e.target.value})}
                        placeholder="+254 700 000 000"
                      />
                    </div>
                  </div>
                </div>

                {/* System Access */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">System Access</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="username">Username *</Label>
                      <Input
                        id="username"
                        value={userForm.username}
                        onChange={(e) => setUserForm({...userForm, username: e.target.value})}
                        placeholder="Enter username"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="employeeId">Employee ID</Label>
                      <Input
                        id="employeeId"
                        value={userForm.employeeId}
                        onChange={(e) => setUserForm({...userForm, employeeId: e.target.value})}
                        placeholder="EMP001"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="role">Role *</Label>
                      <Select value={userForm.role} onValueChange={(value) => setUserForm({...userForm, role: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select user role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Administrator</SelectItem>
                          <SelectItem value="doctor">Doctor</SelectItem>
                          <SelectItem value="nurse">Nurse</SelectItem>
                          <SelectItem value="cashier">Cashier</SelectItem>
                          <SelectItem value="lab_tech">Lab Technician</SelectItem>
                          <SelectItem value="therapist">Therapist</SelectItem>
                          <SelectItem value="pharmacist">Pharmacist</SelectItem>
                          <SelectItem value="receptionist">Receptionist</SelectItem>
                          <SelectItem value="staff">General Staff</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Select value={userForm.department} onValueChange={(value) => setUserForm({...userForm, department: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="administration">Administration</SelectItem>
                          <SelectItem value="medical">Medical</SelectItem>
                          <SelectItem value="nursing">Nursing</SelectItem>
                          <SelectItem value="therapy">Mental Health Therapy</SelectItem>
                          <SelectItem value="laboratory">Laboratory</SelectItem>
                          <SelectItem value="pharmacy">Pharmacy</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="reception">Reception</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Password Setup */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Password Setup</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="password">Password *</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={userForm.password}
                          onChange={(e) => handlePasswordChange(e.target.value)}
                          placeholder="Enter secure password"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm Password *</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={userForm.confirmPassword}
                          onChange={(e) => setUserForm({...userForm, confirmPassword: e.target.value})}
                          placeholder="Confirm password"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Status */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Account Status</h3>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={userForm.isActive}
                      onChange={(e) => setUserForm({...userForm, isActive: e.target.checked})}
                      className="rounded"
                    />
                    <Label htmlFor="isActive">Activate user account immediately</Label>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Clear Form
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={registerUserMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {registerUserMutation.isPending ? "Registering..." : "Register User"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Password Requirements & Instructions */}
        <div className="space-y-6">
          {/* Password Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Password Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className={`flex items-center gap-2 text-sm ${passwordValidation.length ? 'text-green-600' : 'text-gray-500'}`}>
                  {passwordValidation.length ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                  At least 8 characters
                </div>
                <div className={`flex items-center gap-2 text-sm ${passwordValidation.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                  {passwordValidation.uppercase ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                  One uppercase letter
                </div>
                <div className={`flex items-center gap-2 text-sm ${passwordValidation.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
                  {passwordValidation.lowercase ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                  One lowercase letter
                </div>
                <div className={`flex items-center gap-2 text-sm ${passwordValidation.number ? 'text-green-600' : 'text-gray-500'}`}>
                  {passwordValidation.number ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                  One number
                </div>
                <div className={`flex items-center gap-2 text-sm ${passwordValidation.special ? 'text-green-600' : 'text-gray-500'}`}>
                  {passwordValidation.special ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                  One special character
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Role Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="p-2 bg-red-50 rounded">
                  <span className="font-medium text-red-800">Administrator:</span>
                  <p className="text-red-700">Full system access and user management</p>
                </div>
                <div className="p-2 bg-blue-50 rounded">
                  <span className="font-medium text-blue-800">Doctor:</span>
                  <p className="text-blue-700">Patient consultations and medical records</p>
                </div>
                <div className="p-2 bg-green-50 rounded">
                  <span className="font-medium text-green-800">Nurse:</span>
                  <p className="text-green-700">Patient care and triage operations</p>
                </div>
                <div className="p-2 bg-purple-50 rounded">
                  <span className="font-medium text-purple-800">Therapist:</span>
                  <p className="text-purple-700">Mental health services and counseling</p>
                </div>
                <div className="p-2 bg-orange-50 rounded">
                  <span className="font-medium text-orange-800">Cashier:</span>
                  <p className="text-orange-700">Payment processing and billing</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Registration Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Registration Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• All fields marked with * are required</p>
                <p>• Email addresses must be unique</p>
                <p>• Usernames cannot be changed later</p>
                <p>• Employee ID helps with payroll integration</p>
                <p>• New users will receive email notifications</p>
                <p>• Account activation is immediate if checked</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}