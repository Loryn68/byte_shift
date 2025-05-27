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
import OutpatientQueue from "@/pages/outpatient-queue";
import TriageVitals from "@/pages/triage-vitals";
import DoctorPortal from "@/pages/doctor-portal";
import Appointments from "@/pages/appointments";
import Laboratory from "@/pages/laboratory";
import Pharmacy from "@/pages/pharmacy";
import Billing from "@/pages/billing";
import ProfessionalBilling from "@/pages/professional-billing";
import Cashier from "@/pages/cashier";
import Reports from "@/pages/reports";
import NotFound from "@/pages/not-found";

function Router() {
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
            <Route path="/outpatient" component={Appointments} />
            <Route path="/inpatient" component={Appointments} />
            <Route path="/patient-flow" component={PatientFlowDashboard} />
            <Route path="/outpatient-queue" component={OutpatientQueue} />
            <Route path="/doctor-portal" component={DoctorPortal} />
            <Route path="/appointments" component={Appointments} />
            <Route path="/laboratory" component={Laboratory} />
            <Route path="/pharmacy" component={Pharmacy} />
            <Route path="/radiology" component={Laboratory} />
            <Route path="/billing" component={Billing} />
            <Route path="/professional-billing" component={ProfessionalBilling} />
            <Route path="/insurance" component={Billing} />
            <Route path="/reports" component={Reports} />
            <Route path="/analytics" component={Reports} />
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
