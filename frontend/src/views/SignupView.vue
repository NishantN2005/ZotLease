<script setup>
import { ref } from 'vue'
import { useUserStore } from '../stores/userStore.js'
import { RouterLink, useRouter } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faArrowCircleLeft } from '@fortawesome/free-solid-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'
import { API_URL, VITE_CLIENT_ID } from '../../constants.js'
library.add(faArrowCircleLeft)

const router = useRouter()

const userStore = useUserStore()

const formData = ref({
  fname: '',
  lname: '',
  email: '',
  password: '',
})

function backToLogin() {
  router.push('/')
}

function loginWithGoogle() {
  const CLIENTID = VITE_CLIENT_ID
  const googleURI = `${API_URL}auth/google/callback`
  const SCOPE = 'email profile'
  console.log('All env vars:', import.meta.env)
  console.log(CLIENTID, googleURI, SCOPE)
  const authURL = `https://accounts.google.com/o/oauth2/auth?client_id=${CLIENTID}&redirect_uri=${googleURI}&response_type=code&scope=${SCOPE}`
  window.location.href = authURL
}

function handleSignup() {
  console.log(formData.value)
  if (
    formData.value.fname == '' ||
    formData.value.lname == '' ||
    formData.value.email == '' ||
    formData.value.password == ''
  ) {
    //TODO: display error message or something
    console.log('One of the values is empty')
    return
  }
  // post user details
  try {
    console.log(formData.value)
    fetch(`${API_URL}auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData.value),
      credentials: 'include',
    }).then(async (res) => {
      console.log(res.status)
      if (res.status == 200) {
        //updating state of user to logged in
        userStore.setIsLoggedIn(true)
        router.push('/dashboard')
      } else {
        console.log('ERROR status was not 200: ', res.status)
      }
    })
  } catch (err) {
    console.log('ERROR: ', err)
  }
}
</script>

<template>
  <section class="bg-[url('/bluenehanced.jpeg')] min-h-screen overflow-hidden bg-cover">
    <div
      class="flex flex-col md:flex-row items-center justify-center min-h-full px-6 py-8 mx-auto md:h-screen lg:py-0 w-full max-w-full"
    >
      <a
        href="#"
        class="flex items-center mb-6 text-2xl font-semibold text-red-600 dark:text-white"
      >
      </a>
      <div
        class="flex flex-col justify-center md:flex-row rounded-xl bg-white border border-uciblue shadow-lg shadow-uciblue/30 p-6"
      >
        <font-awesome-icon
          @click="backToLogin"
          icon="circle-arrow-left"
          class="text-2xl text-uciblue hover:text-blue-600 hover:scale-110 transition-all duration-200 cursor-pointer"
        />

        <div class="relative w-full md:w-1/2 min-h-full flex items-center justify-center">
          <img src="/favicon.png" class="w-[620px] h-92" alt="Petr" />
        </div>

        <!-- Vertical divider for desktop -->
        <div class="hidden md:block w-px bg-uciblue mx-6"></div>

        <!-- Horizontal divider for mobile -->
        <div class="md:hidden w-full border-t my-6 border-uciblue"></div>

        <div class="w-full md:w-1/2 h-full py-8 px-5">
          <h1
            class="text-3xl font-bold mb-2 leading-tight tracking-tight text-black md:text-3xl mt-8"
          >
            Create Account
          </h1>
          <form class="" @submit.prevent="handleSignup">
            <div class="relative w-full flex justify-between mt-12">
              <div class="relative w-[48%]">
                <label
                  for="firstname"
                  class="absolute -top-3 left-3 px-1 text-sm text-gray-500 bg-white"
                >
                  Firstname
                </label>
                <div class="flex items-center border border-gray-400 rounded-md">
                  <input
                    v-model="formData.fname"
                    type="text"
                    name="firstname"
                    id="firstname"
                    class="bg-transparent text-gray-800 block w-full py-2.5 px-3 outline-none focus:border-blue-500 focus:ring-0"
                    required
                  />
                </div>
              </div>
              <div class="relative w-[48%]">
                <label
                  for="lastname"
                  class="absolute -top-3 left-3 px-1 text-sm text-gray-500 bg-white"
                >
                  Lastname
                </label>
                <div class="flex items-center border border-gray-400 rounded-md">
                  <input
                    v-model="formData.lname"
                    type="text"
                    name="lastname"
                    id="lastname"
                    class="bg-transparent text-gray-800 block w-full py-2.5 px-3 outline-none focus:border-blue-500 focus:ring-0"
                    required
                  />
                </div>
              </div>
            </div>
            <div>
              <div class="relative w-full mt-6">
                <!-- Label positioned at the top -->
                <label
                  for="email"
                  class="absolute -top-3 left-3 px-1 text-sm text-gray-500 bg-white"
                >
                  Email
                </label>
                <!-- Input box -->
                <div class="flex items-center border border-gray-400 rounded-md">
                  <input
                    v-model="formData.email"
                    type="email"
                    name="email"
                    id="email"
                    class="bg-transparent text-gray-800 block w-full py-2.5 px-3 outline-none focus:border-blue-500 focus:ring-0"
                    required
                  />
                </div>
              </div>
            </div>
            <div class="relative w-full mt-6">
              <label
                for="password"
                class="absolute -top-3 left-3 px-1 text-sm text-gray-500 bg-white"
              >
                Password
              </label>
              <div class="flex items-center border border-gray-400 rounded-md">
                <input
                  v-model="formData.password"
                  type="password"
                  name="password"
                  id="password"
                  class="bg-transparent text-gray-800 block w-full py-2.5 px-3 outline-none focus:border-blue-500 focus:ring-0"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              class="w-full mb-2 text-white bg-[#25569a] hover:bg-[#1f4e7c] focus:ring-2 focus:outline-none focus:ring-red-300 font-bold rounded-lg text-md px-5 py-2.5 text-center dark:focus:ring-white mt-6"
            >
              Create Account
            </button>
            <p class="text-sm font-light text-gray-500 dark:text-gray-400">
              Already have an account?

              <RouterLink class="font-medium text-uciblue hover:underline" to="/login">
                Sign In
              </RouterLink>
            </p>
          </form>
          <div class="flex items-center my-8">
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
