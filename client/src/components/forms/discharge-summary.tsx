import React from "react";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Patient } from "@shared/schema";
import logoPath from "@assets/image_1748113978202.png";

interface DischargeSummaryProps {
  patient: Patient;
  admissionDate: string;
  dischargeDate: string;
  finalDiagnosis: string;
  admissionMode?: "VOLUNTARY" | "INVOLUNTARY";
  otherDiagnoses?: string;
  investigations?: string;
  management?: string;
  dischargeInstructions?: string;
  followUpAppointments?: string;
  doctorName?: string;
}

export default function DischargeSummary({
  patient,
  admissionDate,
  dischargeDate,
  finalDiagnosis,
  admissionMode = "VOLUNTARY",
  otherDiagnoses = "",
  investigations = "",
  management = "",
  dischargeInstructions = "",
  followUpAppointments = "",
  doctorName = "Dr. Medical Officer"
}: DischargeSummaryProps) {
  const printSummary = () => {
    window.print();
  };

  const downloadSummary = () => {
    const element = document.createElement('a');
    const filename = `Discharge_Summary_${patient.patientId}_${new Date().toISOString().split('T')[0]}.html`;
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
          Print Discharge Summary
        </Button>
        <Button onClick={downloadSummary} variant="outline" className="mb-4">
          <Download className="w-4 h-4 mr-2" />
          Download Summary
        </Button>
      </div>

      {/* Discharge Summary Content */}
      <div className="p-8 max-w-4xl mx-auto print:p-4 print:max-w-none">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-start">
            <img src={logoPath} alt="Child Mental Haven Logo" className="h-16 w-auto mr-4" />
            <div>
              <h1 className="text-3xl font-bold mb-2">CHILD MENTAL HAVEN</h1>
              <h2 className="text-sm font-bold mb-4">COMPREHENSIVE MENTAL HEALTH / REHABILITATION INSTITUTION</h2>
            </div>
          </div>
          <div className="text-right text-xs">
            <p>Northern Bypass Roysambu, Nairobi</p>
            <p>Behind Treat Hotel</p>
            <p>P.O. Box 1079-00600</p>
            <p>Nairobi</p>
            <p>Tel: 0725133444</p>
            <p>childmentalhaven@gmail.com</p>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold underline">DISCHARGE SUMMARY</h2>
        </div>

        {/* Patient Information */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div className="text-sm">
              <p><strong>PATIENT NAME:</strong> {patient.firstName.toUpperCase()} {patient.lastName.toUpperCase()}</p>
            </div>
            <div className="text-sm text-right">
              <p><strong>AGE:</strong> {calculateAge(patient.dateOfBirth)} Years <strong>GENDER:</strong> {patient.gender.toUpperCase()}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-8 text-sm mb-4">
            <div>
              <p><strong>DATE OF ADMISSION:</strong> {formatDate(admissionDate)}</p>
            </div>
            <div>
              <p><strong>DATE OF DISCHARGE:</strong> {formatDate(dischargeDate)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 text-sm mb-6">
            <div>
              <p><strong>MODE OF ADMISSION (VOLUNTARY / INVOLUNTARY):</strong> {admissionMode}</p>
            </div>
            <div>
              <p><strong>IP No.:</strong> {patient.patientId}</p>
            </div>
          </div>
        </div>

        {/* Clinical Information */}
        <div className="space-y-6 text-sm">
          {/* Final Diagnosis */}
          <div>
            <p className="font-bold mb-2">FINAL DIAGNOSIS:</p>
            <div className="border border-gray-400 min-h-[60px] p-3">
              <textarea 
                className="w-full h-full min-h-[60px] bg-transparent border-none outline-none resize-none print:border-none"
                defaultValue={finalDiagnosis}
                placeholder="Mental Health Assessment and Treatment Completed"
              />
            </div>
          </div>

          {/* Other Diagnoses */}
          <div>
            <p className="font-bold mb-2">OTHER ACUTE OR CHRONIC CONDITIONS:</p>
            <div className="border border-gray-400 min-h-[60px] p-3">
              <textarea 
                className="w-full h-full min-h-[60px] bg-transparent border-none outline-none resize-none print:border-none"
                defaultValue={otherDiagnoses}
                placeholder="Mental Status Examination, Psychological Assessment"
              />
            </div>
          </div>

          {/* Investigations */}
          <div>
            <p className="font-bold mb-2">INVESTIGATIONS:</p>
            <div className="border border-gray-400 min-h-[80px] p-3">
              <textarea 
                className="w-full h-full min-h-[80px] bg-transparent border-none outline-none resize-none print:border-none"
                defaultValue={investigations}
                placeholder="Comprehensive mental health treatment with counseling and medication therapy"
              />
            </div>
          </div>

          {/* Management */}
          <div>
            <p className="font-bold mb-2">MANAGEMENT:</p>
            <div className="border border-gray-400 min-h-[100px] p-3">
              <textarea 
                className="w-full h-full min-h-[100px] bg-transparent border-none outline-none resize-none print:border-none"
                defaultValue={management}
                placeholder="Treatment plan and management details"
              />
            </div>
          </div>

          {/* Discharge Drug */}
          <div>
            <p className="font-bold mb-2">DISCHARGE DRUG:</p>
            <div className="border border-gray-400 min-h-[60px] p-3">
              <textarea 
                className="w-full h-full min-h-[60px] bg-transparent border-none outline-none resize-none print:border-none"
                placeholder="To be filled by attending physician"
              />
            </div>
          </div>

          {/* Discharge Instructions */}
          <div>
            <p className="font-bold mb-2">DISCHARGE INSTRUCTIONS:</p>
            <div className="border border-gray-400 min-h-[80px] p-3">
              <textarea 
                className="w-full h-full min-h-[80px] bg-transparent border-none outline-none resize-none print:border-none"
                defaultValue={dischargeInstructions}
                placeholder="Continue prescribed medications, attend follow-up appointments, maintain healthy lifestyle"
              />
            </div>
          </div>

          {/* Follow-up Appointments */}
          <div>
            <p className="font-bold mb-2">FOLLOW-UP APPOINTMENT(S):</p>
            <div className="border border-gray-400 min-h-[60px] p-3">
              <textarea 
                className="w-full h-full min-h-[60px] bg-transparent border-none outline-none resize-none print:border-none"
                defaultValue={followUpAppointments}
                placeholder="Follow-up appointment scheduled in 2 weeks"
              />
            </div>
          </div>

          {/* Doctor Information */}
          <div className="grid grid-cols-2 gap-8 mt-8">
            <div>
              <p className="font-bold mb-2">DOCTOR'S NAME:</p>
              <div className="border-b border-gray-600 pb-1 mb-4">
                <p>{doctorName}</p>
              </div>
            </div>
            <div>
              <p className="font-bold mb-2">DATE:</p>
              <div className="border-b border-gray-600 pb-1 mb-4">
                <p>{formatDate(dischargeDate)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div className="mt-12 pt-8 border-t border-gray-400">
          <div className="grid grid-cols-2 gap-12 text-center text-sm">
            <div>
              <div className="border-b border-black mb-2 h-12"></div>
              <p className="font-bold">DOCTOR'S SIGNATURE</p>
              <p className="text-xs mt-1">DATE: _______________</p>
            </div>
            <div>
              <div className="border-b border-black mb-2 h-12"></div>
              <p className="font-bold">STAMP</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-600">
          <p>This discharge summary was generated on {formatDate(new Date())}</p>
          <p>Child Mental Haven - Comprehensive Mental Health Care</p>
          <p>Northern Bypass Roysambu, Nairobi | Tel: 0725133444 / 0732-313173</p>
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
        }
      `}</style>
    </div>
  );
}