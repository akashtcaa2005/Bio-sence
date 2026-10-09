
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface HealthCardProps {
  title: string;
  value: string | number;
  unit: string;
  icon: ReactNode;
  status: "normal" | "caution" | "abnormal";
  range?: string;
  children?: ReactNode;
  className?: string;
}

const HealthCard = ({
  title,
  value,
  unit,
  icon,
  status,
  range,
  children,
  className,
}: HealthCardProps) => {
  return (
    <div className={cn("health-card", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-primary">{icon}</div>
          <h3 className="font-medium">{title}</h3>
        </div>
        <div
          className={cn(
            "w-2 h-2 rounded-full",
            status === "normal" && "bg-health-normal",
            status === "caution" && "bg-health-caution",
            status === "abnormal" && "bg-health-abnormal animate-pulse-soft"
          )}
        />
      </div>

      <div className="mt-3">
        <div className="flex items-end">
          <span className="text-2xl font-bold">{value}</span>
          <span className="ml-1 text-sm text-muted-foreground">{unit}</span>
        </div>
        {range && (
          <div className="text-xs text-muted-foreground mt-1">
            Normal: {range}
          </div>
        )}
      </div>

      {children}
    </div>
  );
};

export default HealthCard;
