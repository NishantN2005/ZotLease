<template>
  <div
    v-if="showSelectedSubleaseModal"
    id="filterModal"
    class="fixed inset-0 z-10 bg-white p-4 shadow-md border border-gray-200 overflow-y-auto w-screen h-screen md:w-1/2 lg:w-1/3 md:top-2 md:bottom-2 md:right-2 md:left-auto md:h-auto md:rounded-lg"
    style="font-family: 'Comic Sans MS', 'Arial', sans-serif"
  >
    <div class="flex items-center justify-between">
      <!-- Title -->
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

      <!-- Close Button -->
      <button @click="turnOffSubleaseModal" class="text-gray-600 hover:text-gray-900">
        <i class="fa-solid fa-xmark text-xl"></i>
      </button>
    </div>

    <!-- Tabs -->
    <div class="flex space-x-4 mb-4">
      <button
        v-for="(subletter, index) in selectedSubleaseStore.subletters"
        :key="subletter.listerid"
        @click="selectSublet(index)"
        :class="{
          'text-blue-500 border-b-2 border-blue-500': selectedTab === index,
          'text-gray-500': selectedTab !== index,
        }"
        class="py-2 px-4"
      >
        {{ subletter.fname }} {{ subletter.lname }}
      </button>
    </div>

    <!-- Content Container -->
    <div class="space-y-3 text-gray-700 overflow-auto mt-2">
      <div v-if="true" class="mt-4 flex flex-col gap-1">
        <!-- Top Image -->
        <img
          v-for="(photo, index) in selectedSubleaseStore.photos.slice(0, 1)"
          :key="index"
          :src="photo"
          :alt="'Photo ' + (index + 1)"
          class="rounded shadow w-full h-64"
        />

        <div class="flex gap-1 relative">
          <img
            v-for="(photo, index) in selectedSubleaseStore.photos.slice(1, 3)"
            :key="index"
            :src="photo"
            :alt="'Photo ' + (index + 2)"
            class="rounded shadow w-1/2 h-48"
          />

          <!-- View All Button (on the 3rd image) -->
          <button
            class="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-3 py-1 rounded"
            @click="togglePhotoGallery"
            v-if="selectedSubleaseStore.photos.length > 3"
          >
            View All {{ selectedSubleaseStore.photos.length }} Photos
          </button>
        </div>
      </div>

      <!-- Price -->
      <div class="flex justify-between">
        <div class="font-extrabold text-3xl text-black">
          ${{ selectedSubleaseStore.selectedSublet.price
          }}<span class="text-gray-500 font-normal text-lg">/mo</span>
        </div>
        <!-- Start/End Term -->
        <div class="border border-gray-500 flex space-x-6 w-fit px-5 rounded-md text-sm text-black">
          <div>
            <span class="text-xs text-gray-800">Start Term:</span> <br />{{
              selectedSubleaseStore.selectedSublet.startterm
            }}
          </div>
          <div class="border-l border-gray-500 pl-2">
            <span class="text-xs text-gray-800">End Term:</span> <br />
            {{ selectedSubleaseStore.selectedSublet.endterm }}
          </div>
        </div>
      </div>

      <!-- Rooms/Bathrooms -->
      <div class="text-black text-extrabold text-lg">
        <span class="font-semibold"></span>
        {{ selectedSubleaseStore.selectedSublet.roomcount }}
        <span class="font-normal text-base text-gray-700">bed</span>
        {{ selectedSubleaseStore.selectedSublet.bathroomcount }}
        <span class="font-normal text-base text-gray-700 mr-5">bath</span>
        {{ selectedSubleaseStore.selectedSublet.gender }}
        <span class="font-normal text-base text-gray-700">occupation</span>
      </div>

      <!-- Address -->
      <div class="text-gray-700">
        {{ selectedSubleaseStore.selectedSublet.street_name }},
        {{ selectedSubleaseStore.selectedSublet.city }}, California,
        {{ selectedSubleaseStore.selectedSublet.postal_code }} #{{
          selectedSubleaseStore.selectedSublet.room
        }}
      </div>

      <!-- Description -->
      <div>
        <span class="font-semibold text-black">Special Notes:</span>
        <p class="whitespace-pre-line mt-2 border border-gray-500 rounded-sm p-2">
          {{ selectedSubleaseStore.selectedSublet.description }}
        </p>
      </div>

      <!-- Chat Button -->
      <button
        @click="
          () => {
            createChatRoom()
            toggleSidebar()
          }
        "
        class="bg-neutral-900 text-stone-200 text-xl font-bold rounded-md py-1 px-4 transition-colors duration-200 w-full hover:bg-neutral-700"
        v-if="selectedSubleaseStore.selectedSublet.listerid !== userStore.userID"
      >
        Chat
      </button>
    </div>
  </div>
</template>

<script>
import { watch, ref } from 'vue'
import { getPhotos } from '../s3client.js'
import { useUserStore } from '@/stores/userStore.js'
import { useSelectedSubleaseStore } from '@/stores/SelectedSubleaseStore'

export default {
  name: 'SelectedSubleaseModal',
  props: {
    showSelectedSubleaseModal: {
      type: Boolean,
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
    togglePhotoGallery: {
      type: Function,
      required: true,
    },
    toggleSidebar: {
      type: Function,
      required: true,
    },
  },
  setup(props) {
    const userStore = useUserStore()
    const selectedSubleaseStore = useSelectedSubleaseStore()
    const selectedTab = ref(0)

    const selectSublet = (index) => {
      selectedTab.value = index
      selectedSubleaseStore.selectedSublet = selectedSubleaseStore.subletters[index]
    }

    async function fetchPhotos(newSublet) {
      try {
        console.log('fetching photos')
        const key = `${newSublet.listerid}/${selectedSubleaseStore.subleaseID}` // Dynamic prefix
        console.log(key)
        const response = await getPhotos(key)
        console.log(response)
        selectedSubleaseStore.setPhotos(response)
      } catch (error) {
        console.error('Error fetching photos:', error)
      }
    }

    watch(
      () => selectedSubleaseStore.selectedSublet,
      (newSublet) => {
        if (newSublet) {
          console.log('HERE', newSublet.listerid)
          fetchPhotos(newSublet)
        }
      },
      { immediate: true },
    )
    // Watch for changes in subletters and set the default selected sublet
    watch(
      () => selectedSubleaseStore.subletters,
      (newSubletters) => {
        if (newSubletters.length > 0) {
          selectedSubleaseStore.selectedSublet = newSubletters[0]
        }
      },
      { immediate: true },
    )

    return {
      selectedSubleaseStore,
      selectedTab,
      selectSublet,
      userStore,
    }
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
