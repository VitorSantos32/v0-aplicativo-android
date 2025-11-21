"use client"

import { TopBar } from "@/components/top-bar"
import { BottomNav } from "@/components/bottom-nav"
import { NutritionCalculator } from "@/components/nutrition-calculator"

export default function AICoachPage() {
  return (
    <div className="min-h-screen bg-black pb-20">
      <TopBar title="Coach Nutricional" showNotifications={false} />

      <main className="pt-16 max-w-lg mx-auto h-[calc(100vh-8rem)]">
        <NutritionCalculator />
      </main>

      <BottomNav />
    </div>
  )
}
