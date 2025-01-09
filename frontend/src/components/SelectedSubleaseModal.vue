<template>
  <div
    v-if="showSelectedSubleaseModal"
    id="filterModal"
    class="absolute z-10 bg-white inset-y-2 right-2 w-1/3 rounded-lg p-4 shadow-md border border-gray-200 overflow-y-auto"
  >
    <div class="flex items-center justify-between mb-4">
      <!-- Title -->
      <h1 class="font-bold text-2xl text-gray-900 text-center flex-1">
        {{
          selectedSubleaseStore.fName.charAt(0).toUpperCase() +
          selectedSubleaseStore.fName.slice(1).toLowerCase()
        }}
        {{
          selectedSubleaseStore.lName.charAt(0).toUpperCase() +
          selectedSubleaseStore.lName.slice(1).toLowerCase()
        }}'s Apartment
      </h1>

      <!-- Close Button -->
      <button @click="turnOffSubleaseModal" class="text-gray-600 hover:text-gray-900">
        <i class="fa-solid fa-xmark text-xl"></i>
      </button>
    </div>

    <!-- Content Container -->
    <div
      class="space-y-3 text-gray-700 overflow-auto mt-2"
      style="font-family: 'Comic Sans MS', 'Arial', sans-serif"
    >
      <div v-if="true" class="mt-4 flex flex-col gap-1">
        <!-- Top Image -->
        <img
          v-for="(photo, index) in photos.slice(0, 1)"
          :key="index"
          :src="photo"
          :alt="'Photo ' + (index + 1)"
          class="rounded shadow w-full h-64"
        />

        <div class="flex gap-1 relative">
          <img
            v-for="(photo, index) in photos.slice(1, 3)"
            :key="index"
            :src="photo"
            :alt="'Photo ' + (index + 2)"
            class="rounded shadow w-1/2 h-48"
          />

          <!-- View All Button (on the 3rd image) -->
          <button
            class="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-3 py-1 rounded"
            @click="handleViewAll"
            v-if="photos.length > 3"
          >
            View All {{ photos.length }} Photos
          </button>
        </div>
      </div>

      <!-- Price -->
      <div class="flex justify-between">
        <div class="font-extrabold text-3xl text-black">
          ${{ selectedSubleaseStore.price
          }}<span class="text-gray-500 font-normal text-lg">/mo</span>
        </div>
        <!-- Start/End Term -->
        <div class="border border-gray-500 flex space-x-6 w-fit px-5 rounded-md text-sm text-black">
          <div>
            <span class="text-xs text-gray-800">Start Term:</span> <br />{{
              selectedSubleaseStore.startTerm
            }}
          </div>
          <div class="border-l border-gray-500 pl-2">
            <span class="text-xs text-gray-800">End Term:</span> <br />
            {{ selectedSubleaseStore.endTerm }}
          </div>
        </div>
      </div>

      <!-- Rooms/Bathrooms -->
      <div class="text-black text-extrabold text-lg">
        <span class="font-semibold"></span>
        {{ selectedSubleaseStore.roomCount }}
        <span class="font-normal text-base text-gray-700">bed</span>
        {{ selectedSubleaseStore.bathroomCount }}
        <span class="font-normal text-base text-gray-700 mr-5">bath</span>
        {{ selectedSubleaseStore.gender }}
        <span class="font-normal text-base text-gray-700">occupation</span>
      </div>

      <!-- Address -->
      <div class="text-gray-700">
        {{ selectedSubleaseStore.street_name }}, {{ selectedSubleaseStore.city }}, California,
        {{ selectedSubleaseStore.postal_code }} #{{ selectedSubleaseStore.room }}
      </div>

      <!-- Description -->
      <div>
        <span class="font-semibold text-black">Special Notes:</span>
        <p class="whitespace-pre-line mt-2 border border-gray-500 rounded-sm p-2">
          {{ selectedSubleaseStore.description }}
        </p>
      </div>

      <!-- Chat Button -->
      <button
        @click="createChatRoom"
        class="bg-neutral-900 text-stone-200 text-xl font-bold rounded-md py-1 px-4 transition-colors duration-200 w-full hover:bg-neutral-700"
        v-if="selectedSubleaseStore.listerID !== userStore.userID"
      >
        Chat
      </button>
    </div>

    <!-- <div v-if="true" class="mt-4 grid grid-cols-1 gap-4">
      <img
        v-for="(photo, index) in photos"
        :key="index"
        :src="photo"
        :alt="'Photo ' + (index + 1)"
        class="w-full h-auto rounded shadow"
      />
    </div> -->
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import { getPhotos } from '../s3client.js'
import SocketConnection from './SocketConnection.vue'
import { useUserStore } from '@/stores/userStore.js'

export default {
  name: 'SelectedSubleaseModal',
  props: {
    showSelectedSubleaseModal: {
      type: Boolean,
      required: true,
    },
    selectedSubleaseStore: {
      type: Object,
      required: true,
    },
    turnOffSubleaseModal: {
      type: Function,
      required: true,
    },
    createChatRoom: {
      type: Function,
      required: true,
    },
    router: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const photos = ref([])
    const userStore = useUserStore()

    async function fetchPhotos() {
      try {
        console.log('fetching photos')
        const key = `${props.selectedSubleaseStore.listerID}/${props.selectedSubleaseStore.subleaseID}` // Dynamic prefix
        console.log(key)
        const response = await getPhotos(key)
        console.log(response)
        photos.value = response
        console.log(photos.value.length)
      } catch (error) {
        console.error('Error fetching photos:', error)
      }
    }

    const handleViewAll = () => {
      console.log('view')
    }
    // Watch for modal visibility and load photos when opened
    watch(
      () => props.selectedSubleaseStore.subleaseID,
      () => {
        console.log('i was triggered')
        fetchPhotos()
      },
    )

    return { photos, userStore, handleViewAll }
  },
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
