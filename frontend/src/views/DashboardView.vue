<template>
  <div class="dashboard">
    <h1>This is a Dashboard Page</h1>
    <LeafletMap />

    <button @click="callTestRoute">Call /test Route</button>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'
import LeafletMap from '@/components/icons/LeafletMap.vue'

export default {
  name: 'DashboardView',
  components: {
    LeafletMap,
  },
  setup() {
    const router = useRouter()

    const callTestRoute = async () => {
      try {
        const response = await fetch('http://localhost:5555/test', {
          method: 'POST',
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          console.log('Response from /test:', data)
        } else {
          const errorData = await response.json()
          console.log('Error:', errorData.message)
          navigateToLogin()
        }
      } catch (error) {
        console.log('Failed to call /test route:', error)
        navigateToLogin()
      }
    }

    const navigateToLogin = () => {
      router.push('/login')
    }

    return {
      callTestRoute,
      navigateToLogin,
    }
  },
}
</script>

<style></style>
