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
            {{ subleaseStore.fName }} {{ subleaseStore.lName }}
          </h1>

          <!-- Price -->
          <div>
            <span class="font-semibold">Price:</span> ${{ subleaseStore.price }}
          </div>

          <!-- Gender -->
          <div>
            <span class="font-semibold">Gender:</span> {{ subleaseStore.gender }}
          </div>

          <!-- Rooms/Bathrooms -->
          <div>
            <span class="font-semibold">Rooms/Bathrooms:</span> 
            {{ subleaseStore.roomCount }}/{{ subleaseStore.bathroomCount }}
          </div>

          <!-- Address -->
          <div>
            <span class="font-semibold">Address:</span> 
            {{ subleaseStore.street_name }}, {{ subleaseStore.city }}, California,
            {{ subleaseStore.postal_code }}
          </div>

          <!-- Room -->
          <div>
            <span class="font-semibold">Room:</span> 
            {{ subleaseStore.room }}
          </div>

          <!-- Start/End Term -->
          <div>
            <span class="font-semibold">Start Term:</span> {{ subleaseStore.startTerm }}
            <br />
            <span class="font-semibold">End Term:</span> {{ subleaseStore.endTerm }}
          </div>

          <!-- Description -->
          <div>
            <span class="font-semibold">Description:</span> 
            <p class="whitespace-pre-line mt-1">
              {{ subleaseStore.description }}
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
      subleaseStore: {
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
  