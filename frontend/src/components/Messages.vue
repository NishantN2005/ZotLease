<template>
  <div :class="['sidebar', { collapsed: isCollapsed }]">
    <button @click="toggleSidebar" class="toggle-button">
      {{ isCollapsed ? '→' : '←' }}
    </button>
    <div class="content" v-if="!isCollapsed">
      <!-- Chat List -->
      <div class="chat-list">
        <h3>Chats</h3>
        <ul>
          <li v-for="chat in chatList" :key="chat.id" :class="{ active: chat.id === activeChatId }">
            <span @click="selectChat(chat.id)" class="chat-name">
              {{ chat.name }}
            </span>
            <button @click="deleteChat(chat.id)" class="delete-button">❌</button>
          </li>
        </ul>
      </div>

      <!-- Chat Messages -->
      <div class="chat-box">
        <ul class="messages">
          <li
            v-for="message in activeChat.messages"
            :key="message.id"
            :class="['message', message.sender === 'user' ? 'user-message' : 'system-message']"
          >
            <span class="sender">{{ message.sender === 'user' ? 'You' : 'System' }}:</span>
            <p class="text">{{ message.text }}</p>
          </li>
        </ul>
      </div>
    </div>
    <div class="input-container" :class="{ hidden: isCollapsed }">
      <textarea
        v-model="newMessage"
        placeholder="Type your message..."
        @keydown.enter.prevent="sendMessage"
      ></textarea>
      <button @click="sendMessage" class="send-button">Send</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isCollapsed: true,
      chatList: [
        { id: 1, name: 'Nishant' },
        { id: 2, name: 'Brian' },
        { id: 3, name: 'Humayl' },
      ],
      activeChatId: 1,
      chats: {
        1: {
          messages: [{ id: 1, sender: 'system', text: 'Chat with Nishant' }],
        },
        2: {
          messages: [{ id: 1, sender: 'system', text: 'Chat with Brian' }],
        },
        3: {
          messages: [{ id: 1, sender: 'system', text: 'Chat with Humayl' }],
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
  methods: {
    toggleSidebar() {
      this.isCollapsed = !this.isCollapsed
    },
    selectChat(chatId) {
      this.activeChatId = chatId
    },
    sendMessage() {
      if (this.newMessage.trim()) {
        // Add user message to the active chat
        this.activeChat.messages.push({
          id: Date.now(),
          sender: 'user',
          text: this.newMessage.trim(),
        })

        // Simulate a system response
        setTimeout(() => {
          this.activeChat.messages.push({
            id: Date.now() + 1,
            sender: 'system',
            text: 'Fake Response',
          })
        }, 1000)

        this.newMessage = ''
      }
    },
    deleteChat(chatID) {
      this.chatList = this.chatList.filter((chat) => chat.id !== chatID)

      if (this.activeChatId === chatID) {
        this.activeChatId = this.chatList.length ? this.chatList[0].id : null
      }
    },
  },
}
</script>

<style>
* {
  box-sizing: border-box;
}

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 50%;
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
  justify-content: space-between;
  width: 100%;
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
</style>
