
import { DietRecommendation } from "@/types/diet";

interface MealPlanProps {
  diet: DietRecommendation;
}

export const MealPlan = ({ diet }: MealPlanProps) => {
  return (
    <div className="space-y-4">
      <div className="p-3 bg-health-blue bg-opacity-10 rounded-lg">
        <h3 className="font-medium mb-1">Breakfast Ideas</h3>
        <ul className="list-disc list-inside">
          {diet.mealPlan.breakfast.map((meal, idx) => (
            <li key={idx}>{meal}</li>
          ))}
        </ul>
      </div>
      <div className="p-3 bg-health-blue bg-opacity-10 rounded-lg">
        <h3 className="font-medium mb-1">Lunch Ideas</h3>
        <ul className="list-disc list-inside">
          {diet.mealPlan.lunch.map((meal, idx) => (
            <li key={idx}>{meal}</li>
          ))}
        </ul>
      </div>
      <div className="p-3 bg-health-blue bg-opacity-10 rounded-lg">
        <h3 className="font-medium mb-1">Dinner Ideas</h3>
        <ul className="list-disc list-inside">
          {diet.mealPlan.dinner.map((meal, idx) => (
            <li key={idx}>{meal}</li>
          ))}
        </ul>
      </div>
      <div className="p-3 bg-health-blue bg-opacity-10 rounded-lg">
        <h3 className="font-medium mb-1">Healthy Snacks</h3>
        <ul className="list-disc list-inside">
          {diet.mealPlan.snacks.map((meal, idx) => (
            <li key={idx}>{meal}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
