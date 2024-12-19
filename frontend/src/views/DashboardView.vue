<template>
  <div class="dashboard">
    <h1>This is a Dashboard Page</h1>
    <LeafletMap />
    <h1>Hello user</h1>
    <button @click="callTestRoute">Call /test Route</button>
    <button class="border ml-10" @click="Logout">Logout</button>
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

    const Logout = async () => {
      try {
        let response = await fetch('http://localhost:5555/auth/logout', {
          method: 'POST',
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${userStore.userToken}`,
          },
        })
        console.log(response)
        if (response.status == 200) {
          userStore.setIsLoggedIn(false)
          userStore.setUserToken(null)
          userStore.setUserID(null)
          router.push('/login')
        }
      } catch (err) {
        console.log(err)
      }
    }
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
      Logout,
    }
  },
}
</script>

<style></style>
