"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Key, Mail } from "lucide-react"

interface ChangePasswordFormProps {
  userEmail: string
}

export function ChangePasswordForm({ userEmail }: ChangePasswordFormProps) {
  const [mode, setMode] = useState<"change" | "reset">("change")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem")
      setLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setError("A nova senha deve ter pelo menos 6 caracteres")
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()

      // Primeiro, tenta fazer login com a senha atual para validar
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: currentPassword,
      })

      if (signInError) {
        setError("Senha atual incorreta")
        setLoading(false)
        return
      }

      // Se login foi bem-sucedido, atualiza a senha
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) throw updateError

      setMessage("Senha alterada com sucesso!")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")

      setTimeout(() => {
        router.push("/profile")
      }, 2000)
    } catch (err: any) {
      setError(err.message || "Erro ao alterar senha")
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    try {
      const supabase = createClient()

      const redirectUrl = process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || window.location.origin

      const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo: `${redirectUrl}/auth/reset-password`,
      })

      if (error) throw error

      setMessage("Email de recuperação enviado! Verifique sua caixa de entrada.")
    } catch (err: any) {
      setError(err.message || "Erro ao enviar email de recuperação")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Button
          type="button"
          variant={mode === "change" ? "default" : "outline"}
          className={
            mode === "change"
              ? "flex-1 bg-orange-600 hover:bg-orange-700"
              : "flex-1 bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
          }
          onClick={() => setMode("change")}
        >
          <Key className="w-4 h-4 mr-2" />
          Alterar Senha
        </Button>
        <Button
          type="button"
          variant={mode === "reset" ? "default" : "outline"}
          className={
            mode === "reset"
              ? "flex-1 bg-orange-600 hover:bg-orange-700"
              : "flex-1 bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
          }
          onClick={() => setMode("reset")}
        >
          <Mail className="w-4 h-4 mr-2" />
          Recuperar Senha
        </Button>
      </div>

      {mode === "change" ? (
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password" className="text-white">
              Senha Atual
            </Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="bg-zinc-800 border-zinc-700 text-white"
              placeholder="Digite sua senha atual"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password" className="text-white">
              Nova Senha
            </Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="bg-zinc-800 border-zinc-700 text-white"
              placeholder="Digite sua nova senha"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-white">
              Confirmar Nova Senha
            </Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="bg-zinc-800 border-zinc-700 text-white"
              placeholder="Confirme sua nova senha"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}
          {message && <p className="text-green-400 text-sm">{message}</p>}

          <Button type="submit" disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700">
            {loading ? "Alterando..." : "Alterar Senha"}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
            <p className="text-white text-sm mb-2">Enviar link de recuperação para:</p>
            <p className="text-orange-500 font-semibold">{userEmail}</p>
          </div>

          <p className="text-gray-400 text-sm">
            Um email será enviado com instruções para criar uma nova senha. Verifique também sua caixa de spam.
          </p>

          {error && <p className="text-red-400 text-sm">{error}</p>}
          {message && <p className="text-green-400 text-sm">{message}</p>}

          <Button type="submit" disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700">
            {loading ? "Enviando..." : "Enviar Email de Recuperação"}
          </Button>
        </form>
      )}
    </div>
  )
}
