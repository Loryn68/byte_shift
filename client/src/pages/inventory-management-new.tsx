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
  Package, Scan, MapPin, Clock, AlertTriangle, TrendingUp, 
  BarChart3, Search, Plus, Edit3, Trash2, Eye, Download,
  RefreshCw, CheckCircle, XCircle, Calendar, Truck,
  ShoppingCart, Archive, Settings, Filter, ScanLine
} from "lucide-react";

export default function InventoryManagement() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [scanMode, setScanMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Core inventory metrics and KPIs
  const inventoryMetrics = {
    totalItems: 8945,
    totalValue: 12500000,
    lowStockItems: 47,
    expiringSoon: 23,
    stockouts: 8,
    inventoryTurnover: 8.2,
    wastageRate: 2.1,
    accuracy: 98.7
  };

  // Inventory locations throughout the hospital
  const locations = [
    { id: "central", name: "Central Sterile Supply", items: 2450, value: 4200000 },
    { id: "pharmacy", name: "Main Pharmacy", items: 1850, value: 3800000 },
    { id: "er", name: "Emergency Department", items: 380, value: 450000 },
    { id: "icu", name: "Intensive Care Unit", items: 520, value: 750000 },
    { id: "or", name: "Operating Rooms", items: 890, value: 1200000 },
    { id: "wards", name: "General Wards", items: 1680, value: 890000 },
    { id: "lab", name: "Laboratory", items: 725, value: 980000 },
    { id: "radiology", name: "Radiology", items: 450, value: 520000 }
  ];

  // Item categories with ABC analysis
  const categories = [
    { id: "pharmaceuticals", name: "Pharmaceuticals", classification: "A", items: 2100, value: 5200000, turnover: 12.4 },
    { id: "surgical", name: "Surgical Supplies", classification: "A", items: 850, value: 2800000, turnover: 15.2 },
    { id: "medical_devices", name: "Medical Devices", classification: "B", items: 620, value: 1900000, turnover: 6.8 },
    { id: "consumables", name: "Consumables", classification: "C", items: 3200, value: 1200000, turnover: 24.6 },
    { id: "equipment", name: "Equipment", classification: "B", items: 285, value: 1400000, turnover: 3.2 },
    { id: "lab_reagents", name: "Lab Reagents", classification: "A", items: 890, value: 980000, turnover: 18.7 }
  ];

  // Critical inventory items requiring attention
  const criticalItems = [
    {
      id: "INV001",
      name: "Ventilator Circuits - Adult",
      category: "Medical Devices",
      location: "ICU",
      currentStock: 15,
      parLevel: 50,
      maxLevel: 100,
      unitPrice: 85.50,
      expiryDate: "2024-12-15",
      lotNumber: "VT2024-001",
      supplier: "MedTech Solutions",
      status: "critical",
      lastMovement: "2024-01-28",
      barcode: "1234567890123"
    },
    {
      id: "INV002",
      name: "Insulin Glargine 100U/mL",
      category: "Pharmaceuticals",
      location: "Pharmacy",
      currentStock: 180,
      parLevel: 200,
      maxLevel: 400,
      unitPrice: 125.00,
      expiryDate: "2024-08-20",
      lotNumber: "INS2024-045",
      supplier: "PharmaCorp",
      status: "expiring",
      lastMovement: "2024-01-29",
      barcode: "2345678901234"
    },
    {
      id: "INV003",
      name: "Surgical Masks N95",
      category: "Consumables",
      location: "Central Sterile Supply",
      currentStock: 0,
      parLevel: 1000,
      maxLevel: 2000,
      unitPrice: 2.85,
      expiryDate: "2025-06-30",
      lotNumber: "N95-2024-012",
      supplier: "Safety First Ltd",
      status: "stockout",
      lastMovement: "2024-01-25",
      barcode: "3456789012345"
    },
    {
      id: "INV004",
      name: "Blood Collection Tubes - EDTA",
      category: "Lab Reagents",
      location: "Laboratory",
      currentStock: 850,
      parLevel: 500,
      maxLevel: 1500,
      unitPrice: 0.75,
      expiryDate: "2024-11-30",
      lotNumber: "BCT2024-089",
      supplier: "Lab Supplies Inc",
      status: "optimal",
      lastMovement: "2024-01-30",
      barcode: "4567890123456"
    }
  ];

  // Recent inventory transactions
  const recentTransactions = [
    {
      id: "TXN001",
      type: "receipt",
      itemName: "Surgical Gloves - Sterile",
      quantity: 500,
      location: "Central Sterile Supply",
      user: "Dr. Smith",
      timestamp: "2024-01-30 14:30",
      reference: "PO-2024-001"
    },
    {
      id: "TXN002",
      type: "issue",
      itemName: "Insulin Rapid Acting",
      quantity: 25,
      location: "Emergency Department",
      user: "Nurse Johnson",
      timestamp: "2024-01-30 13:45",
      reference: "Patient-12345"
    },
    {
      id: "TXN003",
      type: "adjustment",
      itemName: "IV Fluid 0.9% Saline",
      quantity: -10,
      location: "ICU",
      user: "Pharmacy Tech",
      timestamp: "2024-01-30 12:20",
      reference: "Cycle Count"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical": return "bg-red-500 text-white";
      case "low": return "bg-orange-500 text-white";
      case "expiring": return "bg-yellow-500 text-black";
      case "stockout": return "bg-red-600 text-white";
      case "optimal": return "bg-green-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case "A": return "bg-red-100 text-red-800 border-red-200";
      case "B": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "C": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleScanItem = () => {
    setScanMode(!scanMode);
    if (!scanMode) {
      toast({
        title: "Barcode Scanner Active",
        description: "Ready to scan items for inventory operations",
      });
    }
  };

  const handleCycleCount = () => {
    toast({
      title: "Cycle Count Initiated",
      description: "Physical count verification started for selected location",
    });
  };

  const handleBulkAction = (action: string) => {
    if (selectedItems.length === 0) {
      toast({
        title: "No Items Selected",
        description: "Please select items to perform bulk actions",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: `Bulk ${action} Initiated`,
      description: `Processing ${selectedItems.length} selected items`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Package className="h-8 w-8 text-blue-600" />
              Hospital Inventory Management System
            </h1>
            <p className="text-gray-600 mt-1">Real-time tracking, automated replenishment, and intelligent inventory optimization</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleScanItem}
              variant={scanMode ? "default" : "outline"}
              className={scanMode ? "bg-green-600 hover:bg-green-700" : ""}
            >
              <ScanLine className="h-4 w-4 mr-2" />
              {scanMode ? "Scanner Active" : "Barcode Scanner"}
            </Button>
            <Badge variant="outline" className="px-3 py-1">
              <CheckCircle className="h-4 w-4 mr-1" />
              System Online
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8 bg-white shadow-sm">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Items
            </TabsTrigger>
            <TabsTrigger value="locations" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Locations
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="receiving" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Receiving
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-6">
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Items</p>
                      <p className="text-3xl font-bold text-gray-900">{inventoryMetrics.totalItems.toLocaleString()}</p>
                      <p className="text-sm text-blue-600">Across all locations</p>
                    </div>
                    <Package className="h-12 w-12 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Value</p>
                      <p className="text-3xl font-bold text-gray-900">${(inventoryMetrics.totalValue / 1000000).toFixed(1)}M</p>
                      <p className="text-sm text-green-600">Current inventory worth</p>
                    </div>
                    <BarChart3 className="h-12 w-12 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                      <p className="text-3xl font-bold text-gray-900">{inventoryMetrics.lowStockItems}</p>
                      <p className="text-sm text-orange-600">Requiring attention</p>
                    </div>
                    <AlertTriangle className="h-12 w-12 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-red-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Stock Outs</p>
                      <p className="text-3xl font-bold text-gray-900">{inventoryMetrics.stockouts}</p>
                      <p className="text-sm text-red-600">Critical items</p>
                    </div>
                    <XCircle className="h-12 w-12 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Inventory by Location */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  Inventory Distribution by Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  {locations.map((location) => (
                    <Card key={location.id} className="border hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-sm mb-2">{location.name}</h3>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-600">{location.items.toLocaleString()} items</p>
                          <p className="text-sm font-bold">${(location.value / 1000000).toFixed(1)}M</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* ABC Analysis */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  ABC Analysis - Inventory Classification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Badge className={`px-2 py-1 ${getClassificationColor(category.classification)}`}>
                          Class {category.classification}
                        </Badge>
                        <div>
                          <h4 className="font-semibold">{category.name}</h4>
                          <p className="text-sm text-gray-600">{category.items} items • ${(category.value / 1000000).toFixed(1)}M value</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{category.turnover}x</p>
                        <p className="text-sm text-gray-600">Turnover rate</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Critical Items Alert */}
            <Card className="shadow-lg border-l-4 border-l-red-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Critical Items Requiring Immediate Attention
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {criticalItems.filter(item => item.status === "critical" || item.status === "stockout").map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg bg-red-50">
                      <div className="flex items-center gap-4">
                        <Badge className={getStatusColor(item.status)}>
                          {item.status.toUpperCase()}
                        </Badge>
                        <div>
                          <h4 className="font-semibold">{item.name}</h4>
                          <p className="text-sm text-gray-600">{item.location} • Lot: {item.lotNumber}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{item.currentStock}/{item.parLevel}</p>
                        <p className="text-sm text-gray-600">Current/Par Level</p>
                      </div>
                      <Button size="sm" className="bg-red-600 hover:bg-red-700">
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Reorder Now
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Items Tab */}
          <TabsContent value="inventory" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Inventory Items Management</h2>
              <div className="flex gap-3">
                <div className="flex gap-2">
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {locations.map((loc) => (
                        <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64"
                  />
                  <Button variant="outline">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </div>

            {/* Bulk Actions */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Bulk Actions:</span>
              <Button size="sm" onClick={() => handleBulkAction("Update")}>
                <Edit3 className="h-4 w-4 mr-1" />
                Update
              </Button>
              <Button size="sm" onClick={() => handleBulkAction("Reorder")}>
                <ShoppingCart className="h-4 w-4 mr-1" />
                Reorder
              </Button>
              <Button size="sm" onClick={handleCycleCount}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Cycle Count
              </Button>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>

            {/* Inventory Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-12">
                        <input type="checkbox" className="rounded" />
                      </TableHead>
                      <TableHead>Item Code</TableHead>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Par/Max Level</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {criticalItems.map((item) => (
                      <TableRow key={item.id} className="hover:bg-gray-50">
                        <TableCell>
                          <input type="checkbox" className="rounded" />
                        </TableCell>
                        <TableCell className="font-medium">{item.id}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{item.location}</TableCell>
                        <TableCell>{item.currentStock}</TableCell>
                        <TableCell>{item.parLevel}/{item.maxLevel}</TableCell>
                        <TableCell>${item.unitPrice}</TableCell>
                        <TableCell>{item.expiryDate}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Scan className="h-4 w-4" />
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

          {/* Locations Tab */}
          <TabsContent value="locations" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Location Management</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Location
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {locations.map((location) => (
                <Card key={location.id} className="shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{location.name}</span>
                      <Badge variant="outline">{location.id.toUpperCase()}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Total Items</p>
                        <p className="text-2xl font-bold">{location.items.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Value</p>
                        <p className="text-2xl font-bold">${(location.value / 1000000).toFixed(1)}M</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline">View Items</Button>
                      <Button size="sm" variant="outline">Transfer</Button>
                      <Button size="sm" variant="outline">Count</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Inventory Transactions</h2>
              <div className="flex gap-3">
                <Select defaultValue="today">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentTransactions.map((txn) => (
                      <TableRow key={txn.id}>
                        <TableCell className="font-medium">{txn.id}</TableCell>
                        <TableCell>
                          <Badge variant={txn.type === 'receipt' ? 'default' : txn.type === 'issue' ? 'secondary' : 'outline'}>
                            {txn.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{txn.itemName}</TableCell>
                        <TableCell>{txn.quantity}</TableCell>
                        <TableCell>{txn.location}</TableCell>
                        <TableCell>{txn.user}</TableCell>
                        <TableCell>{txn.timestamp}</TableCell>
                        <TableCell>{txn.reference}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <h2 className="text-2xl font-bold">Inventory Alerts & Notifications</h2>
            
            <div className="grid grid-cols-3 gap-6">
              <Card className="border-l-4 border-l-red-500">
                <CardHeader>
                  <CardTitle className="text-red-700">Critical Stock Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-red-600">{inventoryMetrics.stockouts}</p>
                  <p className="text-sm text-gray-600">Items out of stock</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500">
                <CardHeader>
                  <CardTitle className="text-orange-700">Low Stock Warnings</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-orange-600">{inventoryMetrics.lowStockItems}</p>
                  <p className="text-sm text-gray-600">Items below par level</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-yellow-500">
                <CardHeader>
                  <CardTitle className="text-yellow-700">Expiry Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-yellow-600">{inventoryMetrics.expiringSoon}</p>
                  <p className="text-sm text-gray-600">Items expiring within 30 days</p>
                </CardContent>
              </Card>
            </div>

            {/* Expiring Items */}
            <Card>
              <CardHeader>
                <CardTitle>Items Expiring Soon (Next 30 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {criticalItems.filter(item => item.status === "expiring").map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50">
                      <div>
                        <h4 className="font-semibold">{item.name}</h4>
                        <p className="text-sm text-gray-600">Lot: {item.lotNumber} • Expires: {item.expiryDate}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{item.currentStock} units</p>
                        <p className="text-sm text-gray-600">${(item.currentStock * item.unitPrice).toLocaleString()} value</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <h2 className="text-2xl font-bold">Inventory Reports & Analytics</h2>
            
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Inventory Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Inventory Turnover Rate:</span>
                      <span className="font-bold">{inventoryMetrics.inventoryTurnover}x</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Stock Accuracy:</span>
                      <span className="font-bold text-green-600">{inventoryMetrics.accuracy}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Wastage Rate:</span>
                      <span className="font-bold text-orange-600">{inventoryMetrics.wastageRate}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Generate Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Inventory Valuation Report
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      ABC Analysis Report
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Stock Movement Report
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Expiry Alert Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Receiving Tab */}
          <TabsContent value="receiving" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Goods Receiving</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Receipt
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Pending Deliveries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Truck className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No pending deliveries at this time</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-2xl font-bold">Inventory System Settings</h2>
            
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Reorder Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Default Lead Time (days)</Label>
                    <Input type="number" defaultValue="7" />
                  </div>
                  <div>
                    <Label>Safety Stock Percentage</Label>
                    <Input type="number" defaultValue="20" />
                  </div>
                  <div>
                    <Label>Auto-reorder Threshold</Label>
                    <Select defaultValue="par">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="par">At Par Level</SelectItem>
                        <SelectItem value="below">Below Par Level</SelectItem>
                        <SelectItem value="manual">Manual Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Alert Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Expiry Alert (days before)</Label>
                    <Input type="number" defaultValue="30" />
                  </div>
                  <div>
                    <Label>Low Stock Alert (%)</Label>
                    <Input type="number" defaultValue="20" />
                  </div>
                  <div>
                    <Label>Email Notifications</Label>
                    <Select defaultValue="enabled">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="enabled">Enabled</SelectItem>
                        <SelectItem value="disabled">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}