import React from "react";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import type { Billing, Patient } from "@shared/schema";

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface PrintableInvoiceProps {
  billing: Billing;
  patient: Patient;
  items: InvoiceItem[];
  onClose: () => void;
}

export default function PrintableInvoice({ billing, patient, items, onClose }: PrintableInvoiceProps) {
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const discount = Number(billing.discount) || 0;
  const total = subtotal - discount;
  const amountPaid = billing.paymentStatus === 'paid' ? total : 0;
  const balance = total - amountPaid;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        {/* Print Controls */}
        <div className="flex justify-between items-center p-4 border-b print:hidden">
          <h3 className="text-lg font-semibold">Invoice Preview</h3>
          <div className="flex space-x-2">
            <button
              onClick={handlePrint}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a1 1 0 001-1v-4a1 1 0 00-1-1H9a1 1 0 00-1 1v4a1 1 0 001 1zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="p-8 print:p-0">
          {/* Hospital Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-800 mb-2">CHILD MENTAL HAVEN</h1>
            <p className="text-gray-600">Comprehensive Mental Health Services for Children</p>
            <p className="text-sm text-gray-500">
              123 Healthcare Avenue, Medical District | Phone: (555) 123-4567 | Email: info@childmentalhaven.org
            </p>
            <hr className="mt-4 border-2 border-blue-200" />
          </div>

          {/* Invoice Header */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-xl font-bold mb-4 text-blue-700">INVOICE</h2>
              <div className="space-y-1 text-sm">
                <p><strong>Invoice #:</strong> {billing.billId}</p>
                <p><strong>Date:</strong> {formatDate(billing.createdAt)}</p>
                <p><strong>Due Date:</strong> {formatDate(new Date(new Date(billing.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000))}</p>
                <p><strong>Payment Status:</strong> 
                  <span className={`ml-1 px-2 py-1 rounded text-xs ${
                    billing.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 
                    billing.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {billing.paymentStatus.toUpperCase()}
                  </span>
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-2 text-blue-700">BILL TO:</h3>
              <div className="text-sm space-y-1">
                <p className="font-semibold">{patient.firstName} {patient.lastName}</p>
                <p>Patient ID: {patient.patientId}</p>
                <p>{patient.address}</p>
                <p>Phone: {patient.phone}</p>
                {patient.email && <p>Email: {patient.email}</p>}
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="mb-8">
            <h3 className="font-bold mb-4 text-blue-700 border-b pb-2">SERVICE DETAILS</h3>
            <div className="bg-gray-50 p-4 rounded">
              <p><strong>Service Type:</strong> {billing.serviceType}</p>
              <p><strong>Description:</strong> {billing.serviceDescription}</p>
              {billing.appointmentId && <p><strong>Appointment Reference:</strong> APT-{billing.appointmentId}</p>}
            </div>
          </div>

          {/* Itemized Services Table */}
          <div className="mb-8">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-blue-100">
                  <th className="border border-gray-300 p-3 text-left">Description</th>
                  <th className="border border-gray-300 p-3 text-center">Qty</th>
                  <th className="border border-gray-300 p-3 text-right">Unit Price</th>
                  <th className="border border-gray-300 p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-3">{item.description}</td>
                    <td className="border border-gray-300 p-3 text-center">{item.quantity}</td>
                    <td className="border border-gray-300 p-3 text-right">{formatCurrency(item.unitPrice)}</td>
                    <td className="border border-gray-300 p-3 text-right">{formatCurrency(item.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              {billing.insuranceClaimed && (
                <div className="bg-blue-50 p-4 rounded">
                  <h4 className="font-bold mb-2 text-blue-700">INSURANCE INFORMATION</h4>
                  <p className="text-sm">Insurance Claimed: Yes</p>
                  <p className="text-sm">Insurance Amount: {formatCurrency(Number(billing.insuranceAmount) || 0)}</p>
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}
                <hr className="border-gray-300" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Amount:</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Amount Paid:</span>
                  <span>{formatCurrency(amountPaid)}</span>
                </div>
                <div className="flex justify-between font-bold text-red-600">
                  <span>Balance Due:</span>
                  <span>{formatCurrency(balance)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          {billing.paymentMethod && (
            <div className="mb-8 bg-green-50 p-4 rounded">
              <h4 className="font-bold mb-2 text-green-700">PAYMENT INFORMATION</h4>
              <p className="text-sm">Payment Method: {billing.paymentMethod}</p>
              {billing.paymentDate && <p className="text-sm">Payment Date: {formatDateTime(billing.paymentDate)}</p>}
            </div>
          )}

          {/* Notes */}
          {billing.notes && (
            <div className="mb-8">
              <h4 className="font-bold mb-2 text-blue-700">NOTES</h4>
              <p className="text-sm bg-yellow-50 p-3 rounded">{billing.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="border-t pt-6 text-center text-sm text-gray-600">
            <p className="mb-2">Thank you for choosing Child Mental Haven for your healthcare needs.</p>
            <p className="mb-2">For billing inquiries, please contact our Finance Department at (555) 123-4567 ext. 200</p>
            <p className="text-xs">This invoice was generated on {formatDateTime(new Date())}</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:block {
            display: block !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}