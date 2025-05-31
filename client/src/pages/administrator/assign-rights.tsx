import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, User, Settings, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const permissions = {
  patient_management: {
    label: "Patient Management",
    permissions: [
      { key: "patient_register", label: "Register New Patients" },
      { key: "patient_view", label: "View Patient Records" },
      { key: "patient_edit", label: "Edit Patient Information" },
      { key: "patient_delete", label: "Delete Patient Records" }
    ]
  },
  consultation: {
    label: "Consultation & Treatment",
    permissions: [
      { key: "consultation_create", label: "Create Consultations" },
      { key: "consultation_view", label: "View Consultations" },
      { key: "prescription_create", label: "Create Prescriptions" },
      { key: "prescription_approve", label: "Approve Prescriptions" }
    ]
  },
  pharmacy: {
    label: "Pharmacy Management",
    permissions: [
      { key: "pharmacy_view", label: "View Pharmacy" },
      { key: "pharmacy_manage", label: "Manage Inventory" },
      { key: "prescription_dispense", label: "Dispense Medications" },
      { key: "pharmacy_reports", label: "Pharmacy Reports" }
    ]
  },
  financial: {
    label: "Financial Management",
    permissions: [
      { key: "billing_create", label: "Create Bills" },
      { key: "billing_view", label: "View Billing Records" },
      { key: "payment_process", label: "Process Payments" },
      { key: "financial_reports", label: "Financial Reports" }
    ]
  },
  administration: {
    label: "System Administration",
    permissions: [
      { key: "user_create", label: "Create Users" },
      { key: "user_manage", label: "Manage Users" },
      { key: "system_settings", label: "System Settings" },
      { key: "audit_logs", label: "View Audit Logs" }
    ]
  }
};

export default function AssignUserRights() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [userPermissions, setUserPermissions] = useState<string[]>([]);

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
  });

  const { data: currentPermissions = [] } = useQuery({
    queryKey: ["/api/users", selectedUserId, "permissions"],
    enabled: !!selectedUserId,
  });

  const updatePermissionsMutation = useMutation({
    mutationFn: async ({ userId, permissions }: { userId: string; permissions: string[] }) => {
      return await apiRequest("PUT", `/api/users/${userId}/permissions`, { permissions });
    },
    onSuccess: () => {
      toast({
        title: "Permissions Updated",
        description: "User permissions have been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users", selectedUserId, "permissions"] });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update user permissions. Please try again.",
        variant: "destructive"
      });
    }
  });

  const selectedUser = users.find((user: any) => user.id.toString() === selectedUserId);

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    setUserPermissions(currentPermissions);
  };

  const handlePermissionToggle = (permissionKey: string) => {
    setUserPermissions(prev => 
      prev.includes(permissionKey)
        ? prev.filter(p => p !== permissionKey)
        : [...prev, permissionKey]
    );
  };

  const handleSavePermissions = () => {
    if (!selectedUserId) {
      toast({
        title: "No User Selected",
        description: "Please select a user first.",
        variant: "destructive"
      });
      return;
    }

    updatePermissionsMutation.mutate({
      userId: selectedUserId,
      permissions: userPermissions
    });
  };

  const getRolePermissions = (role: string) => {
    const roleDefaults: { [key: string]: string[] } = {
      admin: Object.values(permissions).flatMap(category => 
        category.permissions.map(p => p.key)
      ),
      doctor: [
        "patient_view", "patient_edit", "consultation_create", "consultation_view",
        "prescription_create", "pharmacy_view"
      ],
      nurse: [
        "patient_view", "patient_edit", "consultation_view", "pharmacy_view"
      ],
      pharmacist: [
        "patient_view", "pharmacy_view", "pharmacy_manage", "prescription_approve",
        "prescription_dispense", "pharmacy_reports"
      ],
      cashier: [
        "patient_view", "billing_create", "billing_view", "payment_process"
      ],
      receptionist: [
        "patient_register", "patient_view", "patient_edit"
      ],
      therapist: [
        "patient_view", "patient_edit", "consultation_create", "consultation_view"
      ],
      staff: [
        "patient_view"
      ]
    };

    return roleDefaults[role] || [];
  };

  const applyRoleDefaults = () => {
    if (selectedUser) {
      const defaultPermissions = getRolePermissions(selectedUser.role);
      setUserPermissions(defaultPermissions);
      toast({
        title: "Role Defaults Applied",
        description: `Applied default permissions for ${selectedUser.role} role.`,
      });
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Shield className="h-8 w-8 text-blue-600" />
          Assign User Rights
        </h1>
        <p className="text-gray-600 mt-2">Manage user permissions and access controls</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Selection */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Select User
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedUserId} onValueChange={handleUserSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a user" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user: any) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    <div className="flex flex-col">
                      <span>{user.firstName} {user.lastName}</span>
                      <span className="text-xs text-gray-500">@{user.username} • {user.role}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedUser && (
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm text-gray-500">Selected User:</span>
                  <div className="font-medium">{selectedUser.firstName} {selectedUser.lastName}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Role:</span>
                  <div>
                    <Badge className="bg-blue-100 text-blue-800">
                      {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Email:</span>
                  <div className="text-sm">{selectedUser.email}</div>
                </div>
                <Separator />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={applyRoleDefaults}
                  className="w-full"
                >
                  Apply Role Defaults
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Permissions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Permissions & Access Rights
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedUserId ? (
              <div className="text-center py-12">
                <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Select a user to manage their permissions</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(permissions).map(([categoryKey, category]) => (
                  <div key={categoryKey} className="space-y-3">
                    <h3 className="font-semibold text-lg text-gray-900">{category.label}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {category.permissions.map((permission) => (
                        <div
                          key={permission.key}
                          className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <Checkbox
                            id={permission.key}
                            checked={userPermissions.includes(permission.key)}
                            onCheckedChange={() => handlePermissionToggle(permission.key)}
                          />
                          <label
                            htmlFor={permission.key}
                            className="text-sm font-medium cursor-pointer flex-1"
                          >
                            {permission.label}
                          </label>
                        </div>
                      ))}
                    </div>
                    <Separator />
                  </div>
                ))}

                <div className="flex justify-end space-x-4 pt-6">
                  <Button
                    variant="outline"
                    onClick={() => setUserPermissions(currentPermissions)}
                  >
                    Reset Changes
                  </Button>
                  <Button
                    onClick={handleSavePermissions}
                    disabled={updatePermissionsMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updatePermissionsMutation.isPending ? "Saving..." : "Save Permissions"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Permission Summary */}
      {selectedUserId && userPermissions.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Permission Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                {selectedUser?.firstName} {selectedUser?.lastName} will have access to:
              </div>
              <div className="flex flex-wrap gap-2">
                {userPermissions.map((permKey) => {
                  const permission = Object.values(permissions)
                    .flatMap(cat => cat.permissions)
                    .find(p => p.key === permKey);
                  return permission ? (
                    <Badge key={permKey} variant="secondary" className="text-xs">
                      {permission.label}
                    </Badge>
                  ) : null;
                })}
              </div>
              <div className="text-sm text-gray-500">
                Total permissions: {userPermissions.length}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}