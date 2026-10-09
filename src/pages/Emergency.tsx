import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle, Phone, MapPin, Loader2, CheckCircle, XCircle,
  Siren, Ambulance, Volume2, VolumeX, PhoneCall,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type SOSState = "idle" | "sending" | "sent" | "failed";
type CallScreen = null | { number: string; label: string; type: "emergency" | "ambulance" };
type CallPhase = "ringing" | "connected" | "ended";

const SAVED_LOCATION = {
  label: "Akshaya College of Engineering and Technology, Kinathukadavu, Coimbatore",
  latitude: 10.8099722,
  longitude: 77.0115278,
};

const Emergency = () => {
  const [sosState, setSosState] = useState<SOSState>("idle");
  const [cooldown, setCooldown] = useState(0);
  const [muted, setMuted] = useState(false);
  const [callScreen, setCallScreen] = useState<CallScreen>(null);
  const [callPhase, setCallPhase] = useState<CallPhase>("ringing");
  const [callSeconds, setCallSeconds] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const ringIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const connectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { document.title = "Bio Sense - Emergency"; }, []);

  // Cooldown tick
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  // No auto-connect — stays ringing until user cancels

  /* ── Ring tone via Web Audio ── */
  const playRingSound = (type: "emergency" | "ambulance") => {
    stopRingSound();
    try {
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      const playBeep = (t: number) => {
        if (type === "emergency") {
          // Phone-style double ring
          [0, 0.55].forEach((offset) => {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.connect(g); g.connect(ctx.destination);
            osc.type = "sine";
            osc.frequency.setValueAtTime(440, t + offset);
            g.gain.setValueAtTime(0, t + offset);
            g.gain.linearRampToValueAtTime(0.25, t + offset + 0.05);
            g.gain.setValueAtTime(0.25, t + offset + 0.35);
            g.gain.linearRampToValueAtTime(0, t + offset + 0.45);
            osc.start(t + offset);
            osc.stop(t + offset + 0.5);
          });
        } else {
          // Ambulance two-tone
          const freqs = [800, 600];
          freqs.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.connect(g); g.connect(ctx.destination);
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(freq, t + i * 0.45);
            g.gain.setValueAtTime(0, t + i * 0.45);
            g.gain.linearRampToValueAtTime(0.18, t + i * 0.45 + 0.05);
            g.gain.setValueAtTime(0.18, t + i * 0.45 + 0.35);
            g.gain.linearRampToValueAtTime(0, t + i * 0.45 + 0.45);
            osc.start(t + i * 0.45);
            osc.stop(t + i * 0.45 + 0.5);
          });
        }
      };

      playBeep(ctx.currentTime);
      ringIntervalRef.current = setInterval(() => {
        if (audioCtxRef.current) playBeep(audioCtxRef.current.currentTime);
      }, 2200);
    } catch { /* audio blocked */ }
  };

  const stopRingSound = () => {
    if (ringIntervalRef.current) { clearInterval(ringIntervalRef.current); ringIntervalRef.current = null; }
    try { audioCtxRef.current?.close(); } catch { /* ignore */ }
    audioCtxRef.current = null;
  };

  const openCall = (number: string, label: string, type: "emergency" | "ambulance") => {
    setCallScreen({ number, label, type });
    setCallPhase("ringing");
    setCallSeconds(0);
    if (!muted) playRingSound(type);
    // Trigger the real phone call immediately
    setTimeout(() => { window.location.href = `tel:${number}`; }, 800);
  };

  const hangUp = () => {
    stopRingSound();
    if (connectTimeoutRef.current) clearTimeout(connectTimeoutRef.current);
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    setCallPhase("ended");
    setTimeout(() => { setCallScreen(null); setCallPhase("ringing"); }, 1400);
  };

  const acceptAndDial = () => {
    if (!callScreen) return;
    const num = callScreen.number;
    hangUp();
    setTimeout(() => { window.location.href = `tel:${num}`; }, 300);
  };

  const triggerSOS = async () => {
    if (sosState === "sending" || cooldown > 0) return;
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
    const session = refreshData?.session;
    if (refreshError || !session) {
      toast.error("Session expired. Please log in again.");
      await supabase.auth.signOut();
      return;
    }
    setSosState("sending");
    try {
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

      // Call our local Node.js Express server
      let response: Response;
      try {
        response = await fetch("http://localhost:3001/send-sos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contacts,
            latitude: SAVED_LOCATION.latitude,
            longitude: SAVED_LOCATION.longitude,
            locationLabel: SAVED_LOCATION.label,
            timestamp
          })
        });
      } catch (fetchErr: any) {
        throw new Error("SOS server is not running. Please start it: node sos-server.mjs");
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      // Log alerts in DB
      for (const contact of contacts) {
        await supabase.from("alert_notifications").insert({
          user_id: session.user.id,
          contact_id: contact.id,
          alert_type: "SOS Emergency",
          alert_message: `Emergency SOS triggered via Email & SMS.`,
          status: "sent",
        });
      }

      setSosState("sent");
      toast.success(`SOS alert sent to ${data.sent} contact${data.sent !== 1 ? "s" : ""} via Email & SMS!`);
      setCooldown(60);
      setTimeout(() => setSosState("idle"), 5000);
    } catch (err: any) {
      setSosState("failed");
      toast.error(`SOS failed: ${err.message}`);
      setTimeout(() => setSosState("idle"), 4000);
    }
  };

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${SAVED_LOCATION.latitude},${SAVED_LOCATION.longitude}`;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 mb-4">
          <AlertTriangle className="h-10 w-10 text-destructive" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Emergency Services</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          In a medical emergency, press SOS to instantly alert your verified contacts with your location.
        </p>
      </div>

      {/* SOS Card */}
      <div className="bg-card border rounded-2xl p-8 text-center shadow-sm space-y-4">
        <h2 className="text-xl font-semibold">Send SOS Alert</h2>
        <div className="inline-flex flex-col items-center gap-1">
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            <a href={mapsLink} target="_blank" rel="noopener noreferrer"
              className="text-primary hover:underline font-semibold text-sm text-center">
              {SAVED_LOCATION.label}
            </a>
            <span className="text-xs bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full font-medium border border-green-500/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
              Live
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{SAVED_LOCATION.latitude}, {SAVED_LOCATION.longitude}</p>
        </div>

        <button onClick={triggerSOS} disabled={sosState === "sending" || cooldown > 0}
          className={cn(
            "relative mx-auto flex flex-col items-center justify-center",
            "w-40 h-40 rounded-full text-white font-bold",
            "shadow-lg transition-all duration-200 select-none",
            "focus:outline-none focus:ring-4 focus:ring-destructive/40",
            sosState === "sending" && "bg-destructive/70 cursor-not-allowed scale-95",
            sosState === "sent" && "bg-primary cursor-not-allowed",
            sosState === "failed" && "bg-secondary text-secondary-foreground cursor-not-allowed",
            sosState === "idle" && cooldown === 0 && "bg-destructive hover:bg-destructive/90 active:scale-95 cursor-pointer",
            cooldown > 0 && sosState === "idle" && "bg-muted text-muted-foreground cursor-not-allowed"
          )}>
          {sosState === "sending" && <Loader2 className="h-8 w-8 animate-spin mb-1" />}
          {sosState === "sent" && <CheckCircle className="h-8 w-8 mb-1" />}
          {sosState === "failed" && <XCircle className="h-8 w-8 mb-1" />}
          {sosState === "idle" && <AlertTriangle className="h-8 w-8 mb-1" />}
          <span className="text-sm font-bold tracking-widest">
            {sosState === "sending" && "SENDING…"}
            {sosState === "sent" && "SENT!"}
            {sosState === "failed" && "FAILED"}
            {sosState === "idle" && cooldown > 0 && `${cooldown}s`}
            {sosState === "idle" && cooldown === 0 && "SOS"}
          </span>
        </button>

        <p className="text-xs text-muted-foreground">
          {cooldown > 0 ? `Cooldown active — you can resend in ${cooldown}s` : "Sends SMS, WhatsApp & Email to all verified contacts"}
        </p>
      </div>

      {/* Call Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative overflow-hidden bg-card border-2 border-border hover:border-primary/40 rounded-2xl p-6 shadow-sm transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <Siren className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Emergency Services</h2>
              <p className="text-xs text-muted-foreground">Police · Fire · Medical</p>
            </div>
          </div>
          <div className="flex gap-2 mb-4 flex-wrap">
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">24/7 Available</span>
            <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">Free Call</span>
            <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">All Networks</span>
          </div>
          <Button size="lg" className="w-full h-14 text-base font-bold gap-3 bg-primary hover:bg-primary/90"
            onClick={() => openCall("112", "Emergency Services", "emergency")}>
            <Phone className="h-5 w-5" /> Call 112
          </Button>
        </div>

        <div className="relative overflow-hidden bg-card border-2 border-border hover:border-destructive/40 rounded-2xl p-6 shadow-sm transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-destructive/10 text-destructive">
              <Ambulance className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Ambulance</h2>
              <p className="text-xs text-muted-foreground">Medical Emergency Response</p>
            </div>
          </div>
          <div className="flex gap-2 mb-4 flex-wrap">
            <span className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded-full font-medium">Rapid Response</span>
            <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">Free Call</span>
            <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">All India</span>
          </div>
          <Button size="lg" className="w-full h-14 text-base font-bold gap-3 bg-destructive hover:bg-destructive/90"
            onClick={() => openCall("108", "Ambulance", "ambulance")}>
            <Phone className="h-5 w-5" /> Call 108
          </Button>
        </div>
      </div>

      {/* Mute toggle */}
      <div className="flex justify-center">
        <button onClick={() => setMuted((m) => !m)}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-full border border-border hover:border-foreground/30">
          {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          {muted ? "Sounds off" : "Sounds on"}
        </button>
      </div>

      {/* ── Call Screen Overlay ── */}
      {callScreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
          <div className={cn(
            "relative w-full max-w-xs mx-4 rounded-3xl overflow-hidden shadow-2xl",
            callScreen.type === "emergency"
              ? "bg-gradient-to-b from-blue-700 to-blue-900"
              : "bg-gradient-to-b from-red-700 to-red-900"
          )}>
            {/* Glow */}
            <div className={cn(
              "absolute -top-12 left-1/2 -translate-x-1/2 w-56 h-56 rounded-full blur-3xl opacity-30 pointer-events-none",
              callScreen.type === "emergency" ? "bg-blue-400" : "bg-red-400"
            )} />

            <div className="relative px-6 pt-10 pb-8 text-white text-center space-y-5">
              {/* Status label */}
              <p className="text-xs font-semibold tracking-[0.2em] uppercase opacity-70">Calling…</p>

              {/* Avatar + pulse rings */}
              <div className="relative mx-auto w-28 h-28 flex items-center justify-center">
                <span className="absolute inset-0 rounded-full border-2 border-white/40 animate-ping" />
                <span className="absolute inset-[-14px] rounded-full border border-white/20 animate-ping" style={{ animationDelay: "0.35s" }} />
                <span className="absolute inset-[-28px] rounded-full border border-white/10 animate-ping" style={{ animationDelay: "0.7s" }} />
                <div className="w-28 h-28 rounded-full bg-white/20 border-4 border-white/40 flex items-center justify-center shadow-xl z-10">
                  {callScreen.type === "emergency"
                    ? <Siren className="h-12 w-12 text-white" />
                    : <Ambulance className="h-12 w-12 text-white" />}
                </div>
              </div>

              {/* Name & number */}
              <div>
                <h2 className="text-xl font-bold">{callScreen.label}</h2>
                <p className="text-4xl font-mono font-extrabold tracking-widest mt-1 opacity-95">{callScreen.number}</p>
              </div>

              {/* Ringing dots */}
              <div className="h-7 flex items-center justify-center">
                <div className="flex items-center gap-1.5">
                  {[0, 1, 2, 3].map((i) => (
                    <span key={i} className="w-2 h-2 rounded-full bg-white/70 animate-bounce"
                      style={{ animationDelay: `${i * 160}ms` }} />
                  ))}
                </div>
              </div>

              {/* Cancel button */}
              <button onClick={hangUp}
                className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-red-500 hover:bg-red-400 active:scale-95 transition-all shadow-lg">
                <PhoneCall className="h-7 w-7 text-white rotate-[135deg]" />
              </button>
              <p className="text-xs opacity-60 -mt-2">Cancel</p>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Emergency;
