import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useOnboarding } from "@/hooks/useOnboarding";

interface RequiresOnboardingProps {
    children: React.ReactNode;
}

export const RequiresOnboarding = ({ children }: RequiresOnboardingProps) => {
    const location = useLocation();
    const { onboardingStep, isLoading } = useOnboarding();

    // Bypass for Mock Mode - REMOVED per surgical purge


    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                    <p className="text-muted-foreground font-medium">Verifying Profile...</p>
                </div>
            </div>
        );
    }

    // Step 1: Missing Income -> Go to Profile Step
    if (onboardingStep === "profile") {
        return <Navigate to="/onboarding" replace />;
    }

    // Step 2: Missing Bank -> Go to Connect Bank Step
    // Step 2: Missing Bank -> Go to Connect Bank Step
    // if (onboardingStep === "bank") {
    //     return <Navigate to="/onboarding?step=2" replace />;
    // }

    // All good
    return <>{children}</>;
};
