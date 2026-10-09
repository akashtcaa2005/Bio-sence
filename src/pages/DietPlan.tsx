
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { 
  Heart, 
  Apple, 
  Calendar,
  Carrot,
  Pill,
  Utensils,
  ChevronDown,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { AspectRatio } from "@/components/ui/aspect-ratio";

// Form Schema
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  age: z.string().min(1, { message: "Age is required" }),
  gender: z.string().min(1, { message: "Gender is required" }),
  condition: z.string().min(1, { message: "Health condition is required" }),
  allergies: z.string().optional(),
  startDate: z.date({ required_error: "Please select a start date" }),
  preferences: z.string().optional(),
});

// Diet plan types
interface MealItem {
  name: string;
  portion: string;
  nutrients: string;
  benefits: string;
}

interface MealPlan {
  time: string;
  meal: string;
  items: MealItem[];
}

interface DietPlan {
  title: string;
  description: string;
  duration: string;
  image: string;
  dailySchedule: MealPlan[];
  guidelines: string[];
}

// Health Conditions
const healthConditions = [
  { value: "diabetes", label: "Diabetes" },
  { value: "hypertension", label: "Hypertension" },
  { value: "celiac", label: "Celiac Disease" },
  { value: "ibs", label: "Irritable Bowel Syndrome" },
  { value: "heartDisease", label: "Heart Disease" },
  { value: "thyroid", label: "Thyroid Disorders" },
];

