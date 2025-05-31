import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp, TrendingDown, DollarSign, Calendar, FileText, Download,
  Plus, Edit3, Trash2, Eye, Search, Filter, PieChart, BarChart3
} from "lucide-react";

interface IncomeRecord {
  id: string;
  date: string;
  incomeType: string;
  amount: number;
  source: string;
  notes: string;
  category: string;
  paymentMethod: string;
  patientId?: string;
  invoiceNumber?: string;
}

export default function IncomeManagementKenya() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedRecord, setSelectedRecord] = useState<IncomeRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [dateRange, setDateRange] = useState("current_month");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<IncomeRecord | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock data for demonstration - replace with actual API calls
  const incomeRecords: IncomeRecord[] = [
    {
      id: "1",
      date: "2024-01-30",
      incomeType: "Patient Fees",
      amount: 15000,
      source: "Outpatient Consultation",
      notes: "Mental health consultation",
      category: "Medical Services",
      paymentMethod: "M-Pesa",
      patientId: "PAT001",
      invoiceNumber: "INV-2024-001"
    },
    {
      id: "2",
      date: "2024-01-30",
      incomeType: "Insurance Claims",
      amount: 45000,
      source: "NHIF Reimbursement",
      notes: "Monthly insurance claims processing",
      category: "Insurance",
      paymentMethod: "Bank Transfer",
      invoiceNumber: "CLM-2024-015"
    },
    {
      id: "3",
      date: "2024-01-29",
      incomeType: "Laboratory Services",
      amount: 8500,
      source: "Blood Tests & Diagnostics",
      notes: "Various lab tests performed",
      category: "Diagnostics",
      paymentMethod: "Cash",
      patientId: "PAT002",
      invoiceNumber: "LAB-2024-089"
    },
    {
      id: "4",
      date: "2024-01-29",
      incomeType: "Pharmacy Sales",
      amount: 12000,
      source: "Medication Dispensing",
      notes: "Prescription medications sold",
      category: "Pharmacy",
      paymentMethod: "M-Pesa",
      patientId: "PAT003",
      invoiceNumber: "PHM-2024-156"
    },
    {
      id: "5",
      date: "2024-01-28",
      incomeType: "Therapy Sessions",
      amount: 25000,
      source: "Individual & Group Therapy",
      notes: "Mental health therapy sessions",
      category: "Therapy",
      paymentMethod: "Bank Transfer",
      patientId: "PAT004",
      invoiceNumber: "THR-2024-078"
    }
  ];

  // Calculate dashboard statistics
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthRecords = incomeRecords.filter(record => record.date.startsWith(currentMonth));
  
  const dashboardStats = {
    totalIncomeAllTime: incomeRecords.reduce((sum, record) => sum + record.amount, 0),
    totalIncomeThisMonth: currentMonthRecords.reduce((sum, record) => sum + record.amount, 0),
    recordsCount: incomeRecords.length,
    averagePerRecord: incomeRecords.length > 0 ? incomeRecords.reduce((sum, record) => sum + record.amount, 0) / incomeRecords.length : 0,
    topCategory: getTopCategory(incomeRecords),
    monthlyGrowth: calculateMonthlyGrowth(incomeRecords)
  };

  function getTopCategory(records: IncomeRecord[]) {
    const categoryTotals: { [key: string]: number } = {};
    records.forEach(record => {
      categoryTotals[record.category] = (categoryTotals[record.category] || 0) + record.amount;
    });
    return Object.keys(categoryTotals).reduce((a, b) => categoryTotals[a] > categoryTotals[b] ? a : b, '');
  }

  function calculateMonthlyGrowth(records: IncomeRecord[]) {
    const currentMonth = new Date();
    const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1);
    
    const currentMonthTotal = records
      .filter(record => record.date.startsWith(currentMonth.toISOString().slice(0, 7)))
      .reduce((sum, record) => sum + record.amount, 0);
    
    const lastMonthTotal = records
      .filter(record => record.date.startsWith(lastMonth.toISOString().slice(0, 7)))
      .reduce((sum, record) => sum + record.amount, 0);
    
    if (lastMonthTotal === 0) return 0;
    return ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;
  }

  const categories = [...new Set(incomeRecords.map(record => record.category))];
  const paymentMethods = [...new Set(incomeRecords.map(record => record.paymentMethod))];

  const filteredRecords = incomeRecords.filter(record => {
    const matchesSearch = record.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.incomeType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || record.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddRecord = () => {
    setShowAddForm(true);
    setEditingRecord(null);
  };

  const handleEditRecord = (record: IncomeRecord) => {
    setEditingRecord(record);
    setShowAddForm(true);
  };

  const handleDeleteRecord = (recordId: string) => {
    if (confirm("Are you sure you want to delete this income record?")) {
      toast({
        title: "Record Deleted",
        description: "Income record has been successfully deleted.",
      });
    }
  };

  const getCategoryBreakdown = () => {
    const breakdown: { [key: string]: number } = {};
    incomeRecords.forEach(record => {
      breakdown[record.category] = (breakdown[record.category] || 0) + record.amount;
    });
    return Object.entries(breakdown).map(([category, amount]) => ({ category, amount }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                Hospital Income Management (Kenya)
              </h1>
              <p className="text-gray-600 mt-1">Track and manage all hospital revenue streams in KSH</p>
            </div>
            <Badge variant="secondary" className="px-3 py-1">
              <Calendar className="h-4 w-4 mr-1" />
              KSH {dashboardStats.totalIncomeThisMonth.toLocaleString()} This Month
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Income Dashboard
            </TabsTrigger>
            <TabsTrigger value="records" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Income Records
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Income (All Time)</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">KSH {dashboardStats.totalIncomeAllTime.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Since hospital inception
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">This Month Income</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">KSH {dashboardStats.totalIncomeThisMonth.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {dashboardStats.monthlyGrowth > 0 ? '+' : ''}{dashboardStats.monthlyGrowth.toFixed(1)}% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Per Transaction</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">KSH {dashboardStats.averagePerRecord.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Across {dashboardStats.recordsCount} transactions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Top Revenue Category</CardTitle>
                  <PieChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.topCategory}</div>
                  <p className="text-xs text-muted-foreground">
                    Highest earning category
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Income by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getCategoryBreakdown().map(({ category, amount }) => {
                    const percentage = (amount / dashboardStats.totalIncomeAllTime) * 100;
                    return (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{category}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-600 h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-bold min-w-[100px] text-right">
                            KSH {amount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Records Tab */}
          <TabsContent value="records" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Income Records Management</CardTitle>
                  <Button onClick={handleAddRecord} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Income Record
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search and Filter */}
                <div className="flex gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search by source, type, or invoice number..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>

                {/* Income Records Table */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Income Type</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Amount (KSH)</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{record.date}</TableCell>
                        <TableCell className="font-medium">{record.incomeType}</TableCell>
                        <TableCell>{record.source}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{record.category}</Badge>
                        </TableCell>
                        <TableCell className="font-bold">
                          KSH {record.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>{record.paymentMethod}</TableCell>
                        <TableCell className="font-mono text-sm">{record.invoiceNumber}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEditRecord(record)}>
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setSelectedRecord(record)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDeleteRecord(record.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}