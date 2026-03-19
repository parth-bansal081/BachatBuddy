import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type OnboardingStep = "profile" | "bank" | "complete";

export const useOnboarding = () => {
    const { data: step, isLoading, error } = useQuery<OnboardingStep>({
        queryKey: ["onboarding-step"],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return "profile"; // Default safe state

            // 1. Check Profile (Income & Flag)
            const { data: profile, error } = await supabase
                .from("user_profiles")
                .select("has_onboarded, monthly_income") // Removed setu_consent_id
                .eq("user_id", user.id)
                .single();

            if (error) {
                // If no profile exists, we definitely need onboarding
                return "profile";
            }

            // If explicit flag is true, we are done
            if (profile?.has_onboarded) return "complete";

            // If flag is false, BUT they have income set (Migration/Legacy case),
            // we consider them onboarded to avoid blocking existing users.
            // Ideally we should background-update has_onboarded=true here, but for now just bypass.
            if (profile?.monthly_income && profile.monthly_income > 0) return "complete";

            return "profile";
        },
        // Don't refetch too aggressively
        staleTime: 0, // Ensure fresh check on valid navigation
        retry: false
    });

    return {
        onboardingStep: step,
        isLoading,
        error
    };
};
