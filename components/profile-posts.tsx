"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ProfilePostsProps {
  posts: any[]
  currentUserId: string
}

export function ProfilePosts({ posts, currentUserId }: ProfilePostsProps) {
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null)
  const [postToDelete, setPostToDelete] = useState<string | null>(null)
  const router = useRouter()

  const handleDelete = async (postId: string) => {
    setDeletingPostId(postId)

    try {
      const response = await fetch("/api/posts/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error("Erro ao deletar post:", error)
    } finally {
      setDeletingPostId(null)
      setPostToDelete(null)
    }
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-sm">Nenhuma publicação ainda</p>
        <Link href="/create">
          <Button className="mt-4 bg-orange-500 hover:bg-orange-600 text-white">Criar primeira publicação</Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-1">
        {posts.map((post) => (
          <div key={post.id} className="relative aspect-square group">
            <Link href={`/posts/${post.id}`}>
              <img
                src={post.image_url || "/placeholder.svg"}
                alt="Post"
                className="w-full h-full object-cover bg-zinc-800"
              />
            </Link>
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 bg-red-500/90 hover:bg-red-600"
              onClick={() => setPostToDelete(post.id)}
              disabled={deletingPostId === post.id}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      <AlertDialog open={!!postToDelete} onOpenChange={() => setPostToDelete(null)}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Deletar publicação?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Esta ação não pode ser desfeita. A publicação será permanentemente removida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 text-white hover:bg-zinc-700 border-zinc-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => postToDelete && handleDelete(postToDelete)}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
