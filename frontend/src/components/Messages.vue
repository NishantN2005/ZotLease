<template>
  <div v-if="messagesOpen" class="sidebar">
    <div class="content relative z-20">
      <!-- Chat List -->
      <div class="chat-list">
        <h3 class="text-white border-b border-b-stone-500 py-3">Chats</h3>
        <ul class="overflow-auto">
          <li
            v-for="chat in chatStore.chatRooms"
            :key="chat.chatRoomID"
            :class="{ active: chat.chatRoomID === activeChatId && chatStore.activeChatID }"
            class="relative flex items-center space-x-2 my-4 bg-stone-800 hover:bg-stone-500"
            @click="
              (selectChat(chat.chatRoomID, chat.partnerName, chat.partnerID),
              updateUnreadCount(chat.chatRoomID))
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

      <!-- Chat Messages -->
      <div
        class="chat-box"
        v-if="chatStore.chatRoomID"
        :class="{ invisible: !chatStore.chatRoomID }"
      >
        <div class="flex items-center space-x-3 py-4 px-6 bg-stone-800 rounded-t-lg mb-5">
          <i
            class="fas fa-user w-10 h-10 bg-stone-600 rounded-full text-white flex items-center justify-center"
          ></i>
          <h4 class="text-stone-300 font-bold text-xl">{{ partnerName }}</h4>
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
    </div>
  </div>
</template>

<script>
import { makeAuthenticatedRequest } from '@/services/authService'
import { ref, watch, nextTick } from 'vue'
import SocketConnection from '@/components/SocketConnection.vue'

export default {
  name: 'Messages',
  setup(props) {
    const messages = ref([])
    const partnerName = ref('')
    const activeChatId = ref(null)
    const messagesContainer = ref(null)

    const scrollToBottom = () => {
      nextTick(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        }
      })
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
          props.userStore.userToken,
        )
        response = await response.json()
        props.chatStore.setOnlineChats(response.messages)
      },
    )
    return { messages, partnerName, activeChatId, messagesContainer }
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
  },

  components: {
    SocketConnection,
  },

  methods: {
    selectChat(chatId, partnerName, partnerID) {
      console.log(chatId, partnerName, partnerID)
      this.activeChatId = chatId
      this.partnerName = partnerName
      console.log(this.partnerName)
      this.chatStore.setChatRoomID(chatId)
      this.chatStore.setActiveChatID(partnerID)
    },
    updateUnreadCount(chatroomid) {
      console.log('in message update')
      this.chatStore.chatRooms.forEach((chat) => {
        if (chat.chatRoomID === chatroomid) {
          chat.unreadMessages = 0
        }
      })
    },
  },
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.sidebar {
  background: rgb(23 23 23);
  border-left: 1px solid rgb(120 113 108 / var(--tw-bg-opacity, 1));
  transition: width 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  z-index: 10;
  padding: 0;
  margin: 0;
  color: black;
  bottom: 0;
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
  padding: 10px;
  height: 100%;
  gap: 10px;
  width: 100%;
}

.chat-list {
  width: 200px;
  display: flex;
  flex-direction: column;
  padding-right: 10px;
  background-color: rgb(23 23 23);
}

.chat-list ul {
  list-style: none;
  padding: 0;
}

.chat-list ul::-webkit-scrollbar {
  display: none; /* Hides the scrollbar */
}

.chat-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  cursor: pointer;
  border-radius: 8px;
  color: white;
}

.chat-list li.active {
  background: rgb(120 113 108);
}

.chat-name {
  flex: 1;
}

.delete-button {
  background: transparent;
  border: none;
  color: red;
  cursor: pointer;
  font-size: 1.2em;
}

.delete-button:hover {
  color: darkred;
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
  background: rgb(120 113 108);
  color: #fff;
  padding: 8px 12px;
  border-radius: 12px;
  max-width: 100%;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.system-message .text {
  background: rgb(23 23 23);
  color: white;
  border: 1px solid rgb(120 113 108);
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
  border-color: #007bff;
}

.send-button {
  background: #007bff;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
}

.send-button:hover {
  background: #0056b3;
}

.input-container.hidden {
  display: none;
}

.sidebar .invisible {
  width: 7%;
}
</style>
