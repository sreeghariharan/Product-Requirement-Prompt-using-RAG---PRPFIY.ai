import { useState } from "react";
import { motion } from "framer-motion";
import { X, User, Mail, Phone, Globe, Save, Key, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import prpfiyLogo from "@/assets/prpfiy-logo.png";

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserSettings {
  name: string;
  email: string;
  phone: string;
  website: string;
  groqApiKey: string;
}

const API_URL = "http://localhost:8000";

export const Settings = ({ isOpen, onClose }: SettingsProps) => {
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem("prpfiy-settings");
    return saved
      ? JSON.parse(saved)
      : {
        name: "",
        email: "",
        phone: "",
        website: "",
        groqApiKey: "",
      };
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save to localStorage
      localStorage.setItem("prpfiy-settings", JSON.stringify(settings));

      // Send API key to backend if provided
      if (settings.groqApiKey) {
        const response = await fetch(`${API_URL}/api-key`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ api_key: settings.groqApiKey }),
        });
        if (!response.ok) {
          throw new Error("Failed to save API key to backend");
        }
      }

      toast({
        title: "Settings Saved",
        description: "Your settings have been saved successfully.",
      });
      onClose();
    } catch (error) {
      console.error("Save error:", error);
      // Still save locally even if backend call fails
      localStorage.setItem("prpfiy-settings", JSON.stringify(settings));
      toast({
        title: "Settings Saved Locally",
        description: "Settings saved locally. Backend may not be running for API key sync.",
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <img src={prpfiyLogo} alt="PRPFIY" className="w-10 h-10 rounded-lg" />
            <h2 className="text-xl font-semibold text-foreground">Settings</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="space-y-4">
          {/* Groq API Key — top priority */}
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
            <Label htmlFor="groqApiKey" className="text-foreground flex items-center gap-2 font-medium">
              <Key className="w-4 h-4 text-primary" />
              Groq API Key
            </Label>
            <div className="relative">
              <Input
                id="groqApiKey"
                type={showApiKey ? "text" : "password"}
                value={settings.groqApiKey}
                onChange={(e) => setSettings({ ...settings, groqApiKey: e.target.value })}
                placeholder="gsk_..."
                className="bg-secondary border-0 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Get your free API key at{" "}
              <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                console.groq.com
              </a>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground flex items-center gap-2">
              <User className="w-4 h-4" />
              Name
            </Label>
            <Input
              id="name"
              value={settings.name}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              placeholder="Your name"
              className="bg-secondary border-0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              placeholder="your@email.com"
              className="bg-secondary border-0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-foreground flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Phone
            </Label>
            <Input
              id="phone"
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              placeholder="+1 234 567 8900"
              className="bg-secondary border-0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website" className="text-foreground flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Website
            </Label>
            <Input
              id="website"
              value={settings.website}
              onChange={(e) => setSettings({ ...settings, website: e.target.value })}
              placeholder="https://yourwebsite.com"
              className="bg-secondary border-0"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-primary text-primary-foreground">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};
