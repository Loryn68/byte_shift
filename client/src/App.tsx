import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "./lib/queryClient";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import Dashboard from "@/pages/dashboard";
import PatientRegistration from "@/pages/patient-registration-new";
import PatientFlowDashboard from "@/pages/patient-flow-dashboard";
import OutpatientConsultation from "@/pages/outpatient-consultation-clean";
import OutpatientFlow from "@/pages/outpatient-flow";
import ConsultationInterface from "@/pages/consultation-interface-enhanced";
import InpatientManagement from "@/pages/inpatient-management";
import TriageVitals from "@/pages/triage-vitals";
import TherapyPage from "@/pages/therapy";
import TherapyFlow from "@/pages/therapy-flow";
import TherapyProfessionalPage from "@/pages/therapy-professional";
import TherapyForms from "@/pages/therapy-forms-simple";
import Appointments from "@/pages/appointments";
import Laboratory from "@/pages/laboratory";
import Pharmacy from "@/pages/pharmacy";
import PharmacyInventory from "@/pages/pharmacy-inventory";
import PharmacyPrescriptions from "@/pages/pharmacy-prescriptions";
import PharmacyMain from "@/pages/pharmacy-main";
import RegistryPrescription from "@/pages/registry-prescription";
import ConsultationPrescription from "@/pages/consultation-prescription";
import ConsultationWithPrescription from "@/pages/consultation-with-prescription";
import OutpatientConsultationWithWorkflow from "@/pages/outpatient-consultation-with-workflow";
import PharmacyApproval from "@/pages/pharmacy-approval";
import CashierPrescriptionBilling from "@/pages/cashier-prescription-billing";
import Billing from "@/pages/billing";
import ProfessionalBilling from "@/pages/professional-billing";
import Cashier from "@/pages/cashier";
import Reports from "@/pages/reports";
import AdministratorDashboard from "@/pages/administrator-dashboard";
import RegisterUser from "@/pages/register-user";
import RegisteredUsers from "@/pages/administrator/registered-users";
import AssignUserRights from "@/pages/administrator/assign-rights";
import RemoveUsers from "@/pages/administrator/remove-users";
import ChangePasswords from "@/pages/administrator/change-passwords";
import UserActivity from "@/pages/administrator/user-activity";
import FinancialManagement from "@/pages/financial-management";
import ReportsAnalytics from "@/pages/reports-analytics";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login";
import { useAuth } from "@/lib/auth";

function Router() {
  const { isAuthenticated } = useAuth();

  // If not authenticated, show login page
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // If authenticated, show the main application
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/patient-registration" component={PatientRegistration} />
            <Route path="/cashier" component={Cashier} />
            <Route path="/triage" component={TriageVitals} />
            <Route path="/therapy" component={TherapyFlow} />
            <Route path="/therapy-original" component={TherapyPage} />
          <Route path="/therapy-professional" component={TherapyProfessionalPage} />
            <Route path="/therapy-forms" component={TherapyForms} />
            <Route path="/outpatient" component={OutpatientFlow} />
            <Route path="/outpatient-original" component={OutpatientConsultation} />
            <Route path="/consultation/:patientId" component={ConsultationInterface} />
            <Route path="/inpatient" component={InpatientManagement} />
            <Route path="/patient-flow" component={PatientFlowDashboard} />
            <Route path="/appointments" component={Appointments} />
            <Route path="/laboratory" component={Laboratory} />
            <Route path="/pharmacy" component={PharmacyMain} />
            <Route path="/pharmacy-inventory" component={PharmacyInventory} />
            <Route path="/pharmacy-original" component={Pharmacy} />
            <Route path="/registry-prescription" component={RegistryPrescription} />
            <Route path="/consultation/:patientId" component={ConsultationWithPrescription} />
            <Route path="/outpatient-consultation/:patientId" component={OutpatientConsultationWithWorkflow} />
            <Route path="/pharmacy-approval" component={PharmacyApproval} />
            <Route path="/cashier-prescriptions" component={CashierPrescriptionBilling} />
            <Route path="/radiology" component={Laboratory} />
            <Route path="/billing" component={Billing} />
            <Route path="/professional-billing" component={ProfessionalBilling} />
            <Route path="/insurance" component={Billing} />
            <Route path="/reports" component={Reports} />
            <Route path="/analytics" component={Reports} />
            <Route path="/administrator" component={AdministratorDashboard} />
            <Route path="/administrator/register" component={RegisterUser} />
            <Route path="/administrator/users" component={RegisteredUsers} />
            <Route path="/administrator/rights" component={AssignUserRights} />
            <Route path="/administrator/remove" component={RemoveUsers} />
            <Route path="/administrator/passwords" component={ChangePasswords} />
            <Route path="/administrator/activity" component={UserActivity} />
            <Route path="/financial-management" component={FinancialManagement} />
            <Route path="/reports-analytics" component={ReportsAnalytics} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
