
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Apple, CheckCircle, Heart, Thermometer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DietRecommendation } from "@/types/diet";
import { dietRecommendations } from "@/data/dietRecommendations";

interface DietSearchFormProps {
  onSelectCondition: (condition: DietRecommendation) => void;
}

export const DietSearchForm = ({ onSelectCondition }: DietSearchFormProps) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = () => {
    const foundCondition = dietRecommendations.find(
      (diet) => diet.condition.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (foundCondition) {
      onSelectCondition(foundCondition);
      toast({
        title: "Diet plan found",
        description: `Showing recommendations for ${foundCondition.condition}`,
      });
    } else {
      toast({
        title: "No matching condition",
        description: "Try searching for 'High Blood Pressure', 'Blood Sugar', 'Heartbeat', 'Cholesterol', or 'Hemoglobin'",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-health-caution" />
          <span>Find Diet Recommendations</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="condition">Health Condition</Label>
            <Input
              id="condition"
              placeholder="e.g. High Blood Pressure"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleSearch();
              }}
            />
          </div>
          <Button 
            onClick={handleSearch}
            className="w-full"
          >
            <Apple className="mr-2 h-5 w-5" /> Find Diet Plan
          </Button>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">Common Health Alerts:</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            {dietRecommendations.map((diet) => (
              <li 
                key={diet.condition}
                className="flex items-center gap-1 cursor-pointer hover:text-foreground"
                onClick={() => {
                  setSearchTerm(diet.condition);
                  onSelectCondition(diet);
                  toast({
                    title: "Diet plan selected",
                    description: `Showing recommendations for ${diet.condition}`,
                  });
                }}
              >
                {diet.condition.includes("Heart") || diet.condition.includes("Blood Pressure") ? (
                  <Heart className="h-4 w-4 text-health-abnormal" />
                ) : diet.condition.includes("Blood Sugar") ? (
                  <Thermometer className="h-4 w-4 text-health-caution" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-health-normal" />
                )}
                <span>{diet.condition}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
