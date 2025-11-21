import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const image = formData.get("image") as File
    const caption = formData.get("caption") as string

    if (!image) {
      return NextResponse.json({ error: "Image required" }, { status: 400 })
    }

    // Upload image to Supabase Storage
    const fileExt = image.name.split(".").pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`
    const filePath = `posts/${fileName}`

    const imageBuffer = await image.arrayBuffer()
    const { error: uploadError } = await supabase.storage.from("images").upload(filePath, imageBuffer, {
      contentType: image.type,
      upsert: false,
    })

    if (uploadError) {
      console.error("Upload error:", uploadError.message)
      return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 })
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("images").getPublicUrl(filePath)

    // Create post
    const { data: post, error: postError } = await supabase
      .from("posts")
      .insert({
        user_id: user.id,
        image_url: publicUrl,
        caption: caption || null,
      })
      .select()
      .single()

    if (postError) throw postError

    return NextResponse.json({ success: true, post })
  } catch (error) {
    console.error("Error creating post:", error)
    return NextResponse.json({ error: "Error creating post" }, { status: 500 })
  }
}
