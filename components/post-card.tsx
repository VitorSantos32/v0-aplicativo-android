"use client"

import { useState } from "react"
import { Heart, MessageCircle, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface PostCardProps {
  post: any
  isLiked: boolean
  currentUserId: string
}

export function PostCard({ post, isLiked: initialIsLiked, currentUserId }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [likesCount, setLikesCount] = useState(post.likes?.[0]?.count || 0)
  const [isLiking, setIsLiking] = useState(false)
  const router = useRouter()

  const handleLike = async () => {
    if (isLiking) return

    setIsLiking(true)
    const newIsLiked = !isLiked

    // Optimistic update
    setIsLiked(newIsLiked)
    setLikesCount((prev) => (newIsLiked ? prev + 1 : prev - 1))

    try {
      const response = await fetch("/api/posts/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id, isLiked: newIsLiked }),
      })

      if (!response.ok) {
        // Revert on error
        setIsLiked(!newIsLiked)
        setLikesCount((prev) => (newIsLiked ? prev - 1 : prev + 1))
      }
    } catch (error) {
      // Revert on error
      setIsLiked(!newIsLiked)
      setLikesCount((prev) => (newIsLiked ? prev - 1 : prev + 1))
    } finally {
      setIsLiking(false)
    }
  }

  const profile = post.profiles

  return (
    <div className="bg-zinc-900 border-b border-zinc-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 border-2 border-orange-500">
            <AvatarImage src={profile?.avatar_url || "/placeholder.svg?height=40&width=40"} />
            <AvatarFallback className="bg-orange-500 text-white">
              {profile?.display_name?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-white font-semibold text-sm">{profile?.display_name || "Usuário"}</p>
            <p className="text-gray-400 text-xs">
              {new Date(post.created_at).toLocaleDateString("pt-BR", {
                day: "numeric",
                month: "short",
              })}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
          <MoreVertical className="w-5 h-5" />
        </Button>
      </div>

      {/* Image */}
      <div className="relative aspect-square bg-zinc-800">
        <img src={post.image_url || "/placeholder.svg"} alt="Post" className="w-full h-full object-cover" />
      </div>

      {/* Actions */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className={cn("hover:scale-110 transition-transform", isLiked ? "text-orange-500" : "text-white")}
            onClick={handleLike}
            disabled={isLiking}
          >
            <Heart className={cn("w-6 h-6", isLiked && "fill-orange-500")} />
          </Button>
          <Link href={`/posts/${post.id}`}>
            <Button variant="ghost" size="icon" className="text-white hover:text-orange-500">
              <MessageCircle className="w-6 h-6" />
            </Button>
          </Link>
        </div>

        {/* Likes count */}
        {likesCount > 0 && (
          <p className="text-white font-semibold text-sm">
            {likesCount} {likesCount === 1 ? "curtida" : "curtidas"}
          </p>
        )}

        {/* Caption */}
        {post.caption && (
          <p className="text-white text-sm">
            <span className="font-semibold mr-2">{profile?.display_name}</span>
            {post.caption}
          </p>
        )}

        {/* Comments count */}
        {post.comments?.[0]?.count > 0 && (
          <Link href={`/posts/${post.id}`}>
            <p className="text-gray-400 text-sm hover:text-white cursor-pointer">
              Ver {post.comments[0].count} {post.comments[0].count === 1 ? "comentário" : "comentários"}
            </p>
          </Link>
        )}
      </div>
    </div>
  )
}