// Example diet plan (would be generated based on selections)
const dietPlans: Record<string, DietPlan> = {
  diabetes: {
    title: "Blood Sugar Balance Diet",
    description: "A carefully crafted diet plan to maintain stable blood sugar levels and support overall health for diabetes management.",
    duration: "4 weeks",
    image: "/placeholder.svg",
    dailySchedule: [
      {
        time: "7:00 AM",
        meal: "Breakfast",
        items: [
          {
            name: "Steel-cut oatmeal",
            portion: "1/2 cup (cooked)",
            nutrients: "Complex carbs, fiber",
            benefits: "Slow-releasing energy, blood sugar control"
          },
          {
            name: "Cinnamon",
            portion: "1/2 teaspoon",
            nutrients: "Antioxidants",
            benefits: "May help lower blood sugar"
          },
          {
            name: "Walnuts",
            portion: "1 tablespoon",
            nutrients: "Omega-3, protein",
            benefits: "Heart health, satiety"
          }
        ]
      },
      {
        time: "10:00 AM",
        meal: "Mid-morning Snack",
        items: [
          {
            name: "Greek yogurt",
            portion: "1/2 cup",
            nutrients: "Protein, probiotics",
            benefits: "Blood sugar stability, gut health"
          },
          {
            name: "Blueberries",
            portion: "1/4 cup",
            nutrients: "Antioxidants, fiber",
            benefits: "Low glycemic impact, anti-inflammatory"
          }
        ]
      },
      {
        time: "12:30 PM",
        meal: "Lunch",
        items: [
          {
            name: "Grilled chicken breast",
            portion: "3 oz",
            nutrients: "Lean protein",
            benefits: "Muscle maintenance, satiety"
          },
          {
            name: "Quinoa",
            portion: "1/2 cup (cooked)",
            nutrients: "Protein, fiber, complex carbs",
            benefits: "Sustained energy, blood sugar control"
          },
          {
            name: "Mixed green salad",
            portion: "2 cups",
            nutrients: "Vitamins, fiber",
            benefits: "Low carbohydrate, nutrient-dense"
          }
        ]
      },
      {
        time: "4:00 PM",
        meal: "Afternoon Snack",
        items: [
          {
            name: "Apple",
            portion: "1 small",
            nutrients: "Fiber, vitamins",
            benefits: "Moderate glycemic impact with fiber"
          },
          {
            name: "Almond butter",
            portion: "1 tablespoon",
            nutrients: "Healthy fats, protein",
            benefits: "Slows sugar absorption, adds satiety"
          }
        ]
      },
      {
        time: "7:00 PM",
        meal: "Dinner",
        items: [
          {
            name: "Baked salmon",
            portion: "4 oz",
            nutrients: "Omega-3, protein",
            benefits: "Anti-inflammatory, heart health"
          },
          {
            name: "Roasted vegetables",
            portion: "1 cup",
            nutrients: "Fiber, antioxidants",
            benefits: "Low glycemic impact, nutrient-rich"
          },
          {
            name: "Lentils",
            portion: "1/4 cup (cooked)",
            nutrients: "Protein, fiber",
            benefits: "Blood sugar regulation"
          }
        ]
      }
    ],
    guidelines: [
      "Keep carbohydrate intake consistent throughout the day",
      "Aim for 3 balanced meals and 2-3 small snacks to maintain blood sugar stability",
      "Include protein with each meal and snack",
      "Choose high-fiber foods which slow sugar absorption",
      "Avoid sugary drinks and limit fruit juices",
      "Stay hydrated by drinking at least 8 glasses of water daily",
      "Time medications appropriately with meals",
      "Monitor blood glucose levels before and after trying new foods"
    ]
  },
  hypertension: {
    title: "DASH-Inspired Blood Pressure Management Plan",
    description: "Based on the clinically-proven DASH diet approach to reduce blood pressure naturally through heart-healthy food choices.",
    duration: "4 weeks",
    image: "/placeholder.svg",
    dailySchedule: [
      {
        time: "7:30 AM",
        meal: "Breakfast",
        items: [
          {
            name: "Overnight oats",
            portion: "1/2 cup oats + 1/2 cup milk",
            nutrients: "Fiber, potassium, calcium",
            benefits: "Heart health, blood pressure regulation"
          },
          {
            name: "Banana",
            portion: "1 medium",
            nutrients: "Potassium, fiber",
            benefits: "Natural blood pressure reduction"
          },
          {
            name: "Chia seeds",
            portion: "1 tablespoon",
            nutrients: "Omega-3, fiber",
            benefits: "Heart health, reduces inflammation"
          }
        ]
      },
      {
        time: "10:30 AM",
        meal: "Mid-morning Snack",
        items: [
          {
            name: "Unsalted mixed nuts",
            portion: "1/4 cup",
            nutrients: "Magnesium, healthy fats",
            benefits: "Blood pressure regulation, heart health"
          }
        ]
      },
      {
        time: "1:00 PM",
        meal: "Lunch",
        items: [
          {
            name: "Spinach salad",
            portion: "2 cups",
            nutrients: "Potassium, magnesium, folate",
            benefits: "Blood pressure regulation"
          },
          {
            name: "Grilled chicken",
            portion: "3 oz",
            nutrients: "Lean protein",
            benefits: "Muscle maintenance, satiety"
          },
          {
            name: "Olive oil dressing",
            portion: "1 tablespoon",
            nutrients: "Monounsaturated fats",
            benefits: "Heart health, reduces inflammation"
          }
        ]
      },
      {
        time: "3:30 PM",
        meal: "Afternoon Snack",
        items: [
          {
            name: "Greek yogurt",
            portion: "3/4 cup",
            nutrients: "Calcium, protein, probiotics",
            benefits: "Blood pressure regulation, gut health"
          },
          {
            name: "Berries",
            portion: "1/2 cup",
            nutrients: "Antioxidants, fiber",
            benefits: "Vascular health, inflammation reduction"
          }
        ]
      },
      {
        time: "7:00 PM",
        meal: "Dinner",
        items: [
          {
            name: "Baked cod",
            portion: "4 oz",
            nutrients: "Lean protein, omega-3",
            benefits: "Heart health, blood pressure regulation"
          },
          {
            name: "Sweet potato",
            portion: "1/2 medium",
            nutrients: "Potassium, fiber",
            benefits: "Blood pressure regulation"
          },
          {
            name: "Steamed broccoli",
            portion: "1 cup",
            nutrients: "Fiber, vitamins, minerals",
            benefits: "Heart health, overall nutrition"
          }
        ]
      }
    ],
    guidelines: [
      "Limit sodium to less than 2,300mg daily (ideally 1,500mg)",
      "Emphasize foods rich in potassium, magnesium, and calcium",
      "Include 4-5 servings each of fruits and vegetables daily",
      "Choose whole grains over refined carbohydrates",
      "Limit red meat to once weekly and favor lean proteins",
      "Avoid processed foods which are typically high in sodium",
      "Read food labels carefully and choose low-sodium options",
      "Use herbs and spices instead of salt for flavoring",
      "Limit alcohol consumption",
      "Stay physically active with regular moderate exercise"
    ]
  },
  celiac: {
    title: "Strict Gluten-Free Healing Plan",
    description: "A completely gluten-free diet to heal intestinal damage, reduce inflammation, and restore nutrient absorption for those with celiac disease.",
    duration: "8 weeks",
    image: "/placeholder.svg",
    dailySchedule: [
      {
        time: "7:00 AM",
        meal: "Breakfast",
        items: [
          { name: "Certified GF oats with banana", portion: "1/2 cup oats", nutrients: "Fiber, potassium", benefits: "Gentle on gut, sustained energy" },
          { name: "Almond milk", portion: "1 cup", nutrients: "Calcium, vitamin D", benefits: "Bone health, dairy-free calcium" },
          { name: "Chia seeds", portion: "1 tablespoon", nutrients: "Omega-3, fiber", benefits: "Anti-inflammatory, gut health" }
        ]
      },
      {
        time: "10:00 AM",
        meal: "Mid-morning Snack",
        items: [
          { name: "Rice cakes with peanut butter", portion: "2 rice cakes + 1 tbsp", nutrients: "Carbs, protein, healthy fat", benefits: "Gluten-free energy boost" }
        ]
      },
      {
        time: "12:30 PM",
        meal: "Lunch",
        items: [
          { name: "Quinoa salad", portion: "1 cup cooked quinoa", nutrients: "Complete protein, fiber", benefits: "Gut-friendly, anti-inflammatory" },
          { name: "Roasted vegetables", portion: "1 cup", nutrients: "Vitamins, antioxidants", benefits: "Nutrient-dense, easy to digest" },
          { name: "Olive oil & lemon dressing", portion: "1 tablespoon", nutrients: "Healthy fats", benefits: "Anti-inflammatory" }
        ]
      },
      {
        time: "4:00 PM",
        meal: "Afternoon Snack",
        items: [
          { name: "Fresh fruit", portion: "1 medium piece", nutrients: "Vitamins, fiber", benefits: "Natural energy, gut health" }
        ]
      },
      {
        time: "7:00 PM",
        meal: "Dinner",
        items: [
          { name: "Baked salmon", portion: "4 oz", nutrients: "Omega-3, protein", benefits: "Reduces gut inflammation" },
          { name: "Sweet potato", portion: "1 medium", nutrients: "Beta-carotene, potassium", benefits: "Anti-inflammatory, easy to digest" },
          { name: "Steamed spinach", portion: "1 cup", nutrients: "Iron, magnesium", benefits: "Restores nutrients lost from malabsorption" }
        ]
      }
    ],
    guidelines: [
      "Eliminate all wheat, barley, and rye completely",
      "Use only certified gluten-free labeled products",
      "Avoid cross-contamination — use separate cookware and utensils",
      "Focus on naturally gluten-free whole foods: rice, quinoa, potatoes",
      "Supplement with vitamins D, B12, and iron as absorption may be impaired",
      "Read every food label carefully — gluten hides in sauces, seasonings, and processed foods",
      "Healing can take 6–12 months — be patient and consistent"
    ]
  },
  ibs: {
    title: "Low-FODMAP Digestive Comfort Plan",
    description: "A structured low-FODMAP diet to identify and eliminate fermentable carbohydrates that trigger IBS symptoms like bloating, gas, and abdominal pain.",
    duration: "6 weeks",
    image: "/placeholder.svg",
    dailySchedule: [
      {
        time: "7:30 AM",
        meal: "Breakfast",
        items: [
          { name: "GF oats with strawberries", portion: "1/2 cup oats + 1/2 cup berries", nutrients: "Fiber, vitamins", benefits: "Low-FODMAP, gentle on gut" },
          { name: "Lactose-free yogurt", portion: "1/2 cup", nutrients: "Protein, probiotics", benefits: "Gut microbiome support" },
          { name: "Maple syrup (pure)", portion: "1 teaspoon", nutrients: "Simple carbs", benefits: "Low-FODMAP sweetener" }
        ]
      },
      {
        time: "10:30 AM",
        meal: "Mid-morning Snack",
        items: [
          { name: "Banana (unripe)", portion: "1 small", nutrients: "Potassium, fiber", benefits: "Low-FODMAP, easy to digest" }
        ]
      },
      {
        time: "1:00 PM",
        meal: "Lunch",
        items: [
          { name: "Grilled chicken", portion: "3 oz", nutrients: "Lean protein", benefits: "Easy to digest, no FODMAPs" },
          { name: "Rice with carrots & zucchini", portion: "1/2 cup rice + 1 cup veg", nutrients: "Carbs, vitamins", benefits: "Low-FODMAP, filling" },
          { name: "Garlic-infused olive oil", portion: "1 tablespoon", nutrients: "Healthy fats", benefits: "Flavour without fructans" }
        ]
      },
      {
        time: "3:30 PM",
        meal: "Afternoon Snack",
        items: [
          { name: "Rice crackers with cheddar", portion: "5 crackers + 1 oz cheese", nutrients: "Carbs, calcium", benefits: "Low-FODMAP snack" }
        ]
      },
      {
        time: "7:00 PM",
        meal: "Dinner",
        items: [
          { name: "Baked cod", portion: "4 oz", nutrients: "Lean protein, omega-3", benefits: "Anti-inflammatory, easy to digest" },
          { name: "Baked potato with olive oil", portion: "1 medium", nutrients: "Potassium, carbs", benefits: "Low-FODMAP, filling" },
          { name: "Steamed green beans", portion: "1 cup", nutrients: "Fiber, vitamins", benefits: "Low-FODMAP vegetable" }
        ]
      }
    ],
    guidelines: [
      "Avoid high-FODMAP foods: garlic, onions, apples, pears, beans, wheat, milk",
      "Use garlic-infused oil for flavour without the fructans",
      "Eat smaller, more frequent meals to reduce gut load",
      "Chew food slowly and thoroughly",
      "Keep a food diary to identify personal triggers",
      "Probiotics may help — consider lactobacillus strains",
      "Manage stress as it directly impacts IBS symptoms",
      "After 6 weeks, slowly reintroduce FODMAP groups to identify specific triggers"
    ]
  },
  heartDisease: {
    title: "Heart-Protective Cardiovascular Diet",
    description: "A comprehensive heart-protective diet focused on reducing LDL cholesterol, inflammation, and blood pressure to support cardiovascular health and recovery.",
    duration: "12 weeks",
    image: "/placeholder.svg",
    dailySchedule: [
      {
        time: "7:00 AM",
        meal: "Breakfast",
        items: [
          { name: "Oatmeal with flaxseed", portion: "1/2 cup oats + 1 tbsp flax", nutrients: "Soluble fiber, omega-3", benefits: "Lowers LDL cholesterol" },
          { name: "Blueberries", portion: "1/2 cup", nutrients: "Antioxidants, fiber", benefits: "Reduces arterial inflammation" },
          { name: "Walnuts", portion: "6 halves", nutrients: "Omega-3, plant sterols", benefits: "Heart-protective fats" }
        ]
      },
      {
        time: "10:00 AM",
        meal: "Mid-morning Snack",
        items: [
          { name: "Apple with almond butter", portion: "1 small + 1 tbsp", nutrients: "Fiber, healthy fats", benefits: "Cholesterol reduction, satiety" }
        ]
      },
      {
        time: "12:30 PM",
        meal: "Lunch",
        items: [
          { name: "Grilled salmon", portion: "4 oz", nutrients: "Omega-3, protein", benefits: "Reduces triglycerides, heart health" },
          { name: "Mixed leafy greens salad", portion: "2 cups", nutrients: "Folate, vitamins K & C", benefits: "Vascular health, anti-inflammatory" },
          { name: "Olive oil & vinegar dressing", portion: "1 tablespoon", nutrients: "Monounsaturated fats", benefits: "Improves cholesterol ratio" }
        ]
      },
      {
        time: "4:00 PM",
        meal: "Afternoon Snack",
        items: [
          { name: "Handful of almonds", portion: "1 oz (23 almonds)", nutrients: "Vitamin E, magnesium", benefits: "Heart-protective antioxidants" }
        ]
      },
      {
        time: "7:00 PM",
        meal: "Dinner",
        items: [
          { name: "Grilled chicken breast", portion: "4 oz", nutrients: "Lean protein", benefits: "Builds muscle without saturated fat" },
          { name: "Lentils", portion: "1/2 cup cooked", nutrients: "Fiber, plant protein, folate", benefits: "Lowers cholesterol, heart health" },
          { name: "Roasted broccoli & carrots", portion: "1 cup", nutrients: "Fiber, beta-carotene", benefits: "Antioxidant protection for vessels" }
        ]
      }
    ],
    guidelines: [
      "Limit saturated fat to less than 7% of daily calories",
      "Avoid trans fats completely — check labels for 'partially hydrogenated oils'",
      "Eat fatty fish (salmon, mackerel, sardines) at least twice a week",
      "Choose whole grains over refined carbohydrates",
      "Limit sodium to less than 2,000mg daily",
      "Include plant sterols from nuts, seeds, and legumes daily",
      "Aim for 25–30g of fiber per day",
      "Avoid sugary drinks and processed snacks",
      "Maintain a healthy weight — even 5–10% loss improves heart health",
      "Exercise for at least 150 minutes per week of moderate activity"
    ]
  },
  thyroid: {
    title: "Thyroid-Supportive Nutrient-Rich Plan",
    description: "A carefully designed diet providing key nutrients — iodine, selenium, and zinc — essential for thyroid hormone production and metabolism regulation.",
    duration: "8 weeks",
    image: "/placeholder.svg",
    dailySchedule: [
      {
        time: "7:00 AM",
        meal: "Breakfast",
        items: [
          { name: "Scrambled eggs with spinach", portion: "2 eggs + 1 cup spinach", nutrients: "Iodine, selenium, iron", benefits: "Thyroid hormone production" },
          { name: "Whole grain toast", portion: "1 slice", nutrients: "Complex carbs, B vitamins", benefits: "Energy metabolism support" },
          { name: "Brazil nuts (2-3 only)", portion: "2–3 nuts", nutrients: "Selenium (daily requirement)", benefits: "Critical for T4→T3 conversion" }
        ]
      },
      {
        time: "10:00 AM",
        meal: "Mid-morning Snack",
        items: [
          { name: "Greek yogurt with berries", portion: "3/4 cup + 1/2 cup berries", nutrients: "Iodine, probiotics, antioxidants", benefits: "Thyroid support, gut health" }
        ]
      },
      {
        time: "12:30 PM",
        meal: "Lunch",
        items: [
          { name: "Grilled fish (cod or tuna)", portion: "4 oz", nutrients: "Iodine, omega-3, selenium", benefits: "Top thyroid-supporting nutrients" },
          { name: "Quinoa", portion: "1/2 cup cooked", nutrients: "Zinc, complete protein", benefits: "Thyroid enzyme support" },
          { name: "Roasted bell peppers & tomatoes", portion: "1 cup", nutrients: "Vitamin C, lycopene", benefits: "Antioxidant protection for thyroid" }
        ]
      },
      {
        time: "3:30 PM",
        meal: "Afternoon Snack",
        items: [
          { name: "Pumpkin seeds", portion: "2 tablespoons", nutrients: "Zinc, magnesium", benefits: "Thyroid enzyme cofactor" }
        ]
      },
      {
        time: "7:00 PM",
        meal: "Dinner",
        items: [
          { name: "Baked salmon", portion: "4 oz", nutrients: "Omega-3, selenium, iodine", benefits: "Anti-inflammatory, thyroid support" },
          { name: "Sweet potato", portion: "1 medium", nutrients: "Beta-carotene, potassium", benefits: "Converts to vitamin A for thyroid" },
          { name: "Steamed green beans", portion: "1 cup", nutrients: "Fiber, vitamins", benefits: "Nutrient-dense, thyroid-safe vegetable" }
        ]
      }
    ],
    guidelines: [
      "Include iodine-rich foods daily: seafood, dairy, eggs, iodized salt",
      "Eat 2–3 Brazil nuts daily for selenium — do not exceed this amount",
      "Include zinc sources: pumpkin seeds, beef, chickpeas, cashews",
      "Limit raw cruciferous vegetables (broccoli, cauliflower, kale) — cooking reduces goitrogens",
      "Avoid excess soy products which can interfere with thyroid hormone absorption",
      "If on levothyroxine, take it 30–60 minutes before eating",
      "Avoid calcium and iron supplements within 4 hours of thyroid medication",
      "Stay well hydrated — thyroid affects fluid balance",
      "Manage stress as cortisol suppresses thyroid function"
    ]
  }
};

