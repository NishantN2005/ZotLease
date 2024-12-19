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
import { useUserStore } from '@/stores/userStore'
import { refreshAccessToken } from '@/services/authService'

export default {
  name: 'DashboardView',
  components: {
    LeafletMap,
  },
  setup() {
    const router = useRouter()
    const userStore = useUserStore()

    const callTestRoute = async () => {
      try {
        let response = await fetch('http://localhost:5555/user/test', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${userStore.userToken}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          console.log('Response from /test:', data)
        } else {
          const errorData = await response.json()
          console.log('Error:', errorData.message)

          // if 401 unauthorized call refresh token
          if (response.status === 401) {
            const newAccessToken = await refreshAccessToken(router)
            if (newAccessToken) {
              // call api again using new access token
              response = await fetch('http://localhost:5555/user/test', {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${newAccessToken}`,
                },
              })

              if (response.ok) {
                const data = await response.json()
                console.log('Retry Response from /test:', data)
              } else {
                console.log('Failed to retry /test:', await response.json())
                navigateToLogin()
              }
            }
          }
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
