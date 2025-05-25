import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Patient } from "@shared/schema";
import logoPath from "@assets/image_1748113978202.png";

interface MedicalReportProps {
  patient: Patient;
  admissionDate?: string;
  doctorName?: string;
}

export default function MedicalReport({ 
  patient, 
  admissionDate = new Date().toISOString().split('T')[0],
  doctorName = "Dr. Medical Officer"
}: MedicalReportProps) {
  const [formData, setFormData] = useState({
    presentingComplaints: "",
    historyOfIllness: "",
    pastMedicalHistory: "",
    familyHistory: "",
    socialHistory: "",
    systemsReview: "",
    physicalExamination: "",
    mentalStateExam: "",
    investigations: "",
    provisionalDiagnosis: "",
    differentialDiagnosis: "",
    treatmentPlan: "",
    prognosis: ""
  });

  const printReport = () => {
    window.print();
  };

  const downloadReport = () => {
    const element = document.createElement('a');
    const filename = `Medical_Report_${patient.patientId}_${new Date().toISOString().split('T')[0]}.html`;
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
        <Button onClick={printReport} className="mb-4">
          <Printer className="w-4 h-4 mr-2" />
          Print Medical Report
        </Button>
        <Button onClick={downloadReport} variant="outline" className="mb-4">
          <Download className="w-4 h-4 mr-2" />
          Download Report
        </Button>
      </div>

      {/* Medical Report Content */}
      <div className="p-8 max-w-4xl mx-auto print:p-4 print:max-w-none">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-xl font-bold">CHILD MENTAL HAVEN</h1>
              <p className="text-sm">COMPREHENSIVE MENTAL HEALTH / REHABILITATION</p>
            </div>
            <div className="mx-8">
              <img src={logoPath} alt="Child Mental Haven Logo" className="h-24 w-24 object-contain" />
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
          <h2 className="text-lg font-bold mt-6 underline">MEDICAL REPORT</h2>
        </div>

        {/* Patient Information */}
        <div className="mb-6 text-sm border border-black p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><span className="font-bold">PATIENT NAME: </span>{patient.firstName.toUpperCase()} {patient.lastName.toUpperCase()}</p>
              <p><span className="font-bold">AGE: </span>{calculateAge(patient.dateOfBirth)} Years</p>
              <p><span className="font-bold">GENDER: </span>{patient.gender.toUpperCase()}</p>
              <p><span className="font-bold">ADMISSION DATE: </span>{formatDate(admissionDate)}</p>
            </div>
            <div>
              <p><span className="font-bold">IP NO: </span>{patient.patientId}</p>
              <p><span className="font-bold">PHONE: </span>{patient.phone}</p>
              <p><span className="font-bold">ADDRESS: </span>{patient.address}</p>
              <p><span className="font-bold">NEXT OF KIN: </span>{patient.emergencyContactName}</p>
            </div>
          </div>
        </div>

        {/* Clinical Sections */}
        <div className="space-y-6 text-sm">
          {/* Presenting Complaints */}
          <div>
            <p className="font-bold mb-2 underline">1. PRESENTING COMPLAINTS:</p>
            <div className="border border-gray-400 min-h-[80px] p-3">
              <textarea 
                className="w-full h-full min-h-[80px] bg-transparent border-none outline-none resize-none print:border-none"
                value={formData.presentingComplaints}
                onChange={(e) => setFormData({...formData, presentingComplaints: e.target.value})}
                placeholder="Enter presenting complaints and duration..."
              />
            </div>
          </div>

          {/* History of Present Illness */}
          <div>
            <p className="font-bold mb-2 underline">2. HISTORY OF PRESENT ILLNESS:</p>
            <div className="border border-gray-400 min-h-[120px] p-3">
              <textarea 
                className="w-full h-full min-h-[120px] bg-transparent border-none outline-none resize-none print:border-none"
                value={formData.historyOfIllness}
                onChange={(e) => setFormData({...formData, historyOfIllness: e.target.value})}
                placeholder="Detailed history of present illness..."
              />
            </div>
          </div>

          {/* Past Medical History */}
          <div>
            <p className="font-bold mb-2 underline">3. PAST MEDICAL HISTORY:</p>
            <div className="border border-gray-400 min-h-[80px] p-3">
              <textarea 
                className="w-full h-full min-h-[80px] bg-transparent border-none outline-none resize-none print:border-none"
                value={formData.pastMedicalHistory}
                onChange={(e) => setFormData({...formData, pastMedicalHistory: e.target.value})}
                placeholder="Previous medical conditions, hospitalizations, surgeries..."
              />
            </div>
          </div>

          {/* Family History */}
          <div>
            <p className="font-bold mb-2 underline">4. FAMILY HISTORY:</p>
            <div className="border border-gray-400 min-h-[60px] p-3">
              <textarea 
                className="w-full h-full min-h-[60px] bg-transparent border-none outline-none resize-none print:border-none"
                value={formData.familyHistory}
                onChange={(e) => setFormData({...formData, familyHistory: e.target.value})}
                placeholder="Relevant family medical/psychiatric history..."
              />
            </div>
          </div>

          {/* Social History */}
          <div>
            <p className="font-bold mb-2 underline">5. SOCIAL HISTORY:</p>
            <div className="border border-gray-400 min-h-[80px] p-3">
              <textarea 
                className="w-full h-full min-h-[80px] bg-transparent border-none outline-none resize-none print:border-none"
                value={formData.socialHistory}
                onChange={(e) => setFormData({...formData, socialHistory: e.target.value})}
                placeholder="Education, occupation, relationships, substance use..."
              />
            </div>
          </div>

          {/* Review of Systems */}
          <div>
            <p className="font-bold mb-2 underline">6. REVIEW OF SYSTEMS:</p>
            <div className="border border-gray-400 min-h-[100px] p-3">
              <textarea 
                className="w-full h-full min-h-[100px] bg-transparent border-none outline-none resize-none print:border-none"
                value={formData.systemsReview}
                onChange={(e) => setFormData({...formData, systemsReview: e.target.value})}
                placeholder="Systematic review of body systems..."
              />
            </div>
          </div>

          {/* Physical Examination */}
          <div>
            <p className="font-bold mb-2 underline">7. PHYSICAL EXAMINATION:</p>
            <div className="border border-gray-400 min-h-[120px] p-3">
              <textarea 
                className="w-full h-full min-h-[120px] bg-transparent border-none outline-none resize-none print:border-none"
                value={formData.physicalExamination}
                onChange={(e) => setFormData({...formData, physicalExamination: e.target.value})}
                placeholder="General appearance, vital signs, systematic examination..."
              />
            </div>
          </div>

          {/* Mental State Examination */}
          <div>
            <p className="font-bold mb-2 underline">8. MENTAL STATE EXAMINATION:</p>
            <div className="border border-gray-400 min-h-[120px] p-3">
              <textarea 
                className="w-full h-full min-h-[120px] bg-transparent border-none outline-none resize-none print:border-none"
                value={formData.mentalStateExam}
                onChange={(e) => setFormData({...formData, mentalStateExam: e.target.value})}
                placeholder="Appearance, behavior, speech, mood, thought process, perception, cognition..."
              />
            </div>
          </div>

          {/* Investigations */}
          <div>
            <p className="font-bold mb-2 underline">9. INVESTIGATIONS:</p>
            <div className="border border-gray-400 min-h-[100px] p-3">
              <textarea 
                className="w-full h-full min-h-[100px] bg-transparent border-none outline-none resize-none print:border-none"
                value={formData.investigations}
                onChange={(e) => setFormData({...formData, investigations: e.target.value})}
                placeholder="Laboratory tests, imaging, psychological assessments..."
              />
            </div>
          </div>

          {/* Provisional Diagnosis */}
          <div>
            <p className="font-bold mb-2 underline">10. PROVISIONAL DIAGNOSIS:</p>
            <div className="border border-gray-400 min-h-[80px] p-3">
              <textarea 
                className="w-full h-full min-h-[80px] bg-transparent border-none outline-none resize-none print:border-none"
                value={formData.provisionalDiagnosis}
                onChange={(e) => setFormData({...formData, provisionalDiagnosis: e.target.value})}
                placeholder="Primary and secondary diagnoses (ICD-10 codes if applicable)..."
              />
            </div>
          </div>

          {/* Differential Diagnosis */}
          <div>
            <p className="font-bold mb-2 underline">11. DIFFERENTIAL DIAGNOSIS:</p>
            <div className="border border-gray-400 min-h-[60px] p-3">
              <textarea 
                className="w-full h-full min-h-[60px] bg-transparent border-none outline-none resize-none print:border-none"
                value={formData.differentialDiagnosis}
                onChange={(e) => setFormData({...formData, differentialDiagnosis: e.target.value})}
                placeholder="Alternative diagnoses to consider..."
              />
            </div>
          </div>

          {/* Treatment Plan */}
          <div>
            <p className="font-bold mb-2 underline">12. TREATMENT PLAN:</p>
            <div className="border border-gray-400 min-h-[120px] p-3">
              <textarea 
                className="w-full h-full min-h-[120px] bg-transparent border-none outline-none resize-none print:border-none"
                value={formData.treatmentPlan}
                onChange={(e) => setFormData({...formData, treatmentPlan: e.target.value})}
                placeholder="Medications, psychotherapy, behavioral interventions, follow-up..."
              />
            </div>
          </div>

          {/* Prognosis */}
          <div>
            <p className="font-bold mb-2 underline">13. PROGNOSIS:</p>
            <div className="border border-gray-400 min-h-[60px] p-3">
              <textarea 
                className="w-full h-full min-h-[60px] bg-transparent border-none outline-none resize-none print:border-none"
                value={formData.prognosis}
                onChange={(e) => setFormData({...formData, prognosis: e.target.value})}
                placeholder="Expected outcome and recovery prospects..."
              />
            </div>
          </div>
        </div>

        {/* Doctor Signature Section */}
        <div className="mt-12 pt-8 border-t border-gray-400 text-sm">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="font-bold mb-4">PREPARED BY:</p>
              <div className="space-y-2">
                <p>Name: <span className="border-b border-black inline-block w-48 text-center">{doctorName}</span></p>
                <p>Designation: <span className="border-b border-black inline-block w-48 text-center">Consultant Psychiatrist</span></p>
                <p>Signature: <span className="border-b border-black inline-block w-48 h-6"></span></p>
                <p>Date: <span className="border-b border-black inline-block w-48 text-center">{formatDate(new Date().toISOString())}</span></p>
              </div>
            </div>
            <div>
              <p className="font-bold mb-4">APPROVED BY:</p>
              <div className="space-y-2">
                <p>Name: <span className="border-b border-black inline-block w-48 text-center">Dr. Chief Medical Officer</span></p>
                <p>Designation: <span className="border-b border-black inline-block w-48 text-center">Chief Medical Officer</span></p>
                <p>Signature: <span className="border-b border-black inline-block w-48 h-6"></span></p>
                <p>Date: <span className="border-b border-black inline-block w-48"></span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-600">
          <p>*** This is a confidential medical document ***</p>
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