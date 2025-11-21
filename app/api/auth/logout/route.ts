import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST() {
  const supabase = await createClient()
  await supabase.auth.signOut()

  const cookieStore = await cookies()
  cookieStore.delete("sb-access-token")
  cookieStore.delete("sb-refresh-token")

  return NextResponse.redirect(new URL("/auth/login", process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:3000"))
}
