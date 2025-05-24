import React from "react";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Patient, Billing } from "@shared/schema";
import logoPath from "@assets/image_1748113978202.png";

interface ServiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  date: string;
}

interface DetailedServiceBillProps {
  patient: Patient;
  billingRecords: Billing[];
  invoiceNumber: string;
  admissionDate?: string;
}

export default function DetailedServiceBill({ 
  patient, 
  billingRecords, 
  invoiceNumber, 
  admissionDate 
}: DetailedServiceBillProps) {
  const printBill = () => {
    window.print();
  };

  const downloadBill = () => {
    const element = document.createElement('a');
    const filename = `Service_Bill_${patient.patientId}_${new Date().toISOString().split('T')[0]}.html`;
    const content = document.documentElement.outerHTML;
    const file = new Blob([content], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Group billing records by date
  const servicesByDate = billingRecords.reduce((acc, bill) => {
    const date = formatDate(bill.createdAt);
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push({
      description: bill.serviceDescription,
      quantity: 1,
      unitPrice: Number(bill.amount),
      total: Number(bill.totalAmount),
      date: date
    });
    return acc;
  }, {} as Record<string, ServiceItem[]>);

  const totalAmount = billingRecords.reduce((sum, bill) => sum + Number(bill.totalAmount), 0);
  const currentDate = new Date();
  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Print & Download Buttons - Hidden in print */}
      <div className="p-4 print:hidden flex gap-2">
        <Button onClick={printBill} className="mb-4">
          <Printer className="w-4 h-4 mr-2" />
          Print Bill
        </Button>
        <Button onClick={downloadBill} variant="outline" className="mb-4">
          <Download className="w-4 h-4 mr-2" />
          Download Bill
        </Button>
      </div>

      {/* Bill Content */}
      <div className="p-8 max-w-4xl mx-auto print:p-4 print:max-w-none font-mono text-sm">
        {/* Header */}
        <div className="text-center border-b-2 border-black pb-4 mb-6">
          <div className="flex items-center justify-center mb-4">
            <img src={logoPath} alt="Child Mental Haven Logo" className="h-16 w-auto" />
          </div>
          <h1 className="text-2xl font-bold mb-1">CHILD MENTAL HAVEN</h1>
          <h2 className="text-lg font-bold mb-3">COMPREHENSIVE MENTAL HEALTH / REHABILITATION</h2>
          
          <div className="text-xs leading-tight">
            <div className="flex justify-between mb-1">
              <span><strong>Phy. Address:</strong> Northern Bypass, Marurui Roysambu Nairobi. Behind Treat Hotel.</span>
            </div>
            <div className="flex justify-between">
              <span><strong>P.O Box:</strong> 1079-00600 Nairobi, Kenya</span>
              <span><strong>Tel:</strong> 0725133444 / 0732-313173</span>
              <span><strong>Email:</strong> childmentalhaven@gmail.com</span>
            </div>
          </div>
        </div>

        {/* Bill Title */}
        <div className="text-center mb-6">
          <h2 className="text-lg font-bold">Patient Detailed Service Bill</h2>
        </div>

        {/* Bill Details */}
        <div className="flex justify-between mb-6 text-xs">
          <div className="space-y-1">
            <p><strong>Print Date:</strong> {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>Patient Name:</strong> {patient.firstName.toUpperCase()} {patient.lastName.toUpperCase()}</p>
            <p><strong>IP No.:</strong> {patient.patientId} <span className="ml-8"><strong>Gender:</strong> {patient.gender}</span></p>
          </div>
          <div className="space-y-1 text-right">
            <p><strong>Invoice / Claim No.:</strong> {invoiceNumber}</p>
            <p><strong>DOA:</strong> {admissionDate ? formatDate(admissionDate) : formatDate(patient.registrationDate)}</p>
            <p><strong>Age:</strong> {calculateAge(patient.dateOfBirth)} Y {new Date().getMonth() - new Date(patient.dateOfBirth).getMonth()} M {new Date().getDate() - new Date(patient.dateOfBirth).getDate()} Days</p>
          </div>
        </div>

        {/* Service Items Header */}
        <div className="border-t border-b border-black py-1 mb-2 text-xs">
          <div className="flex">
            <div className="w-3/5 text-center font-bold">Item Description</div>
            <div className="w-1/5 text-center font-bold">Quantity</div>
            <div className="w-1/5 text-center font-bold">Unit Price</div>
            <div className="w-1/5 text-center font-bold">Total</div>
          </div>
        </div>

        {/* Service Items by Date */}
        {Object.entries(servicesByDate).map(([date, items], dateIndex) => (
          <div key={date} className="mb-6">
            <h3 className="font-bold text-sm mb-2 underline">{date}</h3>
            {items.map((item, itemIndex) => (
              <div key={itemIndex} className="flex text-xs py-0.5">
                <div className="w-8 text-left">{itemIndex + 1}.</div>
                <div className="w-3/5 uppercase pr-2">{item.description}</div>
                <div className="w-1/5 text-center">{item.quantity.toFixed(2)}</div>
                <div className="w-1/5 text-right">{item.unitPrice.toLocaleString()}.00</div>
                <div className="w-1/5 text-right">{item.total.toLocaleString()}.00</div>
              </div>
            ))}
          </div>
        ))}

        {/* Page Footer */}
        <div className="border-t-2 border-black pt-2 mt-8 text-xs">
          <div className="flex justify-between items-center">
            <div>
              <p><strong>Page 1 of 1</strong></p>
            </div>
            <div className="text-right">
              <p><strong>Page Total: Ksh.{totalAmount.toLocaleString()}.00</strong></p>
              <p><strong>Grand Total: Ksh.{totalAmount.toLocaleString()}.00</strong></p>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="mt-8 border-t border-gray-400 pt-4 text-xs">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="font-bold mb-2">PAYMENT SUMMARY</h4>
              <div className="space-y-1">
                <p>Total Bill Amount: Ksh.{totalAmount.toLocaleString()}.00</p>
                <p>Amount Paid: Ksh.{billingRecords.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + Number(b.totalAmount), 0).toLocaleString()}.00</p>
                <p>Balance Due: Ksh.{billingRecords.filter(b => b.paymentStatus === 'pending').reduce((sum, b) => sum + Number(b.totalAmount), 0).toLocaleString()}.00</p>
              </div>
              
              {/* Payment Methods */}
              <div className="mt-4 p-3 border border-gray-300 bg-gray-50 print:bg-white">
                <h5 className="font-bold mb-2">PAYMENT DETAILS</h5>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="cash" className="print:hidden" />
                    <label htmlFor="cash" className="print:hidden">Cash Payment</label>
                    <span className="hidden print:inline">☐ Cash Payment</span>
                    <span className="ml-auto">Amount: Ksh._______</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="bank" className="print:hidden" />
                    <label htmlFor="bank" className="print:hidden">Bank Transfer</label>
                    <span className="hidden print:inline">☐ Bank Transfer</span>
                    <div className="ml-auto flex gap-2">
                      <span>Ref:</span>
                      <input type="text" placeholder="Transaction No." className="border-b border-black bg-transparent text-xs w-24 print:border-none print:bg-white" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="card" className="print:hidden" />
                    <label htmlFor="card" className="print:hidden">Card Payment</label>
                    <span className="hidden print:inline">☐ Card Payment</span>
                    <div className="ml-auto flex gap-2">
                      <span>Ref:</span>
                      <input type="text" placeholder="Card Ref No." className="border-b border-black bg-transparent text-xs w-24 print:border-none print:bg-white" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="mpesa" className="print:hidden" />
                    <label htmlFor="mpesa" className="print:hidden">M-Pesa Payment</label>
                    <span className="hidden print:inline">☐ M-Pesa Payment</span>
                    <div className="ml-auto flex gap-2">
                      <span>Code:</span>
                      <input type="text" placeholder="M-Pesa Code" className="border-b border-black bg-transparent text-xs w-24 print:border-none print:bg-white" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="insurance" className="print:hidden" />
                    <label htmlFor="insurance" className="print:hidden">Insurance</label>
                    <span className="hidden print:inline">☐ Insurance</span>
                    <div className="ml-auto flex gap-2">
                      <span>Auth:</span>
                      <input type="text" placeholder="Auth Code" className="border-b border-black bg-transparent text-xs w-24 print:border-none print:bg-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-2">PATIENT INFORMATION</h4>
              <div className="space-y-1">
                <p>Insurance Provider: {patient.insuranceProvider || "CASH PATIENT"}</p>
                <p>Policy Number: {patient.policyNumber || "N/A"}</p>
                <p>Emergency Contact: {patient.emergencyContactName}</p>
                <p>Contact Phone: {patient.emergencyContactPhone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Authorization Signatures */}
        <div className="mt-12 pt-8 border-t border-gray-400 text-xs">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="border-b border-black mb-2 h-8"></div>
              <p className="font-bold">PATIENT/GUARDIAN SIGNATURE</p>
              <p className="text-xs mt-1">DATE: _______________</p>
            </div>
            <div>
              <div className="border-b border-black mb-2 h-8"></div>
              <p className="font-bold">DOCTOR SIGNATURE</p>
              <p className="text-xs mt-1">DATE: _______________</p>
            </div>
            <div>
              <div className="border-b border-black mb-2 h-8"></div>
              <p className="font-bold">FINANCE OFFICER SIGNATURE</p>
              <p className="text-xs mt-1">DATE: _______________</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-600">
          <p>*** This is a computer generated bill ***</p>
          <p>Child Mental Haven - Committed to Excellence in Mental Health Care</p>
          <p className="mt-2">For inquiries, please contact: Tel: 0725133444 / 0732-313173</p>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            margin: 0.5in;
            size: A4;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:p-4 {
            padding: 1rem !important;
          }
          .print\\:max-w-none {
            max-width: none !important;
          }
        }
      `}</style>
    </div>
  );
}