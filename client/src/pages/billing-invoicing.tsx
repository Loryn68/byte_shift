import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Receipt, Search, RefreshCw, FileText, CreditCard, Users, Calendar } from "lucide-react";

interface Patient {
  id: string;
  fullName: string;
  opNumber: string;
  age: number;
  fileNo: string;
  paymentMethod: string;
  admissionDate: string;
}

interface BillItem {
  item: string;
  quantity: number;
  sellingPrice: number;
  totalCost: number;
  paid: number;
  waived: number;
  balance: number;
}

interface BillingSummary {
  totalBill: number;
  allocated: number;
  totalPaid: number;
  systemBal: number;
  unallocated: number;
  discountGiven: number;
  actualBal: number;
}

export default function BillingInvoicing() {
  const [activeTab, setActiveTab] = useState("search");
  const [activeSubTab, setActiveSubTab] = useState("total-bill");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [filterByDate, setFilterByDate] = useState(false);
  const [includeAdmDay, setIncludeAdmDay] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [billingSummary, setBillingSummary] = useState<BillingSummary>({
    totalBill: 0,
    allocated: 0,
    totalPaid: 0,
    systemBal: 0,
    unallocated: 0,
    discountGiven: 0,
    actualBal: 0
  });

  const { toast } = useToast();

  // Sample patient data
  const samplePatients: Patient[] = [
    {
      id: "PAT-001",
      fullName: "John Kamau Mwangi",
      opNumber: "OP-2024-001",
      age: 28,
      fileNo: "CMH-001",
      paymentMethod: "NHIF",
      admissionDate: "2024-01-15"
    },
    {
      id: "PAT-002", 
      fullName: "Mary Wanjiku Njoroge",
      opNumber: "OP-2024-002",
      age: 34,
      fileNo: "CMH-002",
      paymentMethod: "Cash",
      admissionDate: "2024-01-20"
    }
  ];

  const handlePatientSearch = () => {
    if (searchQuery.trim()) {
      const found = samplePatients.find(p => 
        p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.opNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.fileNo.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      if (found) {
        setSelectedPatient(found);
        // Generate sample billing data for selected patient
        setBillItems([
          {
            item: "Consultation Fee",
            quantity: 1,
            sellingPrice: 2500,
            totalCost: 2500,
            paid: 2500,
            waived: 0,
            balance: 0
          },
          {
            item: "Lab Tests - Blood Work",
            quantity: 1,
            sellingPrice: 3500,
            totalCost: 3500,
            paid: 0,
            waived: 0,
            balance: 3500
          },
          {
            item: "Medication",
            quantity: 2,
            sellingPrice: 850,
            totalCost: 1700,
            paid: 1700,
            waived: 0,
            balance: 0
          }
        ]);
        
        setBillingSummary({
          totalBill: 7700,
          allocated: 7700,
          totalPaid: 4200,
          systemBal: 3500,
          unallocated: 0,
          discountGiven: 0,
          actualBal: 3500
        });
        
        toast({
          title: "Patient Found",
          description: `Loaded billing data for ${found.fullName}`,
        });
      } else {
        toast({
          title: "Patient Not Found",
          description: "No patient found with the provided search criteria",
          variant: "destructive"
        });
      }
    }
  };

  const handleReceivePayment = () => {
    toast({
      title: "Payment Processing",
      description: "Payment processing interface would open here",
    });
  };

  const handleBilling = () => {
    toast({
      title: "Billing",
      description: "Billing interface would open here",
    });
  };

  const handleRefresh = () => {
    setSelectedPatient(null);
    setSearchQuery("");
    setBillItems([]);
    setBillingSummary({
      totalBill: 0,
      allocated: 0,
      totalPaid: 0,
      systemBal: 0,
      unallocated: 0,
      discountGiven: 0,
      actualBal: 0
    });
    toast({
      title: "Refreshed",
      description: "Data has been refreshed",
    });
  };

  const mainTabs = [
    { id: "search", label: "Search By Patient", icon: <Search className="h-4 w-4" /> },
    { id: "admitted", label: "Admitted Patients", icon: <Users className="h-4 w-4" /> },
    { id: "history", label: "History of Admissions", icon: <Calendar className="h-4 w-4" /> },
    { id: "settings", label: "Automatic Billing Settings", icon: <FileText className="h-4 w-4" /> },
    { id: "gate-pass", label: "Gate Pass", icon: <Receipt className="h-4 w-4" /> },
    { id: "discharge", label: "Discharge Queue", icon: <Users className="h-4 w-4" /> }
  ];

  const billingTabs = [
    { id: "total-bill", label: "Total Bill (Grouped)" },
    { id: "nhif-bill", label: "NHIF Bill" },
    { id: "cash-bill", label: "Cash Bill" },
    { id: "payments", label: "Payments" },
    { id: "detailed", label: "Original Entry(Detailed)" },
    { id: "medication", label: "Medication History" }
  ];

  return (
    <div className="min-h-screen bg-gray-100 font-inter antialiased p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
        {/* Top Navigation Tabs */}
        <div className="flex bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700 overflow-x-auto">
          {mainTabs.map((tab) => (
            <div
              key={tab.id}
              className={`px-4 py-2 border-r border-gray-200 cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id 
                  ? "bg-blue-100 text-blue-800" 
                  : "hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              {tab.label}
            </div>
          ))}
        </div>

        {/* Main Content Area */}
        {activeTab === "search" && (
          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Section - Search & Actions */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <Label htmlFor="patient-search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search Patient by Surname/ID/Tel/OP-No.
                </Label>
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    id="patient-search"
                    className="flex-grow text-sm"
                    placeholder="Enter search criteria..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handlePatientSearch()}
                  />
                  <Button 
                    onClick={handlePatientSearch}
                    className="bg-blue-600 hover:bg-blue-700 text-sm"
                  >
                    Search
                  </Button>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center mb-2">
                  <input 
                    type="checkbox" 
                    id="filter-date" 
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded mr-2"
                    checked={filterByDate}
                    onChange={(e) => setFilterByDate(e.target.checked)}
                  />
                  <Label htmlFor="filter-date" className="text-sm font-medium text-gray-700">
                    Filter By Date Between
                  </Label>
                </div>
                <div className="flex space-x-2 mb-2">
                  <Input 
                    type="date" 
                    className="flex-grow text-sm"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    disabled={!filterByDate}
                  />
                  <Input 
                    type="date" 
                    className="flex-grow text-sm"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    disabled={!filterByDate}
                  />
                </div>
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="include-adm-day" 
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded mr-2"
                    checked={includeAdmDay}
                    onChange={(e) => setIncludeAdmDay(e.target.checked)}
                  />
                  <Label htmlFor="include-adm-day" className="text-sm font-medium text-gray-700">
                    Include Adm. Day
                  </Label>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                <div className="flex items-center">
                  <Label className="w-28 text-sm font-medium text-gray-700">Full Name :</Label>
                  <Input 
                    type="text" 
                    className="flex-grow border-0 border-b border-gray-300 bg-transparent text-sm rounded-none focus:ring-0" 
                    readOnly 
                    value={selectedPatient?.fullName || ""} 
                  />
                </div>
                <div className="flex items-center">
                  <Label className="w-28 text-sm font-medium text-gray-700">OP Number :</Label>
                  <Input 
                    type="text" 
                    className="flex-grow border-0 border-b border-gray-300 bg-transparent text-sm rounded-none focus:ring-0" 
                    readOnly 
                    value={selectedPatient?.opNumber || ""} 
                  />
                </div>
                <div className="flex items-center">
                  <Label className="w-28 text-sm font-medium text-gray-700">Age :</Label>
                  <Input 
                    type="text" 
                    className="flex-grow border-0 border-b border-gray-300 bg-transparent text-sm rounded-none focus:ring-0" 
                    readOnly 
                    value={selectedPatient?.age?.toString() || ""} 
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 gap-2">
                <Button 
                  variant="secondary"
                  className="w-full text-sm"
                  onClick={handleReceivePayment}
                >
                  Receive Payment
                </Button>
                <Button 
                  variant="secondary"
                  className="w-full text-sm"
                  onClick={handleBilling}
                >
                  Billing
                </Button>
                <Button 
                  variant="secondary"
                  className="w-full text-sm"
                >
                  Update Bed Details
                </Button>
                <Button 
                  variant="secondary"
                  className="w-full text-sm"
                  onClick={handleRefresh}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button 
                  variant="secondary"
                  className="w-full text-sm"
                >
                  Invoice
                </Button>
                <Button 
                  variant="secondary"
                  className="w-full text-sm"
                >
                  Detailed
                </Button>
                <Button 
                  variant="secondary"
                  className="w-full text-sm"
                >
                  Detailed NHIF
                </Button>
                <Button 
                  variant="secondary"
                  className="w-full text-sm"
                >
                  Top-Up Other Services Account
                </Button>
              </div>
            </div>

            {/* Right Section - Summary & Details */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Summary Section */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-2">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Summary</h3>
                  <div className="flex justify-between text-sm">
                    <span>Total Bill :</span> 
                    <span className="font-bold">KSH {billingSummary.totalBill.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Allocated :</span> 
                    <span className="font-bold">KSH {billingSummary.allocated.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Paid :</span> 
                    <span className="font-bold">KSH {billingSummary.totalPaid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>System Bal :</span> 
                    <span className="font-bold">KSH {billingSummary.systemBal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Unallocated :</span> 
                    <span className="font-bold">KSH {billingSummary.unallocated.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Discount Given :</span> 
                    <span className="font-bold">KSH {billingSummary.discountGiven.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Actual Bal :</span> 
                    <span className="font-bold text-red-600">KSH {billingSummary.actualBal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Note Section */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Note</h3>
                  <Textarea 
                    className="w-full h-32 text-sm"
                    placeholder="Add billing notes here..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              {/* Patient File & Admission Details */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Label className="w-32 text-sm font-medium text-gray-700">File No. :</Label>
                  <Input 
                    type="text" 
                    className="flex-grow border-0 border-b border-gray-300 bg-transparent text-sm rounded-none focus:ring-0" 
                    readOnly 
                    value={selectedPatient?.fileNo || ""} 
                  />
                </div>
                <div className="flex items-center">
                  <Label className="w-32 text-sm font-medium text-gray-700">Payment Method :</Label>
                  <Input 
                    type="text" 
                    className="flex-grow border-0 border-b border-gray-300 bg-transparent text-sm rounded-none focus:ring-0" 
                    readOnly 
                    value={selectedPatient?.paymentMethod || ""} 
                  />
                </div>
                <div className="flex items-center md:col-span-2">
                  <Label className="w-32 text-sm font-medium text-gray-700">Admission Date :</Label>
                  <Input 
                    type="text" 
                    className="flex-grow border-0 border-b border-gray-300 bg-transparent text-sm rounded-none focus:ring-0" 
                    readOnly 
                    value={selectedPatient?.admissionDate || ""} 
                  />
                </div>
              </div>

              {/* Billing Tabs */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="flex bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700 overflow-x-auto">
                  {billingTabs.map((tab) => (
                    <div
                      key={tab.id}
                      className={`px-4 py-2 border-r border-gray-200 cursor-pointer whitespace-nowrap ${
                        activeSubTab === tab.id 
                          ? "bg-blue-100 text-blue-800" 
                          : "hover:bg-gray-100"
                      }`}
                      onClick={() => setActiveSubTab(tab.id)}
                    >
                      {tab.label}
                    </div>
                  ))}
                </div>

                {/* Itemized Billing Table */}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
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
                      {billItems.length > 0 ? billItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="text-sm">{item.item}</TableCell>
                          <TableCell className="text-sm">{item.quantity}</TableCell>
                          <TableCell className="text-sm">KSH {item.sellingPrice.toLocaleString()}</TableCell>
                          <TableCell className="text-sm">KSH {item.totalCost.toLocaleString()}</TableCell>
                          <TableCell className="text-sm">KSH {item.paid.toLocaleString()}</TableCell>
                          <TableCell className="text-sm">KSH {item.waived.toLocaleString()}</TableCell>
                          <TableCell className="text-sm font-bold text-red-600">
                            KSH {item.balance.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      )) : (
                        Array(5).fill(0).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell className="text-sm text-gray-400">-</TableCell>
                            <TableCell className="text-sm text-gray-400">-</TableCell>
                            <TableCell className="text-sm text-gray-400">-</TableCell>
                            <TableCell className="text-sm text-gray-400">-</TableCell>
                            <TableCell className="text-sm text-gray-400">-</TableCell>
                            <TableCell className="text-sm text-gray-400">-</TableCell>
                            <TableCell className="text-sm text-gray-400">-</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other Tab Content Placeholders */}
        {activeTab !== "search" && (
          <div className="p-6">
            <Card>
              <CardHeader>
                <CardTitle>{mainTabs.find(t => t.id === activeTab)?.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <p>This section is available for implementation.</p>
                  <p className="text-sm mt-2">Content for {mainTabs.find(t => t.id === activeTab)?.label} will be displayed here.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Bottom Summary Bar */}
        <div className="bg-yellow-50 p-4 border-t border-yellow-200 flex flex-wrap justify-around items-center text-sm font-semibold text-gray-800">
          <div className="flex items-center space-x-1">
            <span>Totals :</span> 
            <span className="font-bold">Bill : KSH {billingSummary.totalBill.toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="font-bold">Paid : KSH {billingSummary.totalPaid.toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="font-bold">Balance : KSH {billingSummary.actualBal.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}