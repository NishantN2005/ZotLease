<template>
  <div class="sidebar">
    <div class="content">
      <!-- Chat List -->
      <div class="chat-list">
        <h3>Chats</h3>
        <ul>
          <li
            v-for="chat in chatStore.chatRooms"
            :key="chat.chatRoomID"
            :class="{ active: chat.chatRoomID === activeChatId }"
            class="relative flex items-center space-x-2"
          >
            <span
              @click="(selectChat(chat.chatRoomID), updateUnreadCount(chat.chatRoomID))"
              class="chat-name"
            >
              {{ chat.partnerName }}
            </span>
            <!-- Unread messages badge -->
            <div
              v-if="chat.unreadMessages > 0"
              class="bg-uciblue rounded-full w-4 h-4 flex items-center justify-center text-white text-xs font-medium absolute right-2 top-1/2 transform -translate-y-1/2"
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
        <ul class="messages">
          <li
            v-for="message in chatStore.onlineChats"
            :key="message.id"
            :class="[
              'message',
              message.sender === userStore.userID ? 'user-message' : 'system-message',
            ]"
          >
            <span class="sender"
              >{{ message.sender === userStore.userID ? 'You' : 'System' }}:</span
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
import { ref, watch } from 'vue'
import SocketConnection from '@/components/SocketConnection.vue'

export default {
  setup(props) {
    const messages = ref([])
    watch(
      // add response.messages to online chats and push a new chat to it when we get one and make a watch for it
      () => [props.chatStore.chatRoomID],
      async ([newActiveChatRoomID]) => {
        console.log('looesc')
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
    return { messages }
  },
  data() {
    return {
      activeChatId: null,
      chats: {
        1: {
          messages: [{ id: 1, sender: 'system', text: 'Chat with Nishant' }],
        },
        2: {
          messages: [{ id: 2, sender: 'system', text: 'Chat with Brian' }],
        },
        3: {
          messages: [{ id: 3, sender: 'system', text: 'Chat with Humayl' }],
        },
        4: {
          messages: [{ id: 4, sender: 'system', text: 'Chat with Bob' }],
        },
      },
      newMessage: '',
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
  },

  components: {
    SocketConnection,
  },

  methods: {
    selectChat(chatId) {
      this.chatStore.setChatRoomID(chatId)
    },
    deleteChat(chatID) {
      this.chatList = this.chatList.filter((chat) => chat.id !== chatID)

      if (this.activeChatId === chatID) {
        this.activeChatId = this.chatList.length ? this.chatList[0].id : null
      }
    },
    updateUnreadCount(chatroomid) {
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
  position: fixed;
  left: 58px;
  max-width: 40%;
  height: 100%;
  background: #f9f9f9;
  border-right: 1px solid #ddd;
  transition: width 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  z-index: 1000;
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
  border-right: 1px solid #ddd;
}

.chat-list ul {
  list-style: none;
  padding: 0;
}

.chat-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  cursor: pointer;
  border-radius: 8px;
  background: #f1f1f1;
}

.chat-list li.active {
  background: #007bff;
  color: white;
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
  width: 40%;
  height: 100%;
  word-wrap: break-word;
}

.messages {
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
  overflow: scroll;
  box-sizing: border-box;
}

.message {
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.user-message {
  align-items: flex-end;
  word-wrap: break-word;
}

.system-message {
  align-items: flex-start;
}

.sender {
  font-size: 0.9rem;
  font-weight: bold;
  margin-bottom: 2px;
}

.text {
  background: #007bff;
  color: #fff;
  padding: 8px 12px;
  border-radius: 12px;
  max-width: 100%;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.system-message .text {
  background: #f1f1f1;
  color: #333;
}

.input-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: auto; /* Push the input container to the bottom */
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
