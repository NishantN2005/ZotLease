<script setup>
import { RouterLink, useRouter } from 'vue-router'
import { ref } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faUser, faLock, faArrowCircleLeft } from '@fortawesome/free-solid-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'
import { API_URL, VITE_CLIENT_ID } from '../../constants.js'
library.add(faUser, faLock, faArrowCircleLeft)

const formData = ref({
  email: '',
  password: '',
})

const router = useRouter()
const userStore = useUserStore()
const isWrongPass = ref(false)

function backToLogin() {
  router.push('/')
}

function loginWithGoogle() {
  const CLIENTID = VITE_CLIENT_ID
  const googleURI = `${API_URL}auth/google/callback`
  const SCOPE = 'email profile'
  const authURL = `https://accounts.google.com/o/oauth2/auth?client_id=${CLIENTID}&redirect_uri=${googleURI}&response_type=code&scope=${SCOPE}`
  window.location.href = authURL
}

function handleLogin() {
  try {
    fetch(`${API_URL}auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData.value),
      credentials: 'include',
    })
      .then((res) => {
        if (res.status === 400 || res.status === 403) {
          isWrongPass.value = true
          formData.value.password = ''
        }
        if (!res.ok) {
          throw new Error(`Login failed: ${res.statusText}`)
        }
        return res.json()
      })
      .then((data) => {
        userStore.setIsLoggedIn(true)
        router.push('/dashboard')
      })
      .catch((err) => {
        console.log('Error:', err.message)
      })
  } catch (err) {
    console.log(err.message)
  }
}
</script>

<template>
  <section class="bg-[url('/bluenehanced.jpeg')] min-h-screen bg-cover">
    <div
      class="flex flex-col md:flex-row items-center justify-center min-h-screen px-6 py-8 mx-auto md:h-screen lg:py-0"
    >
      <a
        href="#"
        class="flex items-center mb-6 text-2xl font-semibold text-red-600 dark:text-white"
      >
      </a>

      <div
        class="flex flex-col justify-center md:flex-row rounded-xl bg-white border border-uciblue shadow-lg shadow-uciblue/30 p-8"
      >
        <font-awesome-icon
          @click="backToLogin"
          icon="circle-arrow-left"
          class="text-2xl text-uciblue hover:text-blue-600 hover:scale-110 transition-all duration-200 cursor-pointer"
        />
        <div class="relative w-full min-h-full flex items-center justify-center">
          <img src="/favicon.png" class="w-[620px] h-92 pr-10" alt="Petr" />
        </div>
        <!-- Vertical divider for desktop -->
        <div class="hidden md:block w-px bg-uciblue mx-6"></div>

        <!-- Horizontal divider for mobile -->
        <div class="md:hidden w-full border-t my-6 border-uciblue"></div>
        <div class="mr-4"></div>
        <div class="w-full h-full py-8 px-5 rounded-xl">
          <h1 class="text-3xl font-bold mb-2 leading-tight tracking-tight text-black md:text-3xl">
            Sign In
          </h1>
          <form class="" @submit.prevent="handleLogin">
            <div v-if="isWrongPass">
              <div>
                <div class="flex items-center mt-4">
                  <h2 class="bg-red-200 text-black block w-full p-2.5 outline-none rounded-md">
                    Invalid email or password. Please try again.
                  </h2>
                </div>
              </div>
            </div>
            <div>
              <div class="flex items-center border-b border-gray-400 mt-10">
                <font-awesome-icon icon="user" class="mr-2" />
                <input
                  v-model="formData.email"
                  type="email"
                  name="email"
                  id="email"
                  class="bg-transparent text-gray-900 block w-full p-2.5 outline-none focus:border-blue-500 focus:ring-0"
                  placeholder="Email Address"
                  required
                />
              </div>
            </div>
            <div class="mb-8 mt-6">
              <div class="flex items-center border-b border-gray-400">
                <font-awesome-icon icon="lock" class="mr-2" />
                <input
                  v-model="formData.password"
                  type="password"
                  name="password"
                  id="password"
                  placeholder="Password"
                  class="bg-transparent text-gray-900 block w-full p-2.5 outline-none focus:border-blue-500 focus:ring-0"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              class="w-full mb-2 text-white bg-[#25569a] hover:bg-[#1f4e7c] focus:ring-2 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:focus:ring-white"
            >
              Sign In
            </button>
            <p class="text-sm font-light text-gray-500 dark:text-gray-400">
              Don't have an account yet?

              <RouterLink class="font-medium text-uciblue hover:underline" to="/signup">
                Sign Up
              </RouterLink>
            </p>
          </form>
          <div class="flex items-center my-4">
            <div class="flex-1 border-t border-gray-300"></div>
            <span class="mx-4 text-md text-gray-500">or</span>
            <div class="flex-1 border-t border-gray-300"></div>
          </div>
          <button
            @click="loginWithGoogle"
            class="w-full mt-4 flex items-center justify-center bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 focus:ring-2 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-3.5"
          >
            <img src="/googlelogo.webp" alt="Google" class="w-5 h-5 mr-2" />
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
