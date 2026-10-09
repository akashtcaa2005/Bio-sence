
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { FoodRecommendations } from "./FoodRecommendations";
import { MealPlan } from "./MealPlan";
import { DietRecommendation } from "@/types/diet";
import { Apple } from "lucide-react";

interface DietDisplayProps {
  selectedCondition: DietRecommendation | null;
  onClear: () => void;
}

export const DietDisplay = ({ selectedCondition, onClear }: DietDisplayProps) => {
  if (!selectedCondition) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-gray-50 rounded-lg border border-dashed">
        <Apple className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No Diet Plan Selected</h3>
        <p className="text-muted-foreground max-w-md mt-2">
          Search for a health condition or select from the list to view recommended diet plans tailored to help manage your specific health alert.
        </p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex items-center justify-between">
            <span>{selectedCondition.condition}</span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onClear}
            >
              Clear
            </Button>
          </div>
          <p className="text-base font-normal mt-1 text-muted-foreground">
            {selectedCondition.dietType}
          </p>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {selectedCondition.image && (
          <div className="mb-4">
            <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-md">
              <img 
                src={selectedCondition.image} 
                alt={`${selectedCondition.condition} diet`} 
                className="object-cover w-full h-full"
              />
            </AspectRatio>
          </div>
        )}
        
        <div className="mb-4">
          <p className="text-muted-foreground">{selectedCondition.description}</p>
        </div>
        
        <Tabs defaultValue="foods" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="foods">Recommended Foods</TabsTrigger>
            <TabsTrigger value="meal-plan">Meal Plan</TabsTrigger>
          </TabsList>
          <TabsContent value="foods" className="mt-4">
            <FoodRecommendations diet={selectedCondition} />
          </TabsContent>
          <TabsContent value="meal-plan" className="mt-4">
            <MealPlan diet={selectedCondition} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
