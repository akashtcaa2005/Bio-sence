
import { DietRecommendation } from "@/types/diet";

export const dietRecommendations: DietRecommendation[] = [
  {
    condition: "High Blood Pressure",
    dietType: "DASH Diet (Dietary Approaches to Stop Hypertension)",
    description: "The DASH diet focuses on reducing sodium intake and increasing foods rich in nutrients that help lower blood pressure, such as potassium, calcium, and magnesium.",
    foods: {
      recommended: ["Fruits", "Vegetables", "Whole grains", "Lean proteins", "Low-fat dairy", "Seeds & nuts"],
      avoid: ["Salt & sodium", "Processed foods", "Caffeine", "Alcohol", "Red meat", "Added sugars"]
    },
    mealPlan: {
      breakfast: ["Oatmeal with berries and nuts", "Low-fat yogurt with banana", "Whole grain toast with avocado"],
      lunch: ["Quinoa salad with vegetables", "Grilled chicken with steamed vegetables", "Bean soup with whole grain bread"],
      dinner: ["Baked salmon with roasted vegetables", "Vegetable stir-fry with brown rice", "Grilled turkey with sweet potato"],
      snacks: ["Apple slices with nut butter", "Carrot sticks with hummus", "Unsalted nuts mix"]
    },
    image: "https://images.unsplash.com/photo-1564894809611-1742fc40ed80?q=80&w=1287&auto=format&fit=crop"
  },
  {
    condition: "Elevated Blood Sugar",
    dietType: "Low Glycemic Diet",
    description: "A low glycemic diet focuses on foods that have minimal impact on blood sugar levels, helping to maintain stable glucose levels throughout the day.",
    foods: {
      recommended: ["Non-starchy vegetables", "Lean proteins", "Healthy fats", "Whole grains", "Legumes", "Berries"],
      avoid: ["Added sugars", "Refined carbs", "Processed foods", "Sugary drinks", "White bread", "Fruit juice"]
    },
    mealPlan: {
      breakfast: ["Greek yogurt with berries and chia seeds", "Vegetable omelet with whole grain toast", "Steel-cut oats with cinnamon"],
      lunch: ["Chickpea salad with olive oil dressing", "Turkey wrap with lettuce instead of tortilla", "Lentil soup with mixed greens"],
      dinner: ["Grilled fish with roasted vegetables", "Chicken and vegetable stir-fry", "Cauliflower rice bowl with tofu"],
      snacks: ["Handful of almonds", "Celery with peanut butter", "Hard-boiled egg"]
    },
    image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=1170&auto=format&fit=crop"
  },
  {
    condition: "Irregular Heartbeat",
    dietType: "Heart-Healthy Mediterranean Diet",
    description: "The Mediterranean diet is rich in anti-inflammatory foods and healthy fats that support heart rhythm regulation and overall cardiovascular health.",
    foods: {
      recommended: ["Omega-3 rich fish", "Olive oil", "Leafy greens", "Whole grains", "Nuts & seeds", "Fruits"],
      avoid: ["Caffeine", "Alcohol", "High-sodium foods", "Trans fats", "Processed meats", "Energy drinks"]
    },
    mealPlan: {
      breakfast: ["Whole grain toast with olive oil and tomato", "Greek yogurt with honey and walnuts", "Vegetable frittata"],
      lunch: ["Mediterranean salad with chickpeas", "Tuna sandwich on whole grain bread", "Lentil soup with olive oil drizzle"],
      dinner: ["Baked salmon with spinach", "Vegetable and bean stew", "Grilled chicken with quinoa and roasted vegetables"],
      snacks: ["Trail mix with unsalted nuts", "Apple with almond butter", "Hummus with vegetable sticks"]
    },
    image: "https://images.unsplash.com/photo-1559847844-5315695dadae?q=80&w=1158&auto=format&fit=crop"
  },
  {
    condition: "High Cholesterol",
    dietType: "TLC Diet (Therapeutic Lifestyle Changes)",
    description: "The TLC diet focuses on reducing saturated fat intake while increasing soluble fiber to help lower LDL (bad) cholesterol levels naturally.",
    foods: {
      recommended: ["Oats & barley", "Fatty fish", "Nuts & seeds", "Beans & legumes", "Fruits & vegetables", "Olive oil"],
      avoid: ["Trans fats", "Saturated fats", "Red meat", "Full-fat dairy", "Fried foods", "Processed snacks"]
    },
    mealPlan: {
      breakfast: ["Oatmeal with apple and flaxseed", "Smoothie with berries and plant protein", "Avocado toast on whole grain bread"],
      lunch: ["Black bean soup with vegetable salad", "Tuna salad with olive oil dressing", "Vegetable wrap with hummus"],
      dinner: ["Grilled salmon with steamed broccoli", "Bean and vegetable chili", "Stir-fry with tofu and vegetables"],
      snacks: ["Handful of walnuts", "Edamame", "Baked apple with cinnamon"]
    },
    image: "https://images.unsplash.com/photo-1615937657715-bc7b4b7962c1?q=80&w=1170&auto=format&fit=crop"
  },
  {
    condition: "Low Hemoglobin",
    dietType: "Iron-Rich Diet",
    description: "An iron-rich diet focuses on foods that can help increase hemoglobin levels and combat anemia by improving oxygen transport in the blood.",
    foods: {
      recommended: ["Lean red meat", "Spinach & leafy greens", "Beans & lentils", "Fortified cereals", "Dried fruits", "Dark chocolate"],
      avoid: ["Tea & coffee with meals", "Calcium supplements with iron", "Excessive dairy", "Processed foods", "High-fiber foods with iron"]
    },
    mealPlan: {
      breakfast: ["Fortified cereal with strawberries", "Spinach omelet with whole grain toast", "Oatmeal with dried fruits and nuts"],
      lunch: ["Lentil soup with vitamin C-rich vegetables", "Beef and bean burrito", "Quinoa bowl with chickpeas and vegetables"],
      dinner: ["Lean steak with spinach salad", "Turkey meatballs with tomato sauce", "Fish with iron-rich sides"],
      snacks: ["Dried apricots and pumpkin seeds", "Hummus with bell peppers", "Dark chocolate covered raisins"]
    },
    image: "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?q=80&w=1200&auto=format&fit=crop"
  },
  {
    condition: "Celiac Disease",
    dietType: "Strict Gluten-Free Diet",
    description: "A gluten-free diet eliminates all foods containing gluten (wheat, barley, rye) to prevent intestinal damage and allow healing of the gut lining.",
    foods: {
      recommended: ["Rice", "Quinoa", "Corn", "Potatoes", "Fruits & vegetables", "Lean meats & fish", "Eggs", "Legumes", "Nuts & seeds"],
      avoid: ["Wheat & wheat flour", "Barley", "Rye", "Regular bread & pasta", "Beer", "Soy sauce", "Processed foods with hidden gluten", "Oats (unless certified GF)"]
    },
    mealPlan: {
      breakfast: ["Rice porridge with banana and honey", "Gluten-free oats with berries", "Scrambled eggs with gluten-free toast"],
      lunch: ["Quinoa salad with roasted vegetables", "Rice noodle soup with vegetables", "Stuffed bell peppers with rice and beans"],
      dinner: ["Baked salmon with sweet potato and greens", "Chicken stir-fry with rice noodles", "Lentil curry with basmati rice"],
      snacks: ["Rice cakes with almond butter", "Fresh fruit with gluten-free crackers", "Handful of mixed nuts"]
    },
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1170&auto=format&fit=crop"
  },
  {
    condition: "Irritable Bowel Syndrome",
    dietType: "Low-FODMAP Diet",
    description: "The Low-FODMAP diet reduces fermentable carbohydrates that trigger IBS symptoms like bloating, gas, and abdominal pain by limiting hard-to-digest sugars.",
    foods: {
      recommended: ["Rice & oats", "Carrots & zucchini", "Spinach & kale", "Bananas & strawberries", "Lean meats", "Lactose-free dairy", "Tofu", "Walnuts"],
      avoid: ["Garlic & onions", "Apples & pears", "Wheat & rye", "Milk & soft cheese", "Legumes", "Cauliflower & broccoli", "Honey", "Artificial sweeteners"]
    },
    mealPlan: {
      breakfast: ["Gluten-free oats with banana and maple syrup", "Scrambled eggs with spinach", "Rice cakes with peanut butter and strawberries"],
      lunch: ["Grilled chicken with rice and carrots", "Tuna salad on gluten-free bread", "Vegetable soup with rice noodles"],
      dinner: ["Baked cod with zucchini and potatoes", "Turkey stir-fry with bok choy and rice", "Grilled tofu with eggplant and quinoa"],
      snacks: ["Banana with walnuts", "Lactose-free yogurt", "Rice crackers with cucumber slices"]
    },
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1170&auto=format&fit=crop"
  },
  {
    condition: "Heart Disease",
    dietType: "Heart-Protective Diet",
    description: "A heart-protective diet focuses on reducing LDL cholesterol, inflammation, and blood pressure through whole foods, healthy fats, and limited saturated fat.",
    foods: {
      recommended: ["Fatty fish (salmon, mackerel)", "Berries & citrus fruits", "Leafy greens", "Whole grains", "Olive oil", "Avocado", "Nuts & seeds", "Legumes"],
      avoid: ["Trans fats", "Saturated & red meat", "Full-fat dairy", "Salt & sodium", "Sugary drinks", "Fried foods", "Processed snacks", "Alcohol"]
    },
    mealPlan: {
      breakfast: ["Oatmeal with blueberries and flaxseed", "Avocado toast on whole grain bread", "Smoothie with spinach, banana and walnuts"],
      lunch: ["Grilled salmon salad with olive oil dressing", "Lentil soup with whole grain bread", "Chickpea and vegetable wrap"],
      dinner: ["Baked mackerel with steamed broccoli and quinoa", "Bean and vegetable stew", "Grilled chicken with roasted sweet potato and greens"],
      snacks: ["Handful of almonds or walnuts", "Apple slices with almond butter", "Carrot sticks with hummus"]
    },
    image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=1172&auto=format&fit=crop"
  },
  {
    condition: "Thyroid Disorder",
    dietType: "Thyroid-Supportive Diet",
    description: "A thyroid-supportive diet provides key nutrients like iodine, selenium, and zinc that are essential for thyroid hormone production and metabolism regulation.",
    foods: {
      recommended: ["Seaweed & seafood (iodine)", "Brazil nuts (selenium)", "Pumpkin seeds (zinc)", "Eggs", "Lean poultry", "Berries", "Whole grains", "Legumes"],
      avoid: ["Raw cruciferous vegetables in excess", "Soy products in excess", "Gluten (if Hashimoto's)", "Processed foods", "Sugar", "Alcohol", "Caffeine in excess"]
    },
    mealPlan: {
      breakfast: ["Eggs with spinach and whole grain toast", "Greek yogurt with Brazil nuts and berries", "Oatmeal with pumpkin seeds and honey"],
      lunch: ["Grilled fish tacos with avocado salsa", "Chicken and quinoa bowl with roasted vegetables", "Lentil soup with seaweed crackers"],
      dinner: ["Baked cod with sweet potato and green beans", "Turkey stir-fry with bok choy and brown rice", "Salmon with roasted beets and kale salad"],
      snacks: ["Brazil nuts (2-3 only)", "Hard-boiled egg with sea salt", "Hummus with bell pepper strips"]
    },
    image: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?q=80&w=1170&auto=format&fit=crop"
  },
];
