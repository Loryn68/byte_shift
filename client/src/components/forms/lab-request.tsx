import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Patient } from "@shared/schema";
import logoPath from "@assets/image_1748113978202.png";

interface LabRequestProps {
  patient: Patient;
  requestDate?: string;
  doctorName?: string;
}

export default function LabRequest({ 
  patient, 
  requestDate = new Date().toISOString().split('T')[0],
  doctorName = "Dr. Medical Officer"
}: LabRequestProps) {
  const [selectedTests, setSelectedTests] = useState({
    // Hematology
    fullBloodCount: false,
    hemoglobin: false,
    hematocrit: false,
    plateletCount: false,
    whiteBloodCount: false,
    esr: false,
    bloodGrouping: false,
    
    // Biochemistry
    urea: false,
    creatinine: false,
    electrolytes: false,
    glucose: false,
    liverFunction: false,
    lipidProfile: false,
    thyroidFunction: false,
    hba1c: false,
    crp: false,
    dDimer: false,
    
    // Microbiology
    urinalysis: false,
    stoolAnalysis: false,
    bloodCulture: false,
    urineCulture: false,
    sputumCulture: false,
    
    // Special Tests
    drugScreen: false,
    toxicology: false,
    hormones: false,
    vitamins: false,
    
    // Imaging
    chestXray: false,
    ecg: false,
    ultrasound: false
  });

  const [clinicalInfo, setClinicalInfo] = useState("");
  const [urgency, setUrgency] = useState("routine");

  const printRequest = () => {
    window.print();
  };

  const downloadRequest = () => {
    const element = document.createElement('a');
    const filename = `Lab_Request_${patient.patientId}_${new Date().toISOString().split('T')[0]}.html`;
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

  const handleTestChange = (testName: string) => {
    setSelectedTests(prev => ({
      ...prev,
      [testName]: !prev[testName as keyof typeof prev]
    }));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Print & Download Buttons - Hidden in print */}
      <div className="p-4 print:hidden flex gap-2">
        <Button onClick={printRequest} className="mb-4">
          <Printer className="w-4 h-4 mr-2" />
          Print Lab Request
        </Button>
        <Button onClick={downloadRequest} variant="outline" className="mb-4">
          <Download className="w-4 h-4 mr-2" />
          Download Request
        </Button>
      </div>

      {/* Lab Request Content */}
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
          <h2 className="text-lg font-bold mt-6 underline">LABORATORY REQUEST FORM</h2>
        </div>

        {/* Patient Information */}
        <div className="mb-6 text-sm border-2 border-black p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><span className="font-bold">PATIENT NAME: </span>{patient.firstName.toUpperCase()} {patient.lastName.toUpperCase()}</p>
              <p><span className="font-bold">AGE: </span>{calculateAge(patient.dateOfBirth)} Years</p>
              <p><span className="font-bold">GENDER: </span>{patient.gender.toUpperCase()}</p>
              <p><span className="font-bold">PATIENT ID: </span>{patient.patientId}</p>
            </div>
            <div>
              <p><span className="font-bold">REQUEST DATE: </span>{formatDate(requestDate)}</p>
              <p><span className="font-bold">PHONE: </span>{patient.phone}</p>
              <p><span className="font-bold">REQUESTING DOCTOR: </span>{doctorName}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="font-bold">URGENCY: </span>
                <label className="flex items-center gap-1">
                  <input 
                    type="radio" 
                    name="urgency" 
                    value="routine"
                    checked={urgency === "routine"}
                    onChange={(e) => setUrgency(e.target.value)}
                    className="print:hidden"
                  />
                  <span className="hidden print:inline">{urgency === "routine" ? "☑" : "☐"}</span>
                  <span>Routine</span>
                </label>
                <label className="flex items-center gap-1">
                  <input 
                    type="radio" 
                    name="urgency" 
                    value="urgent"
                    checked={urgency === "urgent"}
                    onChange={(e) => setUrgency(e.target.value)}
                    className="print:hidden"
                  />
                  <span className="hidden print:inline">{urgency === "urgent" ? "☑" : "☐"}</span>
                  <span>Urgent</span>
                </label>
                <label className="flex items-center gap-1">
                  <input 
                    type="radio" 
                    name="urgency" 
                    value="stat"
                    checked={urgency === "stat"}
                    onChange={(e) => setUrgency(e.target.value)}
                    className="print:hidden"
                  />
                  <span className="hidden print:inline">{urgency === "stat" ? "☑" : "☐"}</span>
                  <span>STAT</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Tests Selection */}
        <div className="space-y-6 text-sm">
          {/* Hematology Tests */}
          <div className="border border-black p-4">
            <h3 className="font-bold mb-3 underline">HEMATOLOGY TESTS</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'fullBloodCount', label: 'Full Blood Count (FBC)' },
                { key: 'hemoglobin', label: 'Hemoglobin (Hb)' },
                { key: 'hematocrit', label: 'Hematocrit (HCT)' },
                { key: 'plateletCount', label: 'Platelet Count' },
                { key: 'whiteBloodCount', label: 'White Blood Count (WBC)' },
                { key: 'esr', label: 'ESR (Erythrocyte Sedimentation Rate)' },
                { key: 'bloodGrouping', label: 'Blood Grouping & Rh' }
              ].map(test => (
                <label key={test.key} className="flex items-center gap-2">
                  <input 
                    type="checkbox"
                    checked={selectedTests[test.key as keyof typeof selectedTests]}
                    onChange={() => handleTestChange(test.key)}
                    className="print:hidden"
                  />
                  <span className="hidden print:inline">
                    {selectedTests[test.key as keyof typeof selectedTests] ? "☑" : "☐"}
                  </span>
                  <span>{test.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Biochemistry Tests */}
          <div className="border border-black p-4">
            <h3 className="font-bold mb-3 underline">BIOCHEMISTRY TESTS</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'urea', label: 'Urea & Electrolytes (U&Es)' },
                { key: 'creatinine', label: 'Creatinine' },
                { key: 'glucose', label: 'Random Blood Sugar/Glucose' },
                { key: 'liverFunction', label: 'Liver Function Tests (LFTs)' },
                { key: 'lipidProfile', label: 'Lipid Profile' },
                { key: 'thyroidFunction', label: 'Thyroid Function Tests' },
                { key: 'hba1c', label: 'HbA1c' },
                { key: 'crp', label: 'C-Reactive Protein (CRP)' },
                { key: 'dDimer', label: 'D-Dimer' }
              ].map(test => (
                <label key={test.key} className="flex items-center gap-2">
                  <input 
                    type="checkbox"
                    checked={selectedTests[test.key as keyof typeof selectedTests]}
                    onChange={() => handleTestChange(test.key)}
                    className="print:hidden"
                  />
                  <span className="hidden print:inline">
                    {selectedTests[test.key as keyof typeof selectedTests] ? "☑" : "☐"}
                  </span>
                  <span>{test.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Microbiology Tests */}
          <div className="border border-black p-4">
            <h3 className="font-bold mb-3 underline">MICROBIOLOGY TESTS</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'urinalysis', label: 'Urinalysis' },
                { key: 'stoolAnalysis', label: 'Stool Analysis' },
                { key: 'bloodCulture', label: 'Blood Culture' },
                { key: 'urineCulture', label: 'Urine Culture' },
                { key: 'sputumCulture', label: 'Sputum Culture' }
              ].map(test => (
                <label key={test.key} className="flex items-center gap-2">
                  <input 
                    type="checkbox"
                    checked={selectedTests[test.key as keyof typeof selectedTests]}
                    onChange={() => handleTestChange(test.key)}
                    className="print:hidden"
                  />
                  <span className="hidden print:inline">
                    {selectedTests[test.key as keyof typeof selectedTests] ? "☑" : "☐"}
                  </span>
                  <span>{test.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Special Tests */}
          <div className="border border-black p-4">
            <h3 className="font-bold mb-3 underline">SPECIAL TESTS</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'drugScreen', label: 'Drug Screen/Toxicology' },
                { key: 'hormones', label: 'Hormone Levels' },
                { key: 'vitamins', label: 'Vitamin Levels (B12, D, etc.)' }
              ].map(test => (
                <label key={test.key} className="flex items-center gap-2">
                  <input 
                    type="checkbox"
                    checked={selectedTests[test.key as keyof typeof selectedTests]}
                    onChange={() => handleTestChange(test.key)}
                    className="print:hidden"
                  />
                  <span className="hidden print:inline">
                    {selectedTests[test.key as keyof typeof selectedTests] ? "☑" : "☐"}
                  </span>
                  <span>{test.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Imaging */}
          <div className="border border-black p-4">
            <h3 className="font-bold mb-3 underline">IMAGING/OTHER TESTS</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'chestXray', label: 'Chest X-Ray' },
                { key: 'ecg', label: 'ECG/EKG' },
                { key: 'ultrasound', label: 'Ultrasound' }
              ].map(test => (
                <label key={test.key} className="flex items-center gap-2">
                  <input 
                    type="checkbox"
                    checked={selectedTests[test.key as keyof typeof selectedTests]}
                    onChange={() => handleTestChange(test.key)}
                    className="print:hidden"
                  />
                  <span className="hidden print:inline">
                    {selectedTests[test.key as keyof typeof selectedTests] ? "☑" : "☐"}
                  </span>
                  <span>{test.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Clinical Information */}
          <div className="border border-black p-4">
            <h3 className="font-bold mb-3 underline">CLINICAL INFORMATION</h3>
            <textarea 
              className="w-full h-20 border border-gray-400 p-2 text-sm print:border-none print:bg-white"
              value={clinicalInfo}
              onChange={(e) => setClinicalInfo(e.target.value)}
              placeholder="Please provide relevant clinical history, symptoms, and reason for investigation..."
            />
          </div>
        </div>

        {/* Signatures */}
        <div className="mt-8 pt-6 border-t-2 border-black text-sm">
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="border-b border-black mb-2 h-8"></div>
              <p className="font-bold">REQUESTING DOCTOR</p>
              <p>Name: {doctorName}</p>
              <p>Date: {formatDate(requestDate)}</p>
            </div>
            <div className="text-center">
              <div className="border-b border-black mb-2 h-8"></div>
              <p className="font-bold">LAB TECHNICIAN</p>
              <p>Sample Received By:</p>
              <p>Date: _______________</p>
            </div>
            <div className="text-center">
              <div className="border-b border-black mb-2 h-8"></div>
              <p className="font-bold">SAMPLE COLLECTION</p>
              <p>Collected By:</p>
              <p>Time: _______________</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-600">
          <p>*** Laboratory Request Form ***</p>
          <p>Child Mental Haven - Committed to Excellence in Mental Health Care</p>
          <p className="mt-2">Lab Contact: Tel: 0725133444 / 0732-313173</p>
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
          .print\\:bg-white {
            background: white !important;
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