const DietPlan = () => {
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<DietPlan | null>(null);
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);
  const [dietImage, setDietImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      age: "",
      gender: "",
      condition: "",
      allergies: "",
      preferences: "",
    },
  });

  const generateDietImage = async (planTitle: string, condition: string) => {
    setImageLoading(true);
    setDietImage(null);
    try {
      const { data, error } = await supabase.functions.invoke("generate-diet-image", {
        body: { planTitle, condition },
      });
      if (!error && data?.imageUrl) setDietImage(data.imageUrl);
    } catch (e) {
      console.error("Image generation failed", e);
    } finally {
      setImageLoading(false);
    }
  };

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    // In a real app, this would generate a personalized plan
    // For demo, we'll use our pre-defined plans based on condition
    if (data.condition in dietPlans) {
      setSelectedPlan(dietPlans[data.condition]);
      generateDietImage(dietPlans[data.condition].title, data.condition);
      setStep(2);
      toast({
        title: "Diet Plan Generated",
        description: `We've created a personalized diet plan for ${data.name}`,
      });
    } else {
      toast({
        title: "Plan Not Available",
        description: "We don't have a plan for this condition yet. Please try another.",
        variant: "destructive",
      });
    }
  };

  const toggleMealExpansion = (time: string) => {
    if (expandedMeal === time) {
      setExpandedMeal(null);
    } else {
      setExpandedMeal(time);
    }
  };

  return (
    <div className="container mx-auto max-w-6xl py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center space-x-2">
          <Heart className="h-8 w-8 text-health-abnormal" />
          <h1 className="text-3xl font-bold">Healing Diet Plans</h1>
        </div>
        
        <p className="text-muted-foreground text-lg">
          Personalized, disease-specific diet plans crafted with care for someone you love,
          aiming to reduce symptoms and promote healing.
        </p>

        <Separator />

        {step === 1 ? (
          <Card>
            <CardHeader>
              <CardTitle>Create Your Personalized Diet Plan</CardTitle>
              <CardDescription>
                Tell us about yourself or the person you're caring for. We'll create a customized 
                diet plan designed to support health and healing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Age</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="Age" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gender</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="condition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Health Condition</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select condition" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {healthConditions.map((condition) => (
                                <SelectItem key={condition.value} value={condition.value}>
                                  {condition.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="allergies"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Food Allergies/Intolerances</FormLabel>
                          <FormControl>
                            <Input placeholder="E.g., dairy, nuts, gluten" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Start Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <CalendarComponent
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                                className="p-3 pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            When would you like to start following this diet plan?
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="preferences"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dietary Preferences</FormLabel>
                          <FormControl>
                            <Input placeholder="E.g., vegetarian, low-carb" {...field} />
                          </FormControl>
                          <FormDescription>
                            Optional: Any specific dietary preferences?
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    <Utensils className="mr-2 h-4 w-4" />
                    Generate Diet Plan
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        ) : (
          selectedPlan && (
            <div className="space-y-8">
              <Card>
                {/* AI-generated diet image */}
                {(imageLoading || dietImage) && (
                  <div className="w-full h-56 overflow-hidden rounded-t-lg bg-muted flex items-center justify-center">
                    {imageLoading ? (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="text-sm">Generating diet image…</span>
                      </div>
                    ) : dietImage ? (
                      <img src={dietImage} alt={selectedPlan.title} className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                )}
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl">{selectedPlan.title}</CardTitle>
                      <CardDescription className="text-md mt-2">
                        {selectedPlan.description}
                      </CardDescription>
                    </div>
                    <Button variant="outline" onClick={() => setStep(1)}>
                      Back to Form
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="col-span-2">
                      <div className="flex items-center mb-4">
                        <Calendar className="h-5 w-5 mr-2 text-primary" />
                        <h3 className="text-lg font-medium">Duration: {selectedPlan.duration}</h3>
                      </div>
                      
                      <div className="mb-6">
                        <h3 className="text-lg font-medium mb-3 flex items-center">
                          <Utensils className="h-5 w-5 mr-2 text-primary" />
                          Daily Meal Schedule
                        </h3>
                        <div className="space-y-4">
                          {selectedPlan.dailySchedule.map((mealPlan) => (
                            <Card key={mealPlan.time} className="overflow-hidden">
                              <div 
                                className="p-4 flex justify-between items-center cursor-pointer hover:bg-muted/50"
                                onClick={() => toggleMealExpansion(mealPlan.time)}
                              >
                                <div className="flex items-center">
                                  <span className="font-medium text-primary">{mealPlan.time}</span>
                                  <span className="mx-2">•</span>
                                  <span>{mealPlan.meal}</span>
                                </div>
                                {expandedMeal === mealPlan.time ? 
                                  <ChevronDown className="h-5 w-5" /> : 
                                  <ChevronRight className="h-5 w-5" />
                                }
                              </div>
                              
                              {expandedMeal === mealPlan.time && (
                                <div className="px-4 pb-4">
                                  <div className="bg-muted/30 rounded-md p-3">
                                    {mealPlan.items.map((item, idx) => (
                                      <div key={idx} className="mb-3 last:mb-0">
                                        <div className="flex justify-between items-start">
                                          <div className="font-medium">{item.name}</div>
                                          <div className="text-sm text-muted-foreground">{item.portion}</div>
                                        </div>
                                        <div className="text-sm mt-1">
                                          <span className="text-primary">Nutrients:</span> {item.nutrients}
                                        </div>
                                        <div className="text-sm">
                                          <span className="text-primary">Benefits:</span> {item.benefits}
                                        </div>
                                        {idx < mealPlan.items.length - 1 && <Separator className="my-2" />}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </Card>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="mb-4 bg-muted rounded-md overflow-hidden">
                        <AspectRatio ratio={4/3}>
                          <div className="h-full w-full flex items-center justify-center bg-muted">
                            <Apple className="h-16 w-16 text-muted-foreground" />
                          </div>
                        </AspectRatio>
                      </div>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center">
                            <Pill className="h-5 w-5 mr-2 text-primary" />
                            Key Guidelines
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="list-disc pl-5 space-y-2">
                            {selectedPlan.guidelines.map((guideline, idx) => (
                              <li key={idx} className="text-sm">{guideline}</li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center border-t pt-6">
                  <Button onClick={() => window.print()}>
                    Print Diet Plan
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default DietPlan;
