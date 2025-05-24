import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2, Plus, Receipt } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import PrintableInvoice from "./printable-invoice";
import type { Billing, Patient } from "@shared/schema";

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface ItemizedBillModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  billing: Billing;
  patient: Patient;
}

export default function ItemizedBillModal({ open, onOpenChange, billing, patient }: ItemizedBillModalProps) {
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      description: billing.serviceDescription || "General Consultation",
      quantity: 1,
      unitPrice: Number(billing.amount) || 0,
      totalPrice: Number(billing.amount) || 0,
    }
  ]);
  const [showPrintableInvoice, setShowPrintableInvoice] = useState(false);

  const addItem = () => {
    setItems([...items, {
      description: "",
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
    }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto-calculate total price when quantity or unit price changes
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].totalPrice = newItems[index].quantity * newItems[index].unitPrice;
    }
    
    setItems(newItems);
  };

  const getTotalAmount = () => {
    return items.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const handlePrintInvoice = () => {
    setShowPrintableInvoice(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Receipt className="w-5 h-5" />
              <span>Itemized Bill - {billing.billId}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Patient Information */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Patient Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Name:</strong> {patient.firstName} {patient.lastName}</p>
                  <p><strong>Patient ID:</strong> {patient.patientId}</p>
                </div>
                <div>
                  <p><strong>Phone:</strong> {patient.phone}</p>
                  <p><strong>Service Type:</strong> {billing.serviceType}</p>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800">Service Items</h3>
                <Button onClick={addItem} variant="outline" size="sm" className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Add Item</span>
                </Button>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-3 font-medium">Description</th>
                      <th className="text-center p-3 font-medium">Qty</th>
                      <th className="text-right p-3 font-medium">Unit Price</th>
                      <th className="text-right p-3 font-medium">Total</th>
                      <th className="w-16 p-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index} className="border-t border-gray-200">
                        <td className="p-3">
                          <Input
                            value={item.description}
                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                            placeholder="Service description"
                            className="w-full"
                          />
                        </td>
                        <td className="p-3">
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-20 text-center"
                          />
                        </td>
                        <td className="p-3">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-32 text-right"
                          />
                        </td>
                        <td className="p-3 text-right font-medium">
                          {formatCurrency(item.totalPrice)}
                        </td>
                        <td className="p-3">
                          {items.length > 1 && (
                            <Button
                              onClick={() => removeItem(index)}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-medium">{formatCurrency(getTotalAmount())}</span>
                </div>
                {Number(billing.discount) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-{formatCurrency(Number(billing.discount))}</span>
                  </div>
                )}
                <hr className="border-gray-300" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount:</span>
                  <span>{formatCurrency(getTotalAmount() - Number(billing.discount || 0))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Status:</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    billing.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 
                    billing.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {billing.paymentStatus.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button onClick={handlePrintInvoice} className="bg-blue-600 hover:bg-blue-700">
                Generate Invoice
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Printable Invoice */}
      {showPrintableInvoice && (
        <PrintableInvoice
          billing={billing}
          patient={patient}
          items={items}
          onClose={() => setShowPrintableInvoice(false)}
        />
      )}
    </>
  );
}