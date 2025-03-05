<template>
  <div
    class="absolute h-[calc(100vh-env(safe-area-inset-bottom))] inset-0 flex flex-col items-center justify-center bg-neutral-900 z-[100]"
  >
    <img :src="loadingGIF" alt="Loading..." class="w-fit h-auto" />
    <p class="mt-4 text-white text-4xl font-Sriracha">Loading, please wait...</p>
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
