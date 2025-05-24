import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  FileText, 
  Plus, 
  Search, 
  DollarSign, 
  CreditCard, 
  Smartphone,
  ClipboardList,
  Pill,
  Users
} from "lucide-react";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Patient, Billing, Appointment, Prescription, Medication } from "@shared/schema";
import DetailedServiceBill from "@/components/forms/detailed-service-bill";
import DischargeSummary from "@/components/forms/discharge-summary";
import PrescriptionForm from "@/components/forms/prescription-form";

const billSchema = z.object({
  patientId: z.number(),
  serviceType: z.string(),
  serviceDescription: z.string(),
  amount: z.string(),
  discount: z.string().optional(),
  totalAmount: z.string(),
  paymentStatus: z.enum(["pending", "paid", "cancelled"]),
  paymentMethod: z.string().optional(),
  insuranceClaimed: z.boolean().optional(),
  insuranceAmount: z.string().optional(),
  notes: z.string().optional(),
});

type BillFormData = z.infer<typeof billSchema>;

export default function ProfessionalBilling() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedBilling, setSelectedBilling] = useState<Billing | null>(null);
  const [showBillModal, setShowBillModal] = useState(false);
  const [showServiceBill, setShowServiceBill] = useState(false);
  const [showDischargeSummary, setShowDischargeSummary] = useState(false);
  const [showPrescription, setShowPrescription] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: patients = [] } = useQuery({
    queryKey: ["/api/patients"],
  });

  const { data: billingRecords = [] } = useQuery({
    queryKey: ["/api/billing"],
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ["/api/appointments"],
  });

  const { data: prescriptions = [] } = useQuery({
    queryKey: ["/api/prescriptions"],
  });

  const { data: medications = [] } = useQuery({
    queryKey: ["/api/medications"],
  });

  const form = useForm<BillFormData>({
    resolver: zodResolver(billSchema),
    defaultValues: {
      patientId: 0,
      serviceType: "",
      serviceDescription: "",
      amount: "",
      discount: "0.00",
      totalAmount: "",
      paymentStatus: "pending",
      paymentMethod: "",
      insuranceClaimed: false,
      insuranceAmount: "0.00",
      notes: "",
    },
  });

  const createBillMutation = useMutation({
    mutationFn: async (data: BillFormData) => {
      return await apiRequest("POST", "/api/billing", data);
    },
    onSuccess: () => {
      toast({
        title: "Bill Created",
        description: "New billing record has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/billing"] });
      setShowBillModal(false);
      form.reset();
    },
  });

  const updatePaymentMutation = useMutation({
    mutationFn: async ({ id, paymentMethod }: { id: number; paymentMethod: string }) => {
      return await apiRequest("PUT", `/api/billing/${id}`, {
        paymentStatus: "paid",
        paymentMethod,
        paymentDate: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      toast({
        title: "Payment Updated",
        description: "Payment status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/billing"] });
    },
  });

  const filteredBilling = billingRecords.filter((bill: Billing) => {
    const patient = patients.find((p: Patient) => p.id === bill.patientId);
    if (!searchQuery) return true;
    return (
      patient?.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient?.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient?.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.serviceType.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const onSubmit = (data: BillFormData) => {
    createBillMutation.mutate(data);
  };

  const calculateTotal = () => {
    const amount = parseFloat(form.watch("amount") || "0");
    const discount = parseFloat(form.watch("discount") || "0");
    const total = amount - discount;
    form.setValue("totalAmount", total.toFixed(2));
  };

  const handleViewServiceBill = (patient: Patient, bills: Billing[]) => {
    setSelectedPatient(patient);
    setSelectedBilling(bills[0]);
    setShowServiceBill(true);
  };

  const handleViewDischargeSummary = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowDischargeSummary(true);
  };

  const handleViewPrescription = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPrescription(true);
  };

  const getPatientBills = (patientId: number) => {
    return billingRecords.filter((bill: Billing) => bill.patientId === patientId);
  };

  const getPatientPrescriptions = (patientId: number) => {
    return prescriptions.filter((prescription: Prescription) => prescription.patientId === patientId);
  };

  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `CMH${year}${month}${day}${random}`;
  };

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Professional Billing System</h2>
            <p className="text-gray-600">Manage patient billing and generate professional medical documents</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search patients or services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Dialog open={showBillModal} onOpenChange={setShowBillModal}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Bill
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Bill</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="patientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Patient</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select patient" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {patients.map((patient: Patient) => (
                                <SelectItem key={patient.id} value={patient.id.toString()}>
                                  {patient.firstName} {patient.lastName} - {patient.patientId}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="serviceType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Service Type</FormLabel>
                            <Select onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select service" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Consultation">Consultation</SelectItem>
                                <SelectItem value="Admission">Admission Fee</SelectItem>
                                <SelectItem value="Bed Charges">Bed Charges</SelectItem>
                                <SelectItem value="Nursing">Nursing Fees</SelectItem>
                                <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                                <SelectItem value="Laboratory">Laboratory</SelectItem>
                                <SelectItem value="Therapy">Therapy Session</SelectItem>
                                <SelectItem value="Mental Health">Mental Health Services</SelectItem>
                                <SelectItem value="Rehabilitation">Rehabilitation Services</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01" 
                                placeholder="0.00" 
                                {...field} 
                                onChange={(e) => {
                                  field.onChange(e);
                                  calculateTotal();
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="serviceDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Detailed description of service provided"
                              className="resize-none"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="discount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Discount</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01" 
                                placeholder="0.00" 
                                {...field} 
                                onChange={(e) => {
                                  field.onChange(e);
                                  calculateTotal();
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="totalAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Total Amount</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" readOnly {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="paymentStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Payment Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <Button type="button" variant="outline" onClick={() => setShowBillModal(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createBillMutation.isPending}>
                        Create Bill
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Billing Records Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Patient Billing Records</h3>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Professional Documents</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBilling.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No billing records found</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredBilling.map((bill: Billing) => {
                const patient = patients.find((p: Patient) => p.id === bill.patientId);
                const patientBills = getPatientBills(bill.patientId);
                const patientPrescriptions = getPatientPrescriptions(bill.patientId);
                
                return (
                  <TableRow key={bill.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{patient?.firstName} {patient?.lastName}</p>
                        <p className="text-sm text-gray-500">ID: {patient?.patientId}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{bill.serviceType}</p>
                        <p className="text-sm text-gray-500">{bill.serviceDescription}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{formatCurrency(Number(bill.totalAmount))}</p>
                        {bill.discount && Number(bill.discount) > 0 && (
                          <p className="text-sm text-green-600">Discount: {formatCurrency(Number(bill.discount))}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={
                          bill.paymentStatus === "paid" 
                            ? "bg-green-100 text-green-800" 
                            : bill.paymentStatus === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {bill.paymentStatus.charAt(0).toUpperCase() + bill.paymentStatus.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{formatDateTime(bill.createdAt)}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => patient && handleViewServiceBill(patient, patientBills)}
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          Service Bill
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => patient && handleViewDischargeSummary(patient)}
                        >
                          <ClipboardList className="w-4 h-4 mr-1" />
                          Discharge
                        </Button>
                        {patientPrescriptions.length > 0 && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => patient && handleViewPrescription(patient)}
                          >
                            <Pill className="w-4 h-4 mr-1" />
                            Prescription
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {bill.paymentStatus === "pending" && (
                          <div className="flex space-x-1">
                            <Button 
                              size="sm" 
                              onClick={() => updatePaymentMutation.mutate({ id: bill.id, paymentMethod: "cash" })}
                            >
                              <DollarSign className="w-4 h-4 mr-1" />
                              Cash
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => updatePaymentMutation.mutate({ id: bill.id, paymentMethod: "card" })}
                            >
                              <CreditCard className="w-4 h-4 mr-1" />
                              Card
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => updatePaymentMutation.mutate({ id: bill.id, paymentMethod: "mobile" })}
                            >
                              <Smartphone className="w-4 h-4 mr-1" />
                              Mobile
                            </Button>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Professional Forms Modals */}
      {showServiceBill && selectedPatient && selectedBilling && (
        <Dialog open={showServiceBill} onOpenChange={setShowServiceBill}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
            <DetailedServiceBill
              patient={selectedPatient}
              billingRecords={getPatientBills(selectedPatient.id)}
              invoiceNumber={generateInvoiceNumber()}
              admissionDate={selectedPatient.registrationDate}
            />
          </DialogContent>
        </Dialog>
      )}

      {showDischargeSummary && selectedPatient && (
        <Dialog open={showDischargeSummary} onOpenChange={setShowDischargeSummary}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
            <DischargeSummary
              patient={selectedPatient}
              admissionDate={selectedPatient.registrationDate}
              dischargeDate={new Date().toISOString()}
              finalDiagnosis="Mental Health Assessment and Treatment Completed"
              admissionMode="VOLUNTARY"
              investigations="Mental Status Examination, Psychological Assessment"
              management="Comprehensive mental health treatment with counseling and medication therapy"
              dischargeInstructions="Continue prescribed medications, attend follow-up appointments, maintain healthy lifestyle"
              followUpAppointments="Follow-up appointment scheduled in 2 weeks"
              doctorName="Dr. Mental Health Specialist"
            />
          </DialogContent>
        </Dialog>
      )}

      {showPrescription && selectedPatient && (
        <Dialog open={showPrescription} onOpenChange={setShowPrescription}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
            <PrescriptionForm
              patient={selectedPatient}
              prescriptions={getPatientPrescriptions(selectedPatient.id)}
              medications={medications}
              doctorName="Dr. Mental Health Specialist"
              clinicDate={new Date().toISOString()}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}