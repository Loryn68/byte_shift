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

  const { toast } = useToast();

  // Mock data for demonstration
  const mockPatients = [
    { id: 1, fullName: "John Doe", fileNo: "P001", opNumber: "OP001", age: 25, phone: "0712345678" },
    { id: 2, fullName: "Jane Smith", fileNo: "P002", opNumber: "OP002", age: 30, phone: "0787654321" },
    { id: 3, fullName: "Mary Johnson", fileNo: "P003", opNumber: "OP003", age: 28, phone: "0798765432" },
  ];

  const mockBillingItems = [
    {
      id: 1,
      item: "Consultation Fee",
      quantity: 1,
      sellingPrice: 2500,
      totalCost: 2500,
      paid: 2500,
      waived: 0,
      balance: 0
    },
    {
      id: 2,
      item: "Laboratory Test - CBC",
      quantity: 1,
      sellingPrice: 1500,
      totalCost: 1500,
      paid: 0,
      waived: 0,
      balance: 1500
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

  const billingData = {
    totalBill: selectedPatient ? mockBillingItems.reduce((sum, item) => sum + item.totalCost, 0) : 0,
    allocated: selectedPatient ? mockBillingItems.reduce((sum, item) => sum + item.paid, 0) : 0,
    unallocated: selectedPatient ? mockBillingItems.reduce((sum, item) => sum + item.balance, 0) : 0,
    totalPaid: selectedPatient ? mockBillingItems.reduce((sum, item) => sum + item.paid, 0) : 0,
    discountGiven: 0,
    systemBal: selectedPatient ? mockBillingItems.reduce((sum, item) => sum + item.balance, 0) : 0,
    actualBal: selectedPatient ? mockBillingItems.reduce((sum, item) => sum + item.balance, 0) : 0
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b p-4">
          <h1 className="text-2xl font-bold text-gray-800">Billing & Invoicing Management</h1>
          <p className="text-gray-600">Comprehensive patient billing and payment processing</p>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 overflow-auto">
          <div className="grid grid-cols-12 gap-4 h-full">
            {/* Left Panel - Search and Actions */}
            <div className="col-span-3 bg-orange-100 rounded-lg p-4">
              <div className="space-y-3">
                {/* Search Section */}
                <div className="bg-white rounded p-3">
                  <Label className="text-sm font-medium">Search Patient by Surname/ID/Tel/OP No.</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Enter search criteria"
                      className="text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && handlePatientSearch()}
                    />
                    <Button size="sm" onClick={handlePatientSearch} className="bg-gray-400 hover:bg-gray-500">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Search Options */}
                  <div className="space-y-2 mt-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="filterDate" 
                        checked={filterByDate}
                        onCheckedChange={(checked) => setFilterByDate(checked === true)}
                      />
                      <Label htmlFor="filterDate" className="text-xs">Filter by Date between</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="includeAdm" 
                        checked={includeAdmDay}
                        onCheckedChange={(checked) => setIncludeAdmDay(checked === true)}
                      />
                      <Label htmlFor="includeAdm" className="text-xs">Include Adm Day</Label>
                    </div>
                  </div>
                </div>

                {/* Patient Details */}
                <div className="bg-white rounded p-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Full Name:</span>
                      <span>{selectedPatient?.fullName || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>File No.:</span>
                      <span>{selectedPatient?.fileNo || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>OP Number:</span>
                      <span>{selectedPatient?.opNumber || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Age:</span>
                      <span>{selectedPatient?.age || "-"}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button className="w-full bg-orange-300 text-black hover:bg-orange-400 text-sm py-2">
                    Receive Payment
                  </Button>
                  <Button className="w-full bg-orange-300 text-black hover:bg-orange-400 text-sm py-2">
                    Billing
                  </Button>
                  <Button className="w-full bg-gray-300 text-black hover:bg-gray-400 text-sm py-2">
                    Update Bed Details
                  </Button>
                  <Button className="w-full bg-gray-300 text-black hover:bg-gray-400 text-sm py-2">
                    Refresh
                  </Button>
                  <Button className="w-full bg-orange-300 text-black hover:bg-orange-400 text-sm py-2">
                    Invoice
                  </Button>
                  <Button className="w-full bg-orange-300 text-black hover:bg-orange-400 text-sm py-2">
                    Detailed
                  </Button>
                  <Button className="w-full bg-gray-300 text-black hover:bg-gray-400 text-sm py-2">
                    Detailed - NHIF
                  </Button>
                  <Button className="w-full bg-orange-300 text-black hover:bg-orange-400 text-sm py-2">
                    Top-Up Other Services Account
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Panel - Main Content */}
            <div className="col-span-9 bg-white rounded-lg">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                {/* Tab Navigation */}
                <div className="border-b">
                  <TabsList className="grid w-full grid-cols-6 bg-gray-100 rounded-none h-auto">
                    <TabsTrigger value="search" className="text-xs py-2">Search By Patient</TabsTrigger>
                    <TabsTrigger value="admitted" className="text-xs py-2">Admitted Patients</TabsTrigger>
                    <TabsTrigger value="history" className="text-xs py-2">History of Admissions</TabsTrigger>
                    <TabsTrigger value="settings" className="text-xs py-2">Automatic Billing Settings</TabsTrigger>
                    <TabsTrigger value="gatepass" className="text-xs py-2">Gate Pass</TabsTrigger>
                    <TabsTrigger value="discharge" className="text-xs py-2">Discharge Queue</TabsTrigger>
                  </TabsList>
                </div>

                {/* Search By Patient Tab */}
                <TabsContent value="search" className="flex-1 p-4">
                  <div className="grid grid-cols-12 gap-4 h-full">
                    {/* Billing Summary */}
                    <div className="col-span-4">
                      <div className="bg-gray-50 rounded p-3">
                        <h3 className="font-semibold mb-3">Summary</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Total Bill:</span>
                            <Badge variant="secondary">{billingData.totalBill}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Allocated:</span>
                            <Badge className="bg-green-600">{billingData.allocated}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Unallocated:</span>
                            <Badge className="bg-black">{billingData.unallocated}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Paid:</span>
                            <Badge className="bg-green-600">{billingData.totalPaid}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Discount Given:</span>
                            <Badge className="bg-black">{billingData.discountGiven}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>System Bal:</span>
                            <Badge className="bg-black">{billingData.systemBal}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Actual Bal:</span>
                            <Badge className="bg-black">{billingData.actualBal}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Main Billing Table */}
                    <div className="col-span-8">
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader className="bg-gray-100">
                            <TableRow>
                              <TableHead className="text-xs">Item</TableHead>
                              <TableHead className="text-xs">Quantity</TableHead>
                              <TableHead className="text-xs">Selling Price</TableHead>
                              <TableHead className="text-xs">Total Cost</TableHead>
                              <TableHead className="text-xs">Paid</TableHead>
                              <TableHead className="text-xs">Waived</TableHead>
                              <TableHead className="text-xs">Balance</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedPatient ? mockBillingItems.map((item) => (
                              <TableRow key={item.id} className="text-sm">
                                <TableCell>{item.item}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>{item.sellingPrice.toLocaleString()}</TableCell>
                                <TableCell>{item.totalCost.toLocaleString()}</TableCell>
                                <TableCell>{item.paid.toLocaleString()}</TableCell>
                                <TableCell>{item.waived.toLocaleString()}</TableCell>
                                <TableCell>{item.balance.toLocaleString()}</TableCell>
                              </TableRow>
                            )) : (
                              <TableRow>
                                <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                                  No patient selected. Please search for a patient to view billing details.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Other Tabs */}
                <TabsContent value="admitted" className="p-4">
                  <div className="text-center py-8 text-gray-500">
                    <h3 className="text-lg font-medium mb-2">Admitted Patients</h3>
                    <p>Billing management for currently admitted patients</p>
                  </div>
                </TabsContent>

                <TabsContent value="history" className="p-4">
                  <div className="text-center py-8 text-gray-500">
                    <h3 className="text-lg font-medium mb-2">History of Admissions</h3>
                    <p>Historical billing and admission records</p>
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="p-4">
                  <div className="text-center py-8 text-gray-500">
                    <h3 className="text-lg font-medium mb-2">Automatic Billing Settings</h3>
                    <p>Configure automatic billing and payment settings</p>
                  </div>
                </TabsContent>

                <TabsContent value="gatepass" className="p-4">
                  <div className="text-center py-8 text-gray-500">
                    <h3 className="text-lg font-medium mb-2">Gate Pass</h3>
                    <p>Issue and manage patient gate passes</p>
                  </div>
                </TabsContent>

                <TabsContent value="discharge" className="p-4">
                  <div className="text-center py-8 text-gray-500">
                    <h3 className="text-lg font-medium mb-2">Discharge Queue</h3>
                    <p>Final billing and discharge processing</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}