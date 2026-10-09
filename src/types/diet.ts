
export interface DietRecommendation {
  condition: string;
  dietType: string;
  foods: {
    recommended: string[];
    avoid: string[];
  };
  mealPlan: {
    breakfast: string[];
    lunch: string[];
    dinner: string[];
    snacks: string[];
  };
  description: string;
  image?: string;
}
