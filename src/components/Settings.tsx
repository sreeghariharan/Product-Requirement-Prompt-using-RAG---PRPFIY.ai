import { useState } from "react";
import { motion } from "framer-motion";
import { X, User, Mail, Phone, Globe, Save } from "lucide-react";
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
  ollamaUrl: string;
}

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
          ollamaUrl: "http://localhost:11434",
        };
  });

  const handleSave = () => {
    localStorage.setItem("prpfiy-settings", JSON.stringify(settings));
    toast({
      title: "Settings Saved",
      description: "Your settings have been saved successfully.",
    });
    onClose();
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

          <div className="pt-4 border-t border-border">
            <div className="space-y-2">
              <Label htmlFor="ollamaUrl" className="text-foreground">
                Ollama Server URL
              </Label>
              <Input
                id="ollamaUrl"
                value={settings.ollamaUrl}
                onChange={(e) => setSettings({ ...settings, ollamaUrl: e.target.value })}
                placeholder="http://localhost:11434"
                className="bg-secondary border-0"
              />
              <p className="text-xs text-muted-foreground">
                Make sure Ollama is running with llama3 model installed
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-primary text-primary-foreground">
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};
