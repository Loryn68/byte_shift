import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Pill, Package, AlertTriangle, Plus, Minus, Edit, TrendingDown, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const pharmacyInventory = [
  // ANALGESICS, NSAIDS & ANTIPYRETICS
  { id: 1, name: "Paracetamol 500mg", category: "Analgesics", stock: 500, unit: "tablets", price: 5, reorderLevel: 100, supplier: "Pharmaceutical Ltd" },
  { id: 2, name: "Tramadol 50mg", category: "Analgesics", stock: 200, unit: "tablets", price: 15, reorderLevel: 50, supplier: "MedSupply Co" },
  { id: 3, name: "Etoricoxib 90mg", category: "Analgesics", stock: 150, unit: "tablets", price: 25, reorderLevel: 30, supplier: "Global Pharma" },
  { id: 4, name: "Ibuprofen 400mg", category: "Analgesics", stock: 300, unit: "tablets", price: 8, reorderLevel: 75, supplier: "HealthCare Inc" },
  { id: 5, name: "Diclofenac 100mg", category: "Analgesics", stock: 250, unit: "tablets", price: 12, reorderLevel: 60, supplier: "MedSupply Co" },
  { id: 6, name: "Meloxicam 7.5mg", category: "Analgesics", stock: 180, unit: "tablets", price: 18, reorderLevel: 40, supplier: "Pharmaceutical Ltd" },
  { id: 7, name: "Doloact MR", category: "Analgesics", stock: 100, unit: "tablets", price: 35, reorderLevel: 25, supplier: "Specialty Meds" },
  { id: 8, name: "Buscopan 10mg", category: "Analgesics", stock: 200, unit: "tablets", price: 12, reorderLevel: 50, supplier: "Global Pharma" },
  { id: 9, name: "Buscopan plus 500/10mg", category: "Analgesics", stock: 150, unit: "tablets", price: 18, reorderLevel: 35, supplier: "Global Pharma" },
  { id: 10, name: "Hyoscine Butylbromide 10mg", category: "Analgesics", stock: 120, unit: "tablets", price: 14, reorderLevel: 30, supplier: "MedSupply Co" },

  // ANTIPSYCHOTICS
  { id: 11, name: "Risperidone 2mg", category: "Antipsychotics", stock: 120, unit: "tablets", price: 45, reorderLevel: 25, supplier: "Mental Health Pharma" },
  { id: 12, name: "Risperidone 1mg", category: "Antipsychotics", stock: 150, unit: "tablets", price: 40, reorderLevel: 30, supplier: "Mental Health Pharma" },
  { id: 13, name: "Quetiapine 50mg", category: "Antipsychotics", stock: 100, unit: "tablets", price: 50, reorderLevel: 20, supplier: "Specialty Meds" },
  { id: 14, name: "Quetiapine 100mg", category: "Antipsychotics", stock: 80, unit: "tablets", price: 65, reorderLevel: 15, supplier: "Specialty Meds" },
  { id: 15, name: "Quetiapine 150mg", category: "Antipsychotics", stock: 60, unit: "tablets", price: 75, reorderLevel: 12, supplier: "Specialty Meds" },
  { id: 16, name: "Quetiapine 200mg", category: "Antipsychotics", stock: 70, unit: "tablets", price: 85, reorderLevel: 15, supplier: "Specialty Meds" },
  { id: 17, name: "Quetiapine 300mg", category: "Antipsychotics", stock: 50, unit: "tablets", price: 95, reorderLevel: 10, supplier: "Specialty Meds" },
  { id: 18, name: "Quetiapine SR 100mg", category: "Antipsychotics", stock: 45, unit: "tablets", price: 75, reorderLevel: 10, supplier: "Specialty Meds" },
  { id: 19, name: "Quetiapine SR 200mg", category: "Antipsychotics", stock: 40, unit: "tablets", price: 95, reorderLevel: 8, supplier: "Specialty Meds" },
  { id: 20, name: "Olanzapine 5mg", category: "Antipsychotics", stock: 90, unit: "tablets", price: 55, reorderLevel: 20, supplier: "Mental Health Pharma" },
  { id: 21, name: "Olanzapine 10mg", category: "Antipsychotics", stock: 75, unit: "tablets", price: 70, reorderLevel: 15, supplier: "Mental Health Pharma" },
  { id: 22, name: "Aripiprazole 10mg", category: "Antipsychotics", stock: 60, unit: "tablets", price: 80, reorderLevel: 12, supplier: "Specialty Meds" },
  { id: 23, name: "Aripiprazole 15mg", category: "Antipsychotics", stock: 55, unit: "tablets", price: 90, reorderLevel: 10, supplier: "Specialty Meds" },
  { id: 24, name: "Aripiprazole 30mg", category: "Antipsychotics", stock: 40, unit: "tablets", price: 110, reorderLevel: 8, supplier: "Specialty Meds" },
  { id: 25, name: "Haloperidol 5mg", category: "Antipsychotics", stock: 100, unit: "tablets", price: 25, reorderLevel: 25, supplier: "Generic Pharma" },
  { id: 26, name: "Chlorpromazine 100mg", category: "Antipsychotics", stock: 80, unit: "tablets", price: 30, reorderLevel: 20, supplier: "Generic Pharma" },
  { id: 27, name: "Chlorpromazine 25mg", category: "Antipsychotics", stock: 120, unit: "tablets", price: 20, reorderLevel: 30, supplier: "Generic Pharma" },

  // MOOD STABILIZERS
  { id: 28, name: "Lamotrigine 100mg", category: "Mood Stabilizers", stock: 80, unit: "tablets", price: 60, reorderLevel: 15, supplier: "Neuro Pharma" },
  { id: 29, name: "Lamotrigine 25mg", category: "Mood Stabilizers", stock: 100, unit: "tablets", price: 45, reorderLevel: 20, supplier: "Neuro Pharma" },
  { id: 30, name: "Sodium Valproate 200mg", category: "Mood Stabilizers", stock: 150, unit: "tablets", price: 35, reorderLevel: 30, supplier: "Neuro Pharma" },
  { id: 31, name: "Sodium Valproate 500mg", category: "Mood Stabilizers", stock: 120, unit: "tablets", price: 50, reorderLevel: 25, supplier: "Neuro Pharma" },
  { id: 32, name: "Sodium Valproate 750mg", category: "Mood Stabilizers", stock: 90, unit: "tablets", price: 65, reorderLevel: 18, supplier: "Neuro Pharma" },
  { id: 33, name: "Carbamazepine 200mg", category: "Mood Stabilizers", stock: 100, unit: "tablets", price: 40, reorderLevel: 20, supplier: "Neuro Pharma" },
  { id: 34, name: "Lithium Carbonate 400mg", category: "Mood Stabilizers", stock: 60, unit: "tablets", price: 55, reorderLevel: 12, supplier: "Specialty Meds" },

  // ANTIDEPRESSANTS AND CNS DRUGS
  { id: 35, name: "Mirtazapine 15mg", category: "Antidepressants", stock: 80, unit: "tablets", price: 65, reorderLevel: 15, supplier: "Mental Health Pharma" },
  { id: 36, name: "Mirtazapine 30mg", category: "Antidepressants", stock: 70, unit: "tablets", price: 75, reorderLevel: 12, supplier: "Mental Health Pharma" },
  { id: 37, name: "Sertraline 50mg", category: "Antidepressants", stock: 120, unit: "tablets", price: 55, reorderLevel: 25, supplier: "Mental Health Pharma" },
  { id: 38, name: "Fluoxetine 20mg", category: "Antidepressants", stock: 100, unit: "tablets", price: 45, reorderLevel: 20, supplier: "Mental Health Pharma" },
  { id: 39, name: "Imipramine 25mg", category: "Antidepressants", stock: 90, unit: "tablets", price: 35, reorderLevel: 18, supplier: "Generic Pharma" },
  { id: 40, name: "Amitriptyline 25mg", category: "Antidepressants", stock: 150, unit: "tablets", price: 35, reorderLevel: 30, supplier: "Generic Pharma" },
  { id: 41, name: "Escitalopram 10mg", category: "Antidepressants", stock: 90, unit: "tablets", price: 60, reorderLevel: 18, supplier: "Mental Health Pharma" },
  { id: 42, name: "Procyclidine 5mg", category: "CNS Drugs", stock: 80, unit: "tablets", price: 25, reorderLevel: 15, supplier: "Neuro Pharma" },
  { id: 43, name: "Alprazolam 0.5mg", category: "CNS Drugs", stock: 80, unit: "tablets", price: 25, reorderLevel: 15, supplier: "Controlled Substances" },
  { id: 44, name: "Alprazolam 0.25mg", category: "CNS Drugs", stock: 100, unit: "tablets", price: 20, reorderLevel: 20, supplier: "Controlled Substances" },
  { id: 45, name: "Benzhexol 5mg", category: "CNS Drugs", stock: 70, unit: "tablets", price: 30, reorderLevel: 15, supplier: "Neuro Pharma" },
  { id: 46, name: "Diazepam 5mg", category: "CNS Drugs", stock: 150, unit: "tablets", price: 15, reorderLevel: 30, supplier: "Controlled Substances" },
  { id: 47, name: "Levetiracetam 500mg", category: "CNS Drugs", stock: 60, unit: "tablets", price: 85, reorderLevel: 12, supplier: "Neuro Pharma" },
  { id: 48, name: "Levetiracetam 250mg", category: "CNS Drugs", stock: 80, unit: "tablets", price: 70, reorderLevel: 15, supplier: "Neuro Pharma" },
  { id: 49, name: "Donepezil 5mg", category: "CNS Drugs", stock: 40, unit: "tablets", price: 120, reorderLevel: 8, supplier: "Specialty Meds" },
  { id: 50, name: "Donepezil 10mg", category: "CNS Drugs", stock: 35, unit: "tablets", price: 150, reorderLevel: 7, supplier: "Specialty Meds" },

  // GASTROINTESTINAL
  { id: 51, name: "Bisacodyl 5mg", category: "Gastrointestinal", stock: 300, unit: "tablets", price: 8, reorderLevel: 75, supplier: "Generic Pharma" },
  { id: 52, name: "Loperamide 2mg", category: "Gastrointestinal", stock: 200, unit: "capsules", price: 12, reorderLevel: 50, supplier: "HealthCare Inc" },
  { id: 53, name: "Albendazole 400mg", category: "Gastrointestinal", stock: 150, unit: "tablets", price: 15, reorderLevel: 35, supplier: "Generic Pharma" },
  { id: 54, name: "Mebendazole 100mg", category: "Gastrointestinal", stock: 120, unit: "tablets", price: 12, reorderLevel: 30, supplier: "Generic Pharma" },
  { id: 55, name: "Omeprazole 20mg", category: "Gastrointestinal", stock: 200, unit: "capsules", price: 18, reorderLevel: 50, supplier: "HealthCare Inc" },
  { id: 56, name: "Esomeprazole 20mg", category: "Gastrointestinal", stock: 150, unit: "tablets", price: 25, reorderLevel: 35, supplier: "HealthCare Inc" },
  { id: 57, name: "Esomeprazole 40mg", category: "Gastrointestinal", stock: 120, unit: "tablets", price: 35, reorderLevel: 25, supplier: "HealthCare Inc" },

  // ANTIHYPERTENSIVES
  { id: 58, name: "Atenolol 50mg", category: "Antihypertensives", stock: 200, unit: "tablets", price: 12, reorderLevel: 50, supplier: "Cardio Pharma" },
  { id: 59, name: "Carvedilol 6.25mg", category: "Antihypertensives", stock: 150, unit: "tablets", price: 20, reorderLevel: 35, supplier: "Cardio Pharma" },
  { id: 60, name: "Amlodipine 5mg", category: "Antihypertensives", stock: 250, unit: "tablets", price: 15, reorderLevel: 60, supplier: "Cardio Pharma" },
  { id: 61, name: "Amlodipine 10mg", category: "Antihypertensives", stock: 180, unit: "tablets", price: 20, reorderLevel: 40, supplier: "Cardio Pharma" },
  { id: 62, name: "Enalapril 5mg", category: "Antihypertensives", stock: 150, unit: "tablets", price: 18, reorderLevel: 35, supplier: "Cardio Pharma" },
  { id: 63, name: "Losartan 50mg", category: "Antihypertensives", stock: 200, unit: "tablets", price: 25, reorderLevel: 50, supplier: "Cardio Pharma" },
  { id: 64, name: "Furosemide 40mg", category: "Antihypertensives", stock: 180, unit: "tablets", price: 10, reorderLevel: 45, supplier: "Generic Pharma" },

  // ANTIDIABETICS
  { id: 65, name: "Metformin 1000mg", category: "Antidiabetics", stock: 300, unit: "tablets", price: 20, reorderLevel: 75, supplier: "Diabetes Care" },
  { id: 66, name: "Metformin 850mg", category: "Antidiabetics", stock: 250, unit: "tablets", price: 18, reorderLevel: 60, supplier: "Diabetes Care" },
  { id: 67, name: "Metformin 500mg", category: "Antidiabetics", stock: 400, unit: "tablets", price: 15, reorderLevel: 100, supplier: "Diabetes Care" },
  { id: 68, name: "Glibenclamide 5mg", category: "Antidiabetics", stock: 200, unit: "tablets", price: 12, reorderLevel: 50, supplier: "Diabetes Care" },

  // ANTI-INFECTIVES
  { id: 69, name: "Metronidazole 400mg", category: "Anti-infectives", stock: 250, unit: "tablets", price: 15, reorderLevel: 60, supplier: "Antibiotics Inc" },
  { id: 70, name: "Doxycycline 100mg", category: "Anti-infectives", stock: 150, unit: "tablets", price: 30, reorderLevel: 35, supplier: "Antibiotics Inc" },
  { id: 71, name: "Co-Trimoxazole 960mg", category: "Anti-infectives", stock: 200, unit: "tablets", price: 25, reorderLevel: 50, supplier: "Antibiotics Inc" },
  { id: 72, name: "Amoxicillin 500mg", category: "Anti-infectives", stock: 300, unit: "capsules", price: 25, reorderLevel: 75, supplier: "Antibiotics Inc" },
  { id: 73, name: "Ciprofloxacin 500mg", category: "Anti-infectives", stock: 200, unit: "tablets", price: 35, reorderLevel: 50, supplier: "Antibiotics Inc" },
  { id: 74, name: "Azithromycin 500mg", category: "Anti-infectives", stock: 100, unit: "tablets", price: 45, reorderLevel: 25, supplier: "Specialty Antibiotics" },

  // RESPIRATORY/ANTIHISTAMINES
  { id: 75, name: "Cetirizine 10mg", category: "Antihistamines", stock: 300, unit: "tablets", price: 8, reorderLevel: 75, supplier: "Allergy Care" },
  { id: 76, name: "Chlorpheniramine 4mg", category: "Antihistamines", stock: 250, unit: "tablets", price: 5, reorderLevel: 60, supplier: "Generic Pharma" },
  { id: 77, name: "Salbutamol 4mg", category: "Respiratory", stock: 150, unit: "tablets", price: 12, reorderLevel: 35, supplier: "Respiratory Care" },
  { id: 78, name: "Loratadine 10mg", category: "Antihistamines", stock: 200, unit: "tablets", price: 10, reorderLevel: 50, supplier: "Allergy Care" },

  // PEDIATRIC PREPARATIONS
  { id: 79, name: "Amoxiclav Syrup 100ml", category: "Pediatric", stock: 80, unit: "bottles", price: 45, reorderLevel: 20, supplier: "Pediatric Pharma" },
  { id: 80, name: "Calpol Suspension 100ml", category: "Pediatric", stock: 150, unit: "bottles", price: 25, reorderLevel: 35, supplier: "Pediatric Pharma" },
  { id: 81, name: "Ibuprofen Suspension 60ml", category: "Pediatric", stock: 100, unit: "bottles", price: 20, reorderLevel: 25, supplier: "Pediatric Pharma" },
  { id: 82, name: "Cetirizine Syrup 60ml", category: "Pediatric", stock: 120, unit: "bottles", price: 18, reorderLevel: 30, supplier: "Pediatric Pharma" },

  // INJECTIONS
  { id: 83, name: "Diazepam 5mg/ml injection", category: "Injections", stock: 50, unit: "ampoules", price: 35, reorderLevel: 10, supplier: "Injectable Solutions" },
  { id: 84, name: "Tramadol 100mg injection", category: "Injections", stock: 40, unit: "ampoules", price: 45, reorderLevel: 8, supplier: "Injectable Solutions" },
  { id: 85, name: "Diclofenac injection 25mg/ml", category: "Injections", stock: 60, unit: "ampoules", price: 25, reorderLevel: 12, supplier: "Injectable Solutions" },
  { id: 86, name: "Hydrocortisone 100mg injection", category: "Injections", stock: 30, unit: "vials", price: 55, reorderLevel: 6, supplier: "Steroid Injectables" },

  // TOPICALS
  { id: 87, name: "Hydrocortisone cream 20g", category: "Topicals", stock: 100, unit: "tubes", price: 15, reorderLevel: 25, supplier: "Dermatology Care" },
  { id: 88, name: "Clotrimazole cream 20g", category: "Topicals", stock: 120, unit: "tubes", price: 18, reorderLevel: 30, supplier: "Dermatology Care" },
  { id: 89, name: "Diclofenac gel 20g", category: "Topicals", stock: 80, unit: "tubes", price: 22, reorderLevel: 20, supplier: "Pain Relief Topicals" },

  // VITAMINS/SUPPLEMENTS
  { id: 90, name: "Multivitamin tablets", category: "Vitamins", stock: 200, unit: "tablets", price: 12, reorderLevel: 50, supplier: "Nutrition Plus" },
  { id: 91, name: "Folic acid 5mg", category: "Vitamins", stock: 150, unit: "tablets", price: 8, reorderLevel: 35, supplier: "Nutrition Plus" },
  { id: 92, name: "Vitamin C tablets", category: "Vitamins", stock: 300, unit: "tablets", price: 5, reorderLevel: 75, supplier: "Nutrition Plus" }
];

