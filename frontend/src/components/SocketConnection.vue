<script setup>
import { onMounted, ref } from 'vue'
import { io } from 'socket.io-client'
import { useUserStore } from '@/stores/userStore'
import { makeAuthenticatedRequest } from '@/services/authService'

const props = defineProps({
  router: {
    type: Object,
    required: true,
  },
})

const userStore = useUserStore()

const socketId = ref(null)
const socket = ref(null)
const message = ref('')

// set to 01 but dynamically put recipient id to userID from clicked card/chat
const recipientId = ref('01')
const userID = userStore.userID

const sendMessage = () => {
  const formData = {
    chatRoomID: userStore.chatRoomID,
    sender: userStore.userID,
    content: message.value,
  }

  makeAuthenticatedRequest('chat/sendMessage', formData, props.router, userStore.userToken)
    .then((response) => {
      return response.json()
    })
    .then((data) => {
      socket.value.emit('directMessage', { ...data.messageData, recipientID: recipientId.value })
      message.value = ''
    })
    .catch((error) => {
      console.error('Error storing message:', error)
    })
}

onMounted(() => {
  socket.value = io('http://localhost:5555')

  socket.value.on('connect', () => {
    socketId.value = socket.id
    console.log('Connected with Socket ID:', socket.value.id)

    socket.value.emit('setUser', userID)
  })

  socket.value.on('message', (data) => {
    if (!userStore.chatRooms.includes(data.chatRoomID)) userStore.addChatRoom(data.chatRoomID)
    userStore.addOnlineChats(data)
    console.log('Received message:', data)

    const { senderID, content, timestamp } = data
    console.log(`Message from ${senderID}: ${content} at ${timestamp}`)
  })

  socket.value.on('disconnect', () => {
    console.log('Disconnected from the server')
  })
})
</script>

<template>
  <div>
    <h1>Direct Messaging</h1>
    <input v-model="message" type="text" placeholder="Type your message" />
    <button @click="sendMessage">Send</button>
  </div>
</template>
