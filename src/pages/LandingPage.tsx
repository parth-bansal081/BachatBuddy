import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
    Wallet,
    Brain,
    Bell,
    Building2,
    ArrowRight,
    Menu,
    X,
    Sparkles,
    Shield,
    TrendingUp
} from "lucide-react";

const LandingPage = () => {
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    // Smooth scroll function
    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
            setMobileMenuOpen(false);
        }
    };

    // Handle authentication
    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: "https://bachatbuddy-hq.vercel.app/dashboard",
                    }
                });
                if (error) throw error;
                toast({
                    title: "Check your email",
                    description: "We've sent you a confirmation link.",
                });
                setShowAuthModal(false);
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                toast({
                    title: "Welcome back!",
                    description: "Successfully logged in.",
                });
                setShowAuthModal(false);
                navigate("/");
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

    const openAuthModal = (signup: boolean) => {
        setIsSignUp(signup);
        setShowAuthModal(true);
        setEmail("");
        setPassword("");
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Navigation Bar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                <img src="/BachatBuddy.png" alt="Logo" className="h-6 w-6 object-contain" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                BachatBuddy
                            </span>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-8">
                            <button
                                onClick={() => scrollToSection("features")}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Features
                            </button>
                            <button
                                onClick={() => scrollToSection("developers")}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                About Developers
                            </button>
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="ghost"
                                    onClick={() => openAuthModal(false)}
                                    className="hover:bg-primary/10"
                                >
                                    Login
                                </Button>
                                <Button
                                    onClick={() => openAuthModal(true)}
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                >
                                    Sign Up
                                </Button>
                            </div>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-2 text-foreground"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div className="md:hidden py-4 space-y-3 animate-slide-up">
                            <button
                                onClick={() => scrollToSection("features")}
                                className="block w-full text-left px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
                            >
                                Features
                            </button>
                            <button
                                onClick={() => scrollToSection("developers")}
                                className="block w-full text-left px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
                            >
                                About Developers
                            </button>
                            <div className="px-4 pt-2 space-y-2">
                                <Button
                                    variant="outline"
                                    onClick={() => openAuthModal(false)}
                                    className="w-full"
                                >
                                    Login
                                </Button>
                                <Button
                                    onClick={() => openAuthModal(true)}
                                    className="w-full bg-primary hover:bg-primary/90"
                                >
                                    Sign Up
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
                <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

                <div className="container mx-auto relative z-10">
                    <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20">
                            <Sparkles className="h-4 w-4" />
                            <span className="text-sm font-medium">AI-Powered Financial Management</span>
                        </div>

                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
                            Welcome to{" "}
                            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                                BachatBuddy
                            </span>
                        </h1>

                        <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto">
                            Take control of your finances with intelligent insights, automated tracking,
                            and professional-grade tools designed for modern money management.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <Button
                                size="lg"
                                onClick={() => openAuthModal(true)}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg group"
                            >
                                Get Started Free
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={() => scrollToSection("features")}
                                className="px-8 py-6 text-lg border-primary/20 hover:bg-primary/5"
                            >
                                Learn More
                            </Button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
                            <div className="space-y-1">
                                <div className="text-3xl font-bold text-primary">AI-Powered</div>
                                <div className="text-sm text-muted-foreground">Smart Insights</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-3xl font-bold text-primary">Secure</div>
                                <div className="text-sm text-muted-foreground">Bank-Grade</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-3xl font-bold text-primary">24/7</div>
                                <div className="text-sm text-muted-foreground">Monitoring</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
                <div className="container mx-auto">
                    <div className="text-center space-y-4 mb-16 animate-slide-up">
                        <h2 className="text-4xl sm:text-5xl font-bold">
                            Powerful Features for{" "}
                            <span className="text-primary">Smart Finance</span>
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Everything you need to manage your money intelligently
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* Feature 1: AI Financial Coach */}
                        <div className="group relative p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative space-y-4">
                                <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit">
                                    <Brain className="h-8 w-8" />
                                </div>
                                <h3 className="text-2xl font-bold">AI Financial Coach</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Get personalized budgeting tips and smart recommendations powered by
                                    advanced AI. Learn optimal spending patterns and achieve your financial goals faster.
                                </p>
                                <div className="flex items-center gap-2 text-primary font-medium pt-2">
                                    <span>Learn more</span>
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </div>

                        {/* Feature 2: Automated Bill Reminders */}
                        <div className="group relative p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative space-y-4">
                                <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit">
                                    <Bell className="h-8 w-8" />
                                </div>
                                <h3 className="text-2xl font-bold">Automated Bill Reminders</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Never miss a payment again. Smart countdown timers and notifications
                                    keep you on top of all your recurring bills and subscriptions.
                                </p>
                                <div className="flex items-center gap-2 text-primary font-medium pt-2">
                                    <span>Learn more</span>
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </div>

                        {/* Feature 3: Bank Sync */}
                        <div className="group relative p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative space-y-4">
                                <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit">
                                    <Building2 className="h-8 w-8" />
                                </div>
                                <h3 className="text-2xl font-bold">Professional Bank Sync</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Securely connect your bank accounts using Account Aggregator technology.
                                    Real-time balance updates and transaction tracking in one place.
                                </p>
                                <div className="flex items-center gap-2 text-primary font-medium pt-2">
                                    <span>Learn more</span>
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Features */}
                    <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mt-8">
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-card/50 border border-border/50">
                            <Shield className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold mb-1">Bank-Grade Security</h4>
                                <p className="text-sm text-muted-foreground">Your data is encrypted and protected</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-card/50 border border-border/50">
                            <TrendingUp className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold mb-1">Smart Analytics</h4>
                                <p className="text-sm text-muted-foreground">Visualize spending patterns and trends</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-card/50 border border-border/50">
                            <Sparkles className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold mb-1">Automated Insights</h4>
                                <p className="text-sm text-muted-foreground">AI-powered financial recommendations</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Developers Section */}
            <section id="developers" className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto">
                    <div className="text-center space-y-4 mb-16">
                        <h2 className="text-4xl sm:text-5xl font-bold">
                            Meet the <span className="text-primary">Creators</span>
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Built by passionate developers dedicated to revolutionizing personal finance
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Developer 1 */}
                        <div className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                            <div className="space-y-4">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-2xl font-bold text-primary-foreground">
                                    PB
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-1">Parth Bansal</h3>
                                    <p className="text-sm text-primary mb-3">Lead Developer and Founder</p>
                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                        Visionary leader driving the technical innovation and strategic direction of BachatBuddy.
                                        Passionate about building scalable solutions for financial empowerment.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Developer 2 */}
                        <div className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                            <div className="space-y-4">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/80 to-primary/40 flex items-center justify-center text-2xl font-bold text-primary-foreground">
                                    ST
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-1">Srishti Thakur</h3>
                                    <p className="text-sm text-primary mb-3">UX Designer and Marketing and PR Head</p>
                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                        Creative force behind BachatBuddy's intuitive design and brand presence.
                                        Dedicated to crafting seamless user experiences and driving market growth.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/10 via-primary/5 to-background">
                <div className="container mx-auto">
                    <div className="max-w-3xl mx-auto text-center space-y-8">
                        <h2 className="text-4xl sm:text-5xl font-bold">
                            Ready to Transform Your{" "}
                            <span className="text-primary">Financial Future?</span>
                        </h2>
                        <p className="text-xl text-muted-foreground">
                            Join thousands of users who are already managing their money smarter with BachatBuddy
                        </p>
                        <Button
                            size="lg"
                            onClick={() => openAuthModal(true)}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg group"
                        >
                            Start Your Journey
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-border">
                <div className="container mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                <img src="/BachatBuddy.png" alt="Logo" className="h-5 w-5 object-contain" />
                            </div>
                            <span className="font-bold text-primary">BachatBuddy</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            © 2025 BachatBuddy. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>

            {/* Authentication Modal */}
            <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-center">
                            {isSignUp ? "Create Account" : "Welcome Back"}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAuth} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="modal-email">Email</Label>
                            <Input
                                id="modal-email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="modal-password">Password</Label>
                            <Input
                                id="modal-password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>
                        <Button
                            className="w-full bg-primary hover:bg-primary/90"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Please wait..." : isSignUp ? "Sign Up" : "Sign In"}
                        </Button>
                        <div className="text-sm text-center text-muted-foreground pt-2">
                            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                            <button
                                type="button"
                                className="text-primary hover:underline font-medium"
                                onClick={() => setIsSignUp(!isSignUp)}
                            >
                                {isSignUp ? "Sign In" : "Sign Up"}
                            </button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default LandingPage;
