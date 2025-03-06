<template>
  <div>
    <LoadingScreen v-if="isLoading" />
    <p v-else-if="error">{{ error }}</p>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import LoadingScreen from '@/components/LoadingScreen.vue'

export default {
  // we can get rid of this component
  name: 'OathLoadingView',
  components: {
    LoadingScreen, // Register the LoadingScreen component
  },
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    const isLoading = ref(true)
    const error = ref(null)

    const handleOAuthCallback = async () => {
      // Extract the code from the URL
      const queryParams = new URLSearchParams(window.location.search)
      const code = queryParams.get('code')
      console.log('ieniocowsevbuweiwevevwevweedewde')

      if (code) {
        try {
          // Send the code to backend for processing
          const userInfoEndpoint = `${import.meta.env.VITE_API_URL}auth/google/callback`
          const response = await fetch(userInfoEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
          })

          if (!response.ok) {
            throw new Error('Authentication failed')
          }

          // Redirect to the dashboard
          router.push('/dashboard')
        } catch (err) {
          console.error('Error:', err)
          error.value = 'Authentication failed. Please try again.'
          router.push('/login')
        } finally {
          isLoading.value = false
        }
      } else {
        console.error('No code found in the URL')
        error.value = 'No authorization code found. Please try again.'
        router.push('/login')
      }
    }

    onMounted(async () => {
      await handleOAuthCallback()
    })

    return {
      isLoading,
      error,
    }
  },
}
</script>

<style></style>