export default function PharmacyInventory() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<any>(null);
  const [stockAdjustment, setStockAdjustment] = useState({ quantity: 0, type: "add", reason: "" });

  // Filter medications
  const filteredMedications = useMemo(() => {
    return pharmacyInventory.filter(med => {
      const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || med.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  // Get unique categories
  const categories = Array.from(new Set(pharmacyInventory.map(med => med.category)));

  // Get low stock medications
  const lowStockMedications = pharmacyInventory.filter(med => med.stock <= med.reorderLevel);

  // Stock adjustment mutation
  const adjustStockMutation = useMutation({
    mutationFn: async (adjustmentData: any) => {
      // This would integrate with your backend
      return await apiRequest("PUT", `/api/medications/${adjustmentData.medicationId}/stock`, adjustmentData);
    },
    onSuccess: () => {
      toast({
        title: "Stock Updated",
        description: "Medication stock has been adjusted successfully.",
      });
      setShowStockModal(false);
      queryClient.invalidateQueries({ queryKey: ["/api/medications"] });
    },
  });

  const handleStockAdjustment = (medication: any) => {
    setSelectedMedication(medication);
    setShowStockModal(true);
  };

  const submitStockAdjustment = () => {
    if (!selectedMedication) return;
    adjustStockMutation.mutate({
      medicationId: selectedMedication.id,
      ...stockAdjustment
    });
  };

  const getStockStatus = (medication: any) => {
    if (medication.stock <= medication.reorderLevel) return "low";
    if (medication.stock <= medication.reorderLevel * 2) return "medium";
    return "good";
  };

  const getStockBadgeColor = (status: string) => {
    switch (status) {
      case "low": return "destructive";
      case "medium": return "secondary";
      default: return "default";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Package className="h-8 w-8 text-blue-600" />
            Pharmacy Inventory
          </h1>
          <p className="text-gray-600">Child Mental Haven medication stock management</p>
        </div>
      </div>

      {/* Inventory Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Total Medications</CardTitle>
            <Pill className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{pharmacyInventory.length}</div>
            <p className="text-xs text-blue-600">Different medications</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Total Stock Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              KShs {pharmacyInventory.reduce((sum, med) => sum + (med.stock * med.price), 0).toLocaleString()}
            </div>
            <p className="text-xs text-green-600">Current inventory value</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{lowStockMedications.length}</div>
            <p className="text-xs text-orange-600">Need reordering</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Categories</CardTitle>
            <Package className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{categories.length}</div>
            <p className="text-xs text-purple-600">Medication categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search medications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Medication Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Medication Inventory</CardTitle>
          <CardDescription>
            Complete list of available medications with stock levels and pricing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medication</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Unit Price (KShs)</TableHead>
                <TableHead>Total Value (KShs)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMedications.map((medication) => {
                const stockStatus = getStockStatus(medication);
                return (
                  <TableRow key={medication.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{medication.name}</div>
                        <div className="text-sm text-gray-500">{medication.unit}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{medication.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${stockStatus === 'low' ? 'text-red-600' : ''}`}>
                          {medication.stock}
                        </span>
                        {stockStatus === 'low' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                      </div>
                      <div className="text-xs text-gray-500">
                        Reorder at: {medication.reorderLevel}
                      </div>
                    </TableCell>
                    <TableCell>{medication.price.toFixed(2)}</TableCell>
                    <TableCell>{(medication.stock * medication.price).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={getStockBadgeColor(stockStatus)}>
                        {stockStatus === 'low' ? 'Low Stock' : stockStatus === 'medium' ? 'Medium' : 'In Stock'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{medication.supplier}</div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStockAdjustment(medication)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Adjust Stock
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Low Stock Alert */}
      {lowStockMedications.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockMedications.map(med => (
                <div key={med.id} className="flex justify-between items-center p-2 bg-white rounded">
                  <span className="font-medium">{med.name}</span>
                  <span className="text-orange-600">
                    Stock: {med.stock} {med.unit} (Reorder: {med.reorderLevel})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stock Adjustment Modal */}
      <Dialog open={showStockModal} onOpenChange={setShowStockModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adjust Stock - {selectedMedication?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Current Stock: {selectedMedication?.stock} {selectedMedication?.unit}</Label>
            </div>
            <div>
              <Label>Adjustment Type</Label>
              <Select value={stockAdjustment.type} onValueChange={(value) => setStockAdjustment({...stockAdjustment, type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">Add Stock</SelectItem>
                  <SelectItem value="subtract">Remove Stock</SelectItem>
                  <SelectItem value="set">Set Stock Level</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Quantity</Label>
              <Input
                type="number"
                value={stockAdjustment.quantity}
                onChange={(e) => setStockAdjustment({...stockAdjustment, quantity: parseInt(e.target.value) || 0})}
                placeholder="Enter quantity"
              />
            </div>
            <div>
              <Label>Reason</Label>
              <Input
                value={stockAdjustment.reason}
                onChange={(e) => setStockAdjustment({...stockAdjustment, reason: e.target.value})}
                placeholder="Reason for adjustment"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowStockModal(false)}>
                Cancel
              </Button>
              <Button onClick={submitStockAdjustment} disabled={adjustStockMutation.isPending}>
                {adjustStockMutation.isPending ? "Updating..." : "Update Stock"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}