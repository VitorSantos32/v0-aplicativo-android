"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Download, Share, Plus, Smartphone } from "lucide-react"

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent)
    const isInStandaloneMode = window.matchMedia("(display-mode: standalone)").matches

    setIsIOS(isIOSDevice)
    setIsStandalone(isInStandaloneMode)

    // Se não está instalado, mostrar prompt após 2 segundos
    if (!isInStandaloneMode) {
      const timer = setTimeout(() => {
        setShowInstallPrompt(true)
      }, 2000)

      return () => clearTimeout(timer)
    }

    // Handler para Android/Chrome
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      setDeferredPrompt(null)
      setShowInstallPrompt(false)
    }
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    // Guardar no localStorage para não mostrar novamente por 7 dias
    localStorage.setItem("installPromptDismissed", Date.now().toString())
  }

  // Não mostrar se já está instalado ou foi dispensado recentemente
  useEffect(() => {
    const dismissed = localStorage.getItem("installPromptDismissed")
    if (dismissed) {
      const dismissedTime = Number.parseInt(dismissed)
      const sevenDays = 7 * 24 * 60 * 60 * 1000
      if (Date.now() - dismissedTime < sevenDays) {
        setShowInstallPrompt(false)
      }
    }
  }, [])

  if (!showInstallPrompt || isStandalone) return null

  if (isIOS) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-50 animate-slideIn">
        <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 rounded-2xl p-5 shadow-2xl border-2 border-orange-400/30">
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="pr-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
                <Smartphone className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Instalar Mais Vida</h3>
                <p className="text-white/80 text-xs">Acesso rápido na tela inicial</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 space-y-3">
              <p className="text-white font-semibold text-sm mb-2">Como instalar no iPhone:</p>

              <div className="flex items-start gap-3">
                <div className="bg-white/20 rounded-full p-2 mt-0.5">
                  <span className="text-white font-bold text-xs">1</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Share className="h-4 w-4 text-white" />
                    <p className="text-white text-sm font-medium">Toque no botão Compartilhar</p>
                  </div>
                  <p className="text-white/70 text-xs">Fica na parte inferior do Safari</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-white/20 rounded-full p-2 mt-0.5">
                  <span className="text-white font-bold text-xs">2</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Plus className="h-4 w-4 text-white" />
                    <p className="text-white text-sm font-medium">Adicionar à Tela de Início</p>
                  </div>
                  <p className="text-white/70 text-xs">Role para baixo e selecione esta opção</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-white/20 rounded-full p-2 mt-0.5">
                  <span className="text-white font-bold text-xs">3</span>
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium mb-1">Confirme a instalação</p>
                  <p className="text-white/70 text-xs">Toque em "Adicionar" no canto superior</p>
                </div>
              </div>
            </div>

            <p className="text-white/60 text-xs text-center mt-3">Após instalado, abra o app pela tela inicial</p>
          </div>
        </div>
      </div>
    )
  }

  // Banner para Android
  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-slideIn">
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-4 shadow-2xl border border-orange-400/20">
        <button onClick={handleDismiss} className="absolute top-2 right-2 text-white/80 hover:text-white">
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-start gap-3 pr-6">
          <div className="bg-white/20 p-2 rounded-lg">
            <Download className="h-6 w-6 text-white" />
          </div>

          <div className="flex-1">
            <h3 className="text-white font-bold text-lg mb-1">Instalar Mais Vida</h3>
            <p className="text-white/90 text-sm mb-3">
              Instale o app na tela inicial para acesso rápido e experiência completa
            </p>

            <Button onClick={handleInstallClick} className="bg-white text-orange-600 hover:bg-white/90 font-bold">
              Instalar Agora
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
