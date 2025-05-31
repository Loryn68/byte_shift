import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Search, RefreshCw, FileText, Calculator, Receipt, Users, Clock, Settings, CreditCard, DollarSign, TrendingUp, AlertCircle, Plus, Edit3, Trash2, Eye, Download, Printer } from "lucide-react";

export default function BillingInvoicing() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("search");
  const [filterByDate, setFilterByDate] = useState(false);
  const [includeAdmDay, setIncludeAdmDay] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [notes, setNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock data for demonstration
  const mockPatients = [
    { id: 1, fullName: "John Doe", fileNo: "P001", opNumber: "OP001", age: 25, phone: "0712345678" },
    { id: 2, fullName: "Jane Smith", fileNo: "P002", opNumber: "OP002", age: 30, phone: "0787654321" },
    { id: 3, fullName: "Mary Johnson", fileNo: "P003", opNumber: "OP003", age: 28, phone: "0798765432" },
  ];

  const mockBillingItems = [
    {
      id: 1,
      item: "General Consultation",
      quantity: 1,
      sellingPrice: 2500,
      totalCost: 2500,
      paid: 2500,
      waived: 0,
      balance: 0,
      status: "paid"
    },
    {
      id: 2,
      item: "Laboratory Test - CBC",
      quantity: 1,
      sellingPrice: 1500,
      totalCost: 1500,
      paid: 0,
      waived: 0,
      balance: 1500,
      status: "pending"
    }
  ];

  const handlePatientSearch = () => {
    if (searchQuery.length < 3) {
      toast({
        title: "Search Error",
        description: "Please enter at least 3 characters to search",
        variant: "destructive",
      });
      return;
    }
    // Simulate search
    const found = mockPatients.find(p => 
      p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.fileNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.opNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery)
    );
    
    if (found) {
      setSelectedPatient(found);
      toast({
        title: "Patient Found",
        description: `Selected patient: ${found.fullName}`,
      });
    } else {
      toast({
        title: "No Patient Found",
        description: "No patient matches your search criteria",
        variant: "destructive",
      });
    }
  };

  const handlePayment = async () => {
    if (!selectedPatient) {
      toast({
        title: "No Patient Selected",
        description: "Please select a patient to process payment",
        variant: "destructive",
      });
      return;
    }

    if (!paymentMethod) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: "Payment Processed",
        description: "Payment has been successfully recorded",
      });
    }, 2000);
  };

  const handleItemSelection = (itemId: number) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const calculateTotals = () => {
    const items = selectedPatient ? mockBillingItems : [];
    return {
      totalBill: items.reduce((sum, item) => sum + item.totalCost, 0),
      totalPaid: items.reduce((sum, item) => sum + item.paid, 0),
      totalWaived: items.reduce((sum, item) => sum + item.waived, 0),
      totalBalance: items.reduce((sum, item) => sum + item.balance, 0),
    };
  };

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <CreditCard className="h-8 w-8 text-blue-600" />
              Billing & Invoicing
            </h1>
            <p className="text-gray-600 mt-1">Comprehensive patient billing and payment management system</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="px-3 py-1">
              <TrendingUp className="h-4 w-4 mr-1" />
              Active Session
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="col-span-4 space-y-6">
            {/* Search Panel */}
            <Card className="shadow-lg border-l-4 border-l-blue-500">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Search className="h-5 w-5 text-blue-600" />
                  Patient Search
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Search by Surname/ID/Tel/OP No.
                  </Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Enter patient details..."
                      className="flex-1"
                      onKeyPress={(e) => e.key === 'Enter' && handlePatientSearch()}
                    />
                    <Button 
                      onClick={handlePatientSearch}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="filterDate" 
                      checked={filterByDate}
                      onCheckedChange={(checked) => setFilterByDate(checked === true)}
                    />
                    <Label htmlFor="filterDate" className="text-sm">Filter by date range</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="includeAdm" 
                      checked={includeAdmDay}
                      onCheckedChange={(checked) => setIncludeAdmDay(checked === true)}
                    />
                    <Label htmlFor="includeAdm" className="text-sm">Include admission day</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Patient Details */}
            <Card className="shadow-lg border-l-4 border-l-green-500">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-green-600" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedPatient ? (
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-medium text-gray-600">Full Name:</span>
                      <span className="font-semibold">{selectedPatient.fullName}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-medium text-gray-600">File No.:</span>
                      <span>{selectedPatient.fileNo}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-medium text-gray-600">OP Number:</span>
                      <span>{selectedPatient.opNumber}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="font-medium text-gray-600">Age:</span>
                      <span>{selectedPatient.age} years</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No patient selected</p>
                    <p className="text-sm">Search and select a patient to view details</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card className="shadow-lg border-l-4 border-l-orange-500">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calculator className="h-5 w-5 text-orange-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={handlePayment}
                    disabled={!selectedPatient || isProcessing}
                    className="bg-green-600 hover:bg-green-700 h-12"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Payment
                  </Button>
                  <Button variant="outline" className="h-12">
                    <Receipt className="h-4 w-4 mr-2" />
                    Invoice
                  </Button>
                  <Button variant="outline" className="h-12">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Button variant="outline" className="h-12">
                    <FileText className="h-4 w-4 mr-2" />
                    Reports
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Main Content */}
          <div className="col-span-8 space-y-6">
            {/* Billing Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Bill</p>
                      <p className="text-2xl font-bold text-gray-900">
                        KSh {selectedPatient ? totals.totalBill.toLocaleString() : '0'}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Paid</p>
                      <p className="text-2xl font-bold text-green-600">
                        KSh {selectedPatient ? totals.totalPaid.toLocaleString() : '0'}
                      </p>
                    </div>
                    <CreditCard className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-orange-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Balance</p>
                      <p className="text-2xl font-bold text-orange-600">
                        KSh {selectedPatient ? totals.totalBalance.toLocaleString() : '0'}
                      </p>
                    </div>
                    <AlertCircle className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Payment Method</p>
                      <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                        <SelectTrigger className="w-full mt-1">
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="card">Card</SelectItem>
                          <SelectItem value="insurance">Insurance</SelectItem>
                          <SelectItem value="mobile">Mobile Money</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Billing Content */}
            <Card className="shadow-lg">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                <div className="border-b bg-gray-50 px-6 py-3">
                  <TabsList className="grid w-full grid-cols-6 bg-white">
                    <TabsTrigger value="search" className="text-sm">Search By Patient</TabsTrigger>
                    <TabsTrigger value="admitted" className="text-sm">Admitted Patients</TabsTrigger>
                    <TabsTrigger value="history" className="text-sm">History</TabsTrigger>
                    <TabsTrigger value="settings" className="text-sm">Settings</TabsTrigger>
                    <TabsTrigger value="gatepass" className="text-sm">Gate Pass</TabsTrigger>
                    <TabsTrigger value="discharge" className="text-sm">Discharge</TabsTrigger>
                  </TabsList>
                </div>

                {/* Search By Patient Tab */}
                <TabsContent value="search" className="p-6 space-y-6">
                  {selectedPatient ? (
                    <>
                      {/* Billing Items Table */}
                      <Card>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Billing Items - {selectedPatient.fullName}</CardTitle>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Item
                              </Button>
                              <Button size="sm" variant="outline">
                                <Download className="h-4 w-4 mr-2" />
                                Export
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="border rounded-lg overflow-hidden">
                            <Table>
                              <TableHeader className="bg-gray-50">
                                <TableRow>
                                  <TableHead className="w-12">
                                    <Checkbox />
                                  </TableHead>
                                  <TableHead className="font-semibold">Item Description</TableHead>
                                  <TableHead className="text-center font-semibold">Qty</TableHead>
                                  <TableHead className="text-center font-semibold">Unit Price</TableHead>
                                  <TableHead className="text-center font-semibold">Total Cost</TableHead>
                                  <TableHead className="text-center font-semibold">Paid</TableHead>
                                  <TableHead className="text-center font-semibold">Balance</TableHead>
                                  <TableHead className="text-center font-semibold">Status</TableHead>
                                  <TableHead className="text-center font-semibold">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {mockBillingItems.map((item: any) => (
                                  <TableRow key={item.id} className="hover:bg-gray-50">
                                    <TableCell>
                                      <Checkbox 
                                        checked={selectedItems.includes(item.id)}
                                        onCheckedChange={() => handleItemSelection(item.id)}
                                      />
                                    </TableCell>
                                    <TableCell className="font-medium">{item.item}</TableCell>
                                    <TableCell className="text-center">{item.quantity}</TableCell>
                                    <TableCell className="text-center">KSh {item.sellingPrice.toLocaleString()}</TableCell>
                                    <TableCell className="text-center font-semibold">KSh {item.totalCost.toLocaleString()}</TableCell>
                                    <TableCell className="text-center text-green-600 font-semibold">KSh {item.paid.toLocaleString()}</TableCell>
                                    <TableCell className="text-center text-orange-600 font-semibold">KSh {item.balance.toLocaleString()}</TableCell>
                                    <TableCell className="text-center">
                                      <Badge variant={item.status === 'paid' ? 'default' : 'secondary'} 
                                             className={item.status === 'paid' ? 'bg-green-600' : 'bg-orange-600'}>
                                        {item.status}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                      <div className="flex gap-1 justify-center">
                                        <Button size="sm" variant="ghost">
                                          <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button size="sm" variant="ghost">
                                          <Edit3 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                            
                            {/* Footer Totals */}
                            <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 border-t">
                              <div className="flex justify-between items-center">
                                <div className="flex gap-6 text-sm font-medium">
                                  <span>Totals:</span>
                                  <span>Bill: KSh {totals.totalBill.toLocaleString()}</span>
                                </div>
                                <div className="flex gap-6 text-sm font-medium">
                                  <span>Paid: <Badge className="bg-green-600">KSh {totals.totalPaid.toLocaleString()}</Badge></span>
                                  <span>Waived: <Badge className="bg-gray-600">KSh {totals.totalWaived.toLocaleString()}</Badge></span>
                                  <span>Balance: <Badge className="bg-orange-600">KSh {totals.totalBalance.toLocaleString()}</Badge></span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  ) : (
                    <div className="text-center py-16">
                      <AlertCircle className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Patient Selected</h3>
                      <p className="text-gray-500 mb-6">Search for a patient to view and manage their billing information</p>
                      <Button 
                        onClick={() => document.querySelector<HTMLInputElement>('[placeholder="Enter patient details..."]')?.focus()}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Search className="h-4 w-4 mr-2" />
                        Start Patient Search
                      </Button>
                    </div>
                  )}
                </TabsContent>

                {/* Other Tabs */}
                <TabsContent value="admitted" className="p-6">
                  <div className="text-center py-16">
                    <Users className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Admitted Patients</h3>
                    <p className="text-gray-500">Billing management for currently admitted patients</p>
                  </div>
                </TabsContent>

                <TabsContent value="history" className="p-6">
                  <div className="text-center py-16">
                    <Clock className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Admission History</h3>
                    <p className="text-gray-500">Historical billing and admission records</p>
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="p-6">
                  <div className="text-center py-16">
                    <Settings className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Billing Settings</h3>
                    <p className="text-gray-500">Configure automatic billing and payment settings</p>
                  </div>
                </TabsContent>

                <TabsContent value="gatepass" className="p-6">
                  <div className="text-center py-16">
                    <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Gate Pass Management</h3>
                    <p className="text-gray-500">Issue and manage patient gate passes</p>
                  </div>
                </TabsContent>

                <TabsContent value="discharge" className="p-6">
                  <div className="text-center py-16">
                    <Receipt className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Discharge Queue</h3>
                    <p className="text-gray-500">Final billing and discharge processing</p>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}