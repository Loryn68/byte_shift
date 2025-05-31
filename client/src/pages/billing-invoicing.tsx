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
  const [showBillingForm, setShowBillingForm] = useState(false);
  const [billingItems, setBillingItems] = useState<any[]>([]);
  const [newItemDescription, setNewItemDescription] = useState("");
  const [billingCategory, setBillingCategory] = useState("Bill");

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
    if (!selectedPatient) {
      toast({
        title: "No Patient Selected",
        description: "Please search and select a patient first",
        variant: "destructive"
      });
      return;
    }
    setShowBillingForm(true);
    toast({
      title: "Billing Interface",
      description: `Opening billing form for ${selectedPatient.fullName}`,
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

        {/* Billing Form Overlay */}
        {showBillingForm && selectedPatient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="max-w-4xl w-full bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
              {/* Top Search Section */}
              <div className="p-6 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Billing Interface</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowBillingForm(false)}
                  >
                    Close
                  </Button>
                </div>
                
                <div className="flex items-center space-x-2 mb-4">
                  <Label htmlFor="search-patient" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                    Search Patient by Surname/ID/Tel/OP-No.
                  </Label>
                  <Input
                    type="text"
                    id="search-patient"
                    className="flex-grow text-sm"
                    placeholder=""
                    value={selectedPatient.fullName}
                    readOnly
                  />
                  <Button className="text-sm bg-blue-600 hover:bg-blue-700">
                    Search
                  </Button>
                </div>

                {/* Patient Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center">
                    <Label className="w-24 text-sm font-medium text-gray-700">Full Name :</Label>
                    <Input 
                      type="text" 
                      className="flex-grow p-1 border-b border-gray-300 bg-transparent text-sm border-t-0 border-l-0 border-r-0 rounded-none" 
                      readOnly 
                      value={selectedPatient.fullName} 
                    />
                  </div>
                  <div className="flex items-center">
                    <Label className="w-24 text-sm font-medium text-gray-700">OP Number :</Label>
                    <Input 
                      type="text" 
                      className="flex-grow p-1 border-b border-gray-300 bg-transparent text-sm border-t-0 border-l-0 border-r-0 rounded-none" 
                      readOnly 
                      value={selectedPatient.opNumber} 
                    />
                  </div>
                  <div className="flex items-center">
                    <Label className="w-24 text-sm font-medium text-gray-700">File No. :</Label>
                    <Input 
                      type="text" 
                      className="flex-grow p-1 border-b border-gray-300 bg-transparent text-sm border-t-0 border-l-0 border-r-0 rounded-none" 
                      readOnly 
                      value={selectedPatient.fileNo} 
                    />
                  </div>
                </div>

                {/* Billing Category and Date */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div className="flex items-center">
                    <Label htmlFor="category" className="w-24 text-sm font-medium text-gray-700">Category :</Label>
                    <select 
                      id="category" 
                      className="flex-grow p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                      value={billingCategory}
                      onChange={(e) => setBillingCategory(e.target.value)}
                    >
                      <option value="Bill">Bill</option>
                      <option value="Consultation">Consultation</option>
                      <option value="Procedure">Procedure</option>
                      <option value="Medication">Medication</option>
                      <option value="Lab Test">Lab Test</option>
                    </select>
                  </div>
                  <div className="flex items-center md:col-span-2">
                    <Label htmlFor="billing-date" className="w-24 text-sm font-medium text-gray-700">Billing Date :</Label>
                    <Input 
                      type="date" 
                      id="billing-date" 
                      defaultValue="2025-05-31" 
                      className="p-2 border border-gray-300 rounded-md text-sm" 
                    />
                  </div>
                </div>
              </div>

              {/* Item Entry Section */}
              <div className="p-6">
                <div className="mb-4">
                  <Input
                    type="text"
                    className="w-full text-sm"
                    placeholder="Enter item description to add billing item..."
                    value={newItemDescription}
                    onChange={(e) => setNewItemDescription(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newItemDescription.trim()) {
                        const newItem = {
                          id: Date.now(),
                          description: newItemDescription,
                          quantity: 1,
                          price: 0,
                          totalCost: 0
                        };
                        setBillingItems([...billingItems, newItem]);
                        setNewItemDescription("");
                      }
                    }}
                  />
                </div>

                {/* Billing Items Table */}
                <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200 bg-white">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">#</TableHead>
                        <TableHead className="text-xs">Item Description</TableHead>
                        <TableHead className="text-xs">Quantity Bought</TableHead>
                        <TableHead className="text-xs">Price</TableHead>
                        <TableHead className="text-xs">Total Cost</TableHead>
                        <TableHead className="text-xs">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="bg-gray-200 divide-y divide-gray-300">
                      {billingItems.length > 0 ? (
                        billingItems.map((item, index) => (
                          <TableRow key={item.id}>
                            <TableCell className="text-sm">{index + 1}</TableCell>
                            <TableCell className="text-sm">
                              <Input
                                value={item.description}
                                onChange={(e) => {
                                  const updatedItems = [...billingItems];
                                  updatedItems[index].description = e.target.value;
                                  setBillingItems(updatedItems);
                                }}
                                className="border-0 p-1 text-sm bg-transparent"
                              />
                            </TableCell>
                            <TableCell className="text-sm">
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => {
                                  const updatedItems = [...billingItems];
                                  const quantity = parseInt(e.target.value) || 0;
                                  updatedItems[index].quantity = quantity;
                                  updatedItems[index].totalCost = quantity * updatedItems[index].price;
                                  setBillingItems(updatedItems);
                                }}
                                className="border-0 p-1 text-sm w-20 bg-transparent"
                              />
                            </TableCell>
                            <TableCell className="text-sm">
                              <Input
                                type="number"
                                value={item.price}
                                onChange={(e) => {
                                  const updatedItems = [...billingItems];
                                  const price = parseFloat(e.target.value) || 0;
                                  updatedItems[index].price = price;
                                  updatedItems[index].totalCost = updatedItems[index].quantity * price;
                                  setBillingItems(updatedItems);
                                }}
                                className="border-0 p-1 text-sm w-24 bg-transparent"
                                placeholder="KSH"
                              />
                            </TableCell>
                            <TableCell className="text-sm">
                              {item.totalCost.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-sm">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-800"
                                onClick={() => {
                                  setBillingItems(billingItems.filter((_, i) => i !== index));
                                }}
                              >
                                Remove
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        Array(5).fill(0).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell className="text-sm text-gray-500">-</TableCell>
                            <TableCell className="text-sm text-gray-500">-</TableCell>
                            <TableCell className="text-sm text-gray-500">-</TableCell>
                            <TableCell className="text-sm text-gray-500">-</TableCell>
                            <TableCell className="text-sm text-gray-500">-</TableCell>
                            <TableCell className="text-sm text-gray-500">-</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Bottom Summary and Action Buttons */}
              <div className="p-6 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-end items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="flex items-center space-x-2 text-lg font-semibold text-gray-800">
                  <span>Total :</span> 
                  <span className="font-bold">
                    KSH {billingItems.reduce((sum, item) => sum + item.totalCost, 0).toLocaleString()}
                  </span>
                </div>
                <Button 
                  variant="secondary"
                  className="text-sm"
                  onClick={() => {
                    toast({
                      title: "Bill Saved",
                      description: `Bill saved for ${selectedPatient.fullName} with total KSH ${billingItems.reduce((sum, item) => sum + item.totalCost, 0).toLocaleString()}`,
                    });
                    setShowBillingForm(false);
                  }}
                >
                  Save
                </Button>
                <Button 
                  variant="secondary"
                  className="text-sm"
                  onClick={() => {
                    setBillingItems([]);
                    setNewItemDescription("");
                    setShowBillingForm(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Admitted Patients Tab */}
        {activeTab === "admitted" && (
          <div className="p-6">
            <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200 bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">File Number</TableHead>
                    <TableHead className="text-xs">Op. Number</TableHead>
                    <TableHead className="text-xs">Patient Name</TableHead>
                    <TableHead className="text-xs">Admission Date</TableHead>
                    <TableHead className="text-xs">Total Billed</TableHead>
                    <TableHead className="text-xs">Total Paid + Waived</TableHead>
                    <TableHead className="text-xs">Balance</TableHead>
                    <TableHead className="text-xs">Advance Payment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Sample admitted patients data */}
                  <TableRow>
                    <TableCell className="text-sm">CMH-001</TableCell>
                    <TableCell className="text-sm">OP-2024-001</TableCell>
                    <TableCell className="text-sm">John Kamau Mwangi</TableCell>
                    <TableCell className="text-sm">2024-01-15</TableCell>
                    <TableCell className="text-sm">KSH 7,700</TableCell>
                    <TableCell className="text-sm">KSH 4,200</TableCell>
                    <TableCell className="text-sm font-bold text-red-600">KSH 3,500</TableCell>
                    <TableCell className="text-sm">KSH 0</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-sm">CMH-002</TableCell>
                    <TableCell className="text-sm">OP-2024-002</TableCell>
                    <TableCell className="text-sm">Mary Wanjiku Njoroge</TableCell>
                    <TableCell className="text-sm">2024-01-20</TableCell>
                    <TableCell className="text-sm">KSH 5,200</TableCell>
                    <TableCell className="text-sm">KSH 5,200</TableCell>
                    <TableCell className="text-sm font-bold text-green-600">KSH 0</TableCell>
                    <TableCell className="text-sm">KSH 1,000</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-sm">CMH-003</TableCell>
                    <TableCell className="text-sm">OP-2024-003</TableCell>
                    <TableCell className="text-sm">Peter Mwangi Kimani</TableCell>
                    <TableCell className="text-sm">2024-01-22</TableCell>
                    <TableCell className="text-sm">KSH 12,300</TableCell>
                    <TableCell className="text-sm">KSH 8,000</TableCell>
                    <TableCell className="text-sm font-bold text-red-600">KSH 4,300</TableCell>
                    <TableCell className="text-sm">KSH 0</TableCell>
                  </TableRow>
                  {/* Placeholder rows */}
                  {Array(7).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-sm text-gray-400">-</TableCell>
                      <TableCell className="text-sm text-gray-400">-</TableCell>
                      <TableCell className="text-sm text-gray-400">-</TableCell>
                      <TableCell className="text-sm text-gray-400">-</TableCell>
                      <TableCell className="text-sm text-gray-400">-</TableCell>
                      <TableCell className="text-sm text-gray-400">-</TableCell>
                      <TableCell className="text-sm text-gray-400">-</TableCell>
                      <TableCell className="text-sm text-gray-400">-</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Bottom Summary & Controls */}
            <div className="bg-gray-50 p-6 mt-6 border border-gray-200 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              {/* Total Number of Patients */}
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-gray-800">Total Number of Patients</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Admitted:</span> 
                  <span className="font-bold text-blue-600">3</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">With Balances:</span> 
                  <span className="font-bold text-red-600">2</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Without Balance:</span> 
                  <span className="font-bold text-green-600">1</span>
                </div>
              </div>

              {/* Total Amount */}
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-gray-800">Total Amount:</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Billed:</span> 
                  <span className="font-bold text-gray-900">KSH 25,200</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Paid:</span> 
                  <span className="font-bold text-gray-900">KSH 17,400</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Unpaid:</span> 
                  <span className="font-bold text-gray-900">KSH 7,800</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Adv. Payment:</span> 
                  <span className="font-bold text-gray-900">KSH 1,000</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col space-y-2 justify-end">
                <Button 
                  variant="secondary"
                  className="w-full text-sm"
                  onClick={() => {
                    toast({
                      title: "Data Reloaded",
                      description: "Admitted patients data has been refreshed",
                    });
                  }}
                >
                  Load / Reload
                </Button>
                <Button 
                  variant="secondary"
                  className="w-full text-sm"
                  onClick={() => {
                    toast({
                      title: "Print",
                      description: "Print functionality would open here",
                    });
                  }}
                >
                  Print
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* History of Admissions Tab */}
        {activeTab === "history" && (
          <div>
            {/* Filter Section */}
            <div className="p-6 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center gap-4">
              <Label htmlFor="start-date" className="text-sm font-medium text-gray-700">
                Filter by Admission Date Starting on
              </Label>
              <Input 
                type="date" 
                id="start-date" 
                value={startDate || "2025-05-31"} 
                onChange={(e) => setStartDate(e.target.value)}
                className="p-2 border border-gray-300 rounded-md text-sm w-auto"
              />
              <Label htmlFor="end-date" className="text-sm font-medium text-gray-700">
                and ending on
              </Label>
              <Input 
                type="date" 
                id="end-date" 
                value={endDate || "2025-05-31"} 
                onChange={(e) => setEndDate(e.target.value)}
                className="p-2 border border-gray-300 rounded-md text-sm w-auto"
              />
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-sm"
                onClick={() => {
                  toast({
                    title: "Filter Applied",
                    description: `Filtering admissions from ${startDate} to ${endDate}`,
                  });
                }}
              >
                Filter
              </Button>
            </div>

            {/* Main Content Area - Table */}
            <div className="p-6">
              <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200 bg-white">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">File Number</TableHead>
                      <TableHead className="text-xs">Op. Number</TableHead>
                      <TableHead className="text-xs">Patient Name</TableHead>
                      <TableHead className="text-xs">Admission Date</TableHead>
                      <TableHead className="text-xs">Total Billed</TableHead>
                      <TableHead className="text-xs">Total Paid + Waived</TableHead>
                      <TableHead className="text-xs">Balance</TableHead>
                      <TableHead className="text-xs">Advance Payment</TableHead>
                      <TableHead className="text-xs">Date Discharged</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Sample historical admissions data */}
                    <TableRow>
                      <TableCell className="text-sm">CMH-004</TableCell>
                      <TableCell className="text-sm">OP-2024-004</TableCell>
                      <TableCell className="text-sm">Grace Wanjiru Kinyua</TableCell>
                      <TableCell className="text-sm">2024-01-10</TableCell>
                      <TableCell className="text-sm">KSH 8,500</TableCell>
                      <TableCell className="text-sm">KSH 8,500</TableCell>
                      <TableCell className="text-sm font-bold text-green-600">KSH 0</TableCell>
                      <TableCell className="text-sm">KSH 0</TableCell>
                      <TableCell className="text-sm">2024-01-18</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-sm">CMH-005</TableCell>
                      <TableCell className="text-sm">OP-2024-005</TableCell>
                      <TableCell className="text-sm">Samuel Ochieng Otieno</TableCell>
                      <TableCell className="text-sm">2024-01-05</TableCell>
                      <TableCell className="text-sm">KSH 15,200</TableCell>
                      <TableCell className="text-sm">KSH 12,000</TableCell>
                      <TableCell className="text-sm font-bold text-red-600">KSH 3,200</TableCell>
                      <TableCell className="text-sm">KSH 500</TableCell>
                      <TableCell className="text-sm">2024-01-25</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-sm">CMH-006</TableCell>
                      <TableCell className="text-sm">OP-2023-089</TableCell>
                      <TableCell className="text-sm">Rose Njeri Mukuria</TableCell>
                      <TableCell className="text-sm">2023-12-28</TableCell>
                      <TableCell className="text-sm">KSH 6,800</TableCell>
                      <TableCell className="text-sm">KSH 6,800</TableCell>
                      <TableCell className="text-sm font-bold text-green-600">KSH 0</TableCell>
                      <TableCell className="text-sm">KSH 0</TableCell>
                      <TableCell className="text-sm">2024-01-05</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-sm">CMH-007</TableCell>
                      <TableCell className="text-sm">OP-2023-085</TableCell>
                      <TableCell className="text-sm">David Kiprotich Kiplagat</TableCell>
                      <TableCell className="text-sm">2023-12-20</TableCell>
                      <TableCell className="text-sm">KSH 11,400</TableCell>
                      <TableCell className="text-sm">KSH 9,000</TableCell>
                      <TableCell className="text-sm font-bold text-red-600">KSH 2,400</TableCell>
                      <TableCell className="text-sm">KSH 0</TableCell>
                      <TableCell className="text-sm">2023-12-30</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-sm">CMH-008</TableCell>
                      <TableCell className="text-sm">OP-2023-082</TableCell>
                      <TableCell className="text-sm">Faith Akinyi Odera</TableCell>
                      <TableCell className="text-sm">2023-12-15</TableCell>
                      <TableCell className="text-sm">KSH 9,600</TableCell>
                      <TableCell className="text-sm">KSH 9,600</TableCell>
                      <TableCell className="text-sm font-bold text-green-600">KSH 0</TableCell>
                      <TableCell className="text-sm">KSH 200</TableCell>
                      <TableCell className="text-sm">2023-12-22</TableCell>
                    </TableRow>
                    {/* Placeholder rows */}
                    {Array(5).fill(0).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-sm text-gray-400">-</TableCell>
                        <TableCell className="text-sm text-gray-400">-</TableCell>
                        <TableCell className="text-sm text-gray-400">-</TableCell>
                        <TableCell className="text-sm text-gray-400">-</TableCell>
                        <TableCell className="text-sm text-gray-400">-</TableCell>
                        <TableCell className="text-sm text-gray-400">-</TableCell>
                        <TableCell className="text-sm text-gray-400">-</TableCell>
                        <TableCell className="text-sm text-gray-400">-</TableCell>
                        <TableCell className="text-sm text-gray-400">-</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Bottom Summary & Controls */}
            <div className="bg-gray-50 p-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              {/* Total Number of Patients */}
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-gray-800">Total Number of Patients</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Admitted:</span> 
                  <span className="font-bold text-blue-600">5</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">With Balances:</span> 
                  <span className="font-bold text-red-600">2</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Without Balance:</span> 
                  <span className="font-bold text-green-600">3</span>
                </div>
              </div>

              {/* Total Amount */}
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-gray-800">Total Amount:</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Billed:</span> 
                  <span className="font-bold text-gray-900">KSH 51,500</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Paid:</span> 
                  <span className="font-bold text-gray-900">KSH 45,900</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Unpaid:</span> 
                  <span className="font-bold text-gray-900">KSH 5,600</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Adv. Payment:</span> 
                  <span className="font-bold text-gray-900">KSH 700</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col space-y-2 justify-end">
                <Button 
                  variant="secondary"
                  className="w-full text-sm"
                  onClick={() => {
                    toast({
                      title: "Print",
                      description: "History of admissions report would be generated",
                    });
                  }}
                >
                  Print
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Automatic Billing Settings Tab */}
        {activeTab === "settings" && (
          <div>
            {/* Retrieve Billed Items Link */}
            <div className="p-4 bg-gray-100 border-b border-gray-200 text-center">
              <button 
                className="text-blue-600 hover:underline text-sm"
                onClick={() => {
                  toast({
                    title: "Retrieving Items",
                    description: "Automatically billed items are being retrieved",
                  });
                }}
              >
                Click here to Retrieve Automatically Billed Items
              </button>
            </div>

            {/* Main Content Area */}
            <div className="p-6">
              {/* Inner Tabs for Settings */}
              <div className="flex bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700 mb-6 overflow-x-auto">
                <div 
                  className={`px-4 py-2 border-r border-gray-200 cursor-pointer whitespace-nowrap ${
                    activeSubTab === "global" ? "bg-blue-100 text-blue-800" : "hover:bg-gray-100"
                  }`}
                  onClick={() => setActiveSubTab("global")}
                >
                  Global Settings
                </div>
                <div 
                  className={`px-4 py-2 border-r border-gray-200 cursor-pointer whitespace-nowrap ${
                    activeSubTab === "individual" ? "bg-blue-100 text-blue-800" : "hover:bg-gray-100"
                  }`}
                  onClick={() => setActiveSubTab("individual")}
                >
                  Individual Level Settings
                </div>
                <div 
                  className={`px-4 py-2 cursor-pointer whitespace-nowrap ${
                    activeSubTab === "perform" ? "bg-blue-100 text-blue-800" : "hover:bg-gray-100"
                  }`}
                  onClick={() => setActiveSubTab("perform")}
                >
                  Perform Automatic Billing
                </div>
              </div>

              {/* Global Settings Content */}
              {activeSubTab === "global" && (
                <div className="bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200">
                  <div className="mb-6">
                    <Label htmlFor="item-name" className="block text-sm font-medium text-gray-700 mb-1">
                      Item
                    </Label>
                    <Input
                      type="text"
                      id="item-name"
                      className="w-full text-sm"
                      placeholder="Enter billing item name..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>

                  <div className="mb-6">
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Billing Days
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 text-sm">
                      {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                        <div key={day} className="flex items-center">
                          <input 
                            type="checkbox" 
                            id={day.toLowerCase()} 
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded mr-2" 
                          />
                          <Label htmlFor={day.toLowerCase()} className="text-gray-700">
                            {day}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-4 mb-6">
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700 text-sm"
                      onClick={() => {
                        toast({
                          title: "Settings Saved",
                          description: "Global billing settings have been saved successfully",
                        });
                      }}
                    >
                      Save
                    </Button>
                    <Button 
                      variant="secondary"
                      className="text-sm"
                      onClick={() => {
                        setNotes("");
                        toast({
                          title: "Cancelled",
                          description: "Changes have been cancelled",
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>

                  {/* Table for Billed Items */}
                  <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Item</TableHead>
                          <TableHead className="text-xs">Billing Day</TableHead>
                          <TableHead className="text-xs">Delete</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {/* Sample billing items */}
                        <TableRow>
                          <TableCell className="text-sm">Daily Bed Charge</TableCell>
                          <TableCell className="text-sm">Monday, Tuesday, Wednesday, Thursday, Friday</TableCell>
                          <TableCell className="text-sm">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-red-600 hover:text-red-800"
                              onClick={() => {
                                toast({
                                  title: "Item Deleted",
                                  description: "Billing item has been removed",
                                });
                              }}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="text-sm">Nursing Fee</TableCell>
                          <TableCell className="text-sm">Daily</TableCell>
                          <TableCell className="text-sm">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-red-600 hover:text-red-800"
                              onClick={() => {
                                toast({
                                  title: "Item Deleted",
                                  description: "Billing item has been removed",
                                });
                              }}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                        {/* Placeholder rows */}
                        {Array(3).fill(0).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell className="text-sm text-gray-400">-</TableCell>
                            <TableCell className="text-sm text-gray-400">-</TableCell>
                            <TableCell className="text-sm text-gray-400">-</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Individual Level Settings Content */}
              {activeSubTab === "individual" && (
                <div className="bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200">
                  <div className="text-center py-12">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Individual Level Settings</h3>
                    <p className="text-gray-600 mb-4">
                      Configure automatic billing settings for individual patients or departments.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <Label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Patient
                        </Label>
                        <Input
                          type="text"
                          placeholder="Search patient by name or ID..."
                          className="w-full text-sm"
                        />
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <Label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Department
                        </Label>
                        <Input
                          type="text"
                          placeholder="Choose department..."
                          className="w-full text-sm"
                        />
                      </div>
                    </div>
                    <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                      Configure Individual Settings
                    </Button>
                  </div>
                </div>
              )}

              {/* Perform Automatic Billing Content */}
              {activeSubTab === "perform" && (
                <div className="bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200">
                  <div className="text-center py-12">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Perform Automatic Billing</h3>
                    <p className="text-gray-600 mb-6">
                      Execute automatic billing for all configured items and patients.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-6">
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h4 className="font-semibold text-gray-800 mb-2">Daily Charges</h4>
                        <p className="text-2xl font-bold text-blue-600">15</p>
                        <p className="text-sm text-gray-600">Items to be billed</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h4 className="font-semibold text-gray-800 mb-2">Affected Patients</h4>
                        <p className="text-2xl font-bold text-green-600">8</p>
                        <p className="text-sm text-gray-600">Currently admitted</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h4 className="font-semibold text-gray-800 mb-2">Total Amount</h4>
                        <p className="text-2xl font-bold text-orange-600">KSH 24,500</p>
                        <p className="text-sm text-gray-600">To be billed today</p>
                      </div>
                    </div>
                    <div className="flex justify-center space-x-4">
                      <Button 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          toast({
                            title: "Automatic Billing Executed",
                            description: "All configured items have been billed successfully",
                          });
                        }}
                      >
                        Execute Billing
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          toast({
                            title: "Preview Generated",
                            description: "Billing preview has been generated",
                          });
                        }}
                      >
                        Preview Billing
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Gate Pass Tab */}
        {activeTab === "gate-pass" && (
          <div>
            {/* Inner Tabs for Gatepass */}
            <div className="flex bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700">
              <div 
                className={`px-4 py-2 border-r border-gray-200 cursor-pointer ${
                  activeSubTab === "active" ? "bg-blue-100 text-blue-800" : "hover:bg-gray-100"
                }`}
                onClick={() => setActiveSubTab("active")}
              >
                Active Gatepasses
              </div>
              <div 
                className={`px-4 py-2 cursor-pointer ${
                  activeSubTab === "history" ? "bg-blue-100 text-blue-800" : "hover:bg-gray-100"
                }`}
                onClick={() => setActiveSubTab("history")}
              >
                History
              </div>
            </div>

            {/* Main Content Area */}
            <div className="p-6">
              {/* Load/Reload Button */}
              <div className="mb-6 text-center">
                <Button 
                  variant="secondary"
                  className="text-sm"
                  onClick={() => {
                    toast({
                      title: "Loading Gatepasses",
                      description: activeSubTab === "active" ? "Active gatepasses loaded" : "Gatepass history loaded",
                    });
                  }}
                >
                  Load/Reload List of {activeSubTab === "active" ? "Active" : "Historical"} Gatepasses
                </Button>
              </div>

              {/* Active Gatepasses Table */}
              {activeSubTab === "active" && (
                <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200 bg-white">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Patient Name</TableHead>
                        <TableHead className="text-xs">Headed To</TableHead>
                        <TableHead className="text-xs">Reason</TableHead>
                        <TableHead className="text-xs">Accompanied By</TableHead>
                        <TableHead className="text-xs">Leaving Time</TableHead>
                        <TableHead className="text-xs">Estimated Expenditure</TableHead>
                        <TableHead className="text-xs">Created By</TableHead>
                        <TableHead className="text-xs">Time Created</TableHead>
                        <TableHead className="text-xs">Edit</TableHead>
                        <TableHead className="text-xs">Print Preview</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Sample active gatepasses */}
                      <TableRow>
                        <TableCell className="text-sm">John Kamau Mwangi</TableCell>
                        <TableCell className="text-sm">Kenyatta National Hospital</TableCell>
                        <TableCell className="text-sm">CT Scan Appointment</TableCell>
                        <TableCell className="text-sm">Mary Wanjiku (Sister)</TableCell>
                        <TableCell className="text-sm">14:30</TableCell>
                        <TableCell className="text-sm">KSH 2,500</TableCell>
                        <TableCell className="text-sm">Dr. Kiprotich</TableCell>
                        <TableCell className="text-sm">13:45</TableCell>
                        <TableCell className="text-sm">
                          <Button size="sm" variant="outline" className="text-blue-600">
                            Edit
                          </Button>
                        </TableCell>
                        <TableCell className="text-sm">
                          <Button size="sm" variant="outline" className="text-green-600">
                            Preview
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-sm">Grace Wanjiru Kinyua</TableCell>
                        <TableCell className="text-sm">Nairobi West Hospital</TableCell>
                        <TableCell className="text-sm">Specialist Consultation</TableCell>
                        <TableCell className="text-sm">Peter Kinyua (Husband)</TableCell>
                        <TableCell className="text-sm">16:00</TableCell>
                        <TableCell className="text-sm">KSH 3,000</TableCell>
                        <TableCell className="text-sm">Nurse Jane</TableCell>
                        <TableCell className="text-sm">15:20</TableCell>
                        <TableCell className="text-sm">
                          <Button size="sm" variant="outline" className="text-blue-600">
                            Edit
                          </Button>
                        </TableCell>
                        <TableCell className="text-sm">
                          <Button size="sm" variant="outline" className="text-green-600">
                            Preview
                          </Button>
                        </TableCell>
                      </TableRow>
                      {/* Placeholder rows */}
                      {Array(6).fill(0).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-sm text-gray-400">-</TableCell>
                          <TableCell className="text-sm text-gray-400">-</TableCell>
                          <TableCell className="text-sm text-gray-400">-</TableCell>
                          <TableCell className="text-sm text-gray-400">-</TableCell>
                          <TableCell className="text-sm text-gray-400">-</TableCell>
                          <TableCell className="text-sm text-gray-400">-</TableCell>
                          <TableCell className="text-sm text-gray-400">-</TableCell>
                          <TableCell className="text-sm text-gray-400">-</TableCell>
                          <TableCell className="text-sm text-gray-400">-</TableCell>
                          <TableCell className="text-sm text-gray-400">-</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* History Gatepasses Table */}
              {activeSubTab === "history" && (
                <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200 bg-white">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Patient Name</TableHead>
                        <TableHead className="text-xs">Headed To</TableHead>
                        <TableHead className="text-xs">Reason</TableHead>
                        <TableHead className="text-xs">Accompanied By</TableHead>
                        <TableHead className="text-xs">Leaving Time</TableHead>
                        <TableHead className="text-xs">Return Time</TableHead>
                        <TableHead className="text-xs">Actual Expenditure</TableHead>
                        <TableHead className="text-xs">Created By</TableHead>
                        <TableHead className="text-xs">Date</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Sample historical gatepasses */}
                      <TableRow>
                        <TableCell className="text-sm">Samuel Ochieng Otieno</TableCell>
                        <TableCell className="text-sm">Aga Khan Hospital</TableCell>
                        <TableCell className="text-sm">MRI Scan</TableCell>
                        <TableCell className="text-sm">Agnes Otieno (Wife)</TableCell>
                        <TableCell className="text-sm">09:00</TableCell>
                        <TableCell className="text-sm">12:30</TableCell>
                        <TableCell className="text-sm">KSH 4,500</TableCell>
                        <TableCell className="text-sm">Dr. Mwangi</TableCell>
                        <TableCell className="text-sm">2024-01-20</TableCell>
                        <TableCell className="text-sm">
                          <Badge className="bg-green-100 text-green-800">Completed</Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-sm">Rose Njeri Mukuria</TableCell>
                        <TableCell className="text-sm">Gertrude's Children's Hospital</TableCell>
                        <TableCell className="text-sm">Emergency Consultation</TableCell>
                        <TableCell className="text-sm">James Mukuria (Son)</TableCell>
                        <TableCell className="text-sm">20:15</TableCell>
                        <TableCell className="text-sm">23:45</TableCell>
                        <TableCell className="text-sm">KSH 6,200</TableCell>
                        <TableCell className="text-sm">Nurse Mary</TableCell>
                        <TableCell className="text-sm">2024-01-18</TableCell>
                        <TableCell className="text-sm">
                          <Badge className="bg-green-100 text-green-800">Completed</Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-sm">David Kiprotich Kiplagat</TableCell>
                        <TableCell className="text-sm">MP Shah Hospital</TableCell>
                        <TableCell className="text-sm">Physiotherapy Session</TableCell>
                        <TableCell className="text-sm">Sarah Kiplagat (Daughter)</TableCell>
                        <TableCell className="text-sm">14:00</TableCell>
                        <TableCell className="text-sm">-</TableCell>
                        <TableCell className="text-sm">-</TableCell>
                        <TableCell className="text-sm">Dr. Njoroge</TableCell>
                        <TableCell className="text-sm">2024-01-15</TableCell>
                        <TableCell className="text-sm">
                          <Badge className="bg-red-100 text-red-800">Overdue</Badge>
                        </TableCell>
                      </TableRow>
                      {/* Placeholder rows */}
                      {Array(5).fill(0).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-sm text-gray-400">-</TableCell>
                          <TableCell className="text-sm text-gray-400">-</TableCell>
                          <TableCell className="text-sm text-gray-400">-</TableCell>
                          <TableCell className="text-sm text-gray-400">-</TableCell>
                          <TableCell className="text-sm text-gray-400">-</TableCell>
                          <TableCell className="text-sm text-gray-400">-</TableCell>
                          <TableCell className="text-sm text-gray-400">-</TableCell>
                          <TableCell className="text-sm text-gray-400">-</TableCell>
                          <TableCell className="text-sm text-gray-400">-</TableCell>
                          <TableCell className="text-sm text-gray-400">-</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Discharge Queue Tab */}
        {activeTab === "discharge" && (
          <div className="p-6">
            {/* Load List Button */}
            <div className="mb-6 text-center">
              <Button 
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-base font-semibold"
                onClick={() => {
                  toast({
                    title: "Loading Discharge Queue",
                    description: "Patient discharge list has been loaded successfully",
                  });
                }}
              >
                Load List
              </Button>
            </div>

            {/* Table for Discharge Queue */}
            <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200 bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">OPNO</TableHead>
                    <TableHead className="text-xs">File Number</TableHead>
                    <TableHead className="text-xs">Patient Name</TableHead>
                    <TableHead className="text-xs">Gender</TableHead>
                    <TableHead className="text-xs">Age</TableHead>
                    <TableHead className="text-xs">Admission Date</TableHead>
                    <TableHead className="text-xs">Category</TableHead>
                    <TableHead className="text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Sample discharge queue patients */}
                  <TableRow>
                    <TableCell className="text-sm">OP2024001</TableCell>
                    <TableCell className="text-sm">FN001234</TableCell>
                    <TableCell className="text-sm">Maria Wanjiku Njoroge</TableCell>
                    <TableCell className="text-sm">Female</TableCell>
                    <TableCell className="text-sm">34</TableCell>
                    <TableCell className="text-sm">2024-01-15</TableCell>
                    <TableCell className="text-sm">
                      <Badge className="bg-blue-100 text-blue-800">Inpatient</Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-green-600 hover:text-green-800"
                          onClick={() => {
                            toast({
                              title: "Discharge Process",
                              description: "Patient discharge process initiated",
                            });
                          }}
                        >
                          Discharge
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => {
                            toast({
                              title: "View Details",
                              description: "Patient details displayed",
                            });
                          }}
                        >
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-sm">OP2024002</TableCell>
                    <TableCell className="text-sm">FN001235</TableCell>
                    <TableCell className="text-sm">James Kiprotich Mutai</TableCell>
                    <TableCell className="text-sm">Male</TableCell>
                    <TableCell className="text-sm">45</TableCell>
                    <TableCell className="text-sm">2024-01-18</TableCell>
                    <TableCell className="text-sm">
                      <Badge className="bg-orange-100 text-orange-800">Observation</Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-green-600 hover:text-green-800"
                          onClick={() => {
                            toast({
                              title: "Discharge Process",
                              description: "Patient discharge process initiated",
                            });
                          }}
                        >
                          Discharge
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => {
                            toast({
                              title: "View Details",
                              description: "Patient details displayed",
                            });
                          }}
                        >
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-sm">OP2024003</TableCell>
                    <TableCell className="text-sm">FN001236</TableCell>
                    <TableCell className="text-sm">Grace Nyawira Kamau</TableCell>
                    <TableCell className="text-sm">Female</TableCell>
                    <TableCell className="text-sm">28</TableCell>
                    <TableCell className="text-sm">2024-01-20</TableCell>
                    <TableCell className="text-sm">
                      <Badge className="bg-purple-100 text-purple-800">Therapy</Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-green-600 hover:text-green-800"
                          onClick={() => {
                            toast({
                              title: "Discharge Process",
                              description: "Patient discharge process initiated",
                            });
                          }}
                        >
                          Discharge
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => {
                            toast({
                              title: "View Details",
                              description: "Patient details displayed",
                            });
                          }}
                        >
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-sm">OP2024004</TableCell>
                    <TableCell className="text-sm">FN001237</TableCell>
                    <TableCell className="text-sm">Samuel Ochieng Otieno</TableCell>
                    <TableCell className="text-sm">Male</TableCell>
                    <TableCell className="text-sm">52</TableCell>
                    <TableCell className="text-sm">2024-01-22</TableCell>
                    <TableCell className="text-sm">
                      <Badge className="bg-red-100 text-red-800">Emergency</Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-green-600 hover:text-green-800"
                          onClick={() => {
                            toast({
                              title: "Discharge Process",
                              description: "Patient discharge process initiated",
                            });
                          }}
                        >
                          Discharge
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => {
                            toast({
                              title: "View Details",
                              description: "Patient details displayed",
                            });
                          }}
                        >
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {/* Placeholder rows to match the empty table appearance */}
                  {Array(4).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-sm text-gray-400">-</TableCell>
                      <TableCell className="text-sm text-gray-400">-</TableCell>
                      <TableCell className="text-sm text-gray-400">-</TableCell>
                      <TableCell className="text-sm text-gray-400">-</TableCell>
                      <TableCell className="text-sm text-gray-400">-</TableCell>
                      <TableCell className="text-sm text-gray-400">-</TableCell>
                      <TableCell className="text-sm text-gray-400">-</TableCell>
                      <TableCell className="text-sm text-gray-400">-</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Discharge Summary Section */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending Discharges</p>
                      <p className="text-2xl font-bold text-orange-600">4</p>
                    </div>
                    <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 text-sm font-bold">4</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Today's Discharges</p>
                      <p className="text-2xl font-bold text-green-600">12</p>
                    </div>
                    <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-sm font-bold">12</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Average Stay</p>
                      <p className="text-2xl font-bold text-blue-600">7.2</p>
                      <p className="text-xs text-gray-500">days</p>
                    </div>
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-sm font-bold">7</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Other Tab Content Placeholders */}
        {!["search", "admitted", "history", "settings", "gate-pass", "discharge"].includes(activeTab) && (
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