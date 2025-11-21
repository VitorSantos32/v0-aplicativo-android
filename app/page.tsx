import { redirect } from "next/navigation"

export default function HomePage() {
  // Redirecionar direto para login, deixando o middleware cuidar da autenticação
  redirect("/auth/login")
}
