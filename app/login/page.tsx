"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        toast.success("Welcome back!");
        router.push("/");
        router.refresh();
      } else {
        toast.error("Invalid credentials. Please try again.");
      }
    } catch (err) {
      toast.error("An error occurred during login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-[400px]">
        <Card className="bg-white border-slate-200 shadow-xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/50 to-indigo-50/50 opacity-100 pointer-events-none" />
          
          <CardHeader className="text-center relative z-10 pb-6">
            <div className="mx-auto w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 shadow-sm border border-blue-200">
              <Lock className="h-5 w-5" />
            </div>
            <CardTitle className="text-2xl font-display tracking-tight text-slate-900">Admin Login</CardTitle>
            <CardDescription className="text-slate-500 mt-2">
              Enter your credentials to access the Lead → Launch dashboard.
            </CardDescription>
          </CardHeader>

          <CardContent className="relative z-10">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com" 
                  className="h-11 bg-white border-slate-200 focus-visible:ring-blue-500/30 text-slate-900 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="h-11 bg-white border-slate-200 focus-visible:ring-blue-500/30 text-slate-900 rounded-xl"
                />
              </div>
              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 rounded-xl transition-all"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
