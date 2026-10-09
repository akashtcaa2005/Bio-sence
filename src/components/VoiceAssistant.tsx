import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Message {
  id: number;
  text: string;
  sender: "user" | "assistant";
  timestamp: Date;
}

const VoiceAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your Bio Sense Health Assistant. Ask me anything about your health metrics, symptoms, or wellness tips!",
      sender: "assistant",
      timestamp: new Date(),
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (text: string, sender: "user" | "assistant") => {
    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        text,
        sender,
        timestamp: new Date(),
      },
    ]);
  };

  const getHealthReply = (userText: string): string => {
    const t = userText.toLowerCase();

    if (t.includes("heart rate") || t.includes("pulse") || t.includes("bpm")) {
      return "A normal resting heart rate for adults is 60–100 bpm. Athletes may have lower rates (40–60 bpm). If your rate is consistently above 100 or below 50, consult your doctor. Regular aerobic exercise helps maintain a healthy heart rate.";
    }
    if (t.includes("blood pressure") || t.includes("bp") || t.includes("hypertension")) {
      return "Normal blood pressure is below 120/80 mmHg. Readings of 130–139/80–89 are considered Stage 1 hypertension. Reduce sodium intake, exercise regularly, manage stress, and limit alcohol to help keep it in check.";
    }
    if (t.includes("blood sugar") || t.includes("glucose") || t.includes("diabetes")) {
      return "Normal fasting blood glucose is 70–99 mg/dL. Levels of 100–125 indicate prediabetes, and 126+ may indicate diabetes. Eating low-glycemic foods, exercising, and maintaining a healthy weight are key to managing blood sugar.";
    }
    if (t.includes("sleep") || t.includes("insomnia") || t.includes("tired") || t.includes("fatigue")) {
      return "Adults need 7–9 hours of sleep per night. To improve sleep: keep a consistent schedule, avoid screens 1 hour before bed, limit caffeine after 2 PM, and keep your room cool and dark. Chronic fatigue may signal an underlying condition — see your doctor if it persists.";
    }
    if (t.includes("stress") || t.includes("anxiety") || t.includes("mental health")) {
      return "Chronic stress can raise blood pressure and weaken immunity. Try deep breathing exercises, 20–30 minutes of daily walking, and limiting screen time. Mindfulness meditation has strong evidence for reducing anxiety. Don't hesitate to speak to a mental health professional.";
    }
    if (t.includes("weight") || t.includes("bmi") || t.includes("obese") || t.includes("overweight")) {
      return "A healthy BMI is 18.5–24.9. Weight management is best achieved through a balanced diet and regular physical activity. Focus on sustainable habits rather than crash diets. Even a 5–10% reduction in body weight can significantly improve health outcomes.";
    }
    if (t.includes("diet") || t.includes("nutrition") || t.includes("eat") || t.includes("food")) {
      return "A balanced diet includes plenty of vegetables, fruits, whole grains, lean proteins, and healthy fats. Limit processed foods, added sugars, and high-sodium foods. The Mediterranean diet is widely regarded as one of the healthiest patterns for long-term wellbeing.";
    }
    if (t.includes("exercise") || t.includes("workout") || t.includes("physical activity") || t.includes("fitness")) {
      return "Adults should aim for at least 150 minutes of moderate-intensity exercise per week (e.g., brisk walking) or 75 minutes of vigorous activity. Include strength training 2 days per week. Even short 10-minute walks add up and benefit your heart and metabolism.";
    }
    if (t.includes("oxygen") || t.includes("spo2") || t.includes("saturation")) {
      return "Normal blood oxygen saturation (SpO2) is 95–100%. Readings below 90% require immediate medical attention. If you experience shortness of breath, dizziness, or confusion, seek care promptly. Regular monitoring is useful for those with respiratory or heart conditions.";
    }
    if (t.includes("cholesterol") || t.includes("ldl") || t.includes("hdl") || t.includes("triglyceride")) {
      return "Total cholesterol should ideally be below 200 mg/dL. LDL ('bad') should be under 100 mg/dL, and HDL ('good') above 60 mg/dL. Eat more fiber, reduce saturated fats, exercise regularly, and avoid smoking to improve your cholesterol profile.";
    }
    if (t.includes("water") || t.includes("hydrat") || t.includes("drink")) {
      return "Staying hydrated is essential! Most adults need 2–3 litres of water per day, more if you're active or in hot weather. Signs of dehydration include dark urine, dry mouth, headaches, and fatigue. Water, herbal teas, and water-rich foods all count.";
    }
    if (t.includes("vitamin") || t.includes("supplement") || t.includes("mineral")) {
      return "Most people can get adequate nutrients from a varied diet. Common deficiencies include Vitamin D, B12, iron, and magnesium. It's best to have blood tests done before starting supplements, as excess amounts can sometimes cause harm. Consult your doctor.";
    }
    if (t.includes("pain") || t.includes("hurt") || t.includes("ache")) {
      return "Pain can have many causes. For mild discomfort, rest, ice/heat therapy, and over-the-counter pain relievers may help. If pain is severe, persistent, or accompanied by other symptoms, please consult a healthcare provider for proper evaluation.";
    }
    if (t.includes("medication") || t.includes("medicine") || t.includes("drug") || t.includes("pill") || t.includes("prescription")) {
      return "Always take medications as prescribed by your doctor. Don't skip doses or stop abruptly without guidance. Store medications properly and check expiry dates. If you experience side effects, contact your healthcare provider rather than stopping on your own.";
    }
    if (t.includes("hello") || t.includes("hi") || t.includes("hey")) {
      return "Hello! 👋 I'm your Bio Sense Health Assistant. You can ask me about heart rate, blood pressure, blood sugar, sleep, nutrition, exercise, or general wellness tips. How can I help you today?";
    }
    if (t.includes("thank")) {
      return "You're welcome! Remember, I'm here anytime you have health questions. Stay healthy! 😊";
    }
    if (t.match(/how are you|who are you|what can you do/)) {
      return "I'm the Bio Sense Health Assistant! I can help with questions about heart rate, blood pressure, blood sugar, sleep, nutrition, stress, exercise, and more. What would you like to know?";
    }
    return "That's a great question! For specific medical concerns, I always recommend consulting with your healthcare provider. In general, maintaining a balanced diet, regular exercise, quality sleep, and stress management are the pillars of good health. Is there a specific health topic I can help you with?";
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    addMessage(text, "user");
    setInputText("");
    setIsLoading(true);

    // Simulate thinking delay
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 600));

    const reply = getHealthReply(text);
    addMessage(reply, "assistant");
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage(inputText);
  };

  const quickQuestions = [
    "Is my heart rate normal?",
    "How can I improve my sleep?",
    "What does blood sugar mean?",
  ];

  return (
    <>
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 rounded-full w-12 h-12 shadow-lg p-0 flex items-center justify-center bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 bg-background rounded-xl shadow-xl flex flex-col border border-border animate-in fade-in-50 duration-300 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-sm">Health Assistant</h3>
                <p className="text-xs text-muted-foreground">Powered by AI</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 max-h-80 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "max-w-[80%] rounded-lg p-3",
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground ml-auto"
                    : "bg-muted mr-auto"
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            ))}

            {isLoading && (
              <div className="bg-muted rounded-lg p-3 max-w-[80%] mr-auto flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length <= 1 && (
            <div className="px-3 pb-2 flex flex-wrap gap-1">
              {quickQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-xs bg-primary/10 text-primary rounded-full px-2 py-1 hover:bg-primary/20 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t flex items-center gap-2">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your health..."
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
      )}
    </>
  );
};

export default VoiceAssistant;
