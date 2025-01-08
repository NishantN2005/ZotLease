<template>
  <div
    class="bg-neutral-900 w-[4%] h-screen flex flex-col justify-between text-stone-300 py-4 relative"
  >
    <!-- Top Section: Profile Picture -->
    <div class="flex flex-col items-center space-y-6">
      <button
        class="w-10 h-10 border border-stone-500 rounded-full flex items-center justify-center"
      >
        <!-- Font Awesome Icon for Profile Picture -->
        <i class="fas fa-user text-white text-xl"></i>
      </button>
      <!-- Middle Section: Buttons -->
      <div class="flex flex-col justify-start">
        <button
          @click="turnOnModal"
          class="border-y border-stone-500 hover:bg-stone-500 text-white py-2 px-4 flex items-center justify-center space-x-2"
        >
          <i class="fas fa-plus"></i>
        </button>
        <button
          @click="toggleFilterModals"
          :class="showFilterModal ? 'bg-stone-500' : ''"
          class="hover:bg-stone-500 text-white py-2 px-4 flex items-center justify-center space-x-2"
        >
          <i class="fas fa-filter"></i>
        </button>
        <button
          :class="messagesOpen ? 'bg-stone-500' : ''"
          class="border-y border-stone-500 hover:bg-stone-500 text-white py-2 px-4 flex items-center justify-center space-x-2"
          @click="toggleMessages"
        >
          <i class="fas fa-comments"></i>
        </button>
        <button
          :class="mapView ? 'bg-stone-500' : ''"
          class="border-y border-stone-500 hover:bg-stone-500 text-white py-2 px-4 flex items-center justify-center space-x-2"
          @click="toggleView()"
        >
          <i class="fas fa-map-location-dot"></i>
        </button>
        <button
          :class="!mapView ? 'bg-stone-500' : ''"
          class="border-y border-stone-500 hover:bg-stone-500 text-white py-2 px-4 flex items-center justify-center space-x-2"
          @click="toggleView(false)"
        >
          <i class="fas fa-list"></i>
        </button>
      </div>
    </div>

    <!-- Bottom Section: Logout Button -->
    <div>
      <button
        @click="Logout"
        class="w-full border-y border-stone-500 hover:bg-stone-500 text-white py-2 px-4 flex items-center justify-center space-x-2"
      >
        <i class="fas fa-sign-out-alt"></i>
      </button>
    </div>
  </div>
</template>

<script>
import Messages from './Messages.vue'
import { useChatStore } from '@/stores/chatStore'
import { useUserStore } from '@/stores/userStore'
import { ref, nextTick } from 'vue'

export default {
  name: 'Sidebar',
  props: {
    Logout: {
      type: Function,
      required: true,
    },
    turnOnModal: {
      type: Function,
      required: true,
    },
    toggleFilterModal: {
      type: Function,
      required: true,
    },
    router: {
      type: Object,
      required: true,
    },
    mapView: {
      type: Boolean,
      required: true,
    },
    toggleView: {
      type: Function,
      required: true,
    },
    toggleCheckMessage: {
      type: Function,
      required: true,
    },
    toggleMessages: {
      type: Function,
      required: true,
    },
    showFilterModal: {
      type: Boolean,
      required: true,
    },
    messagesOpen:{
      type: Boolean,
      required: true,
    }
  },
  components: {
    Messages,
  },
  methods: {
    Logout() {
      this.Logout() // This calls the prop passed to the component.
    },
    turnOnModal() {
      this.turnOnModal()
    },
    toggleFilterModals() {
      this.filterOpen = !this.filterOpen
      if (this.filterOpen) {
        this.messagesOpen = false
        this.chatStore.setChatRoomID(null)
        this.chatStore.setActiveChatID(null)
      }
      this.toggleFilterModal()
    },
  },

  setup(props) {
    const chatStore = useChatStore()
    const userStore = useUserStore()

    return {chatStore, userStore}
  },
}
</script>

<style>
/* Optional: Add custom styles here if needed */
</style>
