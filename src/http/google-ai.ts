import { GoogleGenerativeAI } from "@google/generative-ai"

// 初始化 Google AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY)

/**
 * 调用 Gemini 模型
 * @param prompt 提示词
 * @param model 模型名称，默认 gemini-3.0-flash
 */
export async function callGemini(prompt: string, model = "gemini-3-flash-preview") {
  try {
    const geminiModel = genAI.getGenerativeModel({ model })
    const result = await geminiModel.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error("Google AI 调用失败:", error)
    throw error
  }
}

/**
 * 流式调用 Gemini 模型
 */
export async function* callGeminiStream(prompt: string, model = "gemini-3-flash-preview") {
  try {
    const geminiModel = genAI.getGenerativeModel({ model })
    const result = await geminiModel.generateContentStream(prompt)

    for await (const chunk of result.stream) {
      yield chunk.text()
    }
  } catch (error) {
    console.error("Google AI 流式调用失败:", error)
    throw error
  }
}
