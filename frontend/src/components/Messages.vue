<template>
  <div v-if="messagesOpen" class="sidebar h-[100dvh] w-full">
    <div class="content">
      <!-- Chat List -->
      <div class="chat-list">
        <ul class="overflow-auto">
          <li
            v-for="chat in chatStore.chatRooms"
            :key="chat.chatRoomID"
            :class="{
              active: chat.chatRoomID === chatStore.activeChatId && chatStore.activeChatID,
            }"
            class="relative flex items-center space-x-2 my-4 cursor-pointer"
            @click="
              (selectChat(chat.chatRoomID, chat.partnerName, chat.partnerID),
              updateUnreadCount(chat.chatRoomID),
              turnOffMessageProfile())
            "
          >
            <span class="chat-name">
              {{ chat.partnerName }}
            </span>
            <!-- Unread messages badge -->
            <div
              v-if="chat.unreadMessages > 0"
              class="bg-uciblue rounded-full w-5 h-4 flex items-center justify-center text-white text-xs font-medium absolute right-2 top-1/2 transform -translate-y-1/2"
            >
              {{ chat.unreadMessages }}
            </div>
          </li>
        </ul>
      </div>

      <div
        class="fixed inset-0 flex items-center justify-center z-30"
        v-if="chatStore.chatRooms.length === 0"
      >
        <div class="flex flex-col items-center">
          <img src="/favicon.png" alt="Zotlease Logo" class="w-52 h-52" />
          <h2 class="text-gray-800 font-semibold text-lg mt-4">No Active Chats!</h2>
        </div>
      </div>
      <div v-if="messageProfileActive" class="w-[400px] flex flex-col items-center py-4">
        <button
          @click="toggleMessageProfile"
          class="text-white absolute top-2 right-2 p-2 rounded-full transition-colors duration-200 hover:text-red-600"
          aria-label="Close"
        >
          <i class="fas fa-times"></i>
        </button>

        <!-- Responsive Title -->
        <h2 class="text-[#042553] font-extrabold text-2xl sm:text-3xl mt-4 text-center">
          {{ chatStore.partnerName }}'s Properties
        </h2>

        <div class="w-full mt-4 px-4 flex justify-center">
          <div v-if="listings.length > 0" class="w-full rounded-lg flex justify-center">
            <div
              v-for="listing in listings"
              :key="listing.id"
              class="listing-card bg-white shadow-md hover:shadow-xl rounded-lg transition-all duration-300 ease-in-out cursor-pointer w-3/4 mt-4"
              @click="() => activateSubleaseModal(listing.subleaseid, listing.id)"
            >
              <img
                :src="photos[listing.id] ? photos[listing.id] : housePlaceholder"
                alt="Failed to Render Photo"
                class="w-full h-48 rounded-t-lg object-cover"
              />
              <div>
                <h3
                  class="font-bold text-black mx-2 mt-2"
                  style="font-family: 'Comic Sans MS', 'Arial', sans-serif"
                >
                  ${{ listing.price }}
                </h3>
                <p class="text-gray-600 mx-2 mb-2">
                  {{ [listing.street_name, listing.city].join(', ') }}
                </p>
              </div>
            </div>
          </div>

          <div
            v-else
            class="flex justify-center items-center h-48 text-gray-600 font-semibold text-lg"
          >
            No results found.
          </div>
        </div>
      </div>

      <!-- Chat Messages -->
      <div
        class="chat-box"
        v-if="chatStore.chatRoomID"
        :class="{ invisible: !chatStore.chatRoomID }"
      >
        <div class="flex items-center space-x-3 border border-[#042553] rounded-t-lg">
          <i
            class="cursor-pointer fas fa-user my-2 mx-2 w-10 h-10 bg-[#042553] rounded-full text-white flex items-center justify-center"
            @click="toggleMessageProfile"
          ></i>
          <h4 class="text-[#042553] font-bold text-xl">{{ chatStore.partnerName }}</h4>
        </div>

        <ul class="messages space-y-6" ref="messagesContainer">
          <li
            v-for="message in chatStore.onlineChats"
            :key="message.id"
            :class="[
              'message',
              message.sender === userStore.userID ? 'user-message' : 'system-message',
            ]"
          >
            <p class="text">{{ message.content }}</p>
          </li>
        </ul>
        <div class="input-container" v-if="chatStore.chatRoomID">
          <SocketConnection :router="router" />
        </div>
      </div>
      <div class="h-full w-full flex flex-col items-center mt-32 md:mt-52" v-else-if="!messageProfileActive && chatStore.chatRooms.length !== 0">
        <img
          src="/favicon.png"
          alt="Zotlease Logo"
          class="w-52 h-52"
        />
        <h2 class="text-gray-800 font-semibold text-lg mt-4">
          Select A Chat!
        </h2>
      </div>
    </div>
  </div>
