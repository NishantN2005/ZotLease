<template>
    <div
        v-if="showSelectedSubleaseModal"
        id="filterModal"
        class="absolute z-10 bg-white inset-y-2 right-2 w-1/3 rounded-lg p-4 shadow-md border border-gray-200"
      >
        <!-- Close button (top-right) -->
        <div class="flex justify-end mb-2">
          <button @click="turnOffSubleaseModal" class="text-gray-600 hover:text-gray-900">
            <i class="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <!-- Content Container -->
        <div class="space-y-4 text-gray-700">
          <!-- Title -->
          <h1 class="font-bold text-2xl text-gray-900">
            {{ selectedSubleaseStore.fName }} {{ selectedSubleaseStore.lName }}
          </h1>

          <!-- Price -->
          <div>
            <span class="font-semibold">Price:</span> ${{ selectedSubleaseStore.price }}
          </div>

          <!-- Gender -->
          <div>
            <span class="font-semibold">Gender:</span> {{ selectedSubleaseStore.gender }}
          </div>

          <!-- Rooms/Bathrooms -->
          <div>
            <span class="font-semibold">Rooms/Bathrooms:</span> 
            {{ selectedSubleaseStore.roomCount }}/{{ selectedSubleaseStore.bathroomCount }}
          </div>

          <!-- Address -->
          <div>
            <span class="font-semibold">Address:</span> 
            {{ selectedSubleaseStore.street_name }}, {{ selectedSubleaseStore.city }}, California,
            {{ selectedSubleaseStore.postal_code }}
          </div>

          <!-- Room -->
          <div>
            <span class="font-semibold">Room:</span> 
            {{ selectedSubleaseStore.room }}
          </div>

          <!-- Start/End Term -->
          <div>
            <span class="font-semibold">Start Term:</span> {{ selectedSubleaseStore.startTerm }}
            <br />
            <span class="font-semibold">End Term:</span> {{ selectedSubleaseStore.endTerm }}
          </div>

          <!-- Description -->
          <div>
            <span class="font-semibold">Description:</span> 
            <p class="whitespace-pre-line mt-1">
              {{ selectedSubleaseStore.description }}
            </p>
          </div>

          <!-- Chat Button -->
          <button
            @click="createChatRoom"
            class="bg-uciblue text-uciyellow font-bold rounded-full py-2 px-6 hover:bg-blue-900 transition-colors duration-200"
          >
            Chat
          </button>
        </div>
      </div>
  </template>
  
  <script>
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
    },
  };
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
  