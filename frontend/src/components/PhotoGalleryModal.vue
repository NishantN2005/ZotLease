<template>
  <div
    id="PhotoGallery"
    class="fixed md:absolute inset-0 z-10 bg-white p-4 shadow-md border border-gray-200 overflow-y-auto w-screen h-[calc(100vh-env(safe-area-inset-bottom))] md:w-1/2 lg:w-1/3 md:top-2 md:bottom-2 md:right-2 md:left-auto md:h-auto md:rounded-lg"
  >
    <div class="flex items-center">
      <i
        class="fa-solid text-xl fa-xmark fixed top-4 right-4 md:top-7 md:right-8 z-20 cursor-pointer"
        @click="togglePhotoGallery"
      ></i>
      <h1 class="font-bold text-2xl text-gray-900 text-center flex-1">
        {{
          selectedSubleaseStore.selectedSublet.fname.charAt(0).toUpperCase() +
          selectedSubleaseStore.selectedSublet.fname.slice(1).toLowerCase()
        }}
        {{
          selectedSubleaseStore.selectedSublet.lname.charAt(0).toUpperCase() +
          selectedSubleaseStore.selectedSublet.lname.slice(1).toLowerCase()
        }}'s Apartment
      </h1>
    </div>
    <div
      v-if="selectedSubleaseStore.photos.length > 0"
      class="mt-4 flex flex-col gap-4 overflow-y-auto"
    >
      <template v-for="(group, groupIndex) in photoGroups" :key="'group-' + groupIndex">
        <!-- Full-width photo -->
        <div v-if="group.type === 'full'" class="w-full relative">
          <!-- Skeleton overlay -->
          <div
            v-if="!loadedImages[group.indexes[0]]"
            class="animate-pulse bg-gray-300 absolute inset-0 rounded shadow"
          ></div>
          <img
            :src="group.photos[0]"
            :alt="'Photo ' + (group.indexes[0] + 1)"
            class="rounded shadow w-full h-64 object-cover"
            @load="onImageLoad(group.indexes[0])"
            v-show="loadedImages[group.indexes[0]]"
          />
        </div>
        <!-- Pair of photos -->
        <div v-else-if="group.type === 'pair'" class="flex gap-2">
          <div
            v-for="(photo, photoIndex) in group.photos"
            :key="'photo-' + groupIndex + '-' + photoIndex"
            class="relative w-1/2 h-48"
          >
            <!-- Skeleton overlay -->
            <div
              v-if="!loadedImages[group.indexes[photoIndex]]"
              class="animate-pulse bg-gray-300 absolute inset-0 rounded shadow"
            ></div>
            <img
              :src="photo"
              :alt="'Photo ' + (group.indexes[photoIndex] + 1)"
              class="rounded shadow w-full h-48 object-cover"
              @load="onImageLoad(group.indexes[photoIndex])"
              v-show="loadedImages[group.indexes[photoIndex]]"
            />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import { useSelectedSubleaseStore } from '@/stores/SelectedSubleaseStore.js'

export default {
  name: 'PhotoGalleryModal',
  props: {
    togglePhotoGallery: {
      type: Function,
      required: true,
    },
  },
  setup() {
    const selectedSubleaseStore = useSelectedSubleaseStore()
    const loadedImages = ref([])

    // Reset the loaded state whenever the photos array updates
    watch(
      () => selectedSubleaseStore.photos,
      (newPhotos) => {
        loadedImages.value = new Array(newPhotos.length).fill(false)
      },
      { immediate: true },
    )

    function onImageLoad(index) {
      loadedImages.value[index] = true
    }

    return { selectedSubleaseStore, loadedImages, onImageLoad }
  },
  computed: {
    photoGroups() {
      const groups = []
      const { photos } = this.selectedSubleaseStore
      // Group photos: one full-width photo and then a pair (if available)
      for (let i = 0; i < photos.length; i += 3) {
        groups.push({ type: 'full', photos: [photos[i]], indexes: [i] })
        if (photos[i + 1] || photos[i + 2]) {
          const indexes = []
          if (photos[i + 1] !== undefined) indexes.push(i + 1)
          if (photos[i + 2] !== undefined) indexes.push(i + 2)
          groups.push({ type: 'pair', photos: photos.slice(i + 1, i + 3), indexes })
        }
      }
      return groups
    },
  },
}
</script>
