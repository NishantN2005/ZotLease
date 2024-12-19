<script setup>
import { ref } from 'vue'
import { useUserStore } from '../stores/userStore.js'
import { RouterLink, useRouter } from 'vue-router'
const router = useRouter()

const userStore = useUserStore()

const formData = ref({
  fname: '',
  lname: '',
  email: '',
  password: '',
})

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
    fetch('http://localhost:5555/auth/signup', {
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
  <section class="bg-cover bg-center bg-[url('/blue.png')]">
    <div
      class="flex flex-col items-center justify-center min-h-screen px-6 py-8 mx-auto md:h-screen lg:py-0"
    >
      <div
        class="w-full bg-white/20 rounded-lg shadow-md md:mt-0 sm:max-w-md xl:p-0 dark:border dark:border-white"
      >
        <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
          <h1 class="text-xl font-bold leading-tight tracking-tight text-white md:text-2xl">
            Sign in to your account
          </h1>
          <form class="space-y-4 md:space-y-6" @submit.prevent="handleSignup">
            <div>
              <label
                for="fname"
                class="block mb-2 text-sm font-medium text-gray-300 dark:text-white"
              >
                Firstname
              </label>
              <input
                v-model="formData.fname"
                type="text"
                name="firstname"
                id="firstname"
                placeholder="Enter Firstname"
                class="bg-white/80 text-gray-900 border border-gray-300 rounded-lg focus:ring-red-600 focus:border-red-600 block w-full p-2.5"
                required
              />
            </div>
            <div>
              <label
                for="lname"
                class="block mb-2 text-sm font-medium text-gray-300 dark:text-white"
              >
                Lastname
              </label>
              <input
                v-model="formData.lname"
                type="text"
                name="lastname"
                id="lastname"
                placeholder="Enter Lastname"
                class="bg-white/80 text-gray-900 border border-gray-300 rounded-lg focus:ring-red-600 focus:border-red-600 block w-full p-2.5"
                required
              />
            </div>
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
                placeholder="example@gmail.com"
                class="bg-white/80 text-gray-900 border border-gray-300 rounded-lg focus:ring-red-600 focus:border-red-600 block w-full p-2.5"
                required
              />
            </div>
            <div>
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
                class="bg-white/80 text-gray-900 border border-gray-300 rounded-lg focus:ring-red-600 focus:border-red-600 block w-full p-2.5"
                required
              />
            </div>
            <button
              type="submit"
              class="w-full text-white bg-[#25569a] hover:bg-[#1f4e7c] focus:ring-2 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            >
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>
