<template>
  <div
    id="PhotoGallery"
    class="fixed inset-0 z-10 bg-white px-4 pt-4 pb-4 shadow-md border border-gray-200 w-screen max-h-[calc(100vh-8rem)] overflow-y-auto md:w-1/2 lg:w-1/3 md:top-2 md:bottom-2 md:right-2 md:left-auto md:max-h-[90vh] md:overflow-y-auto md:rounded-lg mt-32 md:mt-16"
  >
    <div class="relative">
      <!-- Close button with higher z-index and proper positioning -->
      <i
        class="fa-solid text-xl fa-xmark absolute top-1 right-2 md:right-4 z-50 cursor-pointer text-gray-700 hover:text-gray-900"
        @click="togglePhotoGallery"
      ></i>
    </div>
    <div class="flex items-center">
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
      id="my-gallery"
      class="pswp-gallery mt-4 flex flex-col gap-4 overflow-y-auto"
    >
      <template v-for="(group, groupIndex) in photoGroups" :key="'group-' + groupIndex">
        <div v-if="group.type === 'full'" class="w-full relative">
          <a
            :href="group.photos[0]"
            :data-pswp-width="getImageDimensions(group.photos[0]).width"
            :data-pswp-height="getImageDimensions(group.photos[0]).height"
            target="_blank"
          >
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
          </a>
        </div>
        <div v-else-if="group.type === 'pair'" class="flex gap-2">
          <div
            v-for="(photo, photoIndex) in group.photos"
            :key="'photo-' + groupIndex + '-' + photoIndex"
            class="relative w-1/2 h-48"
          >
            <a
              :href="photo"
              :data-pswp-width="getImageDimensions(group.indexes[photoIndex]).width"
              :data-pswp-height="getImageDimensions(group.indexes[photoIndex]).height"
              @click.prevent
            >
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
            </a>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useSelectedSubleaseStore } from '@/stores/SelectedSubleaseStore.js'
import PhotoSwipeLightbox from 'photoswipe/lightbox'
import 'photoswipe/style.css'

export default {
  name: 'PhotoGalleryModal',
  props: {
    togglePhotoGallery: {
      type: Function,
      required: true,
    },
    listView: { type: Boolean, required: true },
  },
  setup() {
    const selectedSubleaseStore = useSelectedSubleaseStore()
    const loadedImages = ref([])
    let lightbox = null

    const getImageDimensions = (src) => {
      return { width: 1200, height: 800 }
    }

    onMounted(() => {
      lightbox = new PhotoSwipeLightbox({
        gallery: '#my-gallery',
        children: 'a',
        pswpModule: () => import('photoswipe'),
      })
      lightbox.init()

      if (selectedSubleaseStore.photos.length > 0) {
        setTimeout(() => {
          lightbox.loadAndOpen(0)
        }, 300) // Small delay ensures lightbox initializes properly
      }
    })

    onUnmounted(() => {
      if (lightbox) {
        lightbox.destroy()
      }
    })

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

    return { selectedSubleaseStore, loadedImages, onImageLoad, getImageDimensions, lightbox }
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
