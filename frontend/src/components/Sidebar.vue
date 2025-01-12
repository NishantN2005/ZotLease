<template>
  <div class="bg-neutral-900 w-[4%] h-screen flex flex-col justify-between text-stone-300 py-4">
    <!-- Top Section: Profile Picture -->
    <div class="flex flex-col items-center space-y-6">
      <button
        class="w-10 h-10 border border-stone-500 rounded-full flex items-center justify-center"
        @click="redirectToProfile"
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
          class="hover:bg-stone-500 text-white py-2 px-4 flex items-center justify-center space-x-2"
        >
          <i class="fas fa-filter"></i>
        </button>
        <button
          class="border-y border-stone-500 hover:bg-stone-500 text-white py-2 px-4 flex items-center justify-center space-x-2"
          @click="toggleMessages"
        >
          <i class="fas fa-comments"></i>
        </button>
      </div>
      <Messages
        ref="messageRef"
        v-if="messagesOpen"
        :chatStore="chatStore"
        :router="router"
        :userStore="userStore"
      />
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
  },
  components: {
    Messages,
  },
  methods: {
    redirectToProfile(){
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
        this.messagesOpen = false
        this.chatStore.setChatRoomID(null)
        this.chatStore.setActiveChatID(null)
      }
      this.toggleFilterModal()
    },
    toggleMessages() {
      this.messagesOpen = !this.messagesOpen
      if (this.messagesOpen && this.filterOpen) {
        this.toggleFilterModal()
        this.filterOpen = false
      } else {
        this.chatStore.setChatRoomID(null)
        this.chatStore.setActiveChatID(null)
      }
    },

    toggleDashMessage(chatroomID, partnerName, partnerID) {
      this.messagesOpen = true

      if (this.messagesOpen && this.filterOpen) {
        this.toggleFilterModal()
        this.filterOpen = false
      }

      this.$nextTick(() => {
        if (this.messageRef) {
          this.messageRef.selectChat(chatroomID, partnerName, partnerID)
          this.messageRef.updateUnreadCount(chatroomID)
        }
      })
    },
  },

  setup(props) {
    const chatStore = useChatStore()
    const userStore = useUserStore()
    const messagesOpen = ref(false)
    const filterOpen = ref(false)
    const messageRef = ref(null)

    return { messagesOpen, filterOpen, chatStore, userStore, messageRef }
  },
}
</script>

<style>
/* Optional: Add custom styles here if needed */
</style>
