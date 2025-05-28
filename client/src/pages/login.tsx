import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, User, Lock, AlertCircle } from "lucide-react";
import { authService } from "@/lib/auth";
import { useLocation } from "wouter";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await authService.login({ username, password });
      // Force page reload to ensure authentication state is recognized
      window.location.href = "/";
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please contact your administrator.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Side - Branding and Welcome */}
        <div className="text-center lg:text-left space-y-6">
          <div className="space-y-4">
            <div className="inline-block">
              <h1 className="text-4xl lg:text-6xl font-bold text-green-700">
                Child Mental Haven
              </h1>
              <p className="text-lg text-blue-600 mt-2">Where Young Minds Evolve</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-green-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                Healthcare Management System
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Comprehensive mental health platform providing compassionate, 
                technology-driven care management for young and adult patients through intuitive 
                and supportive digital interfaces.
              </p>
            </div>

            <div className="text-sm text-gray-500 space-y-1">
              <p>Muchai Drive Off Ngong Road</p>
              <p>P.O Box 41622-00100, Nairobi</p>
              <p>Tel: +254 746 170 159</p>
              <p>Email: info@childmentalhaven.org</p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex justify-center lg:justify-end">
          <Card className="w-full max-w-md shadow-lg border-green-100">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-2xl text-green-800">Welcome Back</CardTitle>
                <CardDescription className="text-gray-600">
                  Please sign in to access the healthcare management platform
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-700">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10 border-gray-300 focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-medium"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-500">
                    Access restricted to authorized personnel only
                  </p>
                  <p className="text-xs text-gray-400">
                    Contact your system administrator for account access
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>


    </div>
  );
}