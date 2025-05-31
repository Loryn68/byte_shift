import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "./lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import Dashboard from "@/pages/dashboard";

// Core Administration & User Management
import UserManagement from "@/pages/core-administration/user-management";
import SystemConfiguration from "@/pages/core-administration/system-configuration";

// Patient Management
import PatientRegistry from "@/pages/patient-management/patient-registry";
import AppointmentScheduling from "@/pages/patient-management/appointment-scheduling";
import ClinicalEncounters from "@/pages/patient-management/clinical-encounters";
import OutpatientManagement from "@/pages/patient-management/outpatient-management";
import InpatientManagement from "@/pages/patient-management/inpatient-management";
import ElectronicHealthRecords from "@/pages/patient-management/electronic-health-records";
import TriageManagement from "@/pages/patient-management/triage-management";
import TherapyManagement from "@/pages/patient-management/therapy-management";

// Clinical Support Modules
import LaboratoryManagement from "@/pages/clinical-support/laboratory-management";
import PharmacyManagement from "@/pages/clinical-support/pharmacy-management";
import RadiologyManagement from "@/pages/clinical-support/radiology-management";

// Financial Management
import BillingInvoicing from "@/pages/financial-management/billing-invoicing";
import CashierCollections from "@/pages/financial-management/cashier-collections";
import ExpenditureManagement from "@/pages/financial-management/expenditure-management";
import IncomeManagement from "@/pages/financial-management/income-management";
import GeneralLedger from "@/pages/financial-management/general-ledger";

// Staff & Payroll Management
import StaffManagement from "@/pages/staff-payroll/staff-management";
import PayrollManagement from "@/pages/staff-payroll/payroll-management";

// Inventory & Supply Chain Management
import InventoryManagement from "@/pages/inventory-supply/inventory-management";
import SupplyChainManagement from "@/pages/inventory-supply/supply-chain-management";

// Reports & Analytics
import OperationalReports from "@/pages/reports-analytics/operational-reports";
import ClinicalReports from "@/pages/reports-analytics/clinical-reports";
import FinancialReports from "@/pages/reports-analytics/financial-reports";
import InventoryReports from "@/pages/reports-analytics/inventory-reports";
import AnalyticsDashboard from "@/pages/reports-analytics/analytics-dashboard";

import NotFound from "@/pages/not-found";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Header />
            <main className="flex-1 overflow-auto">
              <Switch>
                <Route path="/" component={Dashboard} />
                <Route path="/dashboard" component={Dashboard} />
                
                {/* Core Administration */}
                <Route path="/administration/users" component={UserManagement} />
                <Route path="/administration/system" component={SystemConfiguration} />
                
                {/* Patient Management */}
                <Route path="/patient/registry" component={PatientRegistry} />
                <Route path="/patient/appointments" component={AppointmentScheduling} />
                <Route path="/patient/encounters" component={ClinicalEncounters} />
                <Route path="/patient/outpatient" component={OutpatientManagement} />
                <Route path="/patient/inpatient" component={InpatientManagement} />
                <Route path="/patient/ehr" component={ElectronicHealthRecords} />
                <Route path="/patient/triage" component={TriageManagement} />
                <Route path="/patient/therapy" component={TherapyManagement} />
                
                {/* Clinical Support */}
                <Route path="/clinical/laboratory" component={LaboratoryManagement} />
                <Route path="/clinical/pharmacy" component={PharmacyManagement} />
                <Route path="/clinical/radiology" component={RadiologyManagement} />
                
                {/* Financial Management */}
                <Route path="/financial/billing" component={BillingInvoicing} />
                <Route path="/financial/cashier" component={CashierCollections} />
                <Route path="/financial/expenditure" component={ExpenditureManagement} />
                <Route path="/financial/income" component={IncomeManagement} />
                <Route path="/financial/ledger" component={GeneralLedger} />
                
                {/* Staff & Payroll */}
                <Route path="/staff/management" component={StaffManagement} />
                <Route path="/staff/payroll" component={PayrollManagement} />
                
                {/* Inventory & Supply */}
                <Route path="/inventory/management" component={InventoryManagement} />
                <Route path="/inventory/supply-chain" component={SupplyChainManagement} />
                
                {/* Reports & Analytics */}
                <Route path="/reports/operational" component={OperationalReports} />
                <Route path="/reports/clinical" component={ClinicalReports} />
                <Route path="/reports/financial" component={FinancialReports} />
                <Route path="/reports/inventory" component={InventoryReports} />
                <Route path="/reports/analytics" component={AnalyticsDashboard} />
                
                <Route component={NotFound} />
              </Switch>
            </main>
          </div>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;