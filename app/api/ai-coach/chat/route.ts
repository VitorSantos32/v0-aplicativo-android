import { consumeStream, convertToModelMessages, streamText, type UIMessage } from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const prompt = convertToModelMessages(messages)

  const systemPrompt = {
    role: "system" as const,
    content: `Você é um coach pessoal de fitness experiente e motivador da Academia Mais Vida. 
    Seu papel é ajudar os alunos com:
    - Orientações sobre exercícios e técnicas corretas
    - Sugestões de treinos personalizados
    - Motivação e apoio para alcançar objetivos
    - Dicas de recuperação e prevenção de lesões
    - Conselhos sobre progressão de treino
    
    Seja sempre positivo, motivador e técnico quando necessário. Use emojis quando apropriado para tornar a conversa mais amigável.
    Mantenha suas respostas concisas e práticas.`,
  }

  const result = streamText({
    model: "openai/gpt-4o-mini",
    prompt: [systemPrompt, ...prompt],
    abortSignal: req.signal,
  })

  return result.toUIMessageStreamResponse({
    onFinish: async ({ isAborted }) => {
      if (isAborted) {
        console.log("[v0] Chat abortado pelo usuário")
      }
    },
    consumeSseStream: consumeStream,
  })
}
