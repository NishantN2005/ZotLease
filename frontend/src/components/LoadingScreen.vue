<template>
  <div class="absolute inset-0 flex flex-col items-center justify-center bg-white z-50">
    <img :src="loadingGIF" alt="Loading..." class="w-36 h-auto" />
    <p class="mt-4 text-lg text-gray-700 font-medium">Loading, please wait...</p>
  </div>
</template>

<script>
import loadingGIF from '../assets/zotleaseloading.gif'

export default {
  name: 'LoadingScreen',
  setup() {
    return {
      loadingGIF,
    }
  },
}
</script>
