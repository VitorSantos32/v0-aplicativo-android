import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-black p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card className="border-orange-500/20 bg-zinc-900">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Obrigado por se cadastrar!</CardTitle>
              <CardDescription className="text-gray-400">Verifique seu email para confirmar</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-300 mb-4">
                Você se cadastrou com sucesso! Por favor, verifique seu email para confirmar sua conta antes de fazer
                login.
              </p>
              <Button asChild className="w-full bg-orange-500 hover:bg-orange-600">
                <Link href="/auth/login">Voltar para Login</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
