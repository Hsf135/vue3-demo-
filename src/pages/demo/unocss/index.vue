<script setup lang="ts">
import { computed, ref } from "vue"
import { callGemini, callGeminiStream } from "@/http/google-ai"

const prompt = ref("")
const response = ref("")
const streamResponse = ref("")
const loading = ref(false)
const streamLoading = ref(false)
const selectedModel = ref("gemini-1.5-flash")

const hasApiKey = computed(() => {
  return !!import.meta.env.VITE_GOOGLE_API_KEY
})

// 普通调用
async function askGemini() {
  if (!prompt.value.trim()) {
    ElMessage.warning("请输入问题")
    return
  }

  if (!hasApiKey.value) {
    ElMessage.error("请先配置 Google API Key")
    return
  }

  loading.value = true
  response.value = ""
  streamResponse.value = ""

  try {
    response.value = await callGemini(prompt.value, selectedModel.value)
    ElMessage.success("获取成功")
  } catch (error: any) {
    ElMessage.error(error?.message || "调用失败，请检查 API Key 是否正确")
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 流式调用
async function askGeminiStream() {
  if (!prompt.value.trim()) {
    ElMessage.warning("请输入问题")
    return
  }

  if (!hasApiKey.value) {
    ElMessage.error("请先配置 Google API Key")
    return
  }

  streamLoading.value = true
  response.value = ""
  streamResponse.value = ""

  try {
    const stream = callGeminiStream(prompt.value, selectedModel.value)

    for await (const chunk of stream) {
      streamResponse.value += chunk
    }

    ElMessage.success("流式输出完成")
  } catch (error: any) {
    ElMessage.error(error?.message || "调用失败，请检查 API Key 是否正确")
    console.error(error)
  } finally {
    streamLoading.value = false
  }
}

// 清空
function clearAll() {
  prompt.value = ""
  response.value = ""
  streamResponse.value = ""
}

// 复制回答
async function copyResponse() {
  const text = streamResponse.value || response.value
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success("已复制到剪贴板")
  } catch {
    ElMessage.error("复制失败")
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
    <div class="max-w-4xl mx-auto">
      <!-- 标题区域 -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-800 mb-2">
          🤖 Google Gemini AI
        </h1>
        <p class="text-gray-600">
          基于 Google Gemini 的智能对话助手
        </p>
      </div>

      <!-- 主卡片 -->
      <div class="bg-white rounded-2xl shadow-xl p-6 mb-6">
        <!-- 模型选择 -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            选择模型
          </label>
          <select
            v-model="selectedModel"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          >
            <option value="gemini-1.5-flash">
              Gemini 1.5 Flash (推荐)
            </option>
            <option value="gemini-1.5-pro">
              Gemini 1.5 Pro
            </option>
            <option value="gemini-pro">
              Gemini Pro
            </option>
          </select>
        </div>

        <!-- 输入区域 -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            输入你的问题
          </label>
          <textarea
            v-model="prompt"
            placeholder="例如：用简单的语言解释什么是量子计算..."
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
            rows="4"
            @keydown.ctrl.enter="askGemini"
          />
          <div class="text-xs text-gray-500 mt-1">
            提示：按 Ctrl + Enter 快速发送
          </div>
        </div>

        <!-- 按钮组 -->
        <div class="flex gap-3">
          <button
            @click="askGemini"
            :disabled="loading || !prompt.trim()"
            class="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2"
          >
            <span v-if="loading" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>{{ loading ? '思考中...' : '发送提问' }}</span>
          </button>

          <button
            @click="askGeminiStream"
            :disabled="loading || !prompt.trim()"
            class="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2"
          >
            <span v-if="streamLoading" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>{{ streamLoading ? '流式输出中...' : '流式对话' }}</span>
          </button>

          <button
            @click="clearAll"
            class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded-lg transition duration-200"
          >
            清空
          </button>
        </div>
      </div>

      <!-- 响应区域 -->
      <div v-if="response || streamResponse" class="bg-white rounded-2xl shadow-xl p-6">
        <div class="flex items-center gap-2 mb-4">
          <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <span class="text-white text-sm">AI</span>
          </div>
          <h3 class="text-lg font-semibold text-gray-800">
            回答
          </h3>
        </div>

        <div class="prose max-w-none">
          <div class="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {{ streamResponse || response }}
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex gap-2 mt-4 pt-4 border-t border-gray-200">
          <button
            @click="copyResponse"
            class="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            📋 复制
          </button>
        </div>
      </div>

      <!-- API Key 提示 -->
      <div v-if="!hasApiKey" class="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div class="flex gap-3">
          <span class="text-2xl">⚠️</span>
          <div>
            <h4 class="font-semibold text-yellow-800 mb-1">
              需要配置 API Key
            </h4>
            <p class="text-sm text-yellow-700 mb-2">
              请在项目根目录的 <code class="bg-yellow-100 px-1 rounded">.env</code> 文件中添加：
            </p>
            <code class="block bg-yellow-100 text-yellow-900 px-3 py-2 rounded text-sm">
              VITE_GOOGLE_API_KEY = your_api_key_here
            </code>
            <p class="text-sm text-yellow-700 mt-2">
              获取 API Key：
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                class="text-blue-600 hover:underline"
              >
                Google AI Studio
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
