
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface FamilyMemberProps {
  name: string;
  age?: number;
  status: "normal" | "caution" | "abnormal";
  heartRate?: number;
  bloodSugar?: number;
  onClick?: () => void;
  className?: string;
}

const FamilyMember = ({
  name,
  age,
  status,
  heartRate,
  bloodSugar,
  onClick,
  className,
}: FamilyMemberProps) => {
  return (
    <div 
      className={cn(
        "health-card cursor-pointer flex items-center gap-4",
        className
      )}
      onClick={onClick}
    >
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
        <User className="h-6 w-6 text-secondary" />
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">{name}</h3>
          <div
            className={cn(
              "w-2 h-2 rounded-full",
              status === "normal" && "bg-health-normal",
              status === "caution" && "bg-health-caution",
              status === "abnormal" && "bg-health-abnormal animate-pulse-soft"
            )}
          />
        </div>
        
        {age && <div className="text-xs text-muted-foreground">Age: {age}</div>}
        
        <div className="grid grid-cols-2 gap-2 mt-2">
          {heartRate !== undefined && (
            <div className="text-xs">
              <span className="text-muted-foreground">Heart Rate:</span>{" "}
              <span className="font-medium">{heartRate}</span> <span className="text-muted-foreground">bpm</span>
            </div>
          )}
          
          {bloodSugar !== undefined && (
            <div className="text-xs">
              <span className="text-muted-foreground">Blood Sugar:</span>{" "}
              <span className="font-medium">{bloodSugar}</span> <span className="text-muted-foreground">mg/dL</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FamilyMember;
