import { useState } from "react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Printer, Download } from "lucide-react";
import logoPath from "@assets/image_1748688959026.png";

interface TreatmentRecordFormProps {
  patientData?: any;
  treatmentType?: "oral" | "injection";
}

export default function TreatmentRecordForm({ patientData, treatmentType = "oral" }: TreatmentRecordFormProps) {
  const [formData, setFormData] = useState({
    patientName: patientData ? `${patientData.surname}, ${patientData.baptismalName}` : "",
    dateOfAdmission: new Date().toISOString().split('T')[0],
    diagnosis: "",
    medications: [
      { name: "", dose: "", route: "", frequency: "" }
    ],
    signature: "",
    date: new Date().toLocaleDateString()
  });

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const timeSlots = ["6 AM", "12 PM", "6 PM", "10 PM"];

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

  const addMedication = () => {
    setFormData(prev => ({
      ...prev,
      medications: [...prev.medications, { name: "", dose: "", route: "", frequency: "" }]
    }));
  };

  const updateMedication = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  const generatePrintHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${treatmentType === "injection" ? "Injection" : "Oral Medication"} Treatment Record - Child Mental Haven</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              line-height: 1.4;
              font-size: 12px;
            }
            .header {
              display: flex;
              align-items: center;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .logo {
              width: 100px;
              height: auto;
              margin-right: 20px;
            }
            .hospital-info {
              flex: 1;
            }
            .hospital-name {
              font-size: 20px;
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 5px;
            }
            .hospital-subtitle {
              font-size: 12px;
              color: #16a34a;
              margin-bottom: 10px;
            }
            .contact-info {
              font-size: 10px;
              color: #666;
            }
            .form-title {
              text-align: center;
              font-size: 16px;
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
              display: inline-block;
            }
            .form-value {
              border-bottom: 1px solid #333;
              min-height: 20px;
              padding-bottom: 2px;
              display: inline-block;
              min-width: 200px;
            }
            .treatment-table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            .treatment-table th,
            .treatment-table td {
              border: 1px solid #333;
              padding: 8px;
              text-align: center;
              vertical-align: top;
            }
            .treatment-table th {
              background-color: #f0f0f0;
              font-weight: bold;
            }
            .medication-row {
              height: 60px;
            }
            .signature-section {
              margin-top: 40px;
              display: flex;
              justify-content: space-between;
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
                Northern Bypass Roysambu, Nairobi Behind Treat Hotel<br>
                P.O. Box 1079, 00600 Nairobi<br>
                Phone: 0725133444 | childmentalhaven@gmail.com
              </div>
            </div>
          </div>

          <div class="form-title">
            ${treatmentType === "injection" ? "INJECTION" : ""} TREATMENT RECORD SHEET${treatmentType === "oral" ? " – PSYC ORAL MEDICATIONS" : ""}
          </div>

          <div class="patient-info">
            <div>
              <span class="form-label">NAME OF PATIENT:</span>
              <span class="form-value">${formData.patientName}</span>
            </div>
            <div>
              <span class="form-label">D.O.A:</span>
              <span class="form-value">${formData.dateOfAdmission}</span>
            </div>
          </div>

          <div class="form-group">
            <span class="form-label">DIAGNOSIS:</span>
            <span class="form-value">${formData.diagnosis}</span>
          </div>

          <table class="treatment-table">
            <thead>
              <tr>
                <th rowspan="2">MEDICATION: dose, route, and frequency</th>
                <th rowspan="2">Time</th>
                <th colspan="7">Days of Week</th>
              </tr>
              <tr>
                ${daysOfWeek.map(day => `<th>${day}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${formData.medications.map((med, index) => `
                <tr class="medication-row">
                  <td style="text-align: left; font-weight: bold;">
                    ${med.name} ${med.dose} ${med.route} ${med.frequency}
                  </td>
                  <td></td>
                  ${daysOfWeek.map(() => '<td></td>').join('')}
                </tr>
                ${timeSlots.map(time => `
                  <tr>
                    <td style="text-align: left;">${time}</td>
                    <td>${time}</td>
                    ${daysOfWeek.map(() => '<td></td>').join('')}
                  </tr>
                `).join('')}
              `).join('')}
              
              <!-- Empty rows for additional medications -->
              ${Array(5).fill(0).map(() => `
                <tr class="medication-row">
                  <td></td>
                  <td></td>
                  ${daysOfWeek.map(() => '<td></td>').join('')}
                </tr>
                ${timeSlots.map(time => `
                  <tr>
                    <td>${time}</td>
                    <td>${time}</td>
                    ${daysOfWeek.map(() => '<td></td>').join('')}
                  </tr>
                `).join('')}
              `).join('')}
            </tbody>
          </table>

          <div class="signature-section">
            <div>
              <span class="form-label">SIGNED:</span>
              <span class="form-value">${formData.signature}</span>
            </div>
            <div>
              <span class="form-label">DATE:</span>
              <span class="form-value">${formData.date}</span>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  return (
    <Card className="max-w-6xl mx-auto">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center border-b-2 border-gray-300 pb-4 mb-6">
          <img src={logoPath} alt="Child Mental Haven" className="w-24 h-auto mr-4" />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-blue-600">CHILD MENTAL HAVEN</h1>
            <p className="text-sm text-green-600 font-medium">COMPREHENSIVE MENTAL HEALTH / REHABILITATION</p>
            <div className="text-xs text-gray-600 mt-2">
              <p>Northern Bypass Roysambu, Nairobi Behind Treat Hotel</p>
              <p>P.O. Box 1079, 00600 Nairobi</p>
              <p>Phone: 0725133444 | childmentalhaven@gmail.com</p>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold text-center underline mb-6">
          {treatmentType === "injection" ? "INJECTION" : ""} TREATMENT RECORD SHEET
          {treatmentType === "oral" ? " – PSYC ORAL MEDICATIONS" : ""}
        </h2>

        {/* Form Fields */}
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-semibold">NAME OF PATIENT:</Label>
              <Input
                value={formData.patientName}
                onChange={(e) => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="font-semibold">D.O.A:</Label>
              <Input
                type="date"
                value={formData.dateOfAdmission}
                onChange={(e) => setFormData(prev => ({ ...prev, dateOfAdmission: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label className="font-semibold">DIAGNOSIS:</Label>
            <Input
              value={formData.diagnosis}
              onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
              className="mt-1"
              placeholder="Enter patient diagnosis"
            />
          </div>

          {/* Medications */}
          <div>
            <Label className="font-semibold text-lg">Medications:</Label>
            {formData.medications.map((medication, index) => (
              <div key={index} className="grid grid-cols-4 gap-2 mt-2 p-2 border rounded">
                <Input
                  placeholder="Medication name"
                  value={medication.name}
                  onChange={(e) => updateMedication(index, "name", e.target.value)}
                />
                <Input
                  placeholder="Dose"
                  value={medication.dose}
                  onChange={(e) => updateMedication(index, "dose", e.target.value)}
                />
                <Input
                  placeholder="Route"
                  value={medication.route}
                  onChange={(e) => updateMedication(index, "route", e.target.value)}
                />
                <Input
                  placeholder="Frequency"
                  value={medication.frequency}
                  onChange={(e) => updateMedication(index, "frequency", e.target.value)}
                />
              </div>
            ))}
            <Button onClick={addMedication} variant="outline" className="mt-2">
              Add Medication
            </Button>
          </div>
        </div>

        {/* Treatment Schedule Table */}
        <div className="mb-6">
          <Table className="border">
            <TableHeader>
              <TableRow>
                <TableHead className="border font-bold">MEDICATION: dose, route, and frequency</TableHead>
                <TableHead className="border font-bold">Time</TableHead>
                {daysOfWeek.map(day => (
                  <TableHead key={day} className="border font-bold text-center">{day}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {formData.medications.map((med, medIndex) => (
                <>
                  <TableRow key={`med-${medIndex}`}>
                    <TableCell className="border font-semibold bg-gray-50">
                      {med.name} {med.dose} {med.route} {med.frequency}
                    </TableCell>
                    <TableCell className="border"></TableCell>
                    {daysOfWeek.map((day, dayIndex) => (
                      <TableCell key={`${medIndex}-${dayIndex}`} className="border h-12"></TableCell>
                    ))}
                  </TableRow>
                  {timeSlots.map((time, timeIndex) => (
                    <TableRow key={`${medIndex}-${timeIndex}`}>
                      <TableCell className="border text-sm">{time}</TableCell>
                      <TableCell className="border text-sm">{time}</TableCell>
                      {daysOfWeek.map((day, dayIndex) => (
                        <TableCell key={`${medIndex}-${timeIndex}-${dayIndex}`} className="border h-8"></TableCell>
                      ))}
                    </TableRow>
                  ))}
                </>
              ))}
              
              {/* Empty rows for additional entries */}
              {Array(3).fill(0).map((_, emptyIndex) => (
                <React.Fragment key={`empty-${emptyIndex}`}>
                  <TableRow>
                    <TableCell className="border h-12"></TableCell>
                    <TableCell className="border"></TableCell>
                    {daysOfWeek.map((day, dayIndex) => (
                      <TableCell key={`empty-${emptyIndex}-${dayIndex}`} className="border"></TableCell>
                    ))}
                  </TableRow>
                  {timeSlots.map((time, timeIndex) => (
                    <TableRow key={`empty-${emptyIndex}-${timeIndex}`}>
                      <TableCell className="border text-sm">{time}</TableCell>
                      <TableCell className="border text-sm">{time}</TableCell>
                      {daysOfWeek.map((day, dayIndex) => (
                        <TableCell key={`empty-${emptyIndex}-${timeIndex}-${dayIndex}`} className="border h-8"></TableCell>
                      ))}
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Signature Section */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <Label className="font-semibold">SIGNED:</Label>
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

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
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