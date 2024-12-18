import { useUserStore } from '@/stores/userStore'

export const refreshAccessToken = async (router) => {
  const userStore = useUserStore()

  try {
    const refreshResponse = await fetch('http://localhost:5555/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    })

    if (refreshResponse.status === 401) {
      navigateToLogin(router)
      return null
    }

    const data = await refreshResponse.json()

    // If access token is returned, store it
    if (data.accessToken) {
      userStore.setUserToken(data.accessToken)
      console.log('New access token:', data.accessToken)
      return data.accessToken
    } else {
      console.log('Token could not be refreshed')
      navigateToLogin(router)
      return null
    }
  } catch (error) {
    console.error('Error refreshing token:', error)
    navigateToLogin(router)
    return null
  }
}

const navigateToLogin = (router) => {
  router.push('/login')
}
