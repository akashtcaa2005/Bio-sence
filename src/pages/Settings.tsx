import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell, Moon, Sun, Monitor, Weight, Thermometer,
  Save, Loader2, ShieldAlert, AlertTriangle, CheckCircle2,
  ChevronRight, MapPin, Search, Navigation,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Theme = "light" | "dark" | "system";
type WeightUnit = "kg" | "lbs";
type TempUnit = "celsius" | "fahrenheit";
type HeightUnit = "cm" | "ft";

interface Settings {
  theme: Theme;
  weight_unit: WeightUnit;
  temperature_unit: TempUnit;
  notify_abnormal: boolean;
  notify_caution: boolean;
  notify_daily_summary: boolean;
  notify_emergency_alerts: boolean;
  default_latitude: number | null;
  default_longitude: number | null;
  default_location_label: string | null;
  body_weight: number | null;
  height: number | null;
  height_unit: HeightUnit;
}

const defaultSettings: Settings = {
  theme: "system",
  weight_unit: "kg",
  temperature_unit: "celsius",
  notify_abnormal: true,
  notify_caution: true,
  notify_daily_summary: false,
  notify_emergency_alerts: true,
  default_latitude: null,
  default_longitude: null,
  default_location_label: null,
  body_weight: null,
  height: null,
  height_unit: "cm",
};

