import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface UserProfile {
    id: string;
    email: string | undefined;
    full_name: string | undefined;
    avatar_url: string | undefined;
    monthly_income?: number;
    monthly_savings_target?: number;
    currency?: string;
    language?: string;
    has_onboarded?: boolean;
}

export const useUserProfile = () => {
    const queryClient = useQueryClient();

    const { data: profile, isLoading, error } = useQuery({
        queryKey: ["user-profile"],
        queryFn: async (): Promise<UserProfile | null> => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            // Fetch additional profile data from the database
            const { data: dbProfile, error: dbError } = await supabase
                .from("user_profiles")
                .select("*")
                .eq("user_id", user.id)
                .single();

            // We don't throw on dbError immediately because user might not have a profile row yet,
            // but we still have auth data.
            if (dbError && dbError.code !== "PGRST116") {
                console.error("Error fetching user profile:", dbError);
            }

            // Merge Auth Metadata with DB Profile
            // Auth metadata is usually the primary source for name/email/avatar in this setup
            // unless we strictly sync it to DB.
            const meta = user.user_metadata;

            return {
                id: user.id,
                email: user.email,
                full_name: meta?.full_name || dbProfile?.full_name, // Fallback to DB if auth missing
                avatar_url: meta?.avatar_url || meta?.picture,
                monthly_income: dbProfile?.monthly_income,
                monthly_savings_target: dbProfile?.monthly_savings_target,
                currency: dbProfile?.currency,
                language: dbProfile?.language,
                has_onboarded: dbProfile?.has_onboarded,
            };
        },
        staleTime: 0,
    });

    const updateProfile = useMutation({
        mutationFn: async (updates: Partial<UserProfile>) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user authenticated");

            // 1. Update Auth Metadata (Best for name/avatar)
            if (updates.full_name || updates.avatar_url) {
                const { error: authError } = await supabase.auth.updateUser({
                    data: {
                        full_name: updates.full_name,
                        avatar_url: updates.avatar_url,
                    }
                });
                if (authError) throw authError;
            }

            // 2. Update DB Profile (Best for business logic settings)
            // Filter out fields that don't belong to the DB table or handle them
            const dbUpdates: any = {
                updated_at: new Date().toISOString(),
            };

            if (updates.monthly_income !== undefined) dbUpdates.monthly_income = updates.monthly_income;
            if (updates.monthly_savings_target !== undefined) dbUpdates.monthly_savings_target = updates.monthly_savings_target;
            if (updates.currency !== undefined) dbUpdates.currency = updates.currency;
            if (updates.language !== undefined) dbUpdates.language = updates.language;
            // We also want to save full_name to DB if the column exists/is required
            if (updates.full_name !== undefined) dbUpdates.full_name = updates.full_name;

            const { error: dbError } = await supabase
                .from("user_profiles")
                .upsert({
                    user_id: user.id,
                    // We need to pass all required fields if it's a new row,
                    // but upsert should handle partial if the row exists? 
                    // Actually upsert needs a conflict target.
                    // For partial updates on existing rows, 'update' is better, but 'upsert' covers creation.
                    // To be safe for creation, we might need default values if they are missing.
                    ...dbUpdates
                }, { onConflict: 'user_id' });

            if (dbError) throw dbError;

            return { ...profile, ...updates };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user-profile"] });
            // Also invalidate onboarding step just in case
            queryClient.invalidateQueries({ queryKey: ["onboarding-step"] });
        },
    });

    return {
        profile,
        isLoading,
        error,
        updateProfile,
    };
};
