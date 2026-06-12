import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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
import { motion } from "framer-motion";

const LandingPage = () => {
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
            setMobileMenuOpen(false);
        }
    };

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
                toast.success("Check your email for a confirmation link.");
                setShowAuthModal(false);
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                toast.success("Welcome back! Successfully logged in.");
                setShowAuthModal(false);
                navigate("/");
            }
        } catch (error: any) {
            toast.error(error.message);
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

    const fadeInVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
        exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" } },
    };

    const staggerContainerVariants = {
        animate: { transition: { staggerChildren: 0.1 } },
    };

    return (
        <div className="min-h-screen bg-background text-foreground font-sans">
            {/* Navigation Bar */}
            <motion.nav
                initial="initial"
                animate="animate"
                variants={fadeInVariants}
                className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-elevation-1"
            >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1400px]">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                <img src="/BachatBuddy.png" alt="Logo" className="h-6 w-6 object-contain" />
                            </div>
                            <span className="text-xl font-bold gemini-text-gradient">
                                BachatBuddy
                            </span>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-6">
                            <Button variant="ghost" onClick={() => scrollToSection("features")} className="text-muted-foreground hover:text-foreground">
                                Features
                            </Button>
                            <Button variant="ghost" onClick={() => scrollToSection("developers")} className="text-muted-foreground hover:text-foreground">
                                About Developers
                            </Button>
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => openAuthModal(false)}
                                >
                                    Login
                                </Button>
                                <Button
                                    onClick={() => openAuthModal(true)}
                                    className="shadow-elevation-2"
                                >
                                    Sign Up
                                </Button>
                            </div>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-2 text-foreground/80 hover:text-foreground"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="md:hidden py-4 space-y-3 border-t border-border/50"
                        >
                            <Button variant="ghost" onClick={() => scrollToSection("features")} className="w-full justify-start text-muted-foreground hover:text-foreground">
                                Features
                            </Button>
                            <Button variant="ghost" onClick={() => scrollToSection("developers")} className="w-full justify-start text-muted-foreground hover:text-foreground">
                                About Developers
                            </Button>
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
                                    className="w-full shadow-elevation-2"
                                >
                                    Sign Up
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </motion.nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="absolute inset-0 opacity-20 dark:opacity-10">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 to-transparent" />
                    <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/5 rounded-full mix-blend-multiply blur-3xl animate-blob-one" />
                    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full mix-blend-multiply blur-3xl animate-blob-two animation-delay-2000" />
                    <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-secondary/5 rounded-full mix-blend-multiply blur-3xl animate-blob-three animation-delay-4000" />
                </div>
                <style jsx>{`
                    @keyframes blob-one {
                        0% { transform: translate(0, 0) scale(1); }
                        33% { transform: translate(30px, -50px) scale(1.1); }
                        66% { transform: translate(-20px, 20px) scale(0.9); }
                        100% { transform: translate(0, 0) scale(1); }
                    }
                    @keyframes blob-two {
                        0% { transform: translate(0, 0) scale(1); }
                        33% { transform: translate(-40px, 30px) scale(0.95); }
                        66% { transform: translate(10px, -10px) scale(1.05); }
                        100% { transform: translate(0, 0) scale(1); }
                    }
                    @keyframes blob-three {
                        0% { transform: translate(0, 0) scale(1); }
                        33% { transform: translate(20px, 40px) scale(1.03); }
                        66% { transform: translate(-30px, -30px) scale(0.98); }
                        100% { transform: translate(0, 0) scale(1); }
                    }
                    .animation-delay-2000 { animation-delay: 2s; }
                    .animation-delay-4000 { animation-delay: 4s; }
                `}</style>

                <div className="container mx-auto relative z-10 max-w-[1000px]">
                    <motion.div
                        initial="initial"
                        animate="animate"
                        variants={staggerContainerVariants}
                        className="max-w-4xl mx-auto text-center space-y-8"
                    >
                        <motion.div variants={fadeInVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 shadow-elevation-1">
                            <Sparkles className="h-4 w-4" />
                            <span className="text-sm font-medium">AI-Powered Financial Management</span>
                        </motion.div>

                        <motion.h1 variants={fadeInVariants} className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight text-balance gemini-text-gradient">
                            Welcome to{" "}
                            BachatBuddy
                        </motion.h1>

                        <motion.p variants={fadeInVariants} className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                            Take control of your finances with intelligent insights, automated tracking,
                            and professional-grade tools designed for modern money management.
                        </motion.p>

                        <motion.div variants={fadeInVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <Button
                                size="lg"
                                onClick={() => openAuthModal(true)}
                                className="shadow-elevation-3 hover:shadow-glow-lg"
                            >
                                Get Started Free
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={() => scrollToSection("features")}
                                className="border-primary/20 hover:bg-primary/5 shadow-elevation-1"
                            >
                                Learn More
                            </Button>
                        </motion.div>

                        <motion.div variants={staggerContainerVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
                            <motion.div variants={fadeInVariants} className="space-y-1">
                                <div className="text-3xl font-bold text-primary">AI-Powered</div>
                                <div className="text-sm text-muted-foreground">Smart Insights</div>
                            </motion.div>
                            <motion.div variants={fadeInVariants} className="space-y-1">
                                <div className="text-3xl font-bold text-primary">Secure</div>
                                <div className="text-sm text-muted-foreground">Bank-Grade</div>
                            </motion.div>
                            <motion.div variants={fadeInVariants} className="space-y-1">
                                <div className="text-3xl font-bold text-primary">24/7</div>
                                <div className="text-sm text-muted-foreground">Monitoring</div>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/20">
                <div className="container mx-auto max-w-[1000px]">
                    <motion.div
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={fadeInVariants}
                        className="text-center space-y-4 mb-16"
                    >
                        <h2 className="text-4xl sm:text-5xl font-extrabold">
                            Powerful Features for{" "}
                            <span className="gemini-text-gradient">Smart Finance</span>
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Everything you need to manage your money intelligently
                        </p>
                    </motion.div>

                    <motion.div
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={staggerContainerVariants}
                        className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
                    >
                        {/* Feature 1: AI Financial Coach */}
                        <motion.div variants={fadeInVariants} className="group relative p-8 rounded-2xl card-glass shadow-elevation-2 hover:shadow-elevation-4 hover:-translate-y-1">
                            <div className="relative space-y-4">
                                <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit shadow-elevation-1">
                                    <Brain className="h-8 w-8" />
                                </div>
                                <h3 className="text-2xl font-bold">AI Financial Coach</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Get personalized budgeting tips and smart recommendations powered by
                                    advanced AI. Learn optimal spending patterns and achieve your financial goals faster.
                                </p>
                                <div className="flex items-center gap-2 text-primary font-medium pt-2">
                                    <span>Learn more</span>
                                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </motion.div>

                        {/* Feature 2: Automated Bill Reminders */}
                        <motion.div variants={fadeInVariants} className="group relative p-8 rounded-2xl card-glass shadow-elevation-2 hover:shadow-elevation-4 hover:-translate-y-1">
                            <div className="relative space-y-4">
                                <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit shadow-elevation-1">
                                    <Bell className="h-8 w-8" />
                                </div>
                                <h3 className="text-2xl font-bold">Automated Bill Reminders</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Never miss a payment again. Smart countdown timers and notifications
                                    keep you on top of all your recurring bills and subscriptions.
                                </p>
                                <div className="flex items-center gap-2 text-primary font-medium pt-2">
                                    <span>Learn more</span>
                                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </motion.div>

                        {/* Feature 3: Bank Sync */}
                        <motion.div variants={fadeInVariants} className="group relative p-8 rounded-2xl card-glass shadow-elevation-2 hover:shadow-elevation-4 hover:-translate-y-1">
                            <div className="relative space-y-4">
                                <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit shadow-elevation-1">
                                    <Building2 className="h-8 w-8" />
                                </div>
                                <h3 className="text-2xl font-bold">Professional Bank Sync</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Securely connect your bank accounts using Account Aggregator technology.
                                    Real-time balance updates and transaction tracking in one place.
                                </p>
                                <div className="flex items-center gap-2 text-primary font-medium pt-2">
                                    <span>Learn more</span>
                                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Additional Features */}
                    <motion.div
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={staggerContainerVariants}
                        className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mt-8"
                    >
                        <motion.div variants={fadeInVariants} className="flex items-start gap-3 p-4 rounded-xl card-glass shadow-elevation-1">
                            <Shield className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold mb-1">Bank-Grade Security</h4>
                                <p className="text-sm text-muted-foreground">Your data is encrypted and protected</p>
                            </div>
                        </motion.div>
                        <motion.div variants={fadeInVariants} className="flex items-start gap-3 p-4 rounded-xl card-glass shadow-elevation-1">
                            <TrendingUp className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold mb-1">Smart Analytics</h4>
                                <p className="text-sm text-muted-foreground">Visualize spending patterns and trends</p>
                            </div>
                        </motion.div>
                        <motion.div variants={fadeInVariants} className="flex items-start gap-3 p-4 rounded-xl card-glass shadow-elevation-1">
                            <Sparkles className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold mb-1">Automated Insights</h4>
                                <p className="text-sm text-muted-foreground">AI-powered financial recommendations</p>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Developers Section */}
            <section id="developers" className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto max-w-[1000px]">
                    <motion.div
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={fadeInVariants}
                        className="text-center space-y-4 mb-16"
                    >
                        <h2 className="text-4xl sm:text-5xl font-extrabold">
                            Meet the <span className="gemini-text-gradient">Creators</span>
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Built by passionate developers dedicated to revolutionizing personal finance
                        </p>
                    </motion.div>

                    <motion.div
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={staggerContainerVariants}
                        className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"
                    >
                        {/* Developer 1 */}
                        <motion.div variants={fadeInVariants} className="group p-6 rounded-2xl card-glass shadow-elevation-2 hover:shadow-elevation-4">
                            <div className="space-y-4">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-2xl font-bold text-primary-foreground shadow-elevation-1">
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
                        </motion.div>

                        {/* Developer 2 */}
                        <motion.div variants={fadeInVariants} className="group p-6 rounded-2xl card-glass shadow-elevation-2 hover:shadow-elevation-4">
                            <div className="space-y-4">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/80 to-primary/40 flex items-center justify-center text-2xl font-bold text-primary-foreground shadow-elevation-1">
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
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/10 via-primary/5 to-background border-t border-border/50">
                <div className="container mx-auto max-w-[1000px]">
                    <motion.div
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={fadeInVariants}
                        className="max-w-3xl mx-auto text-center space-y-8"
                    >
                        <h2 className="text-4xl sm:text-5xl font-extrabold">
                            Ready to Transform Your{" "}
                            <span className="gemini-text-gradient">Financial Future?</span>
                        </h2>
                        <p className="text-xl text-muted-foreground">
                            Join thousands of users who are already managing their money smarter with BachatBuddy
                        </p>
                        <Button
                            size="lg"
                            onClick={() => openAuthModal(true)}
                            className="shadow-elevation-3 hover:shadow-glow-lg"
                        >
                            Start Your Journey
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <motion.footer
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeInVariants}
                className="py-8 px-4 sm:px-6 lg:px-8 border-t border-border/50"
            >
                <div className="container mx-auto max-w-[1400px]">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                <img src="/BachatBuddy.png" alt="Logo" className="h-5 w-5 object-contain" />
                            </div>
                            <span className="font-bold gemini-text-gradient">BachatBuddy</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            © 2025 BachatBuddy. All rights reserved.
                        </p>
                    </div>
                </div>
            </motion.footer>

            {/* Authentication Modal - Uses new Dialog component */}
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
                            className="w-full shadow-elevation-2"
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
