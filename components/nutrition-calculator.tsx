"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { TrendingDown, TrendingUp, Activity, ChevronLeft } from "lucide-react"

interface DietPlan {
  calories: number
  protein: number
  carbs: number
  fats: number
  meals: string[]
  tips: string[]
}

export function NutritionCalculator() {
  const [weight, setWeight] = useState("")
  const [height, setHeight] = useState("")
  const [bodyFat, setBodyFat] = useState("")
  const [age, setAge] = useState("")
  const [gender, setGender] = useState<"male" | "female" | null>(null)
  const [goal, setGoal] = useState<"lose" | "gain" | "maintain" | null>(null)
  const [showForm, setShowForm] = useState(true)
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null)

  const calculateDiet = () => {
    if (!weight || !height || !age || !gender || !goal) return

    const w = Number.parseFloat(weight)
    const h = Number.parseFloat(height) / 100 // converter para metros
    const a = Number.parseFloat(age)
    const bf = bodyFat ? Number.parseFloat(bodyFat) : null

    // Calcular TMB (Taxa Metabólica Basal) usando fórmula de Mifflin-St Jeor
    let bmr: number
    if (gender === "male") {
      bmr = 10 * w + 6.25 * Number.parseFloat(height) - 5 * a + 5
    } else {
      bmr = 10 * w + 6.25 * Number.parseFloat(height) - 5 * a - 161
    }

    // Calcular TDEE (Total Daily Energy Expenditure) - assumindo atividade moderada
    const tdee = bmr * 1.55

    // Ajustar calorias baseado no objetivo
    let calories: number
    let protein: number
    let carbs: number
    let fats: number

    if (goal === "lose") {
      calories = Math.round(tdee - 500) // déficit de 500 calorias
      protein = Math.round(w * 2.2) // 2.2g por kg
      fats = Math.round(w * 0.8) // 0.8g por kg
      carbs = Math.round((calories - protein * 4 - fats * 9) / 4)
    } else if (goal === "gain") {
      calories = Math.round(tdee + 300) // superávit de 300 calorias
      protein = Math.round(w * 2.0) // 2.0g por kg
      fats = Math.round(w * 1.0) // 1.0g por kg
      carbs = Math.round((calories - protein * 4 - fats * 9) / 4)
    } else {
      calories = Math.round(tdee)
      protein = Math.round(w * 1.8) // 1.8g por kg
      fats = Math.round(w * 0.9) // 0.9g por kg
      carbs = Math.round((calories - protein * 4 - fats * 9) / 4)
    }

    // Gerar sugestões de refeições
    const meals = generateMeals(goal, protein, carbs, fats, calories)
    const tips = generateTips(goal, bf)

    setDietPlan({ calories, protein, carbs, fats, meals, tips })
    setShowForm(false)
  }

  const generateMeals = (goal: string, protein: number, carbs: number, fats: number, calories: number): string[] => {
    const mealsPerDay = 5
    const proteinPerMeal = Math.round(protein / mealsPerDay)
    const carbsPerMeal = Math.round(carbs / mealsPerDay)
    const fatsPerMeal = Math.round(fats / mealsPerDay)
    const caloriesPerMeal = Math.round(calories / mealsPerDay)

    return [
      `🌅 **Café da Manhã** (${caloriesPerMeal} kcal)
• ${Math.round(proteinPerMeal * 0.3)}g de aveia
• 3 ovos mexidos (${Math.round(proteinPerMeal * 0.4)}g proteína)
• 1 banana média
• ${Math.round(fatsPerMeal * 0.2)}g de pasta de amendoim`,

      `🥗 **Lanche da Manhã** (${Math.round(caloriesPerMeal * 0.8)} kcal)
• 1 scoop de whey protein (${Math.round(proteinPerMeal * 0.8)}g)
• 1 fruta (maçã ou pera)
• ${Math.round(carbsPerMeal * 0.3)}g de granola`,

      `🍽️ **Almoço** (${Math.round(caloriesPerMeal * 1.3)} kcal)
• ${Math.round(proteinPerMeal * 1.5)}g de frango/peixe/carne
• ${Math.round(carbsPerMeal * 1.2)}g de arroz integral ou batata doce
• Salada verde à vontade com azeite
• Legumes cozidos (brócolis, cenoura)`,

      `🥤 **Lanche Pré-Treino** (${Math.round(caloriesPerMeal * 0.7)} kcal)
• 1 fatia de pão integral com ${Math.round(fatsPerMeal * 0.3)}g de pasta de amendoim
• 1 banana
• Café preto (opcional)`,

      `🍗 **Jantar** (${Math.round(caloriesPerMeal * 1.2)} kcal)
• ${Math.round(proteinPerMeal * 1.3)}g de frango/peixe
• ${goal === "lose" ? "Salada grande" : Math.round(carbsPerMeal * 0.8) + "g de batata doce"}
• Legumes grelhados
• Azeite extra virgem (${Math.round(fatsPerMeal * 0.4)}g)`,
    ]
  }

  const generateTips = (goal: string, bodyFat: number | null): string[] => {
    const baseTips = [
      "💧 Beba pelo menos 3 litros de água por dia",
      "😴 Durma 7-9 horas por noite para recuperação muscular",
      "⏰ Faça refeições a cada 3-4 horas",
      "🏋️ Mantenha consistência nos treinos",
    ]

    if (goal === "lose") {
      return [
        ...baseTips,
        "🔥 Priorize proteínas em todas as refeições para saciedade",
        "🥗 Aumente o consumo de vegetais (baixas calorias, alta saciedade)",
        "🚫 Evite alimentos processados e açúcares refinados",
        "🏃 Adicione 20-30min de cardio 3-4x por semana",
      ]
    } else if (goal === "gain") {
      return [
        ...baseTips,
        "💪 Foque em exercícios compostos (agachamento, supino, levantamento terra)",
        "🍚 Não pule carboidratos - eles são essenciais para ganho de massa",
        "📊 Aumente gradualmente as calorias se não estiver ganhando peso",
        "⚡ Consuma carboidratos antes e depois do treino",
      ]
    } else {
      return [
        ...baseTips,
        "⚖️ Monitore seu peso semanalmente",
        "🎯 Ajuste as calorias se começar a ganhar ou perder peso",
        "🥦 Mantenha uma dieta balanceada e variada",
        "💪 Continue treinando regularmente",
      ]
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      {showForm ? (
        <div className="p-4 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Coach Nutricional</h2>
            <p className="text-gray-400 text-sm">Preencha seus dados para receber um plano personalizado</p>
          </div>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="weight" className="text-white">
                  Peso (kg) *
                </Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="Ex: 75"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height" className="text-white">
                  Altura (cm) *
                </Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="Ex: 175"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age" className="text-white">
                  Idade *
                </Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Ex: 25"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bodyFat" className="text-white">
                  Percentual de Gordura (%) - Opcional
                </Label>
                <Input
                  id="bodyFat"
                  type="number"
                  placeholder="Ex: 20"
                  value={bodyFat}
                  onChange={(e) => setBodyFat(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Sexo *</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    onClick={() => setGender("male")}
                    variant={gender === "male" ? "default" : "outline"}
                    className={
                      gender === "male"
                        ? "bg-orange-500 hover:bg-orange-600"
                        : "bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
                    }
                  >
                    Masculino
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setGender("female")}
                    variant={gender === "female" ? "default" : "outline"}
                    className={
                      gender === "female"
                        ? "bg-orange-500 hover:bg-orange-600"
                        : "bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
                    }
                  >
                    Feminino
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <p className="text-white font-semibold">Qual é seu objetivo? *</p>
            <div className="grid grid-cols-1 gap-3">
              <Button
                type="button"
                onClick={() => setGoal("lose")}
                variant={goal === "lose" ? "default" : "outline"}
                className={`h-auto py-4 justify-start ${
                  goal === "lose"
                    ? "bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
                    : "bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800"
                }`}
              >
                <TrendingDown className="w-5 h-5 mr-3 shrink-0" />
                <div className="text-left">
                  <div className="font-semibold">Perder Gordura</div>
                  <div className="text-xs opacity-80">Definição e emagrecimento</div>
                </div>
              </Button>

              <Button
                type="button"
                onClick={() => setGoal("gain")}
                variant={goal === "gain" ? "default" : "outline"}
                className={`h-auto py-4 justify-start ${
                  goal === "gain"
                    ? "bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
                    : "bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800"
                }`}
              >
                <TrendingUp className="w-5 h-5 mr-3 shrink-0" />
                <div className="text-left">
                  <div className="font-semibold">Ganhar Massa Muscular</div>
                  <div className="text-xs opacity-80">Hipertrofia e volume</div>
                </div>
              </Button>

              <Button
                type="button"
                onClick={() => setGoal("maintain")}
                variant={goal === "maintain" ? "default" : "outline"}
                className={`h-auto py-4 justify-start ${
                  goal === "maintain"
                    ? "bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
                    : "bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800"
                }`}
              >
                <Activity className="w-5 h-5 mr-3 shrink-0" />
                <div className="text-left">
                  <div className="font-semibold">Manter Forma Atual</div>
                  <div className="text-xs opacity-80">Equilíbrio e manutenção</div>
                </div>
              </Button>
            </div>
          </div>

          <Button
            onClick={calculateDiet}
            disabled={!weight || !height || !age || !gender || !goal}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold"
          >
            Gerar Plano Personalizado
          </Button>
        </div>
      ) : (
        <div className="p-4 space-y-6">
          <Button
            onClick={() => {
              setShowForm(true)
              setDietPlan(null)
            }}
            variant="ghost"
            className="text-orange-500 hover:text-orange-400 hover:bg-zinc-900 -ml-2"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Refazer Cálculo
          </Button>

          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Seu Plano Nutricional</h2>
            <p className="text-gray-400 text-sm">Baseado em cálculos científicos personalizados</p>
          </div>

          {dietPlan && (
            <>
              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-0">
                <CardContent className="p-6">
                  <h3 className="text-white font-bold mb-4 text-lg">📊 Seus Macronutrientes Diários</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-white/80 text-xs mb-1">Calorias</p>
                      <p className="text-white text-2xl font-bold">{dietPlan.calories}</p>
                      <p className="text-white/60 text-xs">kcal/dia</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-white/80 text-xs mb-1">Proteína</p>
                      <p className="text-white text-2xl font-bold">{dietPlan.protein}g</p>
                      <p className="text-white/60 text-xs">por dia</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-white/80 text-xs mb-1">Carboidratos</p>
                      <p className="text-white text-2xl font-bold">{dietPlan.carbs}g</p>
                      <p className="text-white/60 text-xs">por dia</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-white/80 text-xs mb-1">Gorduras</p>
                      <p className="text-white text-2xl font-bold">{dietPlan.fats}g</p>
                      <p className="text-white/60 text-xs">por dia</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div>
                <h3 className="text-white font-bold mb-3 text-lg">🍽️ Plano de Refeições</h3>
                <div className="space-y-3">
                  {dietPlan.meals.map((meal, index) => (
                    <Card key={index} className="bg-zinc-900 border-zinc-800">
                      <CardContent className="p-4">
                        <div className="text-white text-sm whitespace-pre-line">{meal}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-white font-bold mb-3 text-lg">💡 Dicas Importantes</h3>
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardContent className="p-4 space-y-2">
                    {dietPlan.tips.map((tip, index) => (
                      <p key={index} className="text-white text-sm">
                        {tip}
                      </p>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-yellow-900/30 border-yellow-700/50">
                <CardContent className="p-4">
                  <p className="text-yellow-200 text-xs text-center">
                    ⚠️ Este plano é uma orientação geral baseada em fórmulas científicas. Para um plano personalizado,
                    consulte um nutricionista profissional.
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  )
}
