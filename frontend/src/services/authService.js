import { useUserStore } from '@/stores/userStore'
import { API_URL } from '../../constants.js'
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

export const makeAuthenticatedRequest = async (
  endpoint,
  data,
  router,
  token,
  methodType = 'POST',
) => {
  let response = await fetch(`${API_URL}/${endpoint}`, {
    method: methodType,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  if (response.ok) {
    return response
  } else {
    if (response.status == 401) {
      //if request was unauthorized
      const newAccessToken = await refreshAccessToken(router)
      if (newAccessToken) {
        //make another request with new access token
        let resp = await fetch(`${API_URL}/${endpoint}`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        })
        const respData = await resp.json()
        if (resp.ok) {
          console.log(`Retry Response from ${endpoint}:`, respData)
          return resp
        } else {
          console.log(`Failed to retry ${endpoint}`, respData)
          navigateToLogin(router)
        }
      }
    }
  }
}
