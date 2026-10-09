import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { 
  Heart, Thermometer, HeartPulse, CircleCheck, Clock,
  MessageCircle, AlertTriangle, User, Siren, MapPin, Phone, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import HealthCard from "@/components/health/HealthCard";
import HealthChart from "@/components/health/HealthChart";
import AlertFeed from "@/components/health/AlertFeed";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type HealthStatus = "normal" | "caution" | "abnormal";

interface HealthMetric {
  value: number | string;
  status: HealthStatus;
  unit: string;
  range: string;
}

interface HealthData {
  heartRate: HealthMetric;
  bloodSugar: HealthMetric;
  bloodPressure: HealthMetric;
  oxygenLevel: HealthMetric;
  hemoglobin: HealthMetric;
  stepsWalked: HealthMetric;
  sleepTime: HealthMetric;
  caloriesBurned: HealthMetric;
}

const generateMockData = (base: number, variance: number, count: number) =>
  Array.from({ length: count }, (_, i) => ({
    time: `${i}:00`,
    value: Math.round(base + (Math.random() * variance * 2) - variance),
  }));

const UserDashboard = () => {
  const { toast } = useToast();
  const lastAlertSent = useRef<string | null>(null);
  const [sosSending, setSosSending] = useState(false);
  const [savedLocation, setSavedLocation] = useState<{ label: string; lat: number; lng: number } | null>(null);
  const [liveCoords, setLiveCoords] = useState<{ lat: number; lng: number } | null>({ lat: 10.8099722, lng: 77.0115278 });

  const [healthData, setHealthData] = useState<HealthData>({
    heartRate:      { value: 77,       status: "normal", unit: "bpm",    range: "60-100 bpm" },
    bloodSugar:     { value: 110,      status: "normal", unit: "mg/dL",  range: "80-130 mg/dL" },
    bloodPressure:  { value: "120/80", status: "normal", unit: "mmHg",   range: "90-120/60-80 mmHg" },
    oxygenLevel:    { value: 98,       status: "normal", unit: "%",      range: "95-100%" },
    hemoglobin:     { value: 14.2,     status: "normal", unit: "g/dL",   range: "13.5-17.5 g/dL" },
    stepsWalked:    { value: 7845,     status: "normal", unit: "steps",  range: "7,500-10,000 steps" },
    sleepTime:      { value: 7.5,      status: "normal", unit: "hours",  range: "7-9 hours" },
    caloriesBurned: { value: 1850,     status: "normal", unit: "kcal",   range: "1,500-2,500 kcal" },
  });

  const [alerts] = useState([
    { id: 1, message: "Blood pressure spike detected",  timestamp: "Today, 10:23 AM",     status: "abnormal" as const },
    { id: 2, message: "Blood sugar slightly elevated",  timestamp: "Today, 08:17 AM",     status: "caution"  as const },
    { id: 3, message: "Irregular heartbeat detected",   timestamp: "Yesterday, 11:45 PM", status: "abnormal" as const },
  ]);

  const [chartData] = useState({
    heartRate:     generateMockData(75,  10, 24),
    bloodSugar:    generateMockData(100, 20, 24),
    bloodPressure: generateMockData(120, 15, 24),
    oxygenLevel:   generateMockData(97,  2,  24),
  });

  const sendHealthAlert = useCallback(async (
    alertType: string,
    alertMessage: string,
    metric: { metric: string; value: string | number; normalRange: string }
  ) => {
    const alertKey = `${alertType}-${Date.now()}`;
    if (lastAlertSent.current && Date.now() - parseInt(lastAlertSent.current.split("-")[1]) < 300000) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data, error } = await supabase.functions.invoke("send-health-alert", {
        body: { alertType, alertMessage, healthData: metric },
      });
      if (!error && data?.sent > 0) {
        lastAlertSent.current = alertKey;
        toast({ title: "Emergency Alert Sent", description: `Notified ${data.sent} contact(s) about ${alertType.toLowerCase()}.`, variant: "destructive" });
      }
    } catch (err) {
      console.error("Failed to send health alert:", err);
    }
  }, [toast]);

  const FIXED_LAT = 10.8099722;
  const FIXED_LNG = 77.0115278;
  const FIXED_LABEL = "Akshaya College of Engineering and Technology, Kinathukadavu, Coimbatore";

  // Save & load fixed location
  useEffect(() => {
    const saveLocation = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      await supabase
        .from("user_settings")
        .upsert(
          {
            user_id: session.user.id,
            default_latitude: FIXED_LAT,
            default_longitude: FIXED_LNG,
            default_location_label: FIXED_LABEL,
          },
          { onConflict: "user_id" }
        );
      setSavedLocation({ label: FIXED_LABEL, lat: FIXED_LAT, lng: FIXED_LNG });
    };
    saveLocation();
  }, []);

  // Fixed location coords

  // Cooldown removed

  const triggerSOS = useCallback(async () => {
    if (sosSending) return;
    setSosSending(true);
    try {
      const { data: refreshData } = await supabase.auth.refreshSession();
      const session = refreshData?.session;
      if (!session) throw new Error("Session expired. Please log in again.");

      // Fetch contacts directly from DB
      const { data: contacts, error: fetchErr } = await supabase
        .from("emergency_contacts")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("is_active", true);

      if (fetchErr) throw fetchErr;
      if (!contacts || contacts.length === 0) throw new Error("No active contacts found.");

      const timestamp = new Date().toLocaleString("en-US", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit", timeZoneName: "short",
      });

      // Call our local Node.js Express server to bypass the Edge Function
      let response: Response;
      try {
        response = await fetch("http://localhost:8083/send-sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contacts,
            latitude: 10.8099722,
            longitude: 77.0115278,
            locationLabel: "Akshaya College of Engineering and Technology",
            timestamp
          })
        });
      } catch (fetchErr: any) {
        // Server is not running
        throw new Error("SOS server is not running. Please start it with: node sos-server.mjs");
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      // Log alerts in DB
      for (const contact of contacts) {
        await supabase.from("alert_notifications").insert({
          user_id: session.user.id,
          contact_id: contact.id,
          alert_type: "SOS Emergency",
          alert_message: `Emergency SOS triggered via Gmail.`,
          status: "sent",
        });
      }

      toast({ title: "🚨 SOS Alert Sent!", description: `Emergency dispatched to ${data.sent} contact(s) via Email & SMS.`, variant: "destructive" });
    } catch (e: any) {
      toast({ title: "SOS Failed", description: e.message || "Failed to send SOS.", variant: "destructive" });
    } finally {
      setSosSending(false);
    }
  }, [sosSending, toast]);

  useEffect(() => {
    const interval = setInterval(() => {
      setHealthData(prev => {
        const newHeartRate  = Math.min(78, Math.max(76, Math.round((prev.heartRate.value as number) + (Math.random() * 2 - 1))));
        const newBloodSugar = Math.round((prev.bloodSugar.value as number) + (Math.random() * 6 - 3));
        const heartRateAbnormal = newHeartRate > 78 || newHeartRate < 76;
        const bloodSugarCaution = newBloodSugar > 130;
        if (heartRateAbnormal && prev.heartRate.status !== "abnormal") {
          sendHealthAlert("Abnormal Heart Rate", `Heart rate at ${newHeartRate} bpm.`, { metric: "Heart Rate", value: `${newHeartRate} bpm`, normalRange: "60-100 bpm" });
        }
        if (bloodSugarCaution && prev.bloodSugar.status === "normal") {
          sendHealthAlert("Elevated Blood Sugar", `Blood sugar at ${newBloodSugar} mg/dL.`, { metric: "Blood Sugar", value: `${newBloodSugar} mg/dL`, normalRange: "80-130 mg/dL" });
        }
        return {
          ...prev,
          heartRate:  { ...prev.heartRate,  value: newHeartRate,  status: heartRateAbnormal ? "abnormal" : "normal" },
          bloodSugar: { ...prev.bloodSugar, value: newBloodSugar, status: bloodSugarCaution  ? "caution"  : "normal" },
        };
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [sendHealthAlert]);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Personal Health Dashboard</h1>
          <p className="text-muted-foreground">Real-time health monitoring from your implanted GSM chip</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* SOS Button + location */}
          <button
            onClick={triggerSOS}
            disabled={sosSending}
            className={cn(
              "inline-flex items-center gap-2 px-4 h-10 rounded-md text-sm font-bold shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-destructive/40 text-white hover:opacity-90 active:scale-95",
              sosSending && "opacity-70 cursor-not-allowed"
            )}
            style={{ background: "linear-gradient(135deg, #dc2626, #991b1b)" }}
          >
            {sosSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Siren className="h-4 w-4" />}
            {sosSending ? "Sending SOS…" : "🚨 SOS EMERGENCY"}
          </button>

          <Link to="/emergency-contacts">
            <Button variant="outline" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Contacts
            </Button>
          </Link>
          <Link to="/doctor">
            <Button variant="outline" className="gap-2">
              <MessageCircle className="h-4 w-4" />
              Message Doctor
            </Button>
          </Link>
        </div>
      </div>

      {/* Health Cards Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <HealthCard title="Heart Rate"     value={healthData.heartRate.value}     unit={healthData.heartRate.unit}     icon={<Heart     className="h-5 w-5" />} status={healthData.heartRate.status}     range={healthData.heartRate.range} />
        <HealthCard title="Blood Sugar"    value={healthData.bloodSugar.value}    unit={healthData.bloodSugar.unit}    icon={<Thermometer className="h-5 w-5" />} status={healthData.bloodSugar.status}    range={healthData.bloodSugar.range} />
        <HealthCard title="Blood Pressure" value={healthData.bloodPressure.value} unit={healthData.bloodPressure.unit} icon={<HeartPulse className="h-5 w-5" />} status={healthData.bloodPressure.status} range={healthData.bloodPressure.range} />
        <HealthCard title="Oxygen Level"   value={healthData.oxygenLevel.value}   unit={healthData.oxygenLevel.unit}   icon={<CircleCheck className="h-5 w-5" />} status={healthData.oxygenLevel.status}   range={healthData.oxygenLevel.range} />
      </div>

      {/* Health Cards Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <HealthCard title="Hemoglobin"      value={healthData.hemoglobin.value}           unit={healthData.hemoglobin.unit}      icon={<Thermometer className="h-5 w-5" />} status={healthData.hemoglobin.status}      range={healthData.hemoglobin.range} />
        <HealthCard title="Steps Walked"    value={(healthData.stepsWalked.value as number).toLocaleString()} unit={healthData.stepsWalked.unit} icon={<User className="h-5 w-5" />}       status={healthData.stepsWalked.status}     range={healthData.stepsWalked.range} />
        <HealthCard title="Sleep Time"      value={healthData.sleepTime.value}             unit={healthData.sleepTime.unit}       icon={<Clock className="h-5 w-5" />}       status={healthData.sleepTime.status}       range={healthData.sleepTime.range} />
        <HealthCard title="Calories Burned" value={(healthData.caloriesBurned.value as number).toLocaleString()} unit={healthData.caloriesBurned.unit} icon={<HeartPulse className="h-5 w-5" />} status={healthData.caloriesBurned.status} range={healthData.caloriesBurned.range} />
      </div>

      {/* Charts + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className={cn("health-card col-span-1 lg:col-span-2")}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Heart Rate Trend</h3>
            <div className="text-sm text-muted-foreground">Last 24 hours</div>
          </div>
          <HealthChart data={chartData.heartRate} color="#ef4444" />
        </div>
        <AlertFeed alerts={alerts} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={cn("health-card")}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Blood Sugar Trend</h3>
            <div className="text-sm text-muted-foreground">Last 24 hours</div>
          </div>
          <HealthChart data={chartData.bloodSugar} color="#0ea5e9" />
        </div>
        <div className={cn("health-card")}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Blood Pressure Trend</h3>
            <div className="text-sm text-muted-foreground">Last 24 hours</div>
          </div>
          <HealthChart data={chartData.bloodPressure} color="#10b981" />
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
