
import { AlertTriangle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Alert {
  id: number;
  message: string;
  timestamp: string;
  status: "caution" | "abnormal";
}

interface AlertFeedProps {
  alerts: Alert[];
  className?: string;
}

const AlertFeed = ({ alerts, className }: AlertFeedProps) => {
  return (
    <div className={cn("health-card", className)}>
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="h-5 w-5 text-health-abnormal" />
        <h3 className="font-semibold">Health Alerts</h3>
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {alerts.length === 0 && (
          <div className="text-center text-muted-foreground py-6">
            No alerts at this time
          </div>
        )}
        
        {alerts.map((alert) => (
          <div 
            key={alert.id} 
            className={cn(
              "p-3 rounded-lg border-l-4",
              alert.status === "caution" ? "border-health-caution bg-health-caution/10" : "border-health-abnormal bg-health-abnormal/10"
            )}
          >
            <p className="font-medium">{alert.message}</p>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <Clock className="h-3 w-3 mr-1" />
              <span>{alert.timestamp}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertFeed;
