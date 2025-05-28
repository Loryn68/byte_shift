import React, { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Users, 
  Search, 
  Stethoscope,
  FileText,
  User,
  Calendar,
  Activity
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import type { Patient } from "@shared/schema";

export default function OutpatientConsultation() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  const { data: patients = [] } = useQuery({
    queryKey: ["/api/patients"],
  });

  const { data: billingRecords = [] } = useQuery({
    queryKey: ["/api/billing"],
  });

  // Filter patients to show only those ready for outpatient consultation
  const filteredPatients = patients.filter((patient: Patient) => {
    // Only show patients who have completed triage and are ready for doctor consultation
    // Check both localStorage (for backward compatibility) and patient status
    const hasVitalsInLocalStorage = (() => {
      try {
        const vitalsData = JSON.parse(localStorage.getItem('patientVitals') || '[]');
        return vitalsData.some((vital: any) => vital.patientId === patient.id);
      } catch {
        return false;
      }
    })();
    
    const isReadyForDoctor = patient.status === "triaged-ready-for-doctor" || hasVitalsInLocalStorage;
    
    if (!isReadyForDoctor) return false;
    
    // Exclude therapy patients (those with counseling services)
    const isTherapyPatient = billingRecords.some((bill: any) => 
      bill.patientId === patient.id && 
      (bill.serviceType?.toLowerCase().includes('counseling') ||
       bill.serviceType?.toLowerCase().includes('therapy') ||
       bill.serviceDescription?.toLowerCase().includes('counseling') ||
       bill.serviceDescription?.toLowerCase().includes('therapy'))
    );
    
    if (isTherapyPatient) return false;
    
    if (!searchQuery) return true;
    return (
      patient.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.patientId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Get patient's vital signs
  const getPatientVitals = (patientId: number) => {
    try {
      const vitalsData = JSON.parse(localStorage.getItem('patientVitals') || '[]');
      return vitalsData.find((vital: any) => vital.patientId === patientId);
    } catch {
      return null;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Outpatient Consultation</h1>
          <p className="text-gray-600">Doctor's consultation environment for patient care</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="patients" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="patients" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Patients for Consultation</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Consultation History</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="patients" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Stethoscope className="w-5 h-5" />
                <span>Triaged Patients Ready for Consultation</span>
              </CardTitle>
              <CardDescription>
                Patients who have completed triage and are ready for doctor consultation
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredPatients.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Patients Ready</h3>
                  <p className="text-gray-500">No triaged patients are currently waiting for consultation.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient Details</TableHead>
                      <TableHead>Age/Gender</TableHead>
                      <TableHead>Vital Signs Status</TableHead>
                      <TableHead>Registration Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.map((patient: Patient) => {
                      const vitals = getPatientVitals(patient.id);
                      return (
                        <TableRow key={patient.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <div className="font-medium">{patient.firstName} {patient.lastName}</div>
                                <div className="text-sm text-gray-500">ID: {patient.patientId}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div>{new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} years</div>
                              <div className="text-sm text-gray-500">{patient.gender}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {vitals ? (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                <Activity className="w-3 h-3 mr-1" />
                                Vitals Complete
                              </Badge>
                            ) : (
                              <Badge variant="secondary">No Vitals</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDateTime(patient.registrationDate)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => setLocation(`/consultation/${patient.id}`)}
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <Stethoscope className="w-4 h-4 mr-1" />
                                Start Consultation
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Consultation History</span>
              </CardTitle>
              <CardDescription>
                Previous consultation records and patient visits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No History Available</h3>
                <p className="text-gray-500">Consultation history will appear here once consultations are completed.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}