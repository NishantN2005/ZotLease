<script setup>
import { RouterLink, useRouter } from 'vue-router'
import { ref } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faUser, faLock, faArrowCircleLeft } from '@fortawesome/free-solid-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'
import { API_URL } from '../../constants.js'
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
function handleLogin() {
  try {
    console.log(formData.value)
    console.log(API_URL)
    fetch(`${API_URL}auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData.value),
      credentials: 'include',
    })
      .then((res) => {
        console.log('stats', res.status)
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
        console.log('Login successful:', data)
        userStore.setUserToken(data.accessToken)
        userStore.setUserID(data.id)
        userStore.setFirstname(data.fname)
        userStore.setLastname(data.lname)
        userStore.setEmail(data.email)
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
  <section class="bg-neutral-900 min-h-screen">
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
          class="text-xl text-uciblue hover:cursor-pointer"
        />
        <div class="w-full h-full">
          <img src="/favicon.png" class="w-[500px] h-92 pt-5 pr-10" alt="Petr" />
        </div>
        <div class="border-b border-uciblue md:border-l md:border-uciblue mr-4"></div>
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
              <div class="flex items-center border-b border-gray-400 mt-7">
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
            <div class="mb-4 md:mb-10 lg:mb-12 mt-7">
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
        </div>
      </div>
    </div>
  </section>
</template>
