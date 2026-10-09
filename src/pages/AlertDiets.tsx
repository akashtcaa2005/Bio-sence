
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { DietSearchForm } from "@/components/diet/DietSearchForm";
import { DietDisplay } from "@/components/diet/DietDisplay";
import { DietRecommendation } from "@/types/diet";
import { dietRecommendations } from "@/data/dietRecommendations";

const AlertDiets = () => {
  const { toast } = useToast();
  const [selectedCondition, setSelectedCondition] = useState<DietRecommendation | null>(null);
  const location = useLocation();

  useEffect(() => {
    document.title = "Bio Sense - Health Alert Diets";
    
    // Check if we have a condition passed in the location state
    if (location.state && location.state.condition) {
      const condition = location.state.condition.toLowerCase();
      const foundCondition = dietRecommendations.find(
        (diet) => diet.condition.toLowerCase().includes(condition)
      );
      
      if (foundCondition) {
        setSelectedCondition(foundCondition);
        toast({
          title: "Diet plan found",
          description: `Showing recommendations for ${foundCondition.condition}`,
        });
      }
    }
  }, [location.state, toast]);

  const handleSelectCondition = (diet: DietRecommendation) => {
    setSelectedCondition(diet);
  };

  const handleClear = () => {
    setSelectedCondition(null);
  };

  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Health Alert Diet Plans</h1>
        <p className="text-muted-foreground">
          Find recommended diet plans based on your health alerts
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-4">
          <DietSearchForm onSelectCondition={handleSelectCondition} />
        </div>

        <div className="md:col-span-8">
          <DietDisplay 
            selectedCondition={selectedCondition} 
            onClear={handleClear} 
          />
        </div>
      </div>
    </div>
  );
};

export default AlertDiets;
