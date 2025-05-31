import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Hospital, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container mx-auto p-6 flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <Hospital className="h-24 w-24 text-gray-400" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Page Not Found</h1>
          <p className="text-gray-600 mt-2">The requested page could not be found in the Child Mental Haven system.</p>
        </div>
        <Link href="/dashboard">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}