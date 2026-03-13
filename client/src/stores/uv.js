import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUVStore = defineStore('uv', () => {
  const uvIndex = ref(null)
  const location = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const lastUpdated = ref(null)

  function setUVData(data) {
    uvIndex.value = data.uvIndex
    location.value = data.location
    lastUpdated.value = new Date().toISOString()
    error.value = null
  }

  function setLoading(val) {
    loading.value = val
  }

  function setError(msg) {
    error.value = msg
    loading.value = false
  }

  return { uvIndex, location, loading, error, lastUpdated, setUVData, setLoading, setError }
})
