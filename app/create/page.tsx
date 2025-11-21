"use client"

import type React from "react"

import { useState, useRef } from "react"
import { TopBar } from "@/components/top-bar"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Upload, X, Camera } from "lucide-react"
import { useRouter } from "next/navigation"

export default function CreatePage() {
  const [caption, setCaption] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const router = useRouter()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Imagem muito grande. Máximo 5MB.")
        return
      }
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      setError(null)
    }
  }

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsCameraOpen(true)
        setError(null)
      }
    } catch (err) {
      setError("Não foi possível acessar a câmera")
    }
  }

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas")
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0)
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "photo.jpg", { type: "image/jpeg" })
            setImageFile(file)
            setImagePreview(canvas.toDataURL("image/jpeg"))
            closeCamera()
          }
        }, "image/jpeg")
      }
    }
  }

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setIsCameraOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!imageFile) {
      setError("Selecione uma imagem")
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("image", imageFile)
      formData.append("caption", caption)

      const response = await fetch("/api/posts/create", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Erro ao criar post")
      }

      router.push("/feed")
      router.refresh()
    } catch (err) {
      setError("Erro ao criar post. Tente novamente.")
    } finally {
      setIsUploading(false)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  return (
    <div className="min-h-screen bg-black pb-20">
      <TopBar title="Criar Post" showNotifications={false} />

      <main className="pt-16 max-w-lg mx-auto">
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {isCameraOpen ? (
            <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                <Button type="button" variant="destructive" onClick={closeCamera} className="rounded-full">
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={capturePhoto}
                  className="bg-orange-500 hover:bg-orange-600 rounded-full px-8"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Capturar
                </Button>
              </div>
            </div>
          ) : imagePreview ? (
            <div className="relative aspect-square bg-zinc-900 rounded-lg overflow-hidden">
              <img src={imagePreview || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={removeImage}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col items-center justify-center aspect-square bg-zinc-900 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer hover:border-orange-500 transition-colors">
                <Upload className="w-10 h-10 text-gray-400 mb-2" />
                <span className="text-gray-400 text-sm text-center px-2">Escolher da galeria</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>

              <button
                type="button"
                onClick={openCamera}
                className="flex flex-col items-center justify-center aspect-square bg-zinc-900 border-2 border-dashed border-zinc-700 rounded-lg hover:border-orange-500 transition-colors"
              >
                <Camera className="w-10 h-10 text-gray-400 mb-2" />
                <span className="text-gray-400 text-sm text-center px-2">Tirar foto</span>
              </button>
            </div>
          )}

          {/* Caption */}
          <div className="space-y-2">
            <label className="text-white text-sm font-medium">Legenda</label>
            <Textarea
              placeholder="Compartilhe sua conquista..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="bg-zinc-900 border-zinc-700 text-white placeholder:text-gray-500 min-h-24 resize-none"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 text-right">{caption.length}/500</p>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold"
            disabled={isUploading || !imageFile}
          >
            {isUploading ? "Publicando..." : "Publicar"}
          </Button>
        </form>
      </main>

      <BottomNav />
    </div>
  )
}
