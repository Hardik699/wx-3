import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppNav from "@/components/Navigation";
import LoadingScreen from "@/components/LoadingScreen";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Mail, TestTube, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface HelpdeskSettings {
  emailConfig: {
    imapHost: string;
    imapPort: number;
    imapUser: string;
    imapPassword: string;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    adminEmail: string;
  };
  autoReplyEnabled: boolean;
  autoReplyTemplate: string;
  adminNotificationEnabled: boolean;
  ticketPrefix: string;
  isActive: boolean;
}

export default function HelpdeskSettings() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [settings, setSettings] = useState<HelpdeskSettings>({
    emailConfig: {
      imapHost: "imap.gmail.com",
      imapPort: 993,
      imapUser: "",
      imapPassword: "",
      smtpHost: "smtp.gmail.com",
      smtpPort: 587,
      smtpUser: "",
      smtpPassword: "",
      adminEmail: "",
    },
    autoReplyEnabled: true,
    autoReplyTemplate: `Thank you for contacting our IT Helpdesk.

Your ticket has been created successfully.

Ticket ID: {{ticketId}}
Subject: {{subject}}
Status: {{status}}

We will respond to your request as soon as possible.

Best regards,
IT Support Team`,
    adminNotificationEnabled: true,
    ticketPrefix: "TKT",
    isActive: false,
  });

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    const userRole = localStorage.getItem("userRole");

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (userRole !== "admin") {
      navigate("/");
      return;
    }

    loadSettings();
  }, [navigate]);

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/helpdesk/settings");
      const data = await response.json();

      if (data.success) {
        setSettings(data.data);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/helpdesk/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Settings saved successfully!");
        setSettings(data.data);
      } else {
        toast.error("Error saving settings: " + data.error);
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Error saving settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestEmail = async () => {
    setIsTesting(true);
    try {
      const response = await fetch("/api/helpdesk/test-email", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Test email sent successfully! Check your inbox.");
      } else {
        toast.error("Error sending test email: " + data.error);
      }
    } catch (error) {
      console.error("Error testing email:", error);
      toast.error("Error testing email");
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Loading Settings..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-deep-900 via-blue-deep-800 to-slate-900">
      <AppNav />

      <main className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/helpdesk")}
              className="text-slate-300 hover:text-white hover:bg-slate-700/50"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Helpdesk Settings
              </h1>
              <p className="text-slate-400 text-sm">
                Configure email automation and ticket settings
              </p>
            </div>
          </div>
        </header>

        {/* Email Configuration */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Mail className="h-5 w-5 text-purple-400" />
              Email Configuration
            </CardTitle>
            <CardDescription className="text-slate-400">
              Configure IMAP and SMTP settings for email automation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* IMAP Settings */}
            <div className="space-y-3">
              <h3 className="text-white font-semibold">IMAP Settings (Incoming Mail)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">IMAP Host</Label>
                  <Input
                    value={settings.emailConfig.imapHost}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        emailConfig: { ...settings.emailConfig, imapHost: e.target.value },
                      })
                    }
                    className="bg-slate-800 border-slate-700 text-white"
                    placeholder="imap.gmail.com"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">IMAP Port</Label>
                  <Input
                    type="number"
                    value={settings.emailConfig.imapPort}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        emailConfig: { ...settings.emailConfig, imapPort: parseInt(e.target.value) },
                      })
                    }
                    className="bg-slate-800 border-slate-700 text-white"
                    placeholder="993"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">IMAP Email</Label>
                  <Input
                    type="email"
                    value={settings.emailConfig.imapUser}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        emailConfig: { ...settings.emailConfig, imapUser: e.target.value },
                      })
                    }
                    className="bg-slate-800 border-slate-700 text-white"
                    placeholder="support@company.com"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">IMAP Password / App Password</Label>
                  <Input
                    type="password"
                    value={settings.emailConfig.imapPassword}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        emailConfig: { ...settings.emailConfig, imapPassword: e.target.value },
                      })
                    }
                    className="bg-slate-800 border-slate-700 text-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {/* SMTP Settings */}
            <div className="space-y-3 pt-4 border-t border-slate-700">
              <h3 className="text-white font-semibold">SMTP Settings (Outgoing Mail)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">SMTP Host</Label>
                  <Input
                    value={settings.emailConfig.smtpHost}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        emailConfig: { ...settings.emailConfig, smtpHost: e.target.value },
                      })
                    }
                    className="bg-slate-800 border-slate-700 text-white"
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">SMTP Port</Label>
                  <Input
                    type="number"
                    value={settings.emailConfig.smtpPort}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        emailConfig: { ...settings.emailConfig, smtpPort: parseInt(e.target.value) },
                      })
                    }
                    className="bg-slate-800 border-slate-700 text-white"
                    placeholder="587"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">SMTP Email</Label>
                  <Input
                    type="email"
                    value={settings.emailConfig.smtpUser}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        emailConfig: { ...settings.emailConfig, smtpUser: e.target.value },
                      })
                    }
                    className="bg-slate-800 border-slate-700 text-white"
                    placeholder="support@company.com"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">SMTP Password / App Password</Label>
                  <Input
                    type="password"
                    value={settings.emailConfig.smtpPassword}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        emailConfig: { ...settings.emailConfig, smtpPassword: e.target.value },
                      })
                    }
                    className="bg-slate-800 border-slate-700 text-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {/* Admin Email */}
            <div className="pt-4 border-t border-slate-700">
              <Label className="text-slate-300">Admin Notification Email</Label>
              <Input
                type="email"
                value={settings.emailConfig.adminEmail}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    emailConfig: { ...settings.emailConfig, adminEmail: e.target.value },
                  })
                }
                className="bg-slate-800 border-slate-700 text-white"
                placeholder="admin@company.com"
              />
              <p className="text-slate-500 text-xs mt-1">
                Email address to receive new ticket notifications
              </p>
            </div>

            <Button
              onClick={handleTestEmail}
              disabled={isTesting || !settings.emailConfig.smtpUser}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <TestTube className="h-4 w-4 mr-2" />
              {isTesting ? "Sending..." : "Test Email Configuration"}
            </Button>
          </CardContent>
        </Card>

        {/* Automation Settings */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Automation Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-slate-300">Auto-Reply to Users</Label>
                <p className="text-slate-500 text-xs">
                  Automatically send confirmation email when ticket is created
                </p>
              </div>
              <Switch
                checked={settings.autoReplyEnabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, autoReplyEnabled: checked })
                }
              />
            </div>

            {settings.autoReplyEnabled && (
              <div>
                <Label className="text-slate-300">Auto-Reply Template</Label>
                <Textarea
                  value={settings.autoReplyTemplate}
                  onChange={(e) =>
                    setSettings({ ...settings, autoReplyTemplate: e.target.value })
                  }
                  className="bg-slate-800 border-slate-700 text-white font-mono text-sm"
                  rows={8}
                />
                <p className="text-slate-500 text-xs mt-1">
                  Available variables: {"{"}{"{"} ticketId {"}"}{"}"}, {"{"}{"{"} subject {"}"}{"}"}, {"{"}{"{"} status {"}"}
                  {"}"}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-700">
              <div>
                <Label className="text-slate-300">Admin Notifications</Label>
                <p className="text-slate-500 text-xs">
                  Send email to admin when new ticket is created
                </p>
              </div>
              <Switch
                checked={settings.adminNotificationEnabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, adminNotificationEnabled: checked })
                }
              />
            </div>

            <div className="pt-4 border-t border-slate-700">
              <Label className="text-slate-300">Ticket ID Prefix</Label>
              <Input
                value={settings.ticketPrefix}
                onChange={(e) => setSettings({ ...settings, ticketPrefix: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
                placeholder="TKT"
                maxLength={5}
              />
              <p className="text-slate-500 text-xs mt-1">
                Example: {settings.ticketPrefix}-000001
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-700">
              <div>
                <Label className="text-slate-300">Email Monitoring Active</Label>
                <p className="text-slate-500 text-xs">
                  Enable automatic ticket creation from incoming emails
                </p>
              </div>
              <Switch
                checked={settings.isActive}
                onCheckedChange={(checked) => setSettings({ ...settings, isActive: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => navigate("/helpdesk")}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-purple-500 hover:bg-purple-600"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </main>
    </div>
  );
}
