import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import type { Patient } from "@shared/schema";

interface RecentPatientsProps {
  patients: Patient[];
  loading: boolean;
}

export default function RecentPatients({ patients, loading }: RecentPatientsProps) {
  const getPatientInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getPatientAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Patients</h3>
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-4">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <div className="text-right">
                  <Skeleton className="h-4 w-16 mb-1" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Recent Patients</h3>
          <Link href="/patient-registration">
            <Button variant="ghost" className="text-primary hover:text-blue-700 text-sm font-medium">
              View All
            </Button>
          </Link>
        </div>
      </div>
      <div className="p-6">
        {patients.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No patients registered yet</p>
            <Link href="/patient-registration">
              <Button className="mt-2" size="sm">
                Register First Patient
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {patients.map((patient) => {
              const initials = getPatientInitials(patient.firstName, patient.lastName);
              const age = getPatientAge(patient.dateOfBirth);
              const timeAgo = getTimeAgo(new Date(patient.registrationDate));
              
              // Generate a color based on patient ID for consistent avatar colors
              const colors = [
                'bg-blue-100 text-blue-600',
                'bg-green-100 text-green-600',
                'bg-purple-100 text-purple-600',
                'bg-pink-100 text-pink-600',
                'bg-yellow-100 text-yellow-600'
              ];
              const colorClass = colors[patient.id % colors.length];

              return (
                <div key={patient.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
                      <span className="font-semibold text-sm">{initials}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {patient.firstName} {patient.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        ID: {patient.patientId} • Age: {age}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">General</p>
                    <p className="text-sm text-gray-500">{timeAgo}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={patient.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                      {patient.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
