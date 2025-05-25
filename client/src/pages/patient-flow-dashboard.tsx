import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  Clock, 
  CreditCard, 
  Stethoscope, 
  FlaskConical, 
  Pill,
  FileText,
  CheckCircle,
  AlertCircle,
  ArrowRight
} from "lucide-react";
import { workflowManager } from "@/lib/workflow-system";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";

interface PatientFlowItem {
  patientId: number;
  patientName: string;
  episodeNumber: string;
  episodeType: string;
  status: string;
  registrationTime: string;
  consultationFee: number;
  feesPaid: boolean;
  currentStep: string;
  nextAction: string;
}

export default function PatientFlowDashboard() {
  const [patients, setPatients] = useState<PatientFlowItem[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [transactionRef, setTransactionRef] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    loadPatientFlow();
  }, []);

  const loadPatientFlow = async () => {
    try {
      const episodes = workflowManager.getStoredEpisodes();
      const patientFlowData: PatientFlowItem[] = [];

      for (const episode of episodes) {
        if (episode.status !== 'completed') {
          // Get patient details from API
          const response = await fetch(`/api/patients/${episode.patientId}`);
          const patient = await response.json();
          
          patientFlowData.push({
            patientId: episode.patientId,
            patientName: `${patient.firstName} ${patient.lastName}`,
            episodeNumber: episode.episodeNumber,
            episodeType: episode.episodeType,
            status: episode.status,
            registrationTime: episode.registrationDate,
            consultationFee: episode.consultationFee,
            feesPaid: episode.feesPaid,
            currentStep: getCurrentStep(episode.status, episode.feesPaid),
            nextAction: getNextAction(episode.status, episode.feesPaid)
          });
        }
      }

      setPatients(patientFlowData);
    } catch (error) {
      console.error('Failed to load patient flow:', error);
    }
  };

  const getCurrentStep = (status: string, feesPaid: boolean) => {
    if (!feesPaid) return "Payment Pending";
    switch (status) {
      case 'registered': return "Payment Required";
      case 'in-queue': return "In Queue";
      case 'in-consultation': return "With Doctor";
      case 'treatment': return "Services/Treatment";
      case 'billing': return "Final Billing";
      default: return "Unknown";
    }
  };

  const getNextAction = (status: string, feesPaid: boolean) => {
    if (!feesPaid) return "Pay Consultation Fee";
    switch (status) {
      case 'registered': return "Add to Queue";
      case 'in-queue': return "Call for Consultation";
      case 'in-consultation': return "Complete Consultation";
      case 'treatment': return "Complete Services";
      case 'billing': return "Process Payment";
      default: return "No Action";
    }
  };

  const handlePayment = async (episodeNumber: string) => {
    if (!paymentMethod) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await workflowManager.payConsultationFee(
        episodeNumber, 
        paymentMethod, 
        transactionRef
      );
      
      toast({
        title: "Payment Successful",
        description: result.message
      });
      
      // Add to outpatient queue
      await workflowManager.addToOutpatientQueue(episodeNumber);
      
      loadPatientFlow(); // Refresh the data
      setSelectedPayment("");
      setPaymentMethod("");
      setTransactionRef("");
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "Payment processing failed",
        variant: "destructive"
      });
    }
  };

  const handleCallForConsultation = async (episodeNumber: string) => {
    try {
      await workflowManager.startConsultation(episodeNumber, 1); // Doctor ID 1
      toast({
        title: "Consultation Started",
        description: "Patient has been called for consultation"
      });
      loadPatientFlow();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start consultation",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string, feesPaid: boolean) => {
    if (!feesPaid) return <CreditCard className="h-5 w-5 text-red-500" />;
    switch (status) {
      case 'in-queue': return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'in-consultation': return <Stethoscope className="h-5 w-5 text-blue-500" />;
      case 'treatment': return <FlaskConical className="h-5 w-5 text-purple-500" />;
      case 'billing': return <FileText className="h-5 w-5 text-green-500" />;
      default: return <Users className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string, feesPaid: boolean) => {
    if (!feesPaid) return "bg-red-100 text-red-800";
    switch (status) {
      case 'in-queue': return "bg-yellow-100 text-yellow-800";
      case 'in-consultation': return "bg-blue-100 text-blue-800";
      case 'treatment': return "bg-purple-100 text-purple-800";
      case 'billing': return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patient Flow Dashboard</h1>
          <p className="text-gray-600">Real-time patient workflow management based on Kranium HIMS model</p>
        </div>
        <Button onClick={loadPatientFlow} variant="outline">
          Refresh Data
        </Button>
      </div>

      {/* Flow Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Pending</CardTitle>
            <CreditCard className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {patients.filter(p => !p.feesPaid).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Queue</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {patients.filter(p => p.status === 'in-queue').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Consultation</CardTitle>
            <Stethoscope className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {patients.filter(p => p.status === 'in-consultation').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Treatment</CardTitle>
            <FlaskConical className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {patients.filter(p => p.status === 'treatment').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Active</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patients.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Patient Flow List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Patient Episodes</CardTitle>
          <CardDescription>
            Real-time view of all active patient episodes and their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {patients.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No active patient episodes
              </div>
            ) : (
              patients.map((patient) => (
                <div key={patient.episodeNumber} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(patient.status, patient.feesPaid)}
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{patient.patientName}</h3>
                          <Badge variant="outline">{patient.episodeNumber}</Badge>
                          <Badge className={getStatusColor(patient.status, patient.feesPaid)}>
                            {patient.currentStep}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          <span className="capitalize">{patient.episodeType}</span> • 
                          Registered: {formatDate(patient.registrationTime)} • 
                          Fee: Ksh.{patient.consultationFee}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {!patient.feesPaid ? (
                        <div className="flex items-center space-x-2">
                          {selectedPayment === patient.episodeNumber ? (
                            <div className="flex items-center space-x-2">
                              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                <SelectTrigger className="w-40">
                                  <SelectValue placeholder="Payment method" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="cash">Cash</SelectItem>
                                  <SelectItem value="card">Card</SelectItem>
                                  <SelectItem value="mpesa">M-Pesa</SelectItem>
                                  <SelectItem value="insurance">Insurance</SelectItem>
                                </SelectContent>
                              </Select>
                              {paymentMethod !== 'cash' && (
                                <Input
                                  placeholder="Transaction ref"
                                  value={transactionRef}
                                  onChange={(e) => setTransactionRef(e.target.value)}
                                  className="w-32"
                                />
                              )}
                              <Button 
                                size="sm" 
                                onClick={() => handlePayment(patient.episodeNumber)}
                              >
                                Pay
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => setSelectedPayment("")}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button 
                              size="sm" 
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => setSelectedPayment(patient.episodeNumber)}
                            >
                              <CreditCard className="h-4 w-4 mr-2" />
                              Pay Fee (Ksh.{patient.consultationFee})
                            </Button>
                          )}
                        </div>
                      ) : patient.status === 'in-queue' ? (
                        <Button 
                          size="sm" 
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={() => handleCallForConsultation(patient.episodeNumber)}
                        >
                          <Stethoscope className="h-4 w-4 mr-2" />
                          Call for Consultation
                        </Button>
                      ) : (
                        <div className="flex items-center text-sm text-gray-600">
                          <ArrowRight className="h-4 w-4 mr-1" />
                          {patient.nextAction}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}