</template>

<script>
import { makeAuthenticatedRequest } from '@/services/authService'
import { ref, watch, nextTick, computed } from 'vue'
import SocketConnection from '@/components/SocketConnection.vue'
import { useAllLocationsStore } from '@/stores/AllLocationsStore'
import { useUserStore } from '@/stores/userStore'
import { useSelectedSubleaseStore } from '@/stores/SelectedSubleaseStore'

export default {
  name: 'Messages',
  setup(props) {
    const allLocations = useAllLocationsStore()
    const userStore = useUserStore()
    const selectedSubleaseStore = useSelectedSubleaseStore()
    const photos = ref({})
    const messages = ref([])
    const partnerName = ref('')
    const activeChatId = ref(null)
    const messagesContainer = ref(null)
    const listings = computed(() => {
      return allLocations.allLocations.filter(
        (loc) => loc.listerid === props.chatStore.activeChatID,
      )
    })

    watch(
      () => allLocations.firstPhotos,
      (newPhotos) => {
        photos.value = newPhotos
      },
      { immediate: true },
    )

    const scrollToBottom = () => {
      nextTick(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        }
      })
    }

    async function activateSubleaseModal(subid, uniqueid) {
      const userID = userStore.userID
      // Make call to retrieve listing information
      let info = await makeAuthenticatedRequest(
        'sublease/selectedInfo',
        { subleaseID: subid, uniqueid: uniqueid, userid: userID },
        props.router,
      )

      // parse JSON
      const subleaseData = await info.json()

      // set Pinia store state
      if (selectedSubleaseStore.subleaseID !== subleaseData[0].subleaseid) {
        selectedSubleaseStore.resetSelectedSublease()
        selectedSubleaseStore.setSelectedSubleaseID(subleaseData[0].subleaseid)
        subleaseData.forEach((subletter) => {
          const { subleaseid, id, ...subletterData } = subletter
          selectedSubleaseStore.addSubletter(subletterData)
        })
      }

      // open your sublease modal
      props.turnOnSubleaseModal()
    }

    watch(() => props.chatStore.onlineChats, scrollToBottom)
    watch(() => props.chatStore.onlineChats.length, scrollToBottom)

    watch(
      // add response.messages to online chats and push a new chat to it when we get one and make a watch for it
      () => [props.chatStore.chatRoomID],
      async ([newActiveChatRoomID]) => {
        let response = await makeAuthenticatedRequest(
          'chat/getOfflineChats',
          { chatRoomID: newActiveChatRoomID },
          props.router,
        )
        response = await response.json()
        props.chatStore.setOnlineChats(response.messages)
      },
    )
    return {
      messages,
      partnerName,
      activeChatId,
      messagesContainer,
      listings,
      photos,
      activateSubleaseModal,
    }
  },
  computed: {
    activeChat() {
      return this.chats[this.activeChatId]
    },
  },
  props: {
    chatStore: {
      type: Object,
      required: true,
    },
    router: {
      type: Object,
      required: true,
    },
    userStore: {
      type: Object,
      required: true,
    },
    messagesOpen: {
      type: Boolean,
      required: true,
    },
    toggleMessageProfile: {
      type: Function,
      required: true,
    },
    turnOffMessageProfile: {
      type: Function,
      required: true,
    },
    messageProfileActive: {
      type: Boolean,
      required: true,
    },
    turnOnSubleaseModal: {
      type: Function,
      required: true,
    },
  },

  components: {
    SocketConnection,
  },

  methods: {
    selectChat(chatId, partnerName, partnerID) {
      this.chatStore.activeChatId = chatId
      this.chatStore.partnerName = partnerName
      this.chatStore.setChatRoomID(chatId)
      this.chatStore.setActiveChatID(partnerID)
    },
    async updateUnreadCount(chatroomid) {
      this.chatStore.chatRooms.forEach((chat) => {
        if (chat.chatRoomID === chatroomid) {
          chat.unreadMessages = 0
        }
      })
      // Send authenticated request to update session
      const response = await makeAuthenticatedRequest(
        'chat/updateUnreadCount',
        { userID: this.userStore.userID, chatRooms: this.chatStore.chatRooms },
        this.router,
      )

      const data = await response.json()
    },
  },
}
</script>

