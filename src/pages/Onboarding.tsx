import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowRight, Building2, Sparkles, Globe } from "lucide-react";
import { BankSyncButton } from "@/components/BankSyncButton";
import { useTranslation } from "react-i18next";

const Onboarding = () => {
    const { t, i18n } = useTranslation();
    const [searchParams] = useSearchParams();
    // Step 0: Language, Step 1: Profile, Step 2: Bank
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Step 1: Profile
    const [fullName, setFullName] = useState("");
    const [monthlyIncome, setMonthlyIncome] = useState("");
    const [savingsTarget, setSavingsTarget] = useState("");
    const [currency, setCurrency] = useState("₹");

    // Load existing profile if any
    useEffect(() => {
        const loadProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Load name from Auth Metadata first
            if (user.user_metadata?.full_name) {
                setFullName(user.user_metadata.full_name);
            }

            const { data } = await supabase
                .from("user_profiles")
                .select("*")
                .eq("user_id", user.id)
                .single();

            if (data) {
                setMonthlyIncome(data.monthly_income?.toString() || "");
                setSavingsTarget(data.monthly_savings_target?.toString() || "");
                setCurrency(data.currency || "₹");
                // Fallback name if not in metadata but in DB (unlikely but good safety)
                if (!user.user_metadata?.full_name && data.full_name) {
                    setFullName(data.full_name);
                }

                // If has_onboarded is already true, maybe redirect?
                if (data.has_onboarded) {
                    navigate("/dashboard");
                }
            }
        };
        loadProfile();
    }, [navigate]);

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    const handleLanguageNext = () => {
        setStep(1);
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.error("No user found in session.");
                alert("Session expired. Please log in again.");
                window.location.href = "/";
                return;
            }

            // 1. Update Supabase Auth Metadata (Source of Truth for Name)
            const { error: authError } = await supabase.auth.updateUser({
                data: { full_name: fullName }
            });
            if (authError) throw authError;

            // 2. Save Profile & Mark Onboarded
            // FIX: Explicitly set `id` to match `user.id` to respect Primary Key / Foreign Key 1:1 relationship
            const { error } = await supabase.from("user_profiles").upsert({
                user_id: user.id,
                full_name: fullName, // Sync to DB as well
                monthly_income: Number(monthlyIncome),
                monthly_savings_target: Number(savingsTarget),
                currency: currency,
                has_onboarded: true,
                language: i18n.language
            }, {
                onConflict: 'user_id', // Handle conflict on user_id if that's the unique constraint
                ignoreDuplicates: false
            });

            if (error) throw error;
            toast.success(t("save") + "!");
            setStep(2); // Move to Bank Sync Step
            // window.location.href = "/dashboard"; // Removed immediate redirect
        } catch (error: any) {
            console.error("Onboarding Error:", error);
            // Error 23505: Unique constraint violation (means profile exists)
            if (error.code === '23505' || error.message?.includes('duplicate key')) {
                toast.success("Profile already saved!");
                window.location.href = "/dashboard";
                return;
            }
            alert(`Error saving profile: ${error.message || "Unknown error"}`);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
            {/* Gemini Background Effects */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full max-w-lg z-10 animate-fade-in">

                {step === 0 && (
                    <Card className="border-0 bg-black/60 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                        <CardHeader className="text-center pb-2">
                            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Globe className="w-6 h-6 text-primary" />
                            </div>
                            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Choose Language / भाषा चुनें
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Button
                                    variant={i18n.language === 'en' ? "default" : "outline"}
                                    onClick={() => changeLanguage('en')}
                                    className="h-20 text-xl"
                                >
                                    English
                                </Button>
                                <Button
                                    variant={i18n.language === 'hi' ? "default" : "outline"}
                                    onClick={() => changeLanguage('hi')}
                                    className="h-20 text-xl font-bold"
                                >
                                    हिंदी
                                </Button>
                            </div>
                            <Button onClick={handleLanguageNext} className="w-full h-12 text-base mt-6">
                                {t('next')} <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {step === 1 && (
                    <Card className="border-0 bg-black/60 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                        {/* Rotating Border Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-20 animate-pulse pointer-events-none" />

                        <CardHeader className="text-center pb-2">
                            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Sparkles className="w-6 h-6 text-primary" />
                            </div>
                            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                {t('welcome')}
                            </CardTitle>
                            <CardDescription className="text-lg">
                                {t('onboarding_title')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSaveProfile} className="space-y-6">
                                <div className="space-y-3">
                                    <Label>Full Name / पूरा नाम</Label>
                                    <Input
                                        className="bg-white/5 border-white/10"
                                        placeholder=""
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label>{t('income')}</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{currency}</span>
                                        <Input
                                            className="pl-8 bg-white/5 border-white/10"
                                            placeholder="0"
                                            type="number"
                                            value={monthlyIncome}
                                            onChange={(e) => setMonthlyIncome(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label>{t('goal')}</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{currency}</span>
                                        <Input
                                            className="pl-8 bg-white/5 border-white/10"
                                            placeholder="0"
                                            type="number"
                                            value={savingsTarget}
                                            onChange={(e) => setSavingsTarget(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label>{t('currency')}</Label>
                                    <Select value={currency} onValueChange={setCurrency}>
                                        <SelectTrigger className="bg-white/5 border-white/10">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="₹">Rupee (₹)</SelectItem>
                                            <SelectItem value="$">Dollar ($)</SelectItem>
                                            <SelectItem value="€">Euro (€)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
                                    {t('save')} <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {step === 2 && (
                    <Card className="border-0 bg-black/60 backdrop-blur-xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-500">
                        <CardHeader className="text-center pb-2">
                            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                                <Building2 className="w-8 h-8 text-primary" />
                            </div>
                            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Connect Your Bank
                            </CardTitle>
                            <CardDescription className="text-lg">
                                Sync your Setu Sandbox account to get real-time financial insights.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="bg-muted/50 p-4 rounded-lg text-sm text-center text-muted-foreground">
                                Use <b>9999999999</b> to login to the sandbox.
                            </div>

                            <BankSyncButton />

                            <Button
                                variant="ghost"
                                className="w-full text-muted-foreground hover:text-white"
                                onClick={() => window.location.href = "/dashboard"}
                            >
                                Skip for now
                            </Button>
                        </CardContent>
                    </Card>
                )}

            </div>
        </div>
    );
};

export default Onboarding;
