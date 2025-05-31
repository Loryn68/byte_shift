import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Shield, Eye, EyeOff, Key, Lock, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function ChangePasswords() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: ""
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
  });

  const changePasswordMutation = useMutation({
    mutationFn: async ({ userId, newPassword }: { userId: string; newPassword: string }) => {
      return await apiRequest("PUT", `/api/users/${userId}/password`, { newPassword });
    },
    onSuccess: () => {
      toast({
        title: "Password Changed Successfully",
        description: "User password has been updated. They should log in with the new password.",
      });
      setPasswords({ newPassword: "", confirmPassword: "" });
      setSelectedUserId("");
      setShowResetDialog(false);
    },
    onError: () => {
      toast({
        title: "Password Change Failed",
        description: "Failed to update user password. Please try again.",
        variant: "destructive"
      });
    }
  });

  const generatePasswordMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest("POST", `/api/users/${userId}/generate-password`);
    },
    onSuccess: (data) => {
      toast({
        title: "Password Generated",
        description: `New password: ${data.password}. Please share this securely with the user.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: () => {
      toast({
        title: "Password Generation Failed",
        description: "Failed to generate new password. Please try again.",
        variant: "destructive"
      });
    }
  });

  const selectedUser = users.find((user: any) => user.id.toString() === selectedUserId);

  const handlePasswordChange = () => {
    if (!selectedUserId) {
      toast({
        title: "No User Selected",
        description: "Please select a user first.",
        variant: "destructive"
      });
      return;
    }

    if (!passwords.newPassword || !passwords.confirmPassword) {
      toast({
        title: "Missing Password",
        description: "Please enter and confirm the new password.",
        variant: "destructive"
      });
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation do not match.",
        variant: "destructive"
      });
      return;
    }

    if (passwords.newPassword.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive"
      });
      return;
    }

    setShowResetDialog(true);
  };

  const confirmPasswordChange = () => {
    changePasswordMutation.mutate({
      userId: selectedUserId,
      newPassword: passwords.newPassword
    });
  };

  const handleGeneratePassword = () => {
    if (!selectedUserId) {
      toast({
        title: "No User Selected",
        description: "Please select a user first.",
        variant: "destructive"
      });
      return;
    }

    if (confirm(`Generate a new random password for ${selectedUser?.firstName} ${selectedUser?.lastName}?`)) {
      generatePasswordMutation.mutate(selectedUserId);
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
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Shield className="h-8 w-8 text-blue-600" />
          Change User Passwords
        </h1>
        <p className="text-gray-600 mt-2">Reset or update user account passwords</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Select User Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Choose User</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a user to change password" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user: any) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      <div className="flex flex-col">
                        <span className="font-medium">{user.firstName} {user.lastName}</span>
                        <span className="text-xs text-gray-500">@{user.username} • {user.role}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedUser && (
              <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="font-semibold text-blue-900">Selected User</div>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-blue-700">Name:</span>
                    <div className="font-medium text-blue-900">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-blue-700">Username:</span>
                    <div className="font-medium text-blue-900">@{selectedUser.username}</div>
                  </div>
                  <div>
                    <span className="text-sm text-blue-700">Role:</span>
                    <div className="mt-1">{getRoleBadge(selectedUser.role)}</div>
                  </div>
                  <div>
                    <span className="text-sm text-blue-700">Email:</span>
                    <div className="text-sm text-blue-800">{selectedUser.email}</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Password Change */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Password Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!selectedUserId ? (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Select a user to manage their password</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={passwords.newPassword}
                        onChange={(e) => setPasswords(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Enter new password"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwords.confirmPassword}
                        onChange={(e) => setPasswords(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Confirm new password"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                    <strong>Password Requirements:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>• At least 8 characters long</li>
                      <li>• Include uppercase and lowercase letters</li>
                      <li>• Include numbers and special characters</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={handlePasswordChange}
                    disabled={changePasswordMutation.isPending}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {changePasswordMutation.isPending ? "Changing Password..." : "Change Password"}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">Or</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    onClick={handleGeneratePassword}
                    disabled={generatePasswordMutation.isPending}
                    className="w-full"
                  >
                    {generatePasswordMutation.isPending ? "Generating..." : "Generate Random Password"}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Security Notice */}
      <Card className="mt-8 border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-800">Security Best Practices</h3>
              <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                <li>• Always use strong, unique passwords for each account</li>
                <li>• Share new passwords securely with users (not via email)</li>
                <li>• Require users to change passwords on first login</li>
                <li>• Monitor for suspicious login activities</li>
                <li>• Regular password updates enhance security</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Confirm Password Change
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 font-medium">Change password for:</p>
              <div className="mt-2">
                <div className="font-semibold">{selectedUser?.firstName} {selectedUser?.lastName}</div>
                <div className="text-sm text-gray-600">@{selectedUser?.username}</div>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• The user's current password will be invalidated</p>
              <p>• They will need to use the new password to log in</p>
              <p>• Consider notifying the user about this change</p>
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowResetDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmPasswordChange}
                disabled={changePasswordMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}