<style scoped>
* {
  padding: 0;
  box-sizing: border-box;
}

.sidebar {
  position: fixed;
  background: whitesmoke;
  transition: width 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  z-index: 30;
  padding: 0;
  margin-top: 64px;
  color: black;
}

.sidebar.collapsed {
  width: 50px;
}

.toggle-button {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  background: gray;
  color: #fff;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  z-index: 1100; /* Ensure the button is above the sidebar */
}

.content {
  display: flex;
  gap: 1px;
  background: #f3f4f6;
  height: calc(100dvh - 64px);
}

.chat-list {
  width: 25%;
  min-width: 140px;
  background: white;
  border-right: 1px solid #e5e7eb;
  overflow-y: auto;
}

.chat-list ul {
  list-style: none;
  padding: 0.5rem;
}

.chat-list ul::-webkit-scrollbar {
  width: 6px;
}

.chat-list ul::-webkit-scrollbar-track {
  background: transparent;
}

.chat-list ul::-webkit-scrollbar-thumb {
  background: #94a3b8;
  border-radius: 3px;
}

.chat-list li {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  margin: 0.25rem 0;
  border-radius: 0.5rem;
  background: #f8fafc;
  transition: all 0.2s ease;
}

.chat-list li:hover {
  background: #f1f5f9;
  transform: translateX(2px);
}

.chat-list li.active {
  background: #e2e8f0;
  border-left: 3px solid #042553;
}

/* Add !important if Tailwind still overrides */
.active {
  background: #e2e8f0;
  border-left: 3px solid #042553;
}

.chat-name {
  font-weight: 500;
  color: #1e293b;
}

.unread-badge {
  background: #042553;
  color: white;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-weight: 600;
}

.chat-box {
  flex-grow: 1;
  flex-direction: row;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 400px;
  height: 100%;
  overflow: auto;
  word-wrap: break-word;
}
@media (max-width: 768px) {
  .chat-box {
    flex-grow: 1;
    flex-direction: row;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 900px;
    height: 100%;
    overflow: auto;
    word-wrap: break-word;
  }
}
.messages {
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
  overflow: scroll;
  box-sizing: border-box;
  scroll-behavior: smooth;
  padding-bottom: 10px;
}

.message {
  margin-top: 12px;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.messages::-webkit-scrollbar {
  display: none; /* Hides the scrollbar */
}

.user-message {
  align-items: flex-end;
  word-wrap: break-word;
  width: 80%;
  margin-left: auto;
  margin-right: 10px;
}

.system-message {
  align-items: flex-start;
  width: 80%;
  margin-left: 10px;
}

.sender {
  font-size: 0.9rem;
  font-weight: bold;
  margin-bottom: 2px;
}

.text {
  background: #042553;
  color: #fff;
  padding: 8px 12px;
  border-radius: 12px;
  max-width: 100%;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.system-message .text {
  background: white;
  color: #042553;
  border: 1px solid rgb(205, 203, 202);
}

.input-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: auto;
  gap: 10px;
  padding: 10px;
}

textarea {
  flex: 1;
  height: 50px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 8px;
  resize: none;
}

textarea:focus {
  outline: none;
  border-color: #042553;
}

.input-container.hidden {
  display: none;
}

.sidebar .invisible {
  width: 7%;
}
</style>
