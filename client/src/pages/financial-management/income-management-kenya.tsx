import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp, Calendar, FileText, Download, Plus, Edit3, Trash2, 
  PieChart, BarChart3, AlertCircle, DollarSign
} from "lucide-react";

interface IncomeRecord {
  id: string;
  date: string;
  incomeType: string;
  amount: number;
  source: string;
  notes: string;
}

function DashboardCard({ title, value, icon, color }: { title: string; value: string; icon: string; color: string }) {
  return (
    <div className={`p-5 rounded-lg shadow-md flex items-center space-x-4 ${color}`}>
      <span className="text-4xl">{icon}</span>
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-3xl font-bold">{value}</p>
      </div>
    </div>
  );
}

function IncomeDashboard({ incomeRecords }: { incomeRecords: IncomeRecord[] }) {
  const [totalIncomeAllTime, setTotalIncomeAllTime] = useState(0);
  const [totalIncomeThisMonth, setTotalIncomeThisMonth] = useState(0);
  const [incomeByMonth, setIncomeByMonth] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    
    let allTime = 0;
    let thisMonth = 0;
    const monthlyData: { [key: string]: number } = {};
    const currentMonthYear = new Date().toISOString().slice(0, 7); // YYYY-MM

    incomeRecords.forEach(record => {
      const amount = parseFloat(record.amount.toString()) || 0;
      allTime += amount;

      if (record.date && record.date.startsWith(currentMonthYear)) {
        thisMonth += amount;
      }

      if (record.date) {
        const monthYear = record.date.slice(0, 7);
        monthlyData[monthYear] = (monthlyData[monthYear] || 0) + amount;
      }
    });

    setTotalIncomeAllTime(allTime);
    setTotalIncomeThisMonth(thisMonth);
    setIncomeByMonth(monthlyData);
    setLoading(false);
  }, [incomeRecords]);

  const sortedMonths = Object.keys(incomeByMonth).sort().reverse();

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold text-purple-700 mb-6">Income Dashboard</h2>
      {loading ? (
        <p className="text-gray-600">Loading income data...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <DashboardCard 
            title="Total Income (All Time)" 
            value={`KSH ${totalIncomeAllTime.toFixed(2)}`} 
            icon="📈" 
            color="bg-green-100 text-green-700" 
          />
          <DashboardCard 
            title="Total Income (This Month)" 
            value={`KSH ${totalIncomeThisMonth.toFixed(2)}`} 
            icon="🗓️" 
            color="bg-blue-100 text-blue-700" 
          />
        </div>
      )}

      <h3 className="text-xl font-semibold text-purple-800 mb-4">Monthly Income Breakdown</h3>
      {sortedMonths.length === 0 ? (
        <p className="text-gray-600">No monthly income data available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedMonths.map(month => (
            <div key={month} className="p-4 rounded-lg shadow-sm bg-gray-50 border border-gray-200">
              <h4 className="text-md font-semibold text-gray-800">{month}</h4>
              <p className="text-xl font-bold text-gray-900">KSH {incomeByMonth[month].toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function IncomeManagement({ 
  incomeRecords, 
  onAddRecord, 
  onUpdateRecord, 
  onDeleteRecord 
}: { 
  incomeRecords: IncomeRecord[]; 
  onAddRecord: (record: Omit<IncomeRecord, 'id'>) => void;
  onUpdateRecord: (record: IncomeRecord) => void;
  onDeleteRecord: (id: string) => void;
}) {
  const [newIncome, setNewIncome] = useState({ 
    date: '', 
    incomeType: 'Patient Fees', 
    amount: '', 
    source: '', 
    notes: '' 
  });
  const [editingIncome, setEditingIncome] = useState<IncomeRecord | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? parseFloat(value) || '' : value;

    if (editingIncome) {
      setEditingIncome(prev => prev ? { ...prev, [name]: val } : null);
    } else {
      setNewIncome(prev => ({ ...prev, [name]: val }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const incomeData = editingIncome || { ...newIncome, amount: parseFloat(newIncome.amount.toString()) || 0 };
      
      if (!incomeData.date || !incomeData.incomeType || !incomeData.amount || !incomeData.source) {
        setError("Date, Income Type, Amount, and Source are required.");
        return;
      }
      
      if (isNaN(Number(incomeData.amount)) || Number(incomeData.amount) <= 0) {
        setError("Amount must be a positive number.");
        return;
      }

      if (editingIncome) {
        onUpdateRecord(editingIncome);
        setMessage("Income record updated successfully!");
        setEditingIncome(null);
        toast({
          title: "Success",
          description: "Income record updated successfully!",
        });
      } else {
        onAddRecord({
          date: incomeData.date,
          incomeType: incomeData.incomeType,
          amount: Number(incomeData.amount),
          source: incomeData.source,
          notes: incomeData.notes
        });
        setMessage("Income record added successfully!");
        setNewIncome({ date: '', incomeType: 'Patient Fees', amount: '', source: '', notes: '' });
        toast({
          title: "Success", 
          description: "Income record added successfully!",
        });
      }
    } catch (err) {
      console.error("Error saving income record:", err);
      setError("Failed to save income record.");
    }
  };

  const handleEdit = (record: IncomeRecord) => {
    setEditingIncome({ ...record });
    setMessage('');
    setError('');
  };

  const handleDelete = async (id: string) => {
    setMessage('');
    setError('');
    if (window.confirm("Are you sure you want to delete this income record?")) {
      try {
        onDeleteRecord(id);
        setMessage("Income record deleted successfully!");
        toast({
          title: "Success",
          description: "Income record deleted successfully!",
        });
      } catch (err) {
        console.error("Error deleting income record:", err);
        setError("Failed to delete income record.");
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingIncome(null);
    setError('');
    setMessage('');
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold text-purple-700 mb-6">Manage Income Records</h2>

      {/* Add/Edit Income Form */}
      <form onSubmit={handleSubmit} className="mb-8 p-6 bg-yellow-50 rounded-lg shadow-inner border border-yellow-100">
        <h3 className="text-xl font-semibold text-yellow-800 mb-4">
          {editingIncome ? 'Edit Income Record' : 'Add New Income Record'}
        </h3>
        
        {error && <p className="text-red-600 mb-4">{error}</p>}
        {message && <p className="text-green-600 mb-4">{message}</p>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              type="date"
              id="date"
              name="date"
              value={editingIncome ? editingIncome.date : newIncome.date}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="incomeType">Income Type</Label>
            <Select 
              name="incomeType" 
              value={editingIncome ? editingIncome.incomeType : newIncome.incomeType} 
              onValueChange={(value) => {
                if (editingIncome) {
                  setEditingIncome(prev => prev ? { ...prev, incomeType: value } : null);
                } else {
                  setNewIncome(prev => ({ ...prev, incomeType: value }));
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Patient Fees">Patient Fees</SelectItem>
                <SelectItem value="Insurance Claims">Insurance Claims</SelectItem>
                <SelectItem value="Laboratory Services">Laboratory Services</SelectItem>
                <SelectItem value="Pharmacy Sales">Pharmacy Sales</SelectItem>
                <SelectItem value="Therapy Sessions">Therapy Sessions</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="amount">Amount (KSH)</Label>
            <Input
              type="number"
              id="amount"
              name="amount"
              step="0.01"
              min="0"
              value={editingIncome ? editingIncome.amount : newIncome.amount}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="source">Source</Label>
            <Input
              type="text"
              id="source"
              name="source"
              value={editingIncome ? editingIncome.source : newIncome.source}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={editingIncome ? editingIncome.notes : newIncome.notes}
              onChange={handleChange}
              rows={3}
            />
          </div>
        </div>
        
        <div className="flex gap-4">
          <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
            {editingIncome ? 'Update Record' : 'Add Record'}
          </Button>
          {editingIncome && (
            <Button type="button" variant="outline" onClick={handleCancelEdit}>
              Cancel Edit
            </Button>
          )}
        </div>
      </form>

      {/* Income Records Table */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Income Records</h3>
        {incomeRecords.length === 0 ? (
          <p className="text-gray-600">No income records found. Add your first income record above.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Income Type</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Amount (KSH)</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomeRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.date}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{record.incomeType}</Badge>
                    </TableCell>
                    <TableCell>{record.source}</TableCell>
                    <TableCell className="font-bold">KSH {record.amount.toFixed(2)}</TableCell>
                    <TableCell>{record.notes}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(record)}>
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(record.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function IncomeManagementKenya() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [incomeRecords, setIncomeRecords] = useState<IncomeRecord[]>([]);
  const [userId] = useState('hospital_admin');

  // Initialize with sample data
  useEffect(() => {
    const sampleData: IncomeRecord[] = [
      {
        id: "1",
        date: "2024-01-30",
        incomeType: "Patient Fees",
        amount: 15000,
        source: "Outpatient Consultation",
        notes: "Mental health consultation"
      },
      {
        id: "2", 
        date: "2024-01-30",
        incomeType: "Insurance Claims",
        amount: 45000,
        source: "NHIF Reimbursement",
        notes: "Monthly insurance claims processing"
      },
      {
        id: "3",
        date: "2024-01-29", 
        incomeType: "Laboratory Services",
        amount: 8500,
        source: "Blood Tests & Diagnostics",
        notes: "Various lab tests performed"
      },
      {
        id: "4",
        date: "2024-01-29",
        incomeType: "Pharmacy Sales", 
        amount: 12000,
        source: "Medication Dispensing",
        notes: "Prescription medications sold"
      },
      {
        id: "5",
        date: "2024-01-28",
        incomeType: "Therapy Sessions",
        amount: 25000,
        source: "Individual & Group Therapy", 
        notes: "Mental health therapy sessions"
      }
    ];
    setIncomeRecords(sampleData);
  }, []);

  const handleAddRecord = (record: Omit<IncomeRecord, 'id'>) => {
    const newRecord = {
      ...record,
      id: Date.now().toString()
    };
    setIncomeRecords(prev => [...prev, newRecord]);
  };

  const handleUpdateRecord = (updatedRecord: IncomeRecord) => {
    setIncomeRecords(prev => 
      prev.map(record => 
        record.id === updatedRecord.id ? updatedRecord : record
      )
    );
  };

  const handleDeleteRecord = (id: string) => {
    setIncomeRecords(prev => prev.filter(record => record.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 font-inter antialiased">
      {/* Header with Logo */}
      <header className="bg-white shadow-md">
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <img 
              src="/logo.png" 
              alt="Child Mental Haven" 
              className="h-16 w-auto"
            />
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-green-600">Child Mental Haven</h1>
              <p className="text-sm text-blue-600 font-medium">- Where Young Minds Evolve</p>
              <p className="text-xs text-gray-600 ml-4">Income Management System (Kenya)</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Date: {new Date().toLocaleDateString()}</p>
            <p className="text-sm text-gray-600">Time: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
        
        <div className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-purple-800 mb-4 sm:mb-0">
            Income Management (Kenya)
          </h1>
          <nav className="flex flex-wrap gap-2 sm:gap-4">
          <Button
            onClick={() => setCurrentView('dashboard')}
            variant={currentView === 'dashboard' ? 'default' : 'outline'}
            className={currentView === 'dashboard' ? 'bg-purple-600 text-white' : ''}
          >
            <PieChart className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
          <Button
            onClick={() => setCurrentView('income_records')}
            variant={currentView === 'income_records' ? 'default' : 'outline'}
            className={currentView === 'income_records' ? 'bg-purple-600 text-white' : ''}
          >
            <FileText className="h-4 w-4 mr-2" />
            Income Records
          </Button>
        </nav>
        </div>
      </header>

      {/* User ID Display */}
      <div className="p-4 bg-purple-50 text-purple-700 text-center text-sm font-medium">
        User ID: <span className="font-mono text-purple-900">{userId}</span> | Income data stored securely with KSH currency
      </div>

      {/* Main Content Area */}
      <main className="p-4 sm:p-6 lg:p-8">
        {currentView === 'dashboard' && <IncomeDashboard incomeRecords={incomeRecords} />}
        {currentView === 'income_records' && (
          <IncomeManagement 
            incomeRecords={incomeRecords}
            onAddRecord={handleAddRecord}
            onUpdateRecord={handleUpdateRecord}
            onDeleteRecord={handleDeleteRecord}
          />
        )}
      </main>
    </div>
  );
}