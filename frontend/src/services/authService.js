import { useUserStore } from '@/stores/userStore'
import { API_URL } from '../../constants.js'
export const refreshAccessToken = async (router) => {
  const userStore = useUserStore()

  try {
    const refreshResponse = await fetch(`${API_URL}auth/refresh`, {
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
      return // already stored in cookie
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

export const makeAuthenticatedRequest = async (endpoint, data, router, methodType = 'POST') => {
  let response = await fetch(`${API_URL}${endpoint}`, {
    method: methodType,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (response.ok) {
    return response
  } else {
    if (response.status == 401) {
      // If the request was unauthorized
      const newAccessToken = await refreshAccessToken(router)
      if (newAccessToken) {
        // Make another request with the new access token (token is managed in the cookie)
        let resp = await fetch(`${API_URL}${endpoint}`, {
          method: 'POST',
          credentials: 'include', // Token is still handled via cookies
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })

        if (resp.ok) {
          console.log(`Retry Response from ${endpoint}:`, resp)
          return resp
        } else {
          console.log(`Failed to retry ${endpoint}`, resp)
          navigateToLogin(router)
        }
      }
    }
  }
}
