import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Hospital, 
  User, 
  LogOut,
  Bell,
  Settings
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const currentUser = {
    name: "Dr. Sarah Johnson",
    role: "Administrator",
    email: "sarah.johnson@childmentalhaven.com"
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      // In production, handle logout properly
      console.log("Logging out...");
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Hospital className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Child Mental Haven</h1>
                <p className="text-xs text-gray-500">Hospital Information Management</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500 hover:bg-red-500">
                3
              </Badge>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
