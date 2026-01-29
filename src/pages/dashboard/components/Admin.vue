<template>
  <div>
    <h2>设备指纹识别</h2>
    <p v-if="loading">正在获取设备指纹...</p>
    <div v-else>
      <p>设备指纹: {{ fingerprint }}</p>
      <button @click="getFingerprint">重新获取</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import FingerprintJS from '@fingerprintjs/fingerprintjs'

const fingerprint = ref('')
const loading = ref(true)

const getFingerprint = async () => {
  loading.value = true
  try {
    // 加载 FingerprintJS
    const fp = await FingerprintJS.load()
    
    // 获取访问者标识
    const result = await fp.get()
    
    fingerprint.value = result.visitorId
    console.log('完整信息:', result)
  } catch (error) {
    console.error('获取设备指纹失败:', error)
  } finally {
    loading.value = false
  }
}

// 页面加载时自动获取
onMounted(() => {
  getFingerprint()
})
</script>