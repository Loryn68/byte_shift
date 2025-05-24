import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { insertBillingSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Search, Filter, DollarSign, CreditCard, Loader2, Receipt, Printer } from "lucide-react";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import ItemizedBillModal from "@/components/invoice/itemized-bill-modal";
import type { Billing, Patient, Appointment } from "@shared/schema";

const billingFormSchema = insertBillingSchema.extend({
  discountPercentage: z.number().min(0).max(100).optional(),
});

type BillingFormData = z.infer<typeof billingFormSchema>;

export default function BillingPage() {
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [showItemizedBillModal, setShowItemizedBillModal] = useState(false);
  const [selectedBilling, setSelectedBilling] = useState<Billing | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("bills");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: billingRecords = [], isLoading } = useQuery({
    queryKey: ["/api/billing"],
  });

  const { data: patients = [] } = useQuery({
    queryKey: ["/api/patients"],
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ["/api/appointments"],
  });

  const form = useForm<BillingFormData>({
    resolver: zodResolver(billingFormSchema),
    defaultValues: {
      patientId: 0,
      serviceType: "",
      serviceDescription: "",
      amount: "0",
      discount: "0",
      totalAmount: "0",
      paymentStatus: "pending",
      paymentMethod: "",
      insuranceClaimed: false,
      insuranceAmount: "0",
      notes: "",
    },
  });

  const createBillingMutation = useMutation({
    mutationFn: async (data: BillingFormData) => {
      const { discountPercentage, ...billingData } = data;
      return await apiRequest("POST", "/api/billing", billingData);
    },
    onSuccess: async (response) => {
      const billing = await response.json();
      toast({
        title: "Bill Created",
        description: `Bill ${billing.billId} has been created successfully.`,
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/billing"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      
      form.reset();
      setShowBillingModal(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to Create Bill",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateBillingMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Billing> }) => {
      return await apiRequest("PUT", `/api/billing/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/billing"] });
      toast({
        title: "Payment Updated",
        description: "Payment status has been updated successfully.",
      });
    },
  });

  const onSubmit = (data: BillingFormData) => {
    createBillingMutation.mutate(data);
  };

  const handlePaymentUpdate = (billingId: number, paymentStatus: string, paymentMethod?: string) => {
    const updateData: Partial<Billing> = { 
      paymentStatus,
      ...(paymentMethod && { paymentMethod }),
      ...(paymentStatus === "paid" && { paymentDate: new Date() })
    };
    
    updateBillingMutation.mutate({ id: billingId, data: updateData });
  };

  const calculateTotal = () => {
    const amount = Number(form.watch("amount")) || 0;
    const discount = Number(form.watch("discount")) || 0;
    const total = amount - discount;
    form.setValue("totalAmount", total.toString());
    return total;
  };

  // Watch amount and discount to auto-calculate total
  const watchedAmount = form.watch("amount");
  const watchedDiscount = form.watch("discount");
  
  React.useEffect(() => {
    calculateTotal();
  }, [watchedAmount, watchedDiscount]);

  const filteredBillingRecords = billingRecords.filter((record: Billing) => {
    const matchesSearch = !searchQuery || 
      record.billId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.serviceDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patients.find((p: Patient) => p.id === record.patientId)?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patients.find((p: Patient) => p.id === record.patientId)?.lastName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || record.paymentStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getPatientName = (patientId: number) => {
    const patient = patients.find((p: Patient) => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : "Unknown Patient";
  };

  const handlePrintInvoice = (billing: Billing) => {
    const patient = patients.find((p: Patient) => p.id === billing.patientId);
    if (patient) {
      setSelectedBilling(billing);
      setSelectedPatient(patient);
      setShowItemizedBillModal(true);
    } else {
      toast({
        title: "Error",
        description: "Patient information not found.",
        variant: "destructive",
      });
    }
  };

  const getTotalRevenue = () => {
    return billingRecords
      .filter((record: Billing) => record.paymentStatus === "paid")
      .reduce((sum: number, record: Billing) => sum + Number(record.totalAmount), 0);
  };

  const getPendingAmount = () => {
    return billingRecords
      .filter((record: Billing) => record.paymentStatus === "pending")
      .reduce((sum: number, record: Billing) => sum + Number(record.totalAmount), 0);
  };

  const getOverdueAmount = () => {
    // For demo purposes, consider bills older than 30 days as overdue
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return billingRecords
      .filter((record: Billing) => 
        record.paymentStatus === "pending" && 
        new Date(record.createdAt) < thirtyDaysAgo
      )
      .reduce((sum: number, record: Billing) => sum + Number(record.totalAmount), 0);
  };

  const serviceTypes = ["Consultation", "Laboratory", "Pharmacy", "Procedure", "Emergency", "Surgery"];
  const paymentMethods = ["Cash", "Credit Card", "Debit Card", "Bank Transfer", "Insurance", "Check"];

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Billing & Finance</h2>
            <p className="text-gray-600">Manage patient billing, payments, and financial records</p>
          </div>
          <Dialog open={showBillingModal} onOpenChange={setShowBillingModal}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-white hover:bg-blue-700 flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Create Bill</span>
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
                        <FormLabel>Patient *</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select patient" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {patients.map((patient: Patient) => (
                              <SelectItem key={patient.id} value={patient.id.toString()}>
                                {patient.firstName} {patient.lastName} ({patient.patientId})
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
                          <FormLabel>Service Type *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select service type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {serviceTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="appointmentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Related Appointment</FormLabel>
                          <Select onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select appointment (optional)" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">No appointment</SelectItem>
                              {appointments.map((appointment: Appointment) => (
                                <SelectItem key={appointment.id} value={appointment.id.toString()}>
                                  {appointment.appointmentId} - {appointment.department}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                        <FormLabel>Service Description *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Detailed description of services provided"
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
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
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
                            />
                          </FormControl>
                          <FormMessage />
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
                            <Input 
                              type="number" 
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              disabled
                              className="bg-gray-50"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="insuranceClaimed"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Insurance Claim</FormLabel>
                          <Select onValueChange={(value) => field.onChange(value === "true")}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Insurance claimed?" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="false">No</SelectItem>
                              <SelectItem value="true">Yes</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {form.watch("insuranceClaimed") && (
                      <FormField
                        control={form.control}
                        name="insuranceAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Insurance Amount</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01"
                                placeholder="0.00"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Additional notes or comments"
                            className="resize-none"
                            rows={2}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setShowBillingModal(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createBillingMutation.isPending}>
                      {createBillingMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Bill"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(getTotalRevenue())}</p>
              <p className="text-sm text-green-600 mt-1">Paid bills</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="text-green-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Payments</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(getPendingAmount())}</p>
              <p className="text-sm text-yellow-600 mt-1">Awaiting payment</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Receipt className="text-yellow-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(getOverdueAmount())}</p>
              <p className="text-sm text-red-600 mt-1">Past due date</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <FileText className="text-red-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bills</p>
              <p className="text-2xl font-bold text-gray-900">{billingRecords.length}</p>
              <p className="text-sm text-gray-600 mt-1">All time</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <CreditCard className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search bills by ID, patient name, or service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>More Filters</span>
          </Button>
        </div>
      </div>

      {/* Billing Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Billing Records ({filteredBillingRecords.length})
          </h3>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bill ID</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 9 }).map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filteredBillingRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="text-gray-500">
                    {searchQuery || statusFilter !== "all" 
                      ? "No billing records found matching your criteria" 
                      : "No billing records created yet"
                    }
                  </div>
                  <Button 
                    onClick={() => setShowBillingModal(true)}
                    className="mt-2" 
                    size="sm"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Create First Bill
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              filteredBillingRecords.map((record: Billing) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium text-primary">
                    {record.billId}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{getPatientName(record.patientId)}</p>
                      <p className="text-sm text-gray-500">
                        {patients.find((p: Patient) => p.id === record.patientId)?.patientId}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{record.serviceType}</p>
                      <p className="text-sm text-gray-500 truncate max-w-32">
                        {record.serviceDescription}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{formatCurrency(Number(record.amount))}</TableCell>
                  <TableCell>{formatCurrency(Number(record.discount))}</TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(Number(record.totalAmount))}
                  </TableCell>
                  <TableCell>{formatDate(record.createdAt)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(record.paymentStatus)}>
                      {record.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {record.paymentStatus === "pending" && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handlePaymentUpdate(record.id, "paid", "cash")}
                        >
                          Mark Paid
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
