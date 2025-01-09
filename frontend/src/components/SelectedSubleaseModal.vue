<template>
  <div
    v-if="showSelectedSubleaseModal"
    id="filterModal"
    class="absolute z-10 bg-white inset-y-2 right-2 w-1/3 rounded-lg p-4 shadow-md border border-gray-200 overflow-y-auto"
  >
    <!-- Close button (top-right) -->
    <div class="flex justify-end mb-2">
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
          'text-gray-500': selectedTab !== index
        }"
        class="py-2 px-4"
      >
        {{ subletter.fname }} {{ subletter.lname }}
      </button>
    </div>

    <!-- Content Container -->
    <div class="space-y-4 text-gray-700">
      <!-- Title -->
      <h1 class="font-bold text-2xl text-gray-900">
        {{ selectedSubleaseStore.selectedSublet.fName }} {{ selectedSubleaseStore.selectedSublet.lName }}
      </h1>

      <!-- Price -->
      <div><span class="font-semibold">Price:</span> ${{ selectedSubleaseStore.selectedSublet.price }}</div>

      <!-- Gender -->
      <div><span class="font-semibold">Gender:</span> {{ selectedSubleaseStore.selectedSublet.gender }}</div>

      <!-- Rooms/Bathrooms -->
      <div>
        <span class="font-semibold">Rooms:</span> {{ selectedSubleaseStore.selectedSublet.roomCount }}
      </div>
      <div>
        <span class="font-semibold">Bathrooms:</span> {{ selectedSubleaseStore.selectedSublet.bathroomCount }}
      </div>

      <!-- Address -->
      <div>
        <span class="font-semibold">Address:</span>
        {{ selectedSubleaseStore.selectedSublet.street_name }}, {{ selectedSubleaseStore.selectedSublet.city }}, California,
        {{ selectedSubleaseStore.selectedSublet.postal_code }}
      </div>

      <!-- Room -->
      <div>
        <span class="font-semibold">Room:</span>
        {{ selectedSubleaseStore.selectedSublet.room }}
      </div>

      <!-- Start/End Term -->
      <div>
        <span class="font-semibold">Start Term:</span> {{ selectedSubleaseStore.selectedSublet.startterm }}
        <br />
        <span class="font-semibold">End Term:</span> {{ selectedSubleaseStore.selectedSublet.endterm }}
      </div>

      <!-- Description -->
      <div>
        <span class="font-semibold">Description:</span>
        <p class="whitespace-pre-line mt-1">
          {{ selectedSubleaseStore.selectedSublet.description }}
        </p>
      </div>

      <!-- Chat Button -->
      <button
        @click="createChatRoom"
        class="bg-uciblue text-uciyellow text-xl font-bold rounded-md py-1 px-4 hover:bg-blue-900 transition-colors duration-200"
      >
        Chat
      </button>
    </div>
    <div class="mt-4 grid grid-cols-1 gap-4">
      <img
        v-for="(photo, index) in photos"
        :key="index"
        :src="photo"
        :alt="'Photo ' + (index + 1)"
        class="w-full h-auto rounded shadow"
      />
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import { getPhotos } from '../s3client.js'
import { useSelectedSubleaseStore } from '@/stores/SelectedSubleaseStore';

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
  },
  setup(props) {
    const selectedSubleaseStore = useSelectedSubleaseStore();
    const selectedTab = ref(0);
    const photos = ref([])

    const selectSublet = (index) => {
      selectedTab.value = index;
      selectedSubleaseStore.selectedSublet = selectedSubleaseStore.subletters[index];
    };

    async function fetchPhotos(newSublet) {
      try {
        console.log('fetching photos')
        const key = `${newSublet.listerid}/${props.selectedSubleaseStore.subleaseID}` // Dynamic prefix
        console.log(key)
        const response = await getPhotos(key)
        console.log(response)
        photos.value = response
        console.log(photos.value.length)
      } catch (error) {
        console.error('Error fetching photos:', error)
      }
    }

    watch(
      () => selectedSubleaseStore.selectedSublet,
      (newSublet) => {
        if (newSublet) {
          console.log('HERE', newSublet.listerid)
          fetchPhotos(newSublet);
        }
      },
      { immediate: true }
    );
    // Watch for changes in subletters and set the default selected sublet
    watch(
      () => selectedSubleaseStore.subletters,
      (newSubletters) => {
        if (newSubletters.length > 0) {
          selectedSubleaseStore.selectedSublet = newSubletters[0];
        }
      },
      { immediate: true }
    );

    return { 
      selectedSubleaseStore,
      selectedTab,
      selectSublet,
      photos 
    }
  },
}
</script>

<style scoped>
/* Optional fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
