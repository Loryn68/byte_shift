import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { Calendar, Clock, HelpCircle, Settings } from "lucide-react";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("Outpatient");

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const tabs = ["Outpatient", "Therapy", "Admitted", "Discharged"];

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
          
          {/* Patient Statistics Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              {activeTab === "Outpatient" && "Outpatient Statistics - Current Month"}
              {activeTab === "Therapy" && "Therapy Statistics - Current Month"}
              {activeTab === "Admitted" && "Inpatient Statistics - Current Month"}
              {activeTab === "Discharged" && "Discharged Statistics - Current Month"}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Category-specific Stats Cards */}
              {activeTab === "Outpatient" && (
                <>
                  <Card className="p-6 bg-white border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <Calendar className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-gray-600">Total Outpatients</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">0</div>
                  </Card>
                  
                  <Card className="p-6 bg-white border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <Clock className="w-5 h-5 text-blue-500" />
                      <span className="text-sm text-gray-600">Today's Visits</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">0</div>
                  </Card>
                  
                  <Card className="p-6 bg-white border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <Calendar className="w-5 h-5 text-orange-500" />
                      <span className="text-sm text-gray-600">Pending Appointments</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">0</div>
                  </Card>
                  
                  <Card className="p-6 bg-white border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <Calendar className="w-5 h-5 text-purple-500" />
                      <span className="text-sm text-gray-600">Completed Consultations</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">0</div>
                  </Card>
                </>
              )}
              
              {activeTab === "Therapy" && (
                <>
                  <Card className="p-6 bg-white border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <Calendar className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-gray-600">Total Therapy Patients</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">0</div>
                  </Card>
                  
                  <Card className="p-6 bg-white border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <Clock className="w-5 h-5 text-blue-500" />
                      <span className="text-sm text-gray-600">Active Sessions</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">0</div>
                  </Card>
                  
                  <Card className="p-6 bg-white border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <Calendar className="w-5 h-5 text-orange-500" />
                      <span className="text-sm text-gray-600">Scheduled Sessions</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">0</div>
                  </Card>
                  
                  <Card className="p-6 bg-white border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <Calendar className="w-5 h-5 text-purple-500" />
                      <span className="text-sm text-gray-600">Completed Sessions</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">0</div>
                  </Card>
                </>
              )}
              
              {activeTab === "Admitted" && (
                <>
                  <Card className="p-6 bg-white border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <Calendar className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-gray-600">Total Inpatients</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">0</div>
                  </Card>
                  
                  <Card className="p-6 bg-white border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <Clock className="w-5 h-5 text-blue-500" />
                      <span className="text-sm text-gray-600">New Admissions</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">0</div>
                  </Card>
                  
                  <Card className="p-6 bg-white border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <Calendar className="w-5 h-5 text-orange-500" />
                      <span className="text-sm text-gray-600">Bed Occupancy</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">0%</div>
                  </Card>
                  
                  <Card className="p-6 bg-white border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <Calendar className="w-5 h-5 text-purple-500" />
                      <span className="text-sm text-gray-600">Average Stay (Days)</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">0</div>
                  </Card>
                </>
              )}
              
              {activeTab === "Discharged" && (
                <>
                  <Card className="p-6 bg-white border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <Calendar className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-gray-600">Total Discharged</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">0</div>
                  </Card>
                  
                  <Card className="p-6 bg-white border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <Clock className="w-5 h-5 text-blue-500" />
                      <span className="text-sm text-gray-600">Today's Discharges</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">0</div>
                  </Card>
                  
                  <Card className="p-6 bg-white border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <Calendar className="w-5 h-5 text-orange-500" />
                      <span className="text-sm text-gray-600">Recovery Rate</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">0%</div>
                  </Card>
                  
                  <Card className="p-6 bg-white border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <Calendar className="w-5 h-5 text-purple-500" />
                      <span className="text-sm text-gray-600">Follow-up Required</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">0</div>
                  </Card>
                </>
              )}
            </div>
          </div>

          {/* Monthly Trends Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Monthly Trends</h2>
            
            <Card className="p-8 bg-white border border-gray-200">
              <div className="flex items-center justify-center h-64 text-gray-400">
                <div className="text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No trend data available</p>
                  <p className="text-sm">Monthly trends will appear here as patient data accumulates</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
