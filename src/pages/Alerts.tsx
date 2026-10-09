
import { useEffect } from "react";
import { AlertTriangle, Apple, Bell, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Alerts = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    document.title = "Bio Sense - Health Alerts";
  }, []);

  const mockAlerts = [
    {
      id: 1,
      message: "High blood pressure detected - 145/95",
      timestamp: "Today, 9:23 AM",
      severity: "high",
      read: false,
      condition: "High Blood Pressure"
    },
    {
      id: 2,
      message: "Blood sugar slightly elevated - 135 mg/dL",
      timestamp: "Today, 08:17 AM",
      severity: "medium",
      read: false,
      condition: "Elevated Blood Sugar"
    },
    {
      id: 3,
      message: "Heart rate normalized - 75 bpm",
      timestamp: "Today, 07:45 AM",
      severity: "low", 
      read: true,
      condition: null
    },
    {
      id: 4,
      message: "Irregular heartbeat detected",
      timestamp: "Yesterday, 11:45 PM",
      severity: "high",
      read: true,
      condition: "Irregular Heartbeat"
    },
  ];

  const handleFindDietPlan = () => {
    toast({
      title: "Navigating to Diet Plans",
      description: "Find recommended diets based on your health alerts",
    });
  };

  const handleViewDietForAlert = (condition: string | null) => {
    if (!condition) {
      toast({
        title: "No diet recommendation available",
        description: "This alert doesn't have a specific diet plan",
        variant: "destructive"
      });
      return;
    }

    navigate("/alert-diets", { state: { condition } });
    toast({
      title: "Finding diet plan",
      description: `Looking for recommendations for ${condition}`,
    });
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Health Alerts</h1>
          <p className="text-muted-foreground">
            Monitor important notifications about your health status
          </p>
        </div>
        <Link to="/alert-diets">
          <Button 
            onClick={handleFindDietPlan}
            className="flex items-center gap-2"
          >
            <Apple className="h-5 w-5" />
            Find Diet Plans
          </Button>
        </Link>
      </div>
      
      <div className="space-y-4">
        {mockAlerts.map((alert) => (
          <div 
            key={alert.id}
            className={`p-4 rounded-lg border ${!alert.read ? "bg-background" : "bg-muted/30"} 
              ${alert.severity === "high" ? "border-health-abnormal" : 
                alert.severity === "medium" ? "border-health-caution" : "border-border"}`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-1">
                {alert.severity === "high" ? (
                  <AlertTriangle className="h-5 w-5 text-health-abnormal" />
                ) : alert.severity === "medium" ? (
                  <Bell className="h-5 w-5 text-health-caution" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-health-normal" />
                )}
              </div>
              
              <div className="flex-1">
                <p className={`font-medium ${!alert.read ? "" : "text-muted-foreground"}`}>
                  {alert.message}
                </p>
                <p className="text-sm text-muted-foreground">
                  {alert.timestamp}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                {!alert.read && (
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                )}
                
                {alert.condition && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewDietForAlert(alert.condition)}
                    className="flex items-center gap-1"
                  >
                    <Apple className="h-4 w-4" />
                    <span>View Diet</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Alerts;
