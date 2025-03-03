import { useUserStore } from '@/stores/userStore'
import { API_URL } from '../../constants.js'
export const refreshAccessToken = async (router) => {
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
    console.log('DATTTAAAA', data, data.accessToken)
    if (data.accessToken) {
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
      //if request was unauthorized
      console.log('unathorized')
      const newAccessToken = await refreshAccessToken(router)
      console.log('newwwwwowowow', newAccessToken)
      if (newAccessToken) {
        //make another request with new access token
        let resp = await fetch(`${API_URL}${endpoint}`, {
          method: 'POST',
          credentials: 'include',
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
