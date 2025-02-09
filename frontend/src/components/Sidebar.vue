<template>
  <!-- Mobile Toggle Button (always visible on mobile) -->
  <button
    @click="toggleSidebar"
    :class="[
      'md:hidden p-4 fixed top-0 left-0 z-50',
      isSidebarOpen ? 'text-white' : 'text-neutral-900',
    ]"
  >
    <svg
      class="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M4 6h16M4 12h16m-7 6h7"
      ></path>
    </svg>
  </button>

  <!-- Desktop Sidebar -->
  <div class="hidden md:flex flex-col justify-between bg-neutral-900 text-white h-full w-24 z-40">
    <!-- Top Section: Profile and Buttons -->
    <div class="flex flex-col items-center space-y-6 py-4">
      <button
        class="w-16 h-16 border border-stone-500 rounded-full flex items-center justify-center hover:cursor-pointer"
        @click="redirectToProfile"
      >
        <i class="fas fa-user text-white text-3xl"></i>
      </button>
      <div class="flex flex-col w-full">
        <button
          @click="turnOnModal"
          class="w-full border-y border-stone-500 hover:bg-stone-500 text-white py-2 flex items-center justify-center"
        >
          <i class="fas fa-plus"></i>
        </button>
        <button
          @click="toggleFilterModals"
          :class="{ 'bg-stone-500': showFilterModal }"
          class="w-full border-y border-stone-500 hover:bg-stone-500 text-white py-2 flex items-center justify-center"
        >
          <i class="fas fa-filter"></i>
        </button>
        <button
          @click="toggleMessages"
          :class="{ 'bg-stone-500': messagesOpen }"
          class="w-full border-y border-stone-500 hover:bg-stone-500 text-white py-2 flex items-center justify-center"
        >
          <i class="fas fa-comments"></i>
        </button>
        <button
          @click="toggleView"
          :class="{ 'bg-stone-500': mapView }"
          class="w-full border-y border-stone-500 hover:bg-stone-500 text-white py-2 flex items-center justify-center"
        >
          <i class="fas fa-map-location-dot"></i>
        </button>
        <button
          @click="toggleView(false)"
          :class="{ 'bg-stone-500': !mapView }"
          class="w-full border-y border-stone-500 hover:bg-stone-500 text-white py-2 flex items-center justify-center"
        >
          <i class="fas fa-list"></i>
        </button>
      </div>
    </div>
    <!-- Bottom Section: Logout -->
    <div class="w-full">
      <button
        @click="Logout"
        class="w-full border-t border-stone-500 hover:bg-stone-500 text-white py-2 flex items-center justify-center"
      >
        <i class="fas fa-sign-out-alt"></i>
      </button>
    </div>
  </div>

  <!-- Mobile Sidebar -->
  <transition name="slide">
    <div
      v-if="isSidebarOpen"
      class="md:hidden pt-12 w-1/3 h-full bg-neutral-900 text-white z-40 transform transition-transform"
    >
      <div class="flex flex-col items-center space-y-6 py-4">
        <button
          class="w-12 h-12 border border-stone-500 rounded-full flex items-center justify-center hover:cursor-pointer"
          @click="redirectToProfile"
        >
          <i class="fas fa-user text-white text-2xl"></i>
        </button>
        <div class="flex flex-col w-full">
          <button
            @click="turnOnModal"
            class="w-full h-12 border-y border-stone-500 hover:bg-stone-500 text-white flex items-center justify-center"
          >
            <i class="fas fa-plus text-xl"></i>
          </button>
          <button
            @click="toggleFilterModals"
            :class="{ 'bg-stone-500': showFilterModal }"
            class="w-full border-y border-stone-500 hover:bg-stone-500 text-white py-2 flex items-center justify-center"
          >
            <i class="fas fa-filter"></i>
          </button>
          <button
            @click="toggleMessages"
            :class="{ 'bg-stone-500': messagesOpen }"
            class="w-full border-y border-stone-500 hover:bg-stone-500 text-white py-2 flex items-center justify-center"
          >
            <i class="fas fa-comments"></i>
          </button>
          <button
            @click="toggleView"
            :class="{ 'bg-stone-500': mapView }"
            class="w-full border-y border-stone-500 hover:bg-stone-500 text-white py-2 flex items-center justify-center"
          >
            <i class="fas fa-map-location-dot"></i>
          </button>
          <button
            @click="toggleView(false)"
            :class="{ 'bg-stone-500': !mapView }"
            class="w-full border-y border-stone-500 hover:bg-stone-500 text-white py-2 flex items-center justify-center"
          >
            <i class="fas fa-list"></i>
          </button>
        </div>
      </div>
      <div class="absolute bottom-0 left-0 right-0">
        <button
          @click="Logout"
          class="w-full border-t border-stone-500 hover:bg-stone-500 text-white py-2 flex items-center justify-center"
        >
          <i class="fas fa-sign-out-alt"></i>
        </button>
      </div>
    </div>
  </transition>

  <!-- Mobile Overlay -->
  <transition name="fade">
    <div
      v-if="isSidebarOpen"
      @click="toggleSidebar"
      class="md:hidden fixed inset-0 bg-black opacity-50 z-30"
    ></div>
  </transition>
</template>

<script>
import { ref } from 'vue'
import { useChatStore } from '@/stores/chatStore'
import { useUserStore } from '@/stores/userStore'
import Messages from './Messages.vue'

export default {
  name: 'Sidebar',
  components: { Messages },
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
    messagesOpen: {
      type: Boolean,
      required: true,
    },
    messageRef: {
      type: Object,
      required: true,
    },
    isSidebarOpen: {
      type: Boolean,
      required: true,
    },
    toggleSidebar: {
      type: Object,
      required: true,
    },
  },
  components: {
    Messages,
  },
  methods: {
    redirectToProfile() {
      this.router.push('/profile')
    },
    Logout() {
      this.Logout() // This calls the prop passed to the component.
    },
    turnOnModal() {
      this.turnOnModal()
    },
    toggleFilterModals() {
      this.filterOpen = !this.filterOpen
      if (this.filterOpen) {
        this.chatStore.setChatRoomID(null)
        this.chatStore.setActiveChatID(null)
      }
      this.toggleFilterModal()
    },

    toggleDashMessage(chatroomID, partnerName, partnerID) {
      if (!this.messagesOpen) this.toggleMessages()

      if (this.messagesOpen && this.filterOpen) {
        this.toggleFilterModal()
      }

      this.$nextTick(() => {
        if (Object.keys(this.messageRef).length > 0) {
          this.messageRef.selectChat(chatroomID, partnerName, partnerID)
          this.messageRef.updateUnreadCount(chatroomID)
        }
      })
    },
  },

  setup(props) {
    const chatStore = useChatStore()
    const userStore = useUserStore()

    const redirectToProfile = () => {
      props.router.push('/profile')
    }

    // Wrapper functions to call the passed-in props.
    const turnOnModal = () => {
      props.turnOnModal()
    }
    const toggleFilterModals = () => {
      props.toggleFilterModal()
    }
    const toggleMessages = () => {
      props.toggleMessages()
    }
    const toggleView = (param) => {
      props.toggleView(param)
    }
    const Logout = () => {
      props.Logout()
    }

    return {
      redirectToProfile,
      turnOnModal,
      toggleFilterModals,
      toggleMessages,
      toggleView,
      Logout,
      chatStore,
      userStore,
    }
  },
}
</script>

<style scoped>
/* Transitions for mobile sidebar and overlay */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
