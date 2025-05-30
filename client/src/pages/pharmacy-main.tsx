import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Package, Pill } from "lucide-react";
import PharmacyInventory from "./pharmacy-inventory";
import PharmacyPrescriptions from "./pharmacy-prescriptions";

export default function PharmacyMain() {
  const [activeTab, setActiveTab] = useState("prescriptions");

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Pill className="h-8 w-8 text-blue-600" />
          Pharmacy Management
        </h1>
        <p className="text-gray-600">Manage prescriptions, inventory, and medication dispensing</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="prescriptions" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Prescriptions
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Inventory
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prescriptions" className="mt-6">
          <PharmacyPrescriptions />
        </TabsContent>

        <TabsContent value="inventory" className="mt-6">
          <PharmacyInventory />
        </TabsContent>
      </Tabs>
    </div>
  );
}