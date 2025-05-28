import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { Calendar, Clock, HelpCircle, Settings } from "lucide-react";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("Draft");

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const tabs = ["Draft", "Submitted", "Closed"];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">DASHBOARD</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                size="sm" 
                className="bg-green-600 hover:bg-green-700 text-white flex items-center space-x-1"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Help</span>
              </Button>
              <Button 
                size="sm" 
                className="bg-green-700 hover:bg-green-800 text-white flex items-center space-x-1"
              >
                <Settings className="w-4 h-4" />
                <span>Patient Management Guide</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white px-6">
          <div className="flex space-x-0 border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-green-600 text-green-600 bg-green-50"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6">
          
          {/* Patient Overview Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Patient Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Patient Stats Cards */}
              <Card className="p-6 bg-white border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3 mb-4">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">New Patients (7 days)</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">0</div>
              </Card>

              <Card className="p-6 bg-white border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3 mb-4">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Active Appointments</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">0</div>
              </Card>

              <Card className="p-6 bg-white border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3 mb-4">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Pending Lab Tests</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">0</div>
              </Card>

              <Card className="p-6 bg-white border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3 mb-4">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Total Patients</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">0</div>
              </Card>
            </div>
          </div>

          {/* Department Activity Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Department Activity</h2>
            
            <Card className="p-8 bg-white border border-gray-200">
              <div className="flex items-center justify-center h-64 text-gray-400">
                <div className="text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No activity data available</p>
                  <p className="text-sm">Patient activity will appear here as you use the system</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
