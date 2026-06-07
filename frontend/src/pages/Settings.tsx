import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { User, Bell, Shield, Wallet, CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import SubscriptionManager from "@/components/bills/SubscriptionManager";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { useUserProfile } from "@/hooks/useUserProfile";

const Settings = () => {
  const { i18n } = useTranslation();
  const { profile, updateProfile } = useUserProfile();
  const [income, setIncome] = useState<string>("42000");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const currentMonthYear = format(new Date(), "yyyy-MM");

  useEffect(() => {
    if (profile?.monthly_income) {
      setIncome(profile.monthly_income.toString());
    }
  }, [profile?.monthly_income]);

  useEffect(() => {
    if (profile?.full_name) {
      setFullName(profile.full_name);
    }
  }, [profile?.full_name]);

  const handleSaveIncome = async () => {
    setLoading(true);
    updateProfile.mutate(
      { monthly_income: parseFloat(income) },
      {
        onSuccess: () => {
          toast.success("Monthly income updated!");
          queryClient.invalidateQueries({ queryKey: ["user-profile"] });
        },
        onError: (error) => {
          toast.error("Failed to update income: " + error.message);
        },
        onSettled: () => {
          setLoading(false);
        }
      }
    );
  };

  const handleGeneralSave = () => {
    updateProfile.mutate(
      { full_name: fullName },
      {
        onSuccess: () => {
          toast.success("Profile Updated!");
          queryClient.invalidateQueries({ queryKey: ["user-profile"] });
        },
        onError: (error) => {
          toast.error("Failed to update profile: " + error.message);
        }
      }
    );
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account preferences</p>
      </div>

      {/* Financial Settings */}
      <Card className="shadow-card animate-slide-up" style={{ animationDelay: "100ms" }}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Financial Settings</CardTitle>
              <CardDescription>Configure your primary income and budget targets</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="monthly-income">Total Monthly Income (₹)</Label>
            <div className="flex gap-2">
              <Input
                id="monthly-income"
                type="number"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                placeholder="42000"
              />
              <Button onClick={handleSaveIncome} disabled={loading} variant="secondary">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              This value is used to calculate your remaining balance and budget accuracy.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Management */}
      <div className="animate-slide-up" style={{ animationDelay: "150ms" }}>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Recurring Bills
        </h2>
        <SubscriptionManager />
      </div>

      <Separator className="my-8" />

      {/* Profile Settings */}
      <Card className="shadow-card animate-slide-up" style={{ animationDelay: "200ms" }}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <User className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Profile Settings</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Your Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile?.email || ""}
                disabled
                className="bg-muted"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Input id="currency" value={profile?.currency || "INR (₹)"} disabled className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label>Language</Label>
            <div className="flex gap-2">
              <Button
                variant={i18n.language === 'en' ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  i18n.changeLanguage('en');
                  updateProfile.mutate({ language: 'en' });
                }}
              >
                English
              </Button>
              <Button
                variant={i18n.language === 'hi' ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  i18n.changeLanguage('hi');
                  updateProfile.mutate({ language: 'hi' });
                }}
              >
                हिंदी
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="shadow-card animate-slide-up" style={{ animationDelay: "300ms" }}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Notifications</CardTitle>
              <CardDescription>Configure how you receive alerts</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Budget Alerts</p>
              <p className="text-sm text-muted-foreground">Get notified when you exceed budget limits</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Weekly Summary</p>
              <p className="text-sm text-muted-foreground">Receive a weekly spending summary email</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Transaction Alerts</p>
              <p className="text-sm text-muted-foreground">Get notified for every transaction</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="shadow-card animate-slide-up" style={{ animationDelay: "400ms" }}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Security</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end animate-slide-up" style={{ animationDelay: "500ms" }}>
        <Button onClick={handleGeneralSave} className="px-8">
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default Settings;
