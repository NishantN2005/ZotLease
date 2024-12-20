<script setup>
import { RouterLink, useRouter } from 'vue-router'
import { ref } from 'vue'
import { useUserStore } from '@/stores/userStore'

const formData = ref({
  email: '',
  password: '',
})

const router = useRouter()
const userStore = useUserStore()

function handleLogin() {
  try {
    console.log(formData.value)

    fetch('http://localhost:5555/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData.value),
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Login failed: ${res.statusText}`)
        }
        return res.json()
      })
      .then((data) => {
        console.log('Login successful:', data)
        userStore.setUserToken(data.accessToken)
        userStore.setUserID(data.id)
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
  <section class="bg-cover bg-center bg-[url('yellowuci.jpg')] min-h-screen">
    <div
      class="flex flex-col items-center justify-center min-h-screen px-6 py-8 mx-auto md:h-screen lg:py-0"
    >
      <a
        href="#"
        class="flex items-center mb-6 text-2xl font-semibold text-red-600 dark:text-white"
      >
      </a>
      <div
        class="flex justify-center rounded-xl bg-white border border-uciblue shadow-lg shadow-uciblue/30 p-6"
      >
        <div class="w-full h-full">
          <video autoplay muted playsinline class="rounded-xl">
            <source src="/ZotLease.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <div class="border-l border-uciblue mr-4"></div>
        <div class="w-full h-full py-8 px-5 rounded-xl">
          <h1 class="text-3xl font-bold leading-tight tracking-tight text-black md:text-3xl">
            Sign In
          </h1>
          <form class="" @submit.prevent="handleLogin">
            <div>
              <label
                for="email"
                class="block mb-2 text-sm font-medium text-gray-300 dark:text-white"
              >
                Email
              </label>
              <input
                v-model="formData.email"
                type="email"
                name="email"
                id="email"
                class="bg-white/80 text-gray-900 block w-full p-2.5 border-b border-gray-400 focus:border-blue-500 outline-none transition duration-300"
                placeholder="example@gmail.com"
                required
              />
            </div>
            <div class="mb-4 md:mb-12 lg:mb-14">
              <label
                for="password"
                class="block mb-2 text-sm font-medium text-gray-300 dark:text-white"
              >
                Password
              </label>
              <input
                v-model="formData.password"
                type="password"
                name="password"
                id="password"
                placeholder="••••••••"
                class="bg-white/80 text-gray-900 block w-full p-2.5 border-b border-gray-400 focus:border-blue-500 outline-none transition duration-300"
                required
              />
            </div>
            <button
              type="submit"
              class="w-full text-white bg-[#25569a] hover:bg-[#1f4e7c] focus:ring-2 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:focus:ring-white"
            >
              Log In
            </button>
            <p class="text-sm font-light text-gray-500 dark:text-gray-400">
              Don't have an account yet?

              <RouterLink class="font-medium text-uciblue hover:underline" to="/signup">
                Sign Up
              </RouterLink>
            </p>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>
