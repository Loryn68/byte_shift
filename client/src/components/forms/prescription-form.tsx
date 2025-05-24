import React from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Patient, Prescription, Medication } from "@shared/schema";
import logoPath from "@assets/image_1748113978202.png";

interface PrescriptionFormProps {
  patient: Patient;
  prescriptions: Prescription[];
  medications: Medication[];
  doctorName?: string;
  clinicDate?: string;
}

export default function PrescriptionForm({
  patient,
  prescriptions,
  medications,
  doctorName = "Dr. Medical Officer",
  clinicDate
}: PrescriptionFormProps) {
  const printPrescription = () => {
    window.print();
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
      {/* Print Button - Hidden in print */}
      <div className="p-4 print:hidden">
        <Button onClick={printPrescription} className="mb-4">
          <Printer className="w-4 h-4 mr-2" />
          Print Prescription
        </Button>
      </div>

      {/* Prescription Content */}
      <div className="p-8 max-w-4xl mx-auto print:p-4 print:max-w-none">
        {/* Header */}
        <div className="text-center border-b-2 border-blue-600 pb-4 mb-6">
          <div className="flex items-center justify-center mb-4">
            <img src={logoPath} alt="Child Mental Haven Logo" className="h-16 w-auto" />
          </div>
          <h1 className="text-3xl font-bold text-blue-800 mb-2">CHILD MENTAL HAVEN</h1>
          <h2 className="text-lg font-semibold mb-2">COMPREHENSIVE MENTAL HEALTH / REHABILITATION</h2>
          <div className="text-sm">
            <p>Northern Bypass, Marurui Roysambu Nairobi. Behind Treat Hotel.</p>
            <p>P.O Box: 1079-00600 Nairobi, Kenya | Tel: 0725133444 / 0732-313173</p>
            <p>Email: childmentalhaven@gmail.com</p>
          </div>
        </div>

        {/* Prescription Title */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-blue-800">PRESCRIPTION</h2>
        </div>

        {/* Patient Information */}
        <div className="border border-gray-400 p-4 mb-6">
          <div className="grid grid-cols-2 gap-8 text-sm">
            <div className="space-y-2">
              <p><strong>Patient Name:</strong> {patient.firstName.toUpperCase()} {patient.lastName.toUpperCase()}</p>
              <p><strong>Patient ID:</strong> {patient.patientId}</p>
              <p><strong>Age:</strong> {calculateAge(patient.dateOfBirth)} Years</p>
              <p><strong>Gender:</strong> {patient.gender}</p>
            </div>
            <div className="space-y-2">
              <p><strong>Date:</strong> {formatDate(clinicDate || new Date())}</p>
              <p><strong>Doctor:</strong> {doctorName}</p>
              <p><strong>Phone:</strong> {patient.phone}</p>
              <p><strong>Weight:</strong> _____ kg</p>
            </div>
          </div>
        </div>

        {/* Prescription Symbol */}
        <div className="text-6xl font-bold text-blue-600 mb-4">℞</div>

        {/* Medications */}
        <div className="space-y-6 mb-8">
          {prescriptions.map((prescription, index) => {
            const medication = medications.find(m => m.id === prescription.medicationId);
            return (
              <div key={prescription.id} className="border-l-4 border-blue-600 pl-4">
                <div className="text-lg font-semibold mb-2">
                  {index + 1}. {medication?.name || "Medication"} {medication?.strength}
                </div>
                <div className="ml-4 space-y-1 text-sm">
                  <p><strong>Dosage:</strong> {prescription.dosage}</p>
                  <p><strong>Frequency:</strong> {prescription.frequency}</p>
                  <p><strong>Duration:</strong> {prescription.duration}</p>
                  <p><strong>Quantity:</strong> {prescription.quantity} {medication?.dosageForm}</p>
                  <p><strong>Instructions:</strong> {prescription.instructions}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Special Instructions */}
        <div className="border border-gray-400 p-4 mb-6">
          <h3 className="font-bold mb-2">SPECIAL INSTRUCTIONS:</h3>
          <div className="min-h-[80px] space-y-2 text-sm">
            <p>• Take medications as prescribed</p>
            <p>• Complete the full course of treatment</p>
            <p>• Report any adverse reactions immediately</p>
            <p>• Follow up as scheduled</p>
            <p>• Store medications in a cool, dry place</p>
          </div>
        </div>

        {/* Allergies Warning */}
        {patient.allergies && (
          <div className="bg-red-50 border-2 border-red-500 p-4 mb-6">
            <h3 className="font-bold text-red-700 mb-2">⚠️ ALLERGIES:</h3>
            <p className="text-red-700 font-medium">{patient.allergies}</p>
          </div>
        )}

        {/* Follow-up */}
        <div className="border border-gray-400 p-4 mb-6">
          <h3 className="font-bold mb-2">FOLLOW-UP APPOINTMENT:</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p>Date: ________________</p>
            </div>
            <div>
              <p>Time: ________________</p>
            </div>
          </div>
        </div>

        {/* Doctor Information and Signature */}
        <div className="mt-8 pt-6 border-t-2 border-gray-400">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="font-bold mb-4">PRESCRIBING PHYSICIAN:</h4>
              <div className="space-y-3">
                <p><strong>Name:</strong> {doctorName}</p>
                <p><strong>Registration No.:</strong> ________________</p>
                <p><strong>Specialization:</strong> Mental Health / Psychiatry</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-b-2 border-black mb-2 h-16"></div>
              <p className="font-bold">DOCTOR'S SIGNATURE</p>
              <p className="text-sm mt-2">Date: {formatDate(new Date())}</p>
            </div>
          </div>
        </div>

        {/* Pharmacy Section */}
        <div className="mt-8 pt-6 border-t border-gray-400">
          <h3 className="font-bold mb-4 text-center">FOR PHARMACY USE ONLY</h3>
          <div className="grid grid-cols-2 gap-8 text-sm">
            <div>
              <p>Dispensed by: ____________________</p>
              <p className="mt-2">Date: ____________________</p>
            </div>
            <div>
              <div className="border border-gray-400 h-16 mb-2"></div>
              <p className="text-center font-semibold">PHARMACY STAMP & SIGNATURE</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-600">
          <p>This prescription is valid for 30 days from the date of issue</p>
          <p>Child Mental Haven - Professional Mental Health Care</p>
          <p>For emergencies: 0725133444 / 0732-313173</p>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
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