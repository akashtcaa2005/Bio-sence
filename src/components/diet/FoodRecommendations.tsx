
import { AlertTriangle, CheckCircle } from "lucide-react";
import { DietRecommendation } from "@/types/diet";

interface FoodRecommendationsProps {
  diet: DietRecommendation;
}

export const FoodRecommendations = ({ diet }: FoodRecommendationsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="bg-health-green bg-opacity-10 p-4 rounded-lg">
        <h3 className="font-medium mb-2 text-health-normal flex items-center">
          <CheckCircle className="h-4 w-4 mr-2" /> Include These Foods
        </h3>
        <ul className="list-disc list-inside space-y-1">
          {diet.foods.recommended.map((food, idx) => (
            <li key={idx}>{food}</li>
          ))}
        </ul>
      </div>
      <div className="bg-red-50 p-4 rounded-lg">
        <h3 className="font-medium mb-2 text-health-abnormal flex items-center">
          <AlertTriangle className="h-4 w-4 mr-2" /> Limit or Avoid
        </h3>
        <ul className="list-disc list-inside space-y-1">
          {diet.foods.avoid.map((food, idx) => (
            <li key={idx}>{food}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
