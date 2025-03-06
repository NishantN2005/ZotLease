<script setup>
import { ref } from 'vue'
import { useUserStore } from '../stores/userStore.js'
import { RouterLink, useRouter } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faArrowCircleLeft } from '@fortawesome/free-solid-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'
import { API_URL } from '../../constants.js'
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
  const CLIENTID = import.meta.env.VITE_CLIENT_ID
  const googleURI = import.meta.env.VITE_CALLBACK_URI
  const SCOPE = 'email profile'
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
        //updating state of user to logged in and establishing id
        res = await res.json()
        console.log('sign', res)
        userStore.setUserToken(res.accessToken)
        userStore.setIsLoggedIn(true)
        userStore.setUserID(res.id)
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
  <section class="bg-neutral-900 min-h-screen overflow-hidden">
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
          class="text-xl text-uciblue hover:cursor-pointer"
        />
        <div class="w-full min-h-full flex items-center justify-center">
          <img src="/favicon.png" class="w-[620px] h-92 pr-10" alt="Petr" />
        </div>
        <div class="border-b border-uciblue md:border-l md:border-uciblue mr-4"></div>
        <div class="w-full h-full py-8 px-5 rounded-xl">
          <h1 class="text-3xl font-bold mb-2 leading-tight tracking-tight text-black md:text-3xl">
            Sign Up
          </h1>
          <form class="" @submit.prevent="handleSignup">
            <div>
              <label
                for="firstname"
                class="block mb-2 text-sm font-medium text-gray-300 dark:text-white"
              >
                Firstname
              </label>
              <div class="flex items-center border-b border-gray-400">
                <input
                  v-model="formData.fname"
                  type="text"
                  name="firstname"
                  id="firstname"
                  placeholder="Enter Firstname"
                  class="bg-transparent text-gray-900 block w-full py-2.5 outline-none focus:border-blue-500 focus:ring-0"
                  required
                />
              </div>
            </div>
            <div>
              <label
                for="lastname"
                class="block mb-2 text-sm font-medium text-gray-300 dark:text-white"
              >
                Lastname
              </label>
              <div class="flex items-center border-b border-gray-400">
                <input
                  v-model="formData.lname"
                  type="text"
                  name="lastname"
                  id="lastname"
                  placeholder="Enter Lastname"
                  class="bg-transparent text-gray-900 block w-full py-2.5 outline-none focus:border-blue-500 focus:ring-0"
                  required
                />
              </div>
            </div>
            <div>
              <label
                for="email"
                class="block mb-2 text-sm font-medium text-gray-300 dark:text-white"
              >
                Email
              </label>
              <div class="flex items-center border-b border-gray-400">
                <input
                  v-model="formData.email"
                  type="email"
                  name="email"
                  id="email"
                  class="bg-transparent text-gray-900 block w-full py-2.5 outline-none focus:border-blue-500 focus:ring-0"
                  placeholder="Email Address"
                  required
                />
              </div>
            </div>
            <div class="mb-4 md:mb-10 lg:mb-12">
              <label
                for="password"
                class="block mb-2 text-sm font-medium text-gray-300 dark:text-white"
              >
                Password
              </label>
              <div class="flex items-center border-b border-gray-400">
                <input
                  v-model="formData.password"
                  type="password"
                  name="password"
                  id="password"
                  placeholder="Password"
                  class="bg-transparent text-gray-900 block w-full py-2.5 outline-none focus:border-blue-500 focus:ring-0"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              class="w-full mb-2 text-white bg-[#25569a] hover:bg-[#1f4e7c] focus:ring-2 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:focus:ring-white"
            >
              Sign Up
            </button>
            <p class="text-sm font-light text-gray-500 dark:text-gray-400">
              Already have an account?

              <RouterLink class="font-medium text-uciblue hover:underline" to="/login">
                Sign In
              </RouterLink>
            </p>
          </form>
          <button
            @click="loginWithGoogle"
            class="w-full mt-4 flex items-center justify-center bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 focus:ring-2 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5"
          >
            <img src="/googlelogo.webp" alt="Google" class="w-5 h-5 mr-2" />
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
