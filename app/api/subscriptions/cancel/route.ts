import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { subscriptionId } = await request.json()

    if (!subscriptionId) {
      return NextResponse.json({ error: "ID da assinatura é obrigatório" }, { status: 400 })
    }

    // Verify subscription belongs to user
    const { data: subscription, error: verifyError } = await supabase
      .from("subscriptions")
      .select("id, user_id")
      .eq("id", subscriptionId)
      .eq("user_id", user.id)
      .single()

    if (verifyError || !subscription) {
      return NextResponse.json({ error: "Assinatura não encontrada" }, { status: 404 })
    }

    // Update subscription status to expired
    const { error: updateError } = await supabase
      .from("subscriptions")
      .update({ status: "expired" })
      .eq("id", subscriptionId)
      .eq("user_id", user.id)

    if (updateError) {
      console.error("Error canceling subscription:", updateError)
      return NextResponse.json({ error: "Erro ao cancelar assinatura" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in cancel subscription:", error)
    return NextResponse.json({ error: "Erro ao processar cancelamento" }, { status: 500 })
  }
}
