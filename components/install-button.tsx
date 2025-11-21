"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Smartphone, CheckCircle2 } from "lucide-react"

export function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showIOSInstructions, setShowIOSInstructions] = useState(false)

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
    }

    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(iOS)

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true)
      return
    }

    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      setDeferredPrompt(null)
      setIsInstalled(true)
    }
  }

  if (isInstalled) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <div className="flex items-center gap-3 text-green-500">
          <CheckCircle2 className="w-5 h-5" />
          <div>
            <h3 className="font-bold">App Instalado</h3>
            <p className="text-sm text-gray-400 mt-1">O Mais Vida já está instalado no seu dispositivo</p>
          </div>
        </div>
      </div>
    )
  }

  if (showIOSInstructions) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <Smartphone className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-white mb-2">Instalar no iOS</h3>
            <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
              <li>
                Toque no botão <span className="font-bold">Compartilhar</span> (quadrado com seta)
              </li>
              <li>
                Role para baixo e toque em <span className="font-bold">"Adicionar à Tela de Início"</span>
              </li>
              <li>
                Toque em <span className="font-bold">"Adicionar"</span> no canto superior direito
              </li>
            </ol>
            <Button onClick={() => setShowIOSInstructions(false)} variant="outline" className="mt-4 w-full">
              Entendi
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <div className="flex items-start gap-3">
        <div className="bg-orange-500/10 p-2 rounded-lg flex-shrink-0">
          <Download className="w-5 h-5 text-orange-500" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-white mb-1">Instalar Aplicativo</h3>
          <p className="text-sm text-gray-400 mb-4">
            Instale o Mais Vida na tela inicial para acesso rápido e experiência completa offline
          </p>

          <Button
            onClick={handleInstallClick}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
          >
            <Download className="w-4 h-4 mr-2" />
            {isIOS ? "Ver Instruções" : "Instalar Agora"}
          </Button>
        </div>
      </div>
    </div>
  )
}
