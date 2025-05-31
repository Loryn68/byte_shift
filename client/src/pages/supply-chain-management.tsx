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
  Package, TrendingUp, AlertTriangle, Truck, Users, BarChart3, 
  Brain, ShoppingCart, Warehouse, Settings, Clock, DollarSign,
  RefreshCw, Download, Upload, Plus, Edit3, Trash2, Eye,
  Target, Activity, Zap, Shield, Leaf, Globe
} from "lucide-react";

export default function SupplyChainManagement() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [demandPeriod, setDemandPeriod] = useState("30");
  const [aiInsights, setAiInsights] = useState<any[]>([]);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Comprehensive supply chain data with AI-driven insights
  const supplyChainMetrics = {
    inventoryTurnover: 8.2,
    orderFillRate: 96.8,
    averageLeadTime: 4.2,
    stockoutRate: 2.1,
    inventoryHoldingCosts: 245000,
    costPerPatientDay: 125,
    supplierOnTimeRate: 94.5,
    emergencyOrderRate: 8.3
  };

  const inventoryCategories = [
    { id: "pharmaceuticals", name: "Pharmaceuticals", items: 1250, value: 2850000, turnover: 12.4 },
    { id: "medical_devices", name: "Medical Devices", items: 850, value: 4200000, turnover: 6.8 },
    { id: "surgical_supplies", name: "Surgical Supplies", items: 620, value: 1750000, turnover: 15.2 },
    { id: "diagnostic_equipment", name: "Diagnostic Equipment", items: 320, value: 8900000, turnover: 3.2 },
    { id: "consumables", name: "Consumables", items: 2100, value: 980000, turnover: 24.6 }
  ];

  const criticalItems = [
    {
      id: 1,
      name: "Ventilator Circuits",
      category: "Medical Devices",
      currentStock: 45,
      parLevel: 100,
      maxLevel: 200,
      leadTime: 7,
      avgConsumption: 12,
      status: "critical",
      aiPrediction: "High demand expected - increase by 40%",
      lastOrdered: "2024-01-25"
    },
    {
      id: 2,
      name: "Insulin (Rapid Acting)",
      category: "Pharmaceuticals",
      currentStock: 180,
      parLevel: 150,
      maxLevel: 300,
      leadTime: 3,
      avgConsumption: 25,
      status: "optimal",
      aiPrediction: "Stable demand - maintain current levels",
      lastOrdered: "2024-01-28"
    },
    {
      id: 3,
      name: "Surgical Masks (N95)",
      category: "Consumables",
      currentStock: 520,
      parLevel: 1000,
      maxLevel: 2000,
      leadTime: 2,
      avgConsumption: 85,
      status: "low",
      aiPrediction: "Seasonal increase expected - order 500 units",
      lastOrdered: "2024-01-20"
    }
  ];

  const suppliers = [
    {
      id: 1,
      name: "MedSupply Global Ltd",
      category: "Primary Supplier",
      performance: 96.2,
      onTimeDelivery: 94.8,
      qualityRating: 98.1,
      totalOrders: 156,
      activeContracts: 12,
      riskLevel: "low"
    },
    {
      id: 2,
      name: "PharmaCorp International",
      category: "Pharmaceuticals",
      performance: 91.5,
      onTimeDelivery: 89.2,
      qualityRating: 95.7,
      totalOrders: 89,
      activeContracts: 8,
      riskLevel: "medium"
    },
    {
      id: 3,
      name: "TechMed Solutions",
      category: "Medical Equipment",
      performance: 98.7,
      onTimeDelivery: 97.9,
      qualityRating: 99.2,
      totalOrders: 42,
      activeContracts: 5,
      riskLevel: "low"
    }
  ];

  // AI-powered demand forecasting function
  const generateAIInsights = async () => {
    setIsGeneratingInsights(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const insights = [
        {
          type: "demand_forecast",
          title: "Increased Respiratory Equipment Demand",
          description: "AI predicts 35% increase in ventilator and oxygen therapy supplies over next 30 days",
          confidence: 87,
          recommendation: "Increase inventory levels for respiratory equipment by 40%",
          impact: "high",
          category: "Medical Devices"
        },
        {
          type: "cost_optimization",
          title: "Bulk Purchase Opportunity",
          description: "Analysis shows 15% cost savings potential on surgical supplies through bulk ordering",
          confidence: 92,
          recommendation: "Consolidate next 3 months of surgical supply orders",
          impact: "medium",
          category: "Cost Savings"
        },
        {
          type: "supplier_risk",
          title: "Supplier Diversification Alert",
          description: "Over-reliance on single supplier for critical pharmaceuticals detected",
          confidence: 78,
          recommendation: "Identify 2 alternative suppliers for top 10 critical medications",
          impact: "high",
          category: "Risk Management"
        },
        {
          type: "expiry_optimization",
          title: "Expiry Date Optimization",
          description: "AI identified items with high expiry risk - potential waste of KSH 45,000",
          confidence: 95,
          recommendation: "Implement FEFO rotation and adjust reorder quantities",
          impact: "medium",
          category: "Waste Reduction"
        }
      ];
      
      setAiInsights(insights);
      setIsGeneratingInsights(false);
      
      toast({
        title: "AI Analysis Complete",
        description: `Generated ${insights.length} actionable insights for supply chain optimization`,
      });
    }, 3000);
  };

  useEffect(() => {
    // Auto-generate insights on component mount
    generateAIInsights();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical": return "bg-red-500";
      case "low": return "bg-orange-500";
      case "optimal": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high": return "border-red-200 bg-red-50";
      case "medium": return "border-orange-200 bg-orange-50";
      case "low": return "border-green-200 bg-green-50";
      default: return "border-gray-200 bg-gray-50";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header with Logo */}
      <div className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <img 
              src="/logo.png" 
              alt="Child Mental Haven" 
              className="h-16 w-auto"
            />
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-green-600">Child Mental Haven</h1>
              <p className="text-sm text-blue-600 font-medium">- Where Young Minds Evolve</p>
              <p className="text-xs text-gray-600 ml-4">Supply Chain Management System</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Date: {new Date().toLocaleDateString()}</p>
            <p className="text-sm text-gray-600">Time: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Brain className="h-8 w-8 text-blue-600" />
                AI-Powered Supply Chain Management
              </h1>
              <p className="text-gray-600 mt-1">Intelligent hospital supply chain optimization with predictive analytics</p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={generateAIInsights} 
                disabled={isGeneratingInsights}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isGeneratingInsights ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4 mr-2" />
                )}
                Generate AI Insights
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 bg-white shadow-sm">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="procurement" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Procurement
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Suppliers
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="logistics" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Logistics
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
                      <p className="text-sm font-medium text-gray-600">Inventory Turnover</p>
                      <p className="text-3xl font-bold text-gray-900">{supplyChainMetrics.inventoryTurnover}</p>
                      <p className="text-sm text-green-600">+12% from last month</p>
                    </div>
                    <Package className="h-12 w-12 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Order Fill Rate</p>
                      <p className="text-3xl font-bold text-gray-900">{supplyChainMetrics.orderFillRate}%</p>
                      <p className="text-sm text-green-600">Target: 95%</p>
                    </div>
                    <Target className="h-12 w-12 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Stockout Rate</p>
                      <p className="text-3xl font-bold text-gray-900">{supplyChainMetrics.stockoutRate}%</p>
                      <p className="text-sm text-orange-600">-0.5% improvement</p>
                    </div>
                    <AlertTriangle className="h-12 w-12 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Cost Per Patient Day</p>
                      <p className="text-3xl font-bold text-gray-900">KSH {supplyChainMetrics.costPerPatientDay}</p>
                      <p className="text-sm text-green-600">-KSH 8 reduction</p>
                    </div>
                    <DollarSign className="h-12 w-12 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Insights Section */}
            <Card className="shadow-lg border-l-4 border-l-blue-600">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-6 w-6 text-blue-600" />
                  AI-Generated Insights & Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isGeneratingInsights ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mr-3" />
                    <span className="text-lg">Analyzing supply chain data...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {aiInsights.map((insight, index) => (
                      <Card key={index} className={`border-2 ${getImpactColor(insight.impact)}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <Badge variant="outline" className="text-xs">
                              {insight.category}
                            </Badge>
                            <Badge variant={insight.impact === 'high' ? 'destructive' : insight.impact === 'medium' ? 'default' : 'secondary'}>
                              {insight.confidence}% confidence
                            </Badge>
                          </div>
                          <h4 className="font-semibold text-sm mb-2">{insight.title}</h4>
                          <p className="text-xs text-gray-600 mb-3">{insight.description}</p>
                          <div className="bg-white p-2 rounded border">
                            <p className="text-xs font-medium text-blue-800">AI Recommendation:</p>
                            <p className="text-xs text-gray-700">{insight.recommendation}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Critical Items Alert */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Critical Inventory Items Requiring Attention
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {criticalItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(item.status)}`}></div>
                        <div>
                          <h4 className="font-semibold">{item.name}</h4>
                          <p className="text-sm text-gray-600">{item.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{item.currentStock}/{item.parLevel}</p>
                        <p className="text-sm text-gray-600">Current/Par Level</p>
                      </div>
                      <div className="text-right max-w-xs">
                        <p className="text-sm font-medium text-blue-700">AI Prediction:</p>
                        <p className="text-xs text-gray-600">{item.aiPrediction}</p>
                      </div>
                      <Button size="sm" variant="outline">
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Reorder
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Inventory Management</h2>
              <div className="flex gap-3">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {inventoryCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </div>

            {/* Category Overview */}
            <div className="grid grid-cols-5 gap-4">
              {inventoryCategories.map((category) => (
                <Card key={category.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm mb-2">{category.name}</h3>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600">{category.items} items</p>
                      <p className="text-sm font-bold">KSH {category.value.toLocaleString()}</p>
                      <Badge variant="outline" className="text-xs">
                        {category.turnover}x turnover
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Inventory Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Item Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Par/Max Level</TableHead>
                      <TableHead>Lead Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>AI Prediction</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {criticalItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{item.currentStock}</TableCell>
                        <TableCell>{item.parLevel}/{item.maxLevel}</TableCell>
                        <TableCell>{item.leadTime} days</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="text-sm">{item.aiPrediction}</p>
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
                              <ShoppingCart className="h-4 w-4" />
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

          {/* Procurement Tab */}
          <TabsContent value="procurement" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Procurement Management</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Purchase Order
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pending Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-orange-600">23</p>
                    <p className="text-sm text-gray-600">Awaiting approval</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">In Transit</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">47</p>
                    <p className="text-sm text-gray-600">Expected delivery</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">This Month Spend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">KSH 485K</p>
                    <p className="text-sm text-gray-600">vs KSH 520K last month</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI-Recommended Orders */}
            <Card className="border-l-4 border-l-purple-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  AI-Recommended Purchase Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-purple-50">
                    <div>
                      <h4 className="font-semibold">Respiratory Equipment Bundle</h4>
                      <p className="text-sm text-gray-600">Based on predicted 35% demand increase</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">KSH 28,500</p>
                      <Badge className="bg-purple-600">95% confidence</Badge>
                    </div>
                    <Button variant="outline">Review Order</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Suppliers Tab */}
          <TabsContent value="suppliers" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Supplier Management</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Supplier
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Supplier Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Performance Score</TableHead>
                      <TableHead>On-Time Delivery</TableHead>
                      <TableHead>Quality Rating</TableHead>
                      <TableHead>Risk Level</TableHead>
                      <TableHead>Active Contracts</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suppliers.map((supplier) => (
                      <TableRow key={supplier.id}>
                        <TableCell className="font-medium">{supplier.name}</TableCell>
                        <TableCell>{supplier.category}</TableCell>
                        <TableCell>
                          <Badge variant={supplier.performance > 95 ? 'default' : 'secondary'}>
                            {supplier.performance}%
                          </Badge>
                        </TableCell>
                        <TableCell>{supplier.onTimeDelivery}%</TableCell>
                        <TableCell>{supplier.qualityRating}%</TableCell>
                        <TableCell>
                          <Badge variant={supplier.riskLevel === 'low' ? 'default' : 'destructive'}>
                            {supplier.riskLevel}
                          </Badge>
                        </TableCell>
                        <TableCell>{supplier.activeContracts}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Supply Chain Analytics</h2>
              <div className="flex gap-3">
                <Select value={demandPeriod} onValueChange={setDemandPeriod}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 Days</SelectItem>
                    <SelectItem value="30">30 Days</SelectItem>
                    <SelectItem value="90">90 Days</SelectItem>
                    <SelectItem value="365">1 Year</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>

            {/* Analytics Cards */}
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Demand Forecasting Accuracy</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-green-600">87.3%</p>
                    <p className="text-sm text-gray-600">AI prediction accuracy</p>
                    <Badge className="mt-2 bg-green-600">+5.2% improvement</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cost Savings Achieved</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-blue-600">KSH 127K</p>
                    <p className="text-sm text-gray-600">Through AI optimization</p>
                    <Badge className="mt-2 bg-blue-600">This quarter</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sustainability Metrics */}
            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-green-600" />
                  Sustainability & Ethical Sourcing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">85%</p>
                    <p className="text-sm text-gray-600">Eco-friendly suppliers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">-23%</p>
                    <p className="text-sm text-gray-600">Waste reduction</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">92%</p>
                    <p className="text-sm text-gray-600">Ethical sourcing compliance</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Logistics Tab */}
          <TabsContent value="logistics" className="space-y-6">
            <h2 className="text-2xl font-bold">Logistics & Distribution</h2>
            
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Truck className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-sm text-gray-600">Active Deliveries</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <Warehouse className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <p className="text-2xl font-bold">98.2%</p>
                  <p className="text-sm text-gray-600">Warehouse Efficiency</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                  <p className="text-2xl font-bold">4.2</p>
                  <p className="text-sm text-gray-600">Avg Lead Time (days)</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <p className="text-2xl font-bold">99.1%</p>
                  <p className="text-sm text-gray-600">Quality Assurance</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-2xl font-bold">Supply Chain Settings</h2>
            
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Demand Forecasting Model</Label>
                    <Select defaultValue="advanced">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic Statistical</SelectItem>
                        <SelectItem value="advanced">Advanced ML</SelectItem>
                        <SelectItem value="hybrid">Hybrid AI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Prediction Confidence Threshold</Label>
                    <Input type="number" defaultValue="80" />
                  </div>
                  
                  <div>
                    <Label>Auto-reorder AI Recommendations</Label>
                    <Select defaultValue="manual">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual Review</SelectItem>
                        <SelectItem value="auto">Automatic</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
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
                    <Label>Stock Alert Threshold (%)</Label>
                    <Input type="number" defaultValue="20" />
                  </div>
                  
                  <div>
                    <Label>Expiry Alert (days before)</Label>
                    <Input type="number" defaultValue="30" />
                  </div>
                  
                  <div>
                    <Label>Supplier Performance Alert</Label>
                    <Input type="number" defaultValue="90" />
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