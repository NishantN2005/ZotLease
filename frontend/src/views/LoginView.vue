<script>
import { RouterLink } from 'vue-router'
function handleLogin(e) {}
</script>

<template>
  <section className="bg-cover bg-center bg-[url('/blue.png')] min-h-screen">
    <div
      className="flex flex-col items-center justify-center min-h-screen px-6 py-8 mx-auto md:h-screen lg:py-0"
    >
      <a
        href="#"
        className="flex items-center mb-6 text-2xl font-semibold text-red-600 dark:text-white"
      >
      </a>
      <div
        class="w-full bg-white/20 rounded-lg shadow-md md:mt-0 sm:max-w-md xl:p-0 dark:border dark:border-white"
      >
        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
          <h1 className="text-xl font-bold leading-tight tracking-tight text-white md:text-2xl">
            Log in to your account
          </h1>
          <form className="space-y-4 md:space-y-6" @submit.prevent="handleLogin">
            <div>
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-medium text-gray-300 dark:text-white"
              >
                Email
              </label>
              <input
                type="text"
                name="email"
                id="email"
                className="bg-white/80 text-gray-900 border border-gray-300 rounded-lg focus:ring-red-600 focus:border-red-600 block w-full p-2.5 dark:bg-white/80 dark:border-gray-600 dark:text-gray-900 dark:placeholder-gray-800 dark:focus:ring-red-500 dark:focus:border-red-500"
                placeholder="example@gmail.com"
                required
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block mb-2 text-sm font-medium text-gray-300 dark:text-white"
              >
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                placeholder="••••••••"
                className="bg-white/80 text-gray-900 border border-gray-300 rounded-lg focus:ring-red-600 focus:border-red-600 block w-full p-2.5 dark:bg-white/80 dark:border-gray-600 dark:text-gray-900 dark:placeholder-gray-800 dark:focus:ring-red-500 dark:focus:border-red-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full text-white bg-[#25569a] hover:bg-[#1f4e7c] focus:ring-2 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:focus:ring-white"
            >
              Log In
            </button>
            <p className="text-sm font-light text-gray-500 dark:text-gray-400">
              Don't have an account yet?

              <RouterLink
                className="font-medium text-white hover:underline dark:text-white"
                to="/signup"
              >
                Sign Up
              </RouterLink>
            </p>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>
