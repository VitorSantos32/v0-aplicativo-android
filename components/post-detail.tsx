"use client"

import type React from "react"

import { useState } from "react"
import { Heart, Send, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface PostDetailProps {
  post: any
  isLiked: boolean
  currentUserId: string
}

export function PostDetail({ post, isLiked: initialIsLiked, currentUserId }: PostDetailProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [likesCount, setLikesCount] = useState(post.likes?.[0]?.count || 0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleLike = async () => {
    const newIsLiked = !isLiked
    setIsLiked(newIsLiked)
    setLikesCount((prev) => (newIsLiked ? prev + 1 : prev - 1))

    try {
      await fetch("/api/posts/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id, isLiked: newIsLiked }),
      })
    } catch (error) {
      setIsLiked(!newIsLiked)
      setLikesCount((prev) => (newIsLiked ? prev - 1 : prev + 1))
    }
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim() || isSubmitting) return

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/posts/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id, content: comment }),
      })

      if (response.ok) {
        setComment("")
        router.refresh()
      }
    } catch (error) {
      console.error("Error posting comment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await fetch("/api/comments/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId }),
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error("Error deleting comment:", error)
    }
  }

  const profile = post.profiles
  const comments = post.comments || []
  const isPostOwner = post.user_id === currentUserId

  return (
    <div className="bg-zinc-900 page-transition">
      {/* Image */}
      <div className="relative aspect-square bg-zinc-800">
        <img src={post.image_url || "/placeholder.svg"} alt="Post" className="w-full h-full object-cover" />
      </div>

      {/* Post Info */}
      <div className="p-4 space-y-4">
        {/* User */}
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 border-2 border-orange-500">
            <AvatarImage src={profile?.avatar_url || "/placeholder.svg?height=40&width=40"} />
            <AvatarFallback className="bg-orange-500 text-white">
              {profile?.display_name?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-white font-semibold text-sm">{profile?.display_name || "Usuário"}</p>
            <p className="text-gray-400 text-xs">{new Date(post.created_at).toLocaleDateString("pt-BR")}</p>
          </div>
        </div>

        {/* Like button */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className={cn("hover:scale-110 transition-transform", isLiked ? "text-orange-500" : "text-white")}
            onClick={handleLike}
          >
            <Heart className={cn("w-6 h-6", isLiked && "fill-orange-500")} />
          </Button>
          <p className="text-white font-semibold text-sm">
            {likesCount} {likesCount === 1 ? "curtida" : "curtidas"}
          </p>
        </div>

        {/* Caption */}
        {post.caption && (
          <p className="text-white text-sm">
            <span className="font-semibold mr-2">{profile?.display_name}</span>
            {post.caption}
          </p>
        )}

        {/* Comments */}
        <div className="space-y-3 border-t border-zinc-800 pt-4">
          <h3 className="text-white font-semibold">Comentários</h3>

          {comments.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {comments.map((comment: any) => {
                const canDelete = isPostOwner || comment.user_id === currentUserId

                return (
                  <div key={comment.id} className="flex gap-3 slide-in">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={comment.profiles?.avatar_url || "/placeholder.svg?height=32&width=32"} />
                      <AvatarFallback className="bg-orange-500 text-white text-xs">
                        {comment.profiles?.display_name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-white text-sm">
                        <span className="font-semibold mr-2">{comment.profiles?.display_name}</span>
                        {comment.content}
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        {new Date(comment.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    {canDelete && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600 hover:bg-red-500/10 h-8 w-8"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">Deletar comentário</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-400">
                              Tem certeza que deseja deletar este comentário? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-zinc-800 text-white border-zinc-700">
                              Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteComment(comment.id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Deletar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Seja o primeiro a comentar</p>
          )}
        </div>

        {/* Comment Form */}
        <form onSubmit={handleComment} className="flex gap-2 border-t border-zinc-800 pt-4">
          <Input
            placeholder="Adicione um comentário..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-500"
            maxLength={500}
          />
          <Button
            type="submit"
            size="icon"
            className="bg-orange-500 hover:bg-orange-600"
            disabled={!comment.trim() || isSubmitting}
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  )
}
