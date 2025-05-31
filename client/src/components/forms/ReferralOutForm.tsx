import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Printer, Download } from "lucide-react";
import logoPath from "@assets/image_1748688959026.png";

interface ReferralOutFormProps {
  patientData?: any;
  referralData?: any;
}

export default function ReferralOutForm({ patientData, referralData }: ReferralOutFormProps) {
  const [formData, setFormData] = useState({
    date: new Date().toLocaleDateString(),
    patientName: patientData ? `${patientData.surname}, ${patientData.baptismalName}` : "",
    lbmcNo: patientData?.patientId || "",
    phoneNumber: patientData?.telNo || "",
    age: patientData?.age || "",
    sex: patientData?.gender || "",
    briefHistory: referralData?.chiefComplaint || "",
    investigations: "",
    treatment: "",
    diagnosis: "",
    reasonForReferral: referralData?.reasonForReferral || "",
    referredBy: "",
    signature: "",
    additionalComments: "",
    referredTo: referralData?.facilityName || ""
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
          <title>Referral Out Form - Child Mental Haven</title>
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
            .date-field {
              text-align: right;
              margin-bottom: 20px;
              font-weight: bold;
            }
            .patient-info {
              margin-bottom: 15px;
            }
            .form-group {
              margin-bottom: 15px;
            }
            .form-label {
              font-weight: bold;
              margin-bottom: 5px;
              display: inline-block;
            }
            .form-value {
              border-bottom: 1px solid #333;
              min-height: 20px;
              padding-bottom: 2px;
              display: inline-block;
              min-width: 200px;
            }
            .textarea-value {
              border: 1px solid #333;
              min-height: 80px;
              padding: 5px;
              width: 100%;
              margin-top: 5px;
            }
            .signature-section {
              display: flex;
              justify-content: space-between;
              margin-top: 30px;
            }
            .dotted-line {
              border-bottom: 1px dotted #333;
              min-width: 200px;
              display: inline-block;
              margin: 0 10px;
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

          <div class="form-title">REFERRAL OUT FORM</div>

          <div class="date-field">
            DATE: <span class="dotted-line">${formData.date}</span>
          </div>

          <div class="patient-info">
            <strong>PATIENT NAME:</strong> <span class="dotted-line">${formData.patientName}</span>
            <strong style="margin-left: 30px;">LBMC NO:</strong> <span class="dotted-line">${formData.lbmcNo}</span>
          </div>

          <div class="patient-info">
            <strong>PHONE NUMBER:</strong> <span class="dotted-line">${formData.phoneNumber}</span>
            <strong style="margin-left: 20px;">AGE:</strong> <span class="dotted-line">${formData.age}</span>
            <strong style="margin-left: 20px;">SEX:</strong> <span class="dotted-line">${formData.sex}</span>
          </div>

          <div class="form-group">
            <div class="form-label">Brief History:</div>
            <div class="textarea-value">${formData.briefHistory}</div>
          </div>

          <div class="form-group">
            <div class="form-label">Investigations:</div>
            <div class="textarea-value">${formData.investigations}</div>
          </div>

          <div class="form-group">
            <div class="form-label">Treatment:</div>
            <div class="textarea-value">${formData.treatment}</div>
          </div>

          <div class="form-group">
            <div class="form-label">Diagnosis:</div>
            <div class="textarea-value">${formData.diagnosis}</div>
          </div>

          <div class="form-group">
            <div class="form-label">Reason for referral:</div>
            <div class="textarea-value">${formData.reasonForReferral}</div>
          </div>

          <div class="signature-section">
            <div>
              <strong>Referred by:</strong> <span class="dotted-line">${formData.referredBy}</span>
            </div>
            <div>
              <strong>Signature:</strong> <span class="dotted-line">${formData.signature}</span>
            </div>
          </div>

          <div class="form-group" style="margin-top: 20px;">
            <div class="form-label">Additional Comments:</div>
            <div class="textarea-value">${formData.additionalComments}</div>
          </div>

          <div class="form-group">
            <strong>Referred to:</strong> <span class="dotted-line">${formData.referredTo}</span>
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
              <p>Northern Bypass Roysambu, Nairobi Behind Treat Hotel</p>
              <p>P.O. Box 1079-00600, Nairobi</p>
              <p>Phone: 0725133444 | childmentalhaven@gmail.com</p>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold text-center underline mb-6">REFERRAL OUT FORM</h2>

        {/* Form Fields */}
        <div className="space-y-4">
          <div className="text-right">
            <Label className="font-semibold">DATE:</Label>
            <Input
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-40 ml-2 inline-block"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-semibold">PATIENT NAME:</Label>
              <Input
                value={formData.patientName}
                onChange={(e) => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="font-semibold">LBMC NO:</Label>
              <Input
                value={formData.lbmcNo}
                onChange={(e) => setFormData(prev => ({ ...prev, lbmcNo: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="font-semibold">PHONE NUMBER:</Label>
              <Input
                value={formData.phoneNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="font-semibold">AGE:</Label>
              <Input
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="font-semibold">SEX:</Label>
              <Input
                value={formData.sex}
                onChange={(e) => setFormData(prev => ({ ...prev, sex: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label className="font-semibold">Brief History:</Label>
            <Textarea
              value={formData.briefHistory}
              onChange={(e) => setFormData(prev => ({ ...prev, briefHistory: e.target.value }))}
              className="mt-1 min-h-20"
            />
          </div>

          <div>
            <Label className="font-semibold">Investigations:</Label>
            <Textarea
              value={formData.investigations}
              onChange={(e) => setFormData(prev => ({ ...prev, investigations: e.target.value }))}
              className="mt-1 min-h-20"
            />
          </div>

          <div>
            <Label className="font-semibold">Treatment:</Label>
            <Textarea
              value={formData.treatment}
              onChange={(e) => setFormData(prev => ({ ...prev, treatment: e.target.value }))}
              className="mt-1 min-h-20"
            />
          </div>

          <div>
            <Label className="font-semibold">Diagnosis:</Label>
            <Textarea
              value={formData.diagnosis}
              onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
              className="mt-1 min-h-20"
            />
          </div>

          <div>
            <Label className="font-semibold">Reason for referral:</Label>
            <Textarea
              value={formData.reasonForReferral}
              onChange={(e) => setFormData(prev => ({ ...prev, reasonForReferral: e.target.value }))}
              className="mt-1 min-h-20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-semibold">Referred by:</Label>
              <Input
                value={formData.referredBy}
                onChange={(e) => setFormData(prev => ({ ...prev, referredBy: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="font-semibold">Signature:</Label>
              <Input
                value={formData.signature}
                onChange={(e) => setFormData(prev => ({ ...prev, signature: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label className="font-semibold">Additional Comments:</Label>
            <Textarea
              value={formData.additionalComments}
              onChange={(e) => setFormData(prev => ({ ...prev, additionalComments: e.target.value }))}
              className="mt-1 min-h-20"
            />
          </div>

          <div>
            <Label className="font-semibold">Referred to:</Label>
            <Input
              value={formData.referredTo}
              onChange={(e) => setFormData(prev => ({ ...prev, referredTo: e.target.value }))}
              className="mt-1"
            />
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