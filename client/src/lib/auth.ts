import { apiRequest } from "./queryClient";

export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: User;
}

class AuthService {
  private user: User | null = null;

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiRequest("POST", "/api/auth/login", credentials);
      const authResponse: AuthResponse = await response.json();
      
      this.user = authResponse.user;
      this.saveUserToStorage(authResponse.user);
      
      return authResponse;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Login failed");
    }
  }

  logout(): void {
    this.user = null;
    this.removeUserFromStorage();
  }

  getCurrentUser(): User | null {
    if (this.user) {
      return this.user;
    }
    
    return this.getUserFromStorage();
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  isAdmin(): boolean {
    return this.hasRole("admin");
  }

  isDoctor(): boolean {
    return this.hasRole("doctor");
  }

  isNurse(): boolean {
    return this.hasRole("nurse");
  }

  canAccessModule(module: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    // Define role-based access control
    const rolePermissions: Record<string, string[]> = {
      admin: [
        "dashboard", "patient-registration", "appointments", "outpatient", "inpatient",
        "laboratory", "pharmacy", "radiology", "billing", "insurance", "reports", "analytics"
      ],
      doctor: [
        "dashboard", "patient-registration", "appointments", "outpatient", "inpatient",
        "laboratory", "pharmacy", "radiology", "reports"
      ],
      nurse: [
        "dashboard", "patient-registration", "appointments", "outpatient", "inpatient",
        "laboratory", "pharmacy"
      ],
      staff: [
        "dashboard", "patient-registration", "appointments", "billing", "insurance"
      ]
    };

    const allowedModules = rolePermissions[user.role] || [];
    return allowedModules.includes(module);
  }

  private saveUserToStorage(user: User): void {
    try {
      localStorage.setItem("childhaven_user", JSON.stringify(user));
    } catch (error) {
      console.error("Failed to save user to storage:", error);
    }
  }

  private getUserFromStorage(): User | null {
    try {
      const userStr = localStorage.getItem("childhaven_user");
      if (userStr) {
        const user = JSON.parse(userStr);
        this.user = user;
        return user;
      }
    } catch (error) {
      console.error("Failed to get user from storage:", error);
      this.removeUserFromStorage();
    }
    return null;
  }

  private removeUserFromStorage(): void {
    try {
      localStorage.removeItem("childhaven_user");
    } catch (error) {
      console.error("Failed to remove user from storage:", error);
    }
  }

  getFullName(): string {
    const user = this.getCurrentUser();
    return user ? `${user.firstName} ${user.lastName}` : "Unknown User";
  }

  getDisplayRole(): string {
    const user = this.getCurrentUser();
    if (!user) return "Unknown";

    const roleDisplayNames: Record<string, string> = {
      admin: "Administrator",
      doctor: "Doctor",
      nurse: "Nurse",
      staff: "Staff"
    };

    return roleDisplayNames[user.role] || user.role;
  }
}

export const authService = new AuthService();

// Helper hooks for React components
export function useAuth() {
  const user = authService.getCurrentUser();
  
  return {
    user,
    isAuthenticated: authService.isAuthenticated(),
    hasRole: (role: string) => authService.hasRole(role),
    hasAnyRole: (roles: string[]) => authService.hasAnyRole(roles),
    isAdmin: () => authService.isAdmin(),
    isDoctor: () => authService.isDoctor(),
    isNurse: () => authService.isNurse(),
    canAccessModule: (module: string) => authService.canAccessModule(module),
    getFullName: () => authService.getFullName(),
    getDisplayRole: () => authService.getDisplayRole()
  };
}

// Helper functions for requiring authentication and roles
export function requireAuth(): User {
  const user = authService.getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }
  return user;
}

export function requireRole(role: string): User {
  const user = requireAuth();
  if (!authService.hasRole(role)) {
    throw new Error(`Role '${role}' required`);
  }
  return user;
}

export function requireAnyRole(roles: string[]): User {
  const user = requireAuth();
  if (!authService.hasAnyRole(roles)) {
    throw new Error(`One of roles [${roles.join(", ")}] required`);
  }
  return user;
}
