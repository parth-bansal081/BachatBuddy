import { useState } from "react";
import { supabase, SITE_URL } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";

const Auth = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [income, setIncome] = useState("");
    const [savingsGoal, setSavingsGoal] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const navigate = useNavigate();

    // Clear local state on mount to ensure clean slate for new logins
    // This prevents "ghost" data from previous sessions or "100k" artifacts


    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isSignUp) {
                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: "https://bachatbuddy-hq.vercel.app/dashboard",
                        data: {
                            full_name: fullName,
                        }
                    }
                });
                if (authError) throw authError;

                if (authData.user) {
                    // Profile creation is now handled by the 'on_auth_user_created' database trigger.
                    // This prevents race conditions and duplicates.

                    // We can optionally update the profile if we have extra metadata not in the trigger,
                    // but for signup, the trigger uses metadata, so we are good.
                }

                toast({
                    title: "Check your email",
                    description: "We've sent you a confirmation link.",
                });
                setIsSignUp(false); // Switch to sign in or stay on page? Standard is usually stay or switch.
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                // preserve Supabase session — do NOT clear localStorage
                // check if we came from a Setu redirect that needs processing
                const setuPending = sessionStorage.getItem('setu_consent_pending');
                sessionStorage.removeItem('setu_consent_pending');
                navigate(setuPending ? `/dashboard${setuPending}` : "/dashboard");
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const { t, i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
            <div className="absolute top-4 right-4 flex gap-2">
                <Button
                    variant={i18n.language === 'en' ? "default" : "ghost"}
                    size="sm"
                    onClick={() => changeLanguage('en')}
                >
                    EN
                </Button>
                <Button
                    variant={i18n.language === 'hi' ? "default" : "ghost"}
                    size="sm"
                    onClick={() => changeLanguage('hi')}
                >
                    हिंदी
                </Button>
            </div>
            <Card className="w-full max-w-md shadow-lg border-primary/10">
                <CardHeader className="space-y-1 flex flex-col items-center">
                    <div className="p-3 rounded-2xl bg-primary/10 text-primary mb-2">
                        <img src="/BachatBuddy.png" alt="Logo" className="h-12 w-12 object-contain" />
                    </div>
                    <CardTitle className="text-2xl font-bold">
                        {isSignUp ? "Create an account" : "Welcome back"}
                    </CardTitle>
                    <CardDescription>
                        {isSignUp
                            ? "Enter your details to get started with BachatBuddy"
                            : "Enter your credentials to access your account"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAuth} className="space-y-4">
                        {isSignUp && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Full Name</Label>
                                    <Input
                                        id="fullName"
                                        type="text"
                                        placeholder="Parth Bansal"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="income">Monthly Income</Label>
                                        <Input
                                            id="income"
                                            type="number"
                                            placeholder="50000"
                                            value={income}
                                            onChange={(e) => setIncome(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="savingsGoal">Savings Goal</Label>
                                        <Input
                                            id="savingsGoal"
                                            type="number"
                                            placeholder="10000"
                                            value={savingsGoal}
                                            onChange={(e) => setSavingsGoal(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button className="w-full" type="submit" disabled={loading}>
                            {loading ? "Please wait..." : isSignUp ? "Sign Up" : "Sign In"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <div className="text-sm text-center text-muted-foreground w-full">
                        {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                        <button
                            type="button"
                            className="text-primary hover:underline font-medium"
                            onClick={() => setIsSignUp(!isSignUp)}
                        >
                            {isSignUp ? "Sign In" : "Sign Up"}
                        </button>
                    </div>

                    <div className="w-full p-4 bg-primary/5 rounded-xl border border-primary/10 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
                        <p className="text-[10px] font-bold text-primary/60 uppercase tracking-[0.2em] mb-2">Judge-Safe Demo Credentials</p>
                        <div className="flex items-center justify-center gap-6">
                            <div className="flex flex-col items-center">
                                <span className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1">Phone / VUA</span>
                                <span className="text-sm font-mono font-bold text-foreground">9999999999</span>
                            </div>
                            <div className="h-8 w-[1px] bg-primary/10" />
                            <div className="flex flex-col items-center">
                                <span className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1">OTP</span>
                                <span className="text-sm font-mono font-bold text-foreground">123456</span>
                            </div>
                        </div>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Auth;
