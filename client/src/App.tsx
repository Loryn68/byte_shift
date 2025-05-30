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
import ConsultationInterface from "@/pages/consultation-interface-enhanced";
import InpatientManagement from "@/pages/inpatient-management";
import TriageVitals from "@/pages/triage-vitals";
import TherapyPage from "@/pages/therapy";
import TherapyProfessionalPage from "@/pages/therapy-professional";
import TherapyForms from "@/pages/therapy-forms-simple";
import Appointments from "@/pages/appointments";
import Laboratory from "@/pages/laboratory";
import Pharmacy from "@/pages/pharmacy";
import Billing from "@/pages/billing";
import ProfessionalBilling from "@/pages/professional-billing";
import Cashier from "@/pages/cashier";
import Reports from "@/pages/reports";
import AdministratorDashboard from "@/pages/administrator-dashboard";
import RegisterUser from "@/pages/register-user";
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
            <Route path="/therapy" component={TherapyPage} />
          <Route path="/therapy-professional" component={TherapyProfessionalPage} />
            <Route path="/therapy-forms" component={TherapyForms} />
            <Route path="/outpatient" component={OutpatientConsultation} />
            <Route path="/consultation/:patientId" component={ConsultationInterface} />
            <Route path="/inpatient" component={InpatientManagement} />
            <Route path="/patient-flow" component={PatientFlowDashboard} />
            <Route path="/appointments" component={Appointments} />
            <Route path="/laboratory" component={Laboratory} />
            <Route path="/pharmacy" component={Pharmacy} />
            <Route path="/radiology" component={Laboratory} />
            <Route path="/billing" component={Billing} />
            <Route path="/professional-billing" component={ProfessionalBilling} />
            <Route path="/insurance" component={Billing} />
            <Route path="/reports" component={Reports} />
            <Route path="/analytics" component={Reports} />
            <Route path="/administrator" component={AdministratorDashboard} />
            <Route path="/administrator/register" component={RegisterUser} />
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
