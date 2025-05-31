import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Printer, Download } from "lucide-react";
import logoPath from "@assets/image_1748688959026.png";

interface DischargeSummaryFormProps {
  patientData?: any;
  admissionData?: any;
}

export default function DischargeSummaryForm({ patientData, admissionData }: DischargeSummaryFormProps) {
  const [formData, setFormData] = useState({
    patientName: patientData ? `${patientData.surname}, ${patientData.baptismalName}` : "",
    age: patientData?.age || "",
    gender: patientData?.gender || "",
    dateOfAdmission: admissionData?.admissionDate || "",
    dateOfDischarge: new Date().toISOString().split('T')[0],
    modeOfAdmission: "",
    finalDiagnosis: admissionData?.currentDiagnosis || "",
    otherConditions: admissionData?.otherConditions || "",
    investigations: "",
    management: "",
    dischargeDrugs: "",
    dischargeInstructions: "",
    followUpAppointments: "",
    doctorName: "",
    signature: "",
    date: new Date().toLocaleDateString()
  });

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(generatePrintHTML());
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownloadPDF = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(generatePrintHTML());
      printWindow.document.close();
      printWindow.print();
    }
  };

  const generatePrintHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Discharge Summary - Child Mental Haven</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              line-height: 1.4;
            }
            .header {
              display: flex;
              align-items: center;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .logo {
              width: 120px;
              height: auto;
              margin-right: 20px;
            }
            .hospital-info {
              flex: 1;
            }
            .hospital-name {
              font-size: 24px;
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 5px;
            }
            .hospital-subtitle {
              font-size: 14px;
              color: #16a34a;
              margin-bottom: 10px;
            }
            .contact-info {
              font-size: 12px;
              color: #666;
            }
            .form-title {
              text-align: center;
              font-size: 18px;
              font-weight: bold;
              margin: 20px 0;
              text-decoration: underline;
            }
            .patient-info {
              display: flex;
              gap: 30px;
              margin-bottom: 20px;
            }
            .form-group {
              margin-bottom: 15px;
            }
            .form-label {
              font-weight: bold;
              margin-bottom: 5px;
              display: block;
            }
            .form-value {
              border-bottom: 1px solid #333;
              min-height: 20px;
              padding-bottom: 2px;
            }
            .textarea-value {
              border: 1px solid #333;
              min-height: 60px;
              padding: 5px;
              width: 100%;
            }
            .signature-section {
              display: flex;
              justify-content: space-between;
              margin-top: 40px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${logoPath}" alt="Child Mental Haven" class="logo" />
            <div class="hospital-info">
              <div class="hospital-name">CHILD MENTAL HAVEN</div>
              <div class="hospital-subtitle">COMPREHENSIVE MENTAL HEALTH / REHABILITATION</div>
              <div class="contact-info">
                Northern Bypass Roysambu, Nairobi<br>
                Behind Treat Hotel<br>
                P.O. Box 1079-00600<br>
                Nairobi<br>
                Phone: 0725133444<br>
                childmentalhaven@gmail.com
              </div>
            </div>
          </div>

          <div class="form-title">DISCHARGE SUMMARY</div>

          <div class="patient-info">
            <div style="flex: 2;">
              <span class="form-label">PT NAME(S):</span>
              <span class="form-value">${formData.patientName}</span>
            </div>
            <div style="flex: 1;">
              <span class="form-label">AGE:</span>
              <span class="form-value">${formData.age}</span>
            </div>
            <div style="flex: 1;">
              <span class="form-label">GENDER:</span>
              <span class="form-value">${formData.gender}</span>
            </div>
          </div>

          <div style="display: flex; gap: 30px; margin-bottom: 20px;">
            <div style="flex: 1;">
              <span class="form-label">DATE OF ADMISSION:</span>
              <span class="form-value">${formData.dateOfAdmission}</span>
            </div>
            <div style="flex: 1;">
              <span class="form-label">DATE OF DISCHARGE:</span>
              <span class="form-value">${formData.dateOfDischarge}</span>
            </div>
          </div>

          <div class="form-group">
            <div class="form-label">MODE OF ADMISSION (VOLUNTARY / INVOLUNTARY):</div>
            <div class="form-value">${formData.modeOfAdmission}</div>
          </div>

          <div class="form-group">
            <div class="form-label">FINAL DIAGNOSIS:</div>
            <div class="textarea-value">${formData.finalDiagnosis}</div>
          </div>

          <div class="form-group">
            <div class="form-label">OTHER ACUTE OR CHRONIC CONDITIONS:</div>
            <div class="textarea-value">${formData.otherConditions}</div>
          </div>

          <div class="form-group">
            <div class="form-label">INVESTIGATION(S):</div>
            <div class="textarea-value">${formData.investigations}</div>
          </div>

          <div class="form-group">
            <div class="form-label">MANAGEMENT:</div>
            <div class="textarea-value">${formData.management}</div>
          </div>

          <div class="form-group">
            <div class="form-label">DISCHARGE DRUGS:</div>
            <div class="textarea-value">${formData.dischargeDrugs}</div>
          </div>

          <div class="form-group">
            <div class="form-label">DISCHARGE INSTRUCTIONS:</div>
            <div class="textarea-value">${formData.dischargeInstructions}</div>
          </div>

          <div class="form-group">
            <div class="form-label">FOLLOW-UP APPOINTMENT(S):</div>
            <div class="textarea-value">${formData.followUpAppointments}</div>
          </div>

          <div class="signature-section">
            <div>
              <div class="form-label">DOCTOR'S NAME:</div>
              <div class="form-value" style="width: 200px;">${formData.doctorName}</div>
            </div>
            <div>
              <div class="form-label">SIGNATURE:</div>
              <div class="form-value" style="width: 200px;">${formData.signature}</div>
            </div>
            <div>
              <div class="form-label">DATE:</div>
              <div class="form-value" style="width: 150px;">${formData.date}</div>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center border-b-2 border-gray-300 pb-4 mb-6">
          <img src={logoPath} alt="Child Mental Haven" className="w-24 h-auto mr-4" />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-blue-600">CHILD MENTAL HAVEN</h1>
            <p className="text-sm text-green-600 font-medium">COMPREHENSIVE MENTAL HEALTH / REHABILITATION</p>
            <div className="text-xs text-gray-600 mt-2">
              <p>Northern Bypass Roysambu, Nairobi</p>
              <p>Behind Treat Hotel</p>
              <p>P.O. Box 1079-00600, Nairobi</p>
              <p>Phone: 0725133444 | childmentalhaven@gmail.com</p>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold text-center underline mb-6">DISCHARGE SUMMARY</h2>

        {/* Form Fields */}
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <Label className="font-semibold">PT NAME(S):</Label>
              <Input
                value={formData.patientName}
                onChange={(e) => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="font-semibold">AGE:</Label>
                <Input
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="font-semibold">GENDER:</Label>
                <Input
                  value={formData.gender}
                  onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-semibold">DATE OF ADMISSION:</Label>
              <Input
                type="date"
                value={formData.dateOfAdmission}
                onChange={(e) => setFormData(prev => ({ ...prev, dateOfAdmission: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="font-semibold">DATE OF DISCHARGE:</Label>
              <Input
                type="date"
                value={formData.dateOfDischarge}
                onChange={(e) => setFormData(prev => ({ ...prev, dateOfDischarge: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label className="font-semibold">MODE OF ADMISSION (VOLUNTARY / INVOLUNTARY):</Label>
            <Input
              value={formData.modeOfAdmission}
              onChange={(e) => setFormData(prev => ({ ...prev, modeOfAdmission: e.target.value }))}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="font-semibold">FINAL DIAGNOSIS:</Label>
            <Textarea
              value={formData.finalDiagnosis}
              onChange={(e) => setFormData(prev => ({ ...prev, finalDiagnosis: e.target.value }))}
              className="mt-1 min-h-20"
            />
          </div>

          <div>
            <Label className="font-semibold">OTHER ACUTE OR CHRONIC CONDITIONS:</Label>
            <Textarea
              value={formData.otherConditions}
              onChange={(e) => setFormData(prev => ({ ...prev, otherConditions: e.target.value }))}
              className="mt-1 min-h-20"
            />
          </div>

          <div>
            <Label className="font-semibold">INVESTIGATION(S):</Label>
            <Textarea
              value={formData.investigations}
              onChange={(e) => setFormData(prev => ({ ...prev, investigations: e.target.value }))}
              className="mt-1 min-h-20"
            />
          </div>

          <div>
            <Label className="font-semibold">MANAGEMENT:</Label>
            <Textarea
              value={formData.management}
              onChange={(e) => setFormData(prev => ({ ...prev, management: e.target.value }))}
              className="mt-1 min-h-20"
            />
          </div>

          <div>
            <Label className="font-semibold">DISCHARGE DRUGS:</Label>
            <Textarea
              value={formData.dischargeDrugs}
              onChange={(e) => setFormData(prev => ({ ...prev, dischargeDrugs: e.target.value }))}
              className="mt-1 min-h-20"
            />
          </div>

          <div>
            <Label className="font-semibold">DISCHARGE INSTRUCTIONS:</Label>
            <Textarea
              value={formData.dischargeInstructions}
              onChange={(e) => setFormData(prev => ({ ...prev, dischargeInstructions: e.target.value }))}
              className="mt-1 min-h-20"
            />
          </div>

          <div>
            <Label className="font-semibold">FOLLOW-UP APPOINTMENT(S):</Label>
            <Textarea
              value={formData.followUpAppointments}
              onChange={(e) => setFormData(prev => ({ ...prev, followUpAppointments: e.target.value }))}
              className="mt-1 min-h-20"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="font-semibold">DOCTOR'S NAME:</Label>
              <Input
                value={formData.doctorName}
                onChange={(e) => setFormData(prev => ({ ...prev, doctorName: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="font-semibold">SIGNATURE:</Label>
              <Input
                value={formData.signature}
                onChange={(e) => setFormData(prev => ({ ...prev, signature: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="font-semibold">DATE:</Label>
              <Input
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8 justify-center">
          <Button onClick={handlePrint} className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            Print Form
          </Button>
          <Button onClick={handleDownloadPDF} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}