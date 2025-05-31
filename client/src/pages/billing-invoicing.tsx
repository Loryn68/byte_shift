import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Search, RefreshCw, FileText, Calculator, Receipt, Users, Clock, Settings } from "lucide-react";

export default function BillingInvoicing() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeTab, setActiveTab] = useState("search");
  const [filterByDate, setFilterByDate] = useState(false);
  const [includeAdmDay, setIncludeAdmDay] = useState(false);

  // Mock data for demonstration
  const billingData = {
    totalBill: 0,
    allocated: 0,
    unallocated: 0,
    totalPaid: 0,
    discountGiven: 0,
    systemBal: 0,
    actualBal: 0
  };

  const billingItems = [
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
                    />
                    <Button size="sm" className="bg-gray-400 hover:bg-gray-500">
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
                      <span>-</span>
                    </div>
                    <div className="flex justify-between">
                      <span>File No.:</span>
                      <span>-</span>
                    </div>
                    <div className="flex justify-between">
                      <span>OP Number:</span>
                      <span>-</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Age:</span>
                      <span>-</span>
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
                            <Badge variant="secondary">0</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Allocated:</span>
                            <Badge className="bg-green-600">0</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Unallocated:</span>
                            <Badge className="bg-black">0</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Paid:</span>
                            <Badge className="bg-green-600">0</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Discount Given:</span>
                            <Badge className="bg-black">0</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>System Bal:</span>
                            <Badge className="bg-green-600">0</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Actual Bal:</span>
                            <Badge className="bg-black">0</Badge>
                          </div>
                          <hr className="my-2" />
                          <div className="flex justify-between">
                            <span>Payment Method:</span>
                            <span>-</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Admission Date:</span>
                            <span>-</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notes Section */}
                    <div className="col-span-8">
                      <div className="bg-yellow-50 rounded p-3 h-32">
                        <h4 className="font-medium mb-2">Note</h4>
                        <Textarea 
                          className="w-full h-20 border-none bg-transparent resize-none"
                          placeholder="Add billing notes..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Billing Items Table */}
                  <div className="mt-4">
                    <div className="border rounded-lg">
                      {/* Table Tabs */}
                      <div className="bg-gray-100 p-2 border-b">
                        <div className="flex gap-4 text-sm">
                          <span className="font-medium">Total Bill(Grouped)</span>
                          <span>NHIF Bill</span>
                          <span>Cash Bill</span>
                          <span>Payments</span>
                          <span>Original Entry(Detailed)</span>
                          <span>Medication History</span>
                        </div>
                      </div>

                      {/* Table */}
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead className="w-12">
                              <Checkbox />
                            </TableHead>
                            <TableHead>Item</TableHead>
                            <TableHead className="text-center">Quantity</TableHead>
                            <TableHead className="text-center">Selling Price</TableHead>
                            <TableHead className="text-center">Total Cost</TableHead>
                            <TableHead className="text-center">Paid</TableHead>
                            <TableHead className="text-center">Waived</TableHead>
                            <TableHead className="text-center">Balance</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {billingItems.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                                No billing items found. Select a patient to view billing details.
                              </TableCell>
                            </TableRow>
                          ) : (
                            billingItems.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell>
                                  <Checkbox />
                                </TableCell>
                                <TableCell>{item.item}</TableCell>
                                <TableCell className="text-center">{item.quantity}</TableCell>
                                <TableCell className="text-center">KSh {item.sellingPrice.toLocaleString()}</TableCell>
                                <TableCell className="text-center">KSh {item.totalCost.toLocaleString()}</TableCell>
                                <TableCell className="text-center">KSh {item.paid.toLocaleString()}</TableCell>
                                <TableCell className="text-center">KSh {item.waived.toLocaleString()}</TableCell>
                                <TableCell className="text-center">KSh {item.balance.toLocaleString()}</TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>

                      {/* Footer Totals */}
                      <div className="bg-orange-200 p-3 border-t">
                        <div className="flex justify-between items-center text-sm font-medium">
                          <div className="flex gap-8">
                            <span>Totals:</span>
                            <span>Bill: 0</span>
                          </div>
                          <div className="flex gap-8">
                            <span>Paid: <Badge className="bg-green-600">0</Badge></span>
                            <span>Waived: <Badge className="bg-black">0</Badge></span>
                            <span>Sys Bal: <Badge className="bg-green-600">0</Badge></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Other Tabs - Placeholder Content */}
                <TabsContent value="admitted" className="flex-1 p-4">
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle>Admitted Patients</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12">
                        <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500">Admitted patients billing management will be displayed here</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="history" className="flex-1 p-4">
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle>History of Admissions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12">
                        <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500">Patient admission history and billing records will be displayed here</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="settings" className="flex-1 p-4">
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle>Automatic Billing Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12">
                        <Settings className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500">Automatic billing configuration and settings will be displayed here</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="gatepass" className="flex-1 p-4">
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle>Gate Pass</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12">
                        <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500">Gate pass management and processing will be displayed here</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="discharge" className="flex-1 p-4">
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle>Discharge Queue</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12">
                        <Receipt className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500">Patient discharge queue and final billing will be displayed here</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}