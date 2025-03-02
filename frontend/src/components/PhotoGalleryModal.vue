<template>
  <div
    id="PhotoGallery"
    class="fixed inset-0 z-10 bg-white p-4 shadow-md border border-gray-200 overflow-y-auto w-screen h-screen md:w-1/2 lg:w-1/3 md:top-2 md:bottom-2 md:right-2 md:left-auto md:h-auto md:rounded-lg"
    style="font-family: 'Comic Sans MS', 'Arial', sans-serif"
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
        <!-- Render a full-width photo -->
        <div v-if="group.type === 'full'" class="w-full">
          <img
            :src="group.photos[0]"
            :alt="'Photo ' + (groupIndex * 3 + 1)"
            class="rounded shadow w-full h-64"
          />
        </div>

        <div v-else-if="group.type === 'pair'" class="flex gap-2">
          <img
            v-for="(photo, photoIndex) in group.photos"
            :key="'photo-' + groupIndex + '-' + photoIndex"
            :src="photo"
            :alt="'Photo ' + (groupIndex * 3 + photoIndex + 1)"
            class="rounded shadow w-1/2 h-48"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<script>
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
    return { selectedSubleaseStore }
  },
  computed: {
    photoGroups() {
      const groups = []
      const { photos } = this.selectedSubleaseStore

      for (let i = 0; i < photos.length; i += 3) {
        groups.push({ type: 'full', photos: [photos[i]] })
        if (photos[i + 1] || photos[i + 2]) {
          groups.push({
            type: 'pair',
            photos: photos.slice(i + 1, i + 3),
          })
        }
      }

      return groups
    },
  },
}
</script>
