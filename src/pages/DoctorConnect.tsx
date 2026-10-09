import { useEffect, useState, useRef } from "react";
import { MessageCircle, Phone, User, Video, Send, X, Loader2, PhoneOff, Mic, MicOff, VideoOff, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  availability: string;
  lastConsult: string;
}

interface Message {
  id: number;
  text: string;
  sender: "user" | "doctor";
  timestamp: Date;
}

type CallState = "idle" | "ringing" | "active" | "ended";
type CallMode = "video" | "audio";

const mockDoctors: Doctor[] = [
  { id: 1, name: "Dr. Sarah Johnson", specialty: "Cardiologist", availability: "Available Now", lastConsult: "2 weeks ago" },
  { id: 2, name: "Dr. Michael Chen", specialty: "Endocrinologist", availability: "Available at 2:30 PM", lastConsult: "1 month ago" },
  { id: 3, name: "Dr. Lisa Rodriguez", specialty: "General Practitioner", availability: "Busy until 4:00 PM", lastConsult: "Yesterday" },
];

const DoctorConnect = () => {
  const { toast } = useToast();
  const [activeDoctor, setActiveDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Call state
  const [callDoctor, setCallDoctor] = useState<Doctor | null>(null);
  const [callState, setCallState] = useState<CallState>("idle");
  const [callMode, setCallMode] = useState<CallMode>("video");
  const [callSeconds, setCallSeconds] = useState(0);
  const [micMuted, setMicMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const callTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const ringIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playRingTone = () => {
    try {
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      const playBeep = (startTime: number) => {
        // First tone (higher)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.frequency.value = 480;
        gain1.gain.setValueAtTime(0.3, startTime);
        gain1.gain.setValueAtTime(0, startTime + 0.4);
        osc1.start(startTime);
        osc1.stop(startTime + 0.4);

        // Second tone (lower)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.frequency.value = 440;
        gain2.gain.setValueAtTime(0.3, startTime);
        gain2.gain.setValueAtTime(0, startTime + 0.4);
        osc2.start(startTime);
        osc2.stop(startTime + 0.4);
      };

      // Play immediately then every 2s
      playBeep(ctx.currentTime);
      playBeep(ctx.currentTime + 0.45);
      ringIntervalRef.current = setInterval(() => {
        const t = ctx.currentTime;
        playBeep(t);
        playBeep(t + 0.45);
      }, 2000);
    } catch { /* audio not supported */ }
  };

  const stopRingTone = () => {
    if (ringIntervalRef.current) {
      clearInterval(ringIntervalRef.current);
      ringIntervalRef.current = null;
    }
    audioCtxRef.current?.close();
    audioCtxRef.current = null;
  };

  const startCamera = async (mode: CallMode) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: mode === "video",
        audio: true,
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch {
      toast({ title: "Mic/Camera unavailable", description: "Could not access camera/microphone.", variant: "destructive" });
    }
  };

  const stopCamera = () => {
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
  };

  const startCall = (doctor: Doctor, mode: CallMode) => {
    setCallDoctor(doctor);
    setCallMode(mode);
    setCallState("ringing");
    setCallSeconds(0);
    setMicMuted(false);
    setCamOff(false);
    startCamera(mode);
    playRingTone();
    setTimeout(() => {
      setCallState(prev => {
        if (prev === "ringing") {
          stopRingTone();
          return "active";
        }
        return prev;
      });
    }, 3000);
  };

  const endCall = () => {
    stopRingTone();
    setCallState("ended");
    stopCamera();
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    setTimeout(() => {
      setCallState("idle");
      setCallDoctor(null);
    }, 1500);
  };

  useEffect(() => {
    localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = !micMuted; });
  }, [micMuted]);

  useEffect(() => {
    localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = !camOff; });
  }, [camOff]);

  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  });

  useEffect(() => {
    if (callState === "active") {
      callTimerRef.current = setInterval(() => setCallSeconds(s => s + 1), 1000);
    } else {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    }
    return () => { if (callTimerRef.current) clearInterval(callTimerRef.current); };
  }, [callState]);

  const formatDuration = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const [conversations, setConversations] = useState<Record<number, Message[]>>({
    1: [{ id: 1, text: "Hello! I'm Dr. Sarah Johnson, your Cardiologist. How can I help you today?", sender: "doctor", timestamp: new Date() }],
    2: [{ id: 1, text: "Hi, I'm Dr. Michael Chen. Feel free to ask me about your blood sugar or hormonal health.", sender: "doctor", timestamp: new Date() }],
    3: [{ id: 1, text: "Good day! I'm Dr. Lisa Rodriguez. What brings you in today?", sender: "doctor", timestamp: new Date() }],
  });

  useEffect(() => {
    document.title = "Bio Sense - Doctor Connect";
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, activeDoctor]);

  const getMockReply = (doctorName: string, specialty: string, userText: string): string => {
    const text = userText.toLowerCase();
    const firstName = doctorName.replace("Dr. ", "").split(" ")[0];

    if (text.includes("pain") || text.includes("hurt") || text.includes("ache")) {
      return `I'm sorry to hear you're experiencing pain. Can you describe where it is and how long it's been going on? Based on your description, I can better advise whether you need immediate attention. — ${firstName}`;
    }
    if (text.includes("medication") || text.includes("medicine") || text.includes("drug") || text.includes("pill")) {
      return `Regarding your medication question — it's important to take medications as prescribed. Please don't adjust dosages without consulting me first. Would you like to go over your current prescriptions? — ${firstName}`;
    }
    if (text.includes("blood pressure") || text.includes("bp") || text.includes("heart")) {
      return `Blood pressure and cardiovascular health are priorities. Please ensure you're monitoring your BP regularly and avoiding high-sodium foods. Share your recent readings if you have them. — ${firstName}`;
    }
    if (text.includes("sugar") || text.includes("glucose") || text.includes("diabetes") || text.includes("insulin")) {
      return `Monitoring blood glucose levels is essential. Try to log your readings before and after meals. If levels are consistently above 200 mg/dL, please come in for a review. — ${firstName}`;
    }
    if (text.includes("diet") || text.includes("food") || text.includes("eat") || text.includes("nutrition")) {
      return `A balanced diet is key to managing your health. I recommend plenty of vegetables, lean proteins, and whole grains. Limit processed foods and added sugars. Happy to discuss a personalized plan! — ${firstName}`;
    }
    if (text.includes("exercise") || text.includes("workout") || text.includes("physical")) {
      return `Regular exercise is excellent for your overall health. Aim for at least 150 minutes of moderate-intensity activity per week. Always warm up and consult me before starting intense routines. — ${firstName}`;
    }
    if (text.includes("sleep") || text.includes("tired") || text.includes("fatigue") || text.includes("insomnia")) {
      return `Poor sleep can significantly impact your health. Try keeping a consistent sleep schedule, avoid screens an hour before bed, and limit caffeine after noon. Let me know if it persists. — ${firstName}`;
    }
    if (text.includes("stress") || text.includes("anxiety") || text.includes("worried") || text.includes("mental")) {
      return `Managing stress is vital for your overall wellbeing. Consider mindfulness, light exercise, and adequate rest. If anxiety is persistent, we should discuss further options together. — ${firstName}`;
    }
    if (text.includes("fever") || text.includes("temperature") || text.includes("cold") || text.includes("flu")) {
      return `Fever and cold symptoms often resolve with rest and fluids. If your temperature exceeds 103°F (39.4°C) or symptoms worsen after 3 days, please seek immediate care. — ${firstName}`;
    }
    if (text.includes("hello") || text.includes("hi") || text.includes("hey")) {
      return `Hello! Great to hear from you. How are you feeling today? Feel free to share any symptoms or concerns and I'll do my best to help. — ${firstName}`;
    }
    if (text.includes("thank") || text.includes("thanks")) {
      return `You're very welcome! Your health is my priority. Don't hesitate to reach out if you have more questions. Take care! — ${firstName}`;
    }
    // Generic fallback based on specialty
    const specialtyResponses: Record<string, string> = {
      "Cardiologist": `As your cardiologist, I'd recommend keeping track of your heart rate and blood pressure. Could you tell me more about what you're experiencing? — ${firstName}`,
      "Endocrinologist": `From an endocrinological perspective, hormone balance and metabolic health are key. Please share more details so I can give better guidance. — ${firstName}`,
      "General Practitioner": `Thank you for reaching out. Could you describe your symptoms in more detail — duration, severity, and any other factors? That will help me advise you better. — ${firstName}`,
    };
    return specialtyResponses[specialty] ?? `Thank you for your message. Could you provide more details so I can assist you effectively? — ${firstName}`;
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || !activeDoctor || isLoading) return;

    const doctorId = activeDoctor.id;
    const userMsg: Message = { id: Date.now(), text, sender: "user", timestamp: new Date() };

    setConversations((prev) => ({
      ...prev,
      [doctorId]: [...(prev[doctorId] || []), userMsg],
    }));
    setInputText("");
    setIsLoading(true);

    // Simulate network delay for a realistic feel
    await new Promise((resolve) => setTimeout(resolve, 900 + Math.random() * 700));

    const reply = getMockReply(activeDoctor.name, activeDoctor.specialty, text);
    const doctorMsg: Message = { id: Date.now() + 1, text: reply, sender: "doctor", timestamp: new Date() };
    setConversations((prev) => ({
      ...prev,
      [doctorId]: [...(prev[doctorId] || []), doctorMsg],
    }));
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage(inputText);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Doctor Connect</h1>
        <p className="text-muted-foreground">Consult with your healthcare providers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doctor Cards */}
        <div className="lg:col-span-1 space-y-4">
          {mockDoctors.map((doctor) => (
            <div
              key={doctor.id}
              className={cn(
                "bg-card rounded-lg border p-4 cursor-pointer transition-all hover:shadow-md",
                activeDoctor?.id === doctor.id && "border-primary ring-1 ring-primary"
              )}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{doctor.name}</h3>
                  <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-1">
                <div className={cn("w-2 h-2 rounded-full", doctor.availability.includes("Available") ? "bg-health-normal" : "bg-health-caution")} />
                <span className="text-xs">{doctor.availability}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Last consultation: {doctor.lastConsult}</p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 flex items-center justify-center gap-1"
                  onClick={() => setActiveDoctor(doctor)}
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>Message</span>
                </Button>
                <Button
                  size="sm"
                  className="flex-1 flex items-center justify-center gap-1"
                  onClick={() => startCall(doctor, "video")}
                >
                  <Video className="h-3.5 w-3.5" />
                  <span>Video</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 flex items-center justify-center gap-1"
                  onClick={() => startCall(doctor, "audio")}
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>Call</span>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Chat Panel */}
        <div className="lg:col-span-2">
          {activeDoctor ? (
            <div className="bg-card rounded-lg border flex flex-col h-[520px]">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{activeDoctor.name}</h3>
                    <p className="text-xs text-muted-foreground">{activeDoctor.specialty}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setActiveDoctor(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {(conversations[activeDoctor.id] || []).map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "max-w-[75%] rounded-lg p-3",
                      msg.sender === "user"
                        ? "bg-primary text-primary-foreground ml-auto"
                        : "bg-muted mr-auto"
                    )}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                ))}
                {isLoading && (
                  <div className="bg-muted rounded-lg p-3 max-w-[75%] flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{activeDoctor.name} is typing...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t flex items-center gap-2">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message ${activeDoctor.name}...`}
                  className="flex-1 text-sm"
                  disabled={isLoading}
                />
                <Button
                  size="icon"
                  className="rounded-full h-9 w-9 flex-shrink-0"
                  onClick={() => sendMessage(inputText)}
                  disabled={isLoading || !inputText.trim()}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-card rounded-lg border flex flex-col items-center justify-center h-[520px] text-center p-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Start a Conversation</h3>
              <p className="text-muted-foreground text-sm">
                Select a doctor from the left to start messaging, video calling, or audio calling them.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Call Modal Overlay ── */}
      {callDoctor && callState !== "idle" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
            {/* Video / Audio area */}
            <div className="relative bg-gradient-to-br from-primary/20 to-muted h-64 flex flex-col items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-primary/10 border-4 border-primary/30 flex items-center justify-center mb-3 shadow-lg">
                <User className="h-12 w-12 text-primary" />
              </div>
              <p className="text-lg font-semibold">{callDoctor.name}</p>
              <p className="text-sm text-muted-foreground">{callDoctor.specialty}</p>

              {/* Mode badge */}
              <div className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                {callMode === "video" ? <Video className="h-3 w-3" /> : <Phone className="h-3 w-3" />}
                {callMode === "video" ? "Video call" : "Audio call"}
              </div>

              {/* Status */}
              <div className="mt-2 flex items-center gap-2">
                {callState === "ringing" && (
                  <span className="flex items-center gap-1.5 text-sm text-yellow-400 animate-pulse">
                    <Phone className="h-4 w-4" /> Ringing…
                  </span>
                )}
                {callState === "active" && (
                  <span className="flex items-center gap-1.5 text-sm text-green-400">
                    <Clock className="h-4 w-4" /> {formatDuration(callSeconds)}
                  </span>
                )}
                {callState === "ended" && (
                  <span className="text-sm text-muted-foreground">Call ended</span>
                )}
              </div>

              {/* Self camera PiP (video mode only) */}
              {callState === "active" && callMode === "video" && (
                <div className="absolute bottom-3 right-3 w-20 h-24 rounded-lg border-2 border-border shadow-lg overflow-hidden bg-muted">
                  {!camOff ? (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <VideoOff className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="p-6 flex items-center justify-center gap-5">
              {/* Mute mic */}
              <button
                onClick={() => setMicMuted(m => !m)}
                disabled={callState !== "active"}
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                  micMuted ? "bg-destructive/20 text-destructive" : "bg-muted text-foreground hover:bg-muted/80",
                  callState !== "active" && "opacity-40 cursor-not-allowed"
                )}
                title={micMuted ? "Unmute" : "Mute"}
              >
                {micMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>

              {/* End call */}
              <button
                onClick={endCall}
                className="w-14 h-14 rounded-full bg-destructive flex items-center justify-center shadow-lg hover:bg-destructive/90 transition-colors"
                title="End call"
              >
                <PhoneOff className="h-6 w-6 text-white" />
              </button>

              {/* Toggle camera (video mode only) */}
              {callMode === "video" ? (
                <button
                  onClick={() => setCamOff(c => !c)}
                  disabled={callState !== "active"}
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                    camOff ? "bg-destructive/20 text-destructive" : "bg-muted text-foreground hover:bg-muted/80",
                    callState !== "active" && "opacity-40 cursor-not-allowed"
                  )}
                  title={camOff ? "Turn camera on" : "Turn camera off"}
                >
                  {camOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                </button>
              ) : (
                <div className="w-12 h-12" /> /* spacer for alignment */
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorConnect;
