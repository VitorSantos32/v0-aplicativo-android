"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Camera, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface ProfilePictureUploadProps {
  currentAvatarUrl?: string | null
  userId: string
}

export function ProfilePictureUpload({ currentAvatarUrl, userId }: ProfilePictureUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl)
  const router = useRouter()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      const supabase = createClient()

      // Upload to storage
      const fileExt = file.name.split(".").pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage.from("images").upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      })

      if (uploadError) throw uploadError

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("images").getPublicUrl(filePath)

      // Update profile
      const { error: updateError } = await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", userId)

      if (updateError) throw updateError

      setAvatarUrl(publicUrl)
      router.refresh()
    } catch (error) {
      console.error("Error uploading avatar:", error)
      alert("Erro ao fazer upload da foto")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="relative">
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-4xl overflow-hidden">
        {avatarUrl ? (
          <img src={avatarUrl || "/placeholder.svg"} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <span>👤</span>
        )}
      </div>

      <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 cursor-pointer">
        <Button
          type="button"
          size="icon"
          className="rounded-full w-8 h-8 bg-orange-500 hover:bg-orange-600 shadow-lg"
          disabled={uploading}
          onClick={() => document.getElementById("avatar-upload")?.click()}
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
        </Button>
      </label>

      <input
        id="avatar-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={uploading}
      />
    </div>
  )
}
