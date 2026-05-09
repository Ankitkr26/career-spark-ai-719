import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Brain, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
export const Route = createFileRoute("/login")({
    head: () => ({
        meta: [
            { title: "Sign in — PlaceIQ" },
            { name: "description", content: "Sign in or create your PlaceIQ account." },
        ],
    }),
    component: LoginPage,
});
const signInSchema = z.object({
    email: z.string().trim().email("Invalid email").max(255),
    password: z.string().min(6, "Password must be at least 6 characters").max(72),
});
const signUpSchema = signInSchema.extend({
    displayName: z.string().trim().min(1, "Name required").max(100),
});
function LoginPage() {
    const { isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    useEffect(() => {
        if (!loading && isAuthenticated)
            navigate({ to: "/dashboard" });
    }, [loading, isAuthenticated, navigate]);
    const handleSignIn = async (e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const parsed = signInSchema.safeParse({
            email: form.get("email"),
            password: form.get("password"),
        });
        if (!parsed.success) {
            toast.error(parsed.error.issues[0].message);
            return;
        }
        setSubmitting(true);
        let error;
        try {
            const result = await supabase.auth.signInWithPassword(parsed.data);
            error = result.error;
        }
        catch (_err) {
            setSubmitting(false);
            toast.error("Could not connect to auth server. Check your Supabase URL and internet.");
            return;
        }
        setSubmitting(false);
        if (error) {
            toast.error(error.message);
            return;
        }
        toast.success("Welcome back!");
        navigate({ to: "/dashboard" });
    };
    const handleSignUp = async (e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const parsed = signUpSchema.safeParse({
            email: form.get("email"),
            password: form.get("password"),
            displayName: form.get("displayName"),
        });
        if (!parsed.success) {
            toast.error(parsed.error.issues[0].message);
            return;
        }
        setSubmitting(true);
        let error;
        try {
            const result = await supabase.auth.signUp({
                email: parsed.data.email,
                password: parsed.data.password,
                options: {
                    emailRedirectTo: `${window.location.origin}/dashboard`,
                    data: { display_name: parsed.data.displayName },
                },
            });
            error = result.error;
        }
        catch (_err) {
            setSubmitting(false);
            toast.error("Could not connect to auth server. Check your Supabase URL and internet.");
            return;
        }
        setSubmitting(false);
        if (error) {
            toast.error(error.message);
            return;
        }
        toast.success("Account created! You're signed in.");
        navigate({ to: "/dashboard" });
    };
    return (<div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: "var(--gradient-primary)" }}>
            <Brain className="h-5 w-5 text-primary-foreground"/>
          </div>
          <span className="text-xl font-bold">
            Place<span className="text-primary">IQ</span>
          </span>
        </Link>
        <div className="rounded-2xl border border-border p-8" style={{
            background: "var(--gradient-card)",
            boxShadow: "var(--shadow-md)",
        }}>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input id="signin-email" name="email" type="email" required/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input id="signin-password" name="password" type="password" required/>
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin"/>}
                  Sign in
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full name</Label>
                  <Input id="signup-name" name="displayName" type="text" required/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" name="email" type="email" required/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input id="signup-password" name="password" type="password" required minLength={6}/>
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin"/>}
                  Create account
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  By signing up you agree to our terms.
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>);
}
