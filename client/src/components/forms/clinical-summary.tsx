     import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Patient } from "@shared/schema";
import logoPath from "@assets/image_1748113978202.png";

interface ClinicalSummaryProps {
  patient: Patient;
  visitDate?: string;
  doctorName?: string;
}

export default function ClinicalSummary({ 
  patient, 
  visitDate = new Date().toISOString().split('T')[0],
  doctorName = "Dr. Medical Officer"
}: ClinicalSummaryProps) {
  const [formData, setFormData] = useState({
    presentingComplaints: "",
    historyOfIllness: "",
    impression: "",
    investigations: "",
    finalDiagnosis: "",
    management: ""
  });

  const printSummary = () => {
    window.print();
  };

  const downloadSummary = () => {
    const element = document.createElement('a');
    const filename = `Clinical_Summary_${patient.patientId}_${new Date().toISOString().split('T')[0]}.html`;
    const content = document.documentElement.outerHTML;
    const file = new Blob([content], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

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
        <Button onClick={printSummary} className="mb-4">
          <Printer className="w-4 h-4 mr-2" />
          Print Clinical Summary
        </Button>
        <Button onClick={downloadSummary} variant="outline" className="mb-4">
          <Download className="w-4 h-4 mr-2" />
          Download Summary
        </Button>
      </div>

      {/* Clinical Summary Content */}
      <div className="p-8 max-w-4xl mx-auto print:p-4 print:max-w-none">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-xl font-bold">CHILD MENTAL HAVEN</h1>
              <p className="text-sm">COMPREHENSIVE MENTAL HEALTH / REHABILITATION</p>
            </div>
            <div className="mx-8">
              <img src={logoPath} alt="Child Mental Haven Logo" className="h-20 w-20 object-contain" />
            </div>
            <div className="flex-1 text-right text-sm">
              <p>Northern Bypass Roysambu</p>
              <p>Nairobi Behind Treat Hotel</p>
              <p>P.O. Box 1079</p>
              <p>00600 Nairobi</p>
              <p>Phone: 0725133444</p>
              <p>childmentalhaven@gmail.com</p>
            </div>
          </div>
          <h2 className="text-lg font-bold mt-6">CLINICAL SUMMARY</h2>
        </div>

        {/* Patient Information */}
        <div className="mb-6 text-sm">
          <div className="flex justify-between items-center mb-2">
            <div className="flex-1">
              <span className="font-bold">PT NAME(S): </span>
              <span className="border-b border-dotted border-black inline-block w-64 text-center">
                {patient.firstName.toUpperCase()} {patient.lastName.toUpperCase()}
              </span>
            </div>
            <div className="mx-4">
              <span className="font-bold">AGE: </span>
              <span className="border-b border-dotted border-black inline-block w-16 text-center">
                {calculateAge(patient.dateOfBirth)}
              </span>
            </div>
            <div>
              <span className="font-bold">GENDER: </span>
              <span className="border-b border-dotted border-black inline-block w-16 text-center">
                {patient.gender.toUpperCase()}
              </span>
            </div>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="font-bold">DATE OF VISIT: </span>
              <span className="border-b border-dotted border-black inline-block w-32 text-center">
                {formatDate(visitDate)}
              </span>
            </div>
            <div>
              <span className="font-bold">OP NO: </span>
              <span className="border-b border-dotted border-black inline-block w-32 text-center">
                {patient.patientId}
              </span>
            </div>
          </div>
        </div>

        {/* Clinical Sections */}
        <div className="space-y-6 text-sm">
          {/* Presenting Complaints */}
          <div>
            <p className="font-bold mb-2">PRESENTING COMPLAINS:</p>
            <div className="border border-gray-400 min-h-[80px] p-3">
              <textarea 
                className="w-full h-full min-h-[80px] bg-transparent border-none outline-none resize-none print:border-none"
                value={formData.presentingComplaints}
                onChange={(e) => setFormData({...formData, presentingComplaints: e.target.value})}
                placeholder="Enter presenting complaints..."
              />
            </div>
          </div>

          {/* History of Presenting Illness */}
          <div>
            <p className="font-bold mb-2">HISTORY OF PRESENTING ILLNESS:</p>
            <div className="border border-gray-400 min-h-[100px] p-3">
              <textarea 
                className="w-full h-full min-h-[100px] bg-transparent border-none outline-none resize-none print:border-none"
                value={formData.historyOfIllness}
                onChange={(e) => setFormData({...formData, historyOfIllness: e.target.value})}
                placeholder="Enter history of presenting illness..."
              />
            </div>
          </div>

          {/* Impression */}
          <div>
            <p className="font-bold mb-2">IMPRESSION:</p>
            <div className="border border-gray-400 min-h-[80px] p-3">
              <textarea 
                className="w-full h-full min-h-[80px] bg-transparent border-none outline-none resize-none print:border-none"
                value={formData.impression}
                onChange={(e) => setFormData({...formData, impression: e.target.value})}
                placeholder="Enter clinical impression..."
              />
            </div>
          </div>

          {/* Investigations */}
          <div>
            <p className="font-bold mb-2">INVESTIGATIONS:</p>
            <div className="border border-gray-400 min-h-[100px] p-3">
              <textarea 
                className="w-full h-full min-h-[100px] bg-transparent border-none outline-none resize-none print:border-none"
                value={formData.investigations}
                onChange={(e) => setFormData({...formData, investigations: e.target.value})}
                placeholder="Enter investigations ordered/performed..."
              />
            </div>
          </div>

          {/* Final Diagnosis */}
          <div>
            <p className="font-bold mb-2">FINAL DIAGNOSIS:</p>
            <div className="border border-gray-400 min-h-[80px] p-3">
              <textarea 
                className="w-full h-full min-h-[80px] bg-transparent border-none outline-none resize-none print:border-none"
                value={formData.finalDiagnosis}
                onChange={(e) => setFormData({...formData, finalDiagnosis: e.target.value})}
                placeholder="Enter final diagnosis..."
              />
            </div>
          </div>

          {/* Management */}
          <div>
            <p className="font-bold mb-2">MANAGEMENT:</p>
            <div className="border border-gray-400 min-h-[100px] p-3">
              <textarea 
                className="w-full h-full min-h-[100px] bg-transparent border-none outline-none resize-none print:border-none"
                value={formData.management}
                onChange={(e) => setFormData({...formData, management: e.target.value})}
                placeholder="Enter management plan..."
              />
            </div>
          </div>
        </div>

        {/* Doctor Signature Section */}
        <div className="mt-12 pt-8 border-t border-gray-400 text-sm">
          <div className="flex justify-between items-end">
            <div>
              <p className="font-bold mb-2">DOCTOR'S NAME: </p>
              <div className="border-b border-dotted border-black w-64 text-center pb-1">
                {doctorName}
              </div>
            </div>
            <div className="text-center">
              <p className="font-bold mb-2">SIGNATURE: </p>
              <div className="border-b border-dotted border-black w-48 h-8"></div>
            </div>
            <div className="text-right">
              <p className="font-bold mb-2">DATE: </p>
              <div className="border-b border-dotted border-black w-32 text-center pb-1">
                {formatDate(new Date().toISOString())}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-600">
          <p>Child Mental Haven - Committed to Excellence in Mental Health Care</p>
          <p className="mt-2">For inquiries, please contact: Tel: 0725133444 / 0732-313173</p>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            margin: 0.75in;
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
          .print\\:border-none {
            border: none !important;
          }
          textarea {
            background: white !important;
            border: none !important;
            outline: none !important;
          }
        }
      `}</style>
    </div>
  );
}