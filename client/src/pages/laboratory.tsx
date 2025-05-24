import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { insertLabTestSchema } from "@shared/schema";
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
import { FlaskRound, Search, Filter, FileText, Loader2, TestTube } from "lucide-react";
import { formatDateTime, getStatusColor } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { LabTest, Patient, User } from "@shared/schema";

const formSchema = insertLabTestSchema;
type FormData = z.infer<typeof formSchema>;

const resultFormSchema = z.object({
  results: z.string().min(1, "Results are required"),
  normalRange: z.string().optional(),
});
type ResultFormData = z.infer<typeof resultFormSchema>;

export default function Laboratory() {
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: labTests = [], isLoading } = useQuery({
    queryKey: ["/api/lab-tests"],
  });

  const { data: patients = [] } = useQuery({
    queryKey: ["/api/patients"],
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
    queryFn: () => {
      // Mock users - in production this would be a real API
      return Promise.resolve([
        { id: 1, firstName: "Sarah", lastName: "Johnson", role: "admin" },
        { id: 2, firstName: "Michael", lastName: "Chen", role: "doctor" },
        { id: 3, firstName: "Emily", lastName: "Davis", role: "doctor" },
      ]);
    }
  });

  const orderForm = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: 0,
      appointmentId: undefined,
      testName: "",
      testType: "",
      orderedBy: 1, // Default to current user
      status: "ordered",
      urgency: "routine",
      notes: "",
    },
  });

  const resultForm = useForm<ResultFormData>({
    resolver: zodResolver(resultFormSchema),
    defaultValues: {
      results: "",
      normalRange: "",
    },
  });

  const createLabTestMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return await apiRequest("POST", "/api/lab-tests", data);
    },
    onSuccess: async (response) => {
      const labTest = await response.json();
      toast({
        title: "Lab Test Ordered",
        description: `Test ${labTest.testId} has been ordered successfully.`,
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/lab-tests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      
      orderForm.reset();
      setShowOrderModal(false);
    },
    onError: (error) => {
      toast({
        title: "Order Failed",
        description: error.message || "Failed to order lab test. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateLabTestMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<LabTest> }) => {
      return await apiRequest("PUT", `/api/lab-tests/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lab-tests"] });
      toast({
        title: "Lab Test Updated",
        description: "Test results have been updated successfully.",
      });
      setShowResultModal(false);
      setSelectedTest(null);
      resultForm.reset();
    },
  });

  const onOrderSubmit = (data: FormData) => {
    createLabTestMutation.mutate(data);
  };

  const onResultSubmit = (data: ResultFormData) => {
    if (!selectedTest) return;
    
    updateLabTestMutation.mutate({
      id: selectedTest.id,
      data: {
        ...data,
        status: "completed",
        resultDate: new Date(),
      }
    });
  };

  const handleStatusUpdate = (testId: number, newStatus: string) => {
    const updateData: Partial<LabTest> = { status: newStatus };
    
    if (newStatus === "collected") {
      updateData.sampleCollectedDate = new Date();
    } else if (newStatus === "processing") {
      updateData.sampleCollectedDate = new Date();
    }
    
    updateLabTestMutation.mutate({ id: testId, data: updateData });
  };

  const openResultModal = (test: LabTest) => {
    setSelectedTest(test);
    resultForm.setValue("results", test.results || "");
    resultForm.setValue("normalRange", test.normalRange || "");
    setShowResultModal(true);
  };

  const filteredLabTests = labTests.filter((test: LabTest) => {
    const matchesSearch = !searchQuery || 
      test.testId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patients.find((p: Patient) => p.id === test.patientId)?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patients.find((p: Patient) => p.id === test.patientId)?.lastName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || test.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getPatientName = (patientId: number) => {
    const patient = patients.find((p: Patient) => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : "Unknown Patient";
  };

  const getOrderedByName = (orderedBy: number) => {
    const user = users.find((u: User) => u.id === orderedBy);
    return user ? `Dr. ${user.firstName} ${user.lastName}` : "Unknown Doctor";
  };

  const testTypes = ["Blood", "Urine", "Imaging", "Biopsy", "Culture", "Serology", "Chemistry"];
  const commonTests = [
    "Complete Blood Count (CBC)",
    "Basic Metabolic Panel (BMP)",
    "Lipid Panel",
    "Liver Function Tests",
    "Thyroid Function Tests",
    "Urinalysis",
    "Chest X-Ray",
    "Echocardiogram",
    "Blood Culture",
    "COVID-19 Test"
  ];

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Laboratory</h2>
            <p className="text-gray-600">Manage lab test orders, samples, and results</p>
          </div>
          <Dialog open={showOrderModal} onOpenChange={setShowOrderModal}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-white hover:bg-blue-700 flex items-center space-x-2">
                <FlaskRound className="w-4 h-4" />
                <span>Order Lab Test</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Order New Lab Test</DialogTitle>
              </DialogHeader>
              
              <Form {...orderForm}>
                <form onSubmit={orderForm.handleSubmit(onOrderSubmit)} className="space-y-4">
                  <FormField
                    control={orderForm.control}
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
                      control={orderForm.control}
                      name="testName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Test Name *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select test" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {commonTests.map((test) => (
                                <SelectItem key={test} value={test}>
                                  {test}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={orderForm.control}
                      name="testType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Test Type *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {testTypes.map((type) => (
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
                  </div>

                  <FormField
                    control={orderForm.control}
                    name="urgency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Urgency *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select urgency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="routine">Routine</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                            <SelectItem value="stat">STAT</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={orderForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Instructions</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any special instructions for the lab"
                            className="resize-none"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setShowOrderModal(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createLabTestMutation.isPending}>
                      {createLabTestMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Ordering...
                        </>
                      ) : (
                        "Order Test"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search tests by ID, patient name, or test name..."
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
              <SelectItem value="ordered">Ordered</SelectItem>
              <SelectItem value="collected">Collected</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>More Filters</span>
          </Button>
        </div>
      </div>

      {/* Lab Tests Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Lab Tests ({filteredLabTests.length})
          </h3>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Test ID</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Test Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Ordered By</TableHead>
              <TableHead>Order Date</TableHead>
              <TableHead>Urgency</TableHead>
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
            ) : filteredLabTests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="text-gray-500">
                    {searchQuery || statusFilter !== "all" 
                      ? "No lab tests found matching your criteria" 
                      : "No lab tests ordered yet"
                    }
                  </div>
                  <Button 
                    onClick={() => setShowOrderModal(true)}
                    className="mt-2" 
                    size="sm"
                  >
                    <FlaskRound className="w-4 h-4 mr-2" />
                    Order First Test
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              filteredLabTests.map((test: LabTest) => (
                <TableRow key={test.id}>
                  <TableCell className="font-medium text-primary">
                    {test.testId}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{getPatientName(test.patientId)}</p>
                      <p className="text-sm text-gray-500">
                        {patients.find((p: Patient) => p.id === test.patientId)?.patientId}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{test.testName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{test.testType}</Badge>
                  </TableCell>
                  <TableCell>{getOrderedByName(test.orderedBy)}</TableCell>
                  <TableCell>{formatDateTime(test.orderDate)}</TableCell>
                  <TableCell>
                    <Badge className={
                      test.urgency === "stat" ? "bg-red-100 text-red-800" :
                      test.urgency === "urgent" ? "bg-orange-100 text-orange-800" :
                      "bg-gray-100 text-gray-800"
                    }>
                      {test.urgency.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(test.status)}>
                      {test.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {test.status === "ordered" && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleStatusUpdate(test.id, "collected")}
                        >
                          Collect Sample
                        </Button>
                      )}
                      {test.status === "collected" && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleStatusUpdate(test.id, "processing")}
                        >
                          Start Processing
                        </Button>
                      )}
                      {(test.status === "processing" || test.status === "completed") && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openResultModal(test)}
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          {test.status === "completed" ? "View Results" : "Enter Results"}
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

      {/* Results Entry Modal */}
      <Dialog open={showResultModal} onOpenChange={setShowResultModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedTest?.status === "completed" ? "View Test Results" : "Enter Test Results"}
            </DialogTitle>
          </DialogHeader>
          
          {selectedTest && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Test Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Test ID:</span>
                    <span className="ml-2 font-medium">{selectedTest.testId}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Patient:</span>
                    <span className="ml-2 font-medium">{getPatientName(selectedTest.patientId)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Test:</span>
                    <span className="ml-2 font-medium">{selectedTest.testName}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Type:</span>
                    <span className="ml-2 font-medium">{selectedTest.testType}</span>
                  </div>
                </div>
              </div>

              <Form {...resultForm}>
                <form onSubmit={resultForm.handleSubmit(onResultSubmit)} className="space-y-4">
                  <FormField
                    control={resultForm.control}
                    name="results"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Test Results *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter detailed test results..."
                            className="resize-none"
                            rows={6}
                            {...field}
                            disabled={selectedTest.status === "completed"}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={resultForm.control}
                    name="normalRange"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Normal Range/Reference Values</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., 70-100 mg/dL"
                            {...field}
                            disabled={selectedTest.status === "completed"}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {selectedTest.status !== "completed" && (
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setShowResultModal(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={updateLabTestMutation.isPending}>
                        {updateLabTestMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Results"
                        )}
                      </Button>
                    </div>
                  )}
                </form>
              </Form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
