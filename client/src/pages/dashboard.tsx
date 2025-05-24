import { useQuery } from "@tanstack/react-query";
import StatsGrid from "@/components/dashboard/stats-grid";
import RecentPatients from "@/components/dashboard/recent-patients";
import QuickActions from "@/components/dashboard/quick-actions";
import { Button } from "@/components/ui/button";
import { UserPlus, AlertTriangle } from "lucide-react";
import { useState } from "react";
import PatientRegistrationModal from "@/components/modals/patient-registration-modal";

export default function Dashboard() {
  const [showPatientModal, setShowPatientModal] = useState(false);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: patients = [], isLoading: patientsLoading } = useQuery({
    queryKey: ["/api/patients"],
  });

  const handleQuickAdmission = () => {
    setShowPatientModal(true);
  };

  const handleEmergencyAlert = () => {
    alert("Emergency protocols activated. Redirecting to Emergency Management...");
    // In production, this would redirect to emergency module
  };

  return (
    <div className="p-6">
      {/* Dashboard Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
            <p className="text-gray-600">Welcome back, Dr. Johnson. Here's what's happening at ChildHaven today.</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              onClick={handleQuickAdmission}
              className="bg-primary text-white hover:bg-blue-700 flex items-center space-x-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Quick Admission</span>
            </Button>
            <Button 
              onClick={handleEmergencyAlert}
              className="bg-red-600 text-white hover:bg-red-700 flex items-center space-x-2"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Emergency</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <StatsGrid stats={stats} loading={statsLoading} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Recent Patients */}
        <div className="lg:col-span-2">
          <RecentPatients patients={patients.slice(0, 5)} loading={patientsLoading} />
        </div>

        {/* Quick Actions & System Status */}
        <div>
          <QuickActions onRegisterPatient={() => setShowPatientModal(true)} />
          
          {/* System Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-6">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">Database</span>
                  </div>
                  <span className="text-sm text-green-600">Online</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">Lab Interface</span>
                  </div>
                  <span className="text-sm text-green-600">Connected</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">Backup System</span>
                  </div>
                  <span className="text-sm text-yellow-600">Syncing</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">Pharmacy Interface</span>
                  </div>
                  <span className="text-sm text-green-600">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Registration Modal */}
      <PatientRegistrationModal
        open={showPatientModal}
        onOpenChange={setShowPatientModal}
      />
    </div>
  );
}
