import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Landmark, ShieldCheck, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export const BankSyncButton = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleSync = async () => {
        setIsLoading(true);
        // MOCK MODE SIMULATION
        setTimeout(() => {
            toast.success("Mock Bank Connected!");
            setIsLoading(false);
            window.location.assign("/dashboard");
        }, 1500);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="w-full justify-start gap-3 h-12 px-4 border-dashed border-2 hover:border-primary hover:bg-primary/5 transition-all duration-300"
                >
                    <Landmark className="h-5 w-5 text-primary" />
                    <div className="flex flex-col items-start">
                        <span className="text-sm font-semibold">Link Bank Account</span>
                        <span className="text-xs text-muted-foreground">Via Account Aggregator</span>
                    </div>
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                        Secure Bank Link
                    </DialogTitle>
                    <DialogDescription>
                        You will be redirected to a secure sandbox to approve data sharing.
                        This follows RBI's Account Aggregator framework.
                        <br /><br />
                        <span className="text-yellow-500 font-semibold">UAT Mode:</span> Please use the provided mock credentials in the Setu Sandbox.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 flex flex-col items-center justify-center gap-4">
                    {errorMsg ? (
                        <div className="w-full p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm font-medium text-center animate-in fade-in slide-in-from-bottom-2">
                            Setu Error: {errorMsg}
                        </div>
                    ) : (
                        <div className="p-4 bg-muted rounded-full">
                            <Landmark className="h-10 w-10 text-primary" />
                        </div>
                    )}
                    {!errorMsg && (
                        <p className="text-center text-sm text-muted-foreground">
                            BachatBuddy uses 256-bit encryption to ensure your data stays private.
                        </p>
                    )}
                </div>

                <Button
                    onClick={handleSync}
                    disabled={isLoading}
                    className="w-full py-6 text-lg font-bold bg-primary hover:bg-primary/90"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Connecting...
                        </>
                    ) : (
                        "Proceed to Link"
                    )}
                </Button>
            </DialogContent>
        </Dialog>
    );
};