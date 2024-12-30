<script setup>
import { onMounted, ref } from 'vue'
import { io } from 'socket.io-client'
import { useUserStore } from '@/stores/userStore'
import { useChatStore } from '@/stores/chatStore'
import { makeAuthenticatedRequest } from '@/services/authService'

const props = defineProps({
  router: {
    type: Object,
    required: true,
  },
})

const userStore = useUserStore()
const chatStore = useChatStore()

const socketId = ref(null)
const socket = ref(null)
const message = ref('')

// set to 01 but dynamically put recipient id to userID from clicked card/chat
const userID = userStore.userID

const sendMessage = () => {
  const formData = {
    chatRoomID: chatStore.chatRoomID,
    sender: userStore.userID,
    content: message.value,
  }

  makeAuthenticatedRequest('chat/sendMessage', formData, props.router, userStore.userToken)
    .then((response) => {
      return response.json()
    })
    .then((data) => {
      console.log('activeeewe', chatStore.activeChatID)
      const recipientRoom = chatStore.chatRooms.find((room) => {
        console.log(room.chatRoomID)
        return room.chatRoomID === chatStore.activeChatID
      })

      socket.value.emit('directMessage', {
        ...data.messageData,
        recipientID: recipientRoom.partnerID,
      })
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

  socket.value.on('message', async (data) => {
    console.log('Received message:', data)

    const keys = Object.keys(chatStore.chatRooms)
    console.log(keys, data.chatRoomID)
    // checks if recieved message room is in user store, if not add it
    if (!keys.some((key) => key === data.chatRoomID)) {
      try {
        const response = await makeAuthenticatedRequest(
          'chat/getChatRooms',
          { userID: userStore.userID },
          props.router,
          userStore.userToken,
        )
        console.log('Response:', response)
        const result = await response.json()
        console.log('Chat rooms:', result)
        chatStore.setChatRooms(result.chatRooms)

        return
      } catch (error) {
        console.error('Error fetching chat rooms:', error)
        return
      }
    }

    const roomKey = keys.find((room) => room === data.chatRoomID)
    if (!roomKey) {
      console.error('Chat room not found:', data.chatRoomID)
      return
    }
    const room = chatStore.chatRooms[roomKey]

    // updates unread count when chatroom exists in userStore
    room[1] += 1
    chatStore.chatRooms = { ...chatStore.chatRooms }

    console.log('Updated chat rooms:', chatStore.chatRooms)
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