const Settings = () => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locationQuery, setLocationQuery] = useState("");
  const [locationSearching, setLocationSearching] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<{ label: string; lat: number; lon: number }[]>([]);
  const [gpsLocating, setGpsLocating] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", session.user.id)
        .single();
      if (data) {
        setSettings({
          theme: (data.theme as Theme) || "system",
          weight_unit: (data.weight_unit as WeightUnit) || "kg",
          temperature_unit: (data.temperature_unit as TempUnit) || "celsius",
          notify_abnormal: data.notify_abnormal ?? true,
          notify_caution: data.notify_caution ?? true,
          notify_daily_summary: data.notify_daily_summary ?? false,
          notify_emergency_alerts: data.notify_emergency_alerts ?? true,
          default_latitude: data.default_latitude ?? null,
          default_longitude: data.default_longitude ?? null,
          default_location_label: data.default_location_label ?? null,
          body_weight: (data as any).body_weight ?? null,
          height: (data as any).height ?? null,
          height_unit: ((data as any).height_unit as HeightUnit) || "cm",
        });
        if (data.default_location_label) setLocationQuery(data.default_location_label);
      }
      setLoading(false);
    };
    load();
  }, []);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === "dark") {
      root.classList.add("dark");
    } else if (settings.theme === "light") {
      root.classList.remove("dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  }, [settings.theme]);

  const searchLocation = async () => {
    if (!locationQuery.trim()) return;
    setLocationSearching(true);
    setLocationSuggestions([]);
    try {
      // Strip Google Plus Codes (e.g. "R266+QPJ") — Nominatim doesn't support them
      const cleaned = locationQuery
        .replace(/\b[23456789CFGHJMPQRVWX]{2,8}\+[23456789CFGHJMPQRVWX]{2,3}\b/gi, "")
        .replace(/^[,\s]+/, "")
        .trim();

      const query = cleaned || locationQuery;
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const results = await res.json();
      if (results.length === 0) {
        toast({ title: "No results found", description: "Try a more specific address or use GPS.", variant: "destructive" });
      }
      setLocationSuggestions(
        results.map((r: any) => ({ label: r.display_name, lat: parseFloat(r.lat), lon: parseFloat(r.lon) }))
      );
    } catch {
      toast({ title: "Search failed", description: "Could not search for location.", variant: "destructive" });
    }
    setLocationSearching(false);
  };

  const pickLocation = (s: { label: string; lat: number; lon: number }) => {
    setSettings((p) => ({ ...p, default_latitude: s.lat, default_longitude: s.lon, default_location_label: s.label }));
    setLocationQuery(s.label);
    setLocationSuggestions([]);
    toast({ title: "Location selected", description: "Press Save Settings to apply." });
  };

  const useGPS = () => {
    if (!navigator.geolocation) return;
    setGpsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const label = data.display_name || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
          setSettings((p) => ({ ...p, default_latitude: latitude, default_longitude: longitude, default_location_label: label }));
          setLocationQuery(label);
          toast({ title: "GPS location detected", description: "Press Save Settings to apply." });
        } catch {
          setSettings((p) => ({ ...p, default_latitude: latitude, default_longitude: longitude, default_location_label: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}` }));
          setLocationQuery(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        }
        setGpsLocating(false);
      },
      () => {
        toast({ title: "GPS denied", description: "Please allow location access and try again.", variant: "destructive" });
        setGpsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSave = async () => {
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from("user_settings")
      .upsert({ user_id: session.user.id, ...settings }, { onConflict: "user_id" });

    if (error) {
      toast({ title: "Failed to save", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Settings saved ✓", description: "Your preferences have been updated." });
    }
    setSaving(false);
  };

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your preferences and account settings</p>
      </div>

      {/* Theme */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Monitor className="h-4 w-4 text-primary" /> Appearance
          </CardTitle>
          <CardDescription>Choose your preferred display theme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {(["light", "system", "dark"] as Theme[]).map((t) => (
              <button
                key={t}
                onClick={() => set("theme", t)}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                  settings.theme === t
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/30"
                }`}
              >
                {t === "light" && <Sun className={`h-5 w-5 ${settings.theme === t ? "text-primary" : "text-muted-foreground"}`} />}
                {t === "dark" && <Moon className={`h-5 w-5 ${settings.theme === t ? "text-primary" : "text-muted-foreground"}`} />}
                {t === "system" && <Monitor className={`h-5 w-5 ${settings.theme === t ? "text-primary" : "text-muted-foreground"}`} />}
                <span className={`text-xs font-medium capitalize ${settings.theme === t ? "text-primary" : "text-muted-foreground"}`}>
                  {t}
                </span>
                {settings.theme === t && <CheckCircle2 className="h-3 w-3 text-primary" />}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Live Location */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" /> Live Location
          </CardTitle>
          <CardDescription>Used as fallback for SOS alerts when GPS is unavailable</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Search address or place name…"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchLocation()}
              className="flex-1"
            />
            <Button variant="outline" size="icon" onClick={searchLocation} disabled={locationSearching}>
              {locationSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="icon" onClick={useGPS} disabled={gpsLocating} title="Use current GPS location">
              {gpsLocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
            </Button>
          </div>

          {locationSuggestions.length > 0 && (
            <div className="border border-border rounded-lg overflow-hidden divide-y divide-border">
              {locationSuggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => pickLocation(s)}
                  className="w-full text-left px-3 py-2.5 text-sm hover:bg-muted transition-colors"
                >
                  <span className="line-clamp-2">{s.label}</span>
                </button>
              ))}
            </div>
          )}

          {settings.default_latitude && settings.default_longitude && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
              <MapPin className="h-3 w-3 shrink-0 text-primary" />
              <span className="truncate flex-1">{settings.default_location_label || `${settings.default_latitude}, ${settings.default_longitude}`}</span>
              <button
                onClick={() => {
                  setSettings((p) => ({ ...p, default_latitude: null, default_longitude: null, default_location_label: null }));
                  setLocationQuery("");
                  toast({ title: "Location removed", description: "Press Save Settings to apply." });
                }}
                className="ml-auto shrink-0 text-destructive hover:text-destructive/80 font-medium transition-colors"
              >
                Remove
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Units */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Weight className="h-4 w-4 text-primary" /> Measurement Units
          </CardTitle>
          <CardDescription>Set units used across the app for health metrics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Weight unit toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Weight className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Weight Unit</p>
                <p className="text-xs text-muted-foreground">Body weight measurements</p>
              </div>
            </div>
            <div className="flex rounded-lg overflow-hidden border border-border">
              {(["kg", "lbs"] as WeightUnit[]).map((u) => (
                <button
                  key={u}
                  onClick={() => set("weight_unit", u)}
                  className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                    settings.weight_unit === u
                      ? "bg-primary text-primary-foreground"
                      : "bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Body Weight input */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Weight className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Body Weight</p>
                <p className="text-xs text-muted-foreground">Your current body weight</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={500}
                step={0.1}
                placeholder="e.g. 70"
                value={settings.body_weight ?? ""}
                onChange={(e) => set("body_weight", e.target.value ? parseFloat(e.target.value) : null)}
                className="w-28 text-right"
              />
              <span className="text-sm text-muted-foreground w-6">{settings.weight_unit}</span>
            </div>
          </div>

          <Separator />

          {/* Height unit toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Thermometer className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Height Unit</p>
                <p className="text-xs text-muted-foreground">Height measurement format</p>
              </div>
            </div>
            <div className="flex rounded-lg overflow-hidden border border-border">
              {(["cm", "ft"] as HeightUnit[]).map((u) => (
                <button
                  key={u}
                  onClick={() => set("height_unit", u)}
                  className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                    settings.height_unit === u
                      ? "bg-primary text-primary-foreground"
                      : "bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Height input */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Thermometer className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Height</p>
                <p className="text-xs text-muted-foreground">Your current height</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={300}
                step={0.1}
                placeholder={settings.height_unit === "cm" ? "e.g. 170" : "e.g. 5.9"}
                value={settings.height ?? ""}
                onChange={(e) => set("height", e.target.value ? parseFloat(e.target.value) : null)}
                className="w-28 text-right"
              />
              <span className="text-sm text-muted-foreground w-6">{settings.height_unit}</span>
            </div>
          </div>

          <Separator />

          {/* Temperature */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Thermometer className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Temperature</p>
                <p className="text-xs text-muted-foreground">Body temperature readings</p>
              </div>
            </div>
            <div className="flex rounded-lg overflow-hidden border border-border">
              {(["celsius", "fahrenheit"] as TempUnit[]).map((u) => (
                <button
                  key={u}
                  onClick={() => set("temperature_unit", u)}
                  className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                    settings.temperature_unit === u
                      ? "bg-primary text-primary-foreground"
                      : "bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {u === "celsius" ? "°C" : "°F"}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" /> Notifications
          </CardTitle>
          <CardDescription>Control which alerts you receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {[
            {
              key: "notify_emergency_alerts" as const,
              icon: <ShieldAlert className="h-4 w-4 text-destructive" />,
              label: "Emergency Alerts",
              desc: "SOS and critical health warnings",
            },
            {
              key: "notify_abnormal" as const,
              icon: <AlertTriangle className="h-4 w-4 text-health-abnormal" />,
              label: "Abnormal Readings",
              desc: "When metrics are outside safe range",
            },
            {
              key: "notify_caution" as const,
              icon: <AlertTriangle className="h-4 w-4 text-health-caution" />,
              label: "Caution Readings",
              desc: "When metrics need attention",
            },
            {
              key: "notify_daily_summary" as const,
              icon: <CheckCircle2 className="h-4 w-4 text-health-normal" />,
              label: "Daily Summary",
              desc: "A daily overview of your health metrics",
            },
          ].map(({ key, icon, label, desc }, i, arr) => (
            <div key={key}>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">{icon}</div>
                  <div>
                    <Label htmlFor={key} className="text-sm font-medium cursor-pointer">{label}</Label>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </div>
                <Switch
                  id={key}
                  checked={settings[key]}
                  onCheckedChange={(v) => set(key, v)}
                />
              </div>
              {i < arr.length - 1 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Account */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-primary" /> Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <button
            onClick={() => navigate("/profile-setup")}
            className="w-full flex items-center justify-between py-3 hover:bg-muted/50 rounded-lg px-1 transition-colors"
          >
            <span className="text-sm font-medium">Edit Profile</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <Separator />
          <button
            onClick={async () => { await supabase.auth.signOut(); navigate("/auth"); }}
            className="w-full flex items-center justify-between py-3 hover:bg-destructive/5 rounded-lg px-1 transition-colors group"
          >
            <span className="text-sm font-medium text-destructive">Sign Out</span>
            <ChevronRight className="h-4 w-4 text-destructive/50 group-hover:text-destructive transition-colors" />
          </button>
        </CardContent>
      </Card>

      {/* Save button */}
      <Button onClick={handleSave} disabled={saving} className="w-full" size="lg">
        {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : <><Save className="h-4 w-4 mr-2" /> Save Settings</>}
      </Button>
    </div>
  );
};

export default Settings;
