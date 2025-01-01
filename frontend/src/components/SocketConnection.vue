<script setup>
import { onMounted, ref } from 'vue'
import { io } from 'socket.io-client'
import { useUserStore } from '@/stores/userStore'
import { useChatStore } from '@/stores/chatStore'
import { makeAuthenticatedRequest } from '@/services/authService'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'
library.add(faPaperPlane)

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
      console.log('waiyt what')
      console.log('activeeewe', chatStore.chatRoomID)
      const recipientRoom = chatStore.chatRooms.find((room) => {
        console.log(room.chatRoomID)
        return room.chatRoomID === chatStore.chatRoomID
      })

      if (data.messageData.chatRoomID === chatStore.chatRoomID) {
        chatStore.addOnlineChat(data.messageData)
      }

      console.log(chatStore.onlineChats)
      console.log(recipientRoom.partnerID)

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

    console.log(chatStore.chatRooms)
    const keys = chatStore.chatRooms.map((chat) => chat.chatRoomID)
    console.log(keys, data.chatRoomID)

    if (chatStore.chatRoomID === data.chatRoomID) chatStore.addOnlineChat(data)

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

    const roomIndex = chatStore.chatRooms.findIndex((room) => room.chatRoomID === data.chatRoomID)
    if (roomIndex === -1) {
      console.error('Chat room not found:', data.chatRoomID)
      return
    }

    // updates unread count when chatroom exists in userStore
    if (chatStore.chatRoomID !== data.chatRoomID) {
      const room = chatStore.chatRooms[roomIndex]

      room.unreadMessages += 1

      const [updatedRoom] = chatStore.chatRooms.splice(roomIndex, 1)

      chatStore.chatRooms = [updatedRoom, ...chatStore.chatRooms]
    }

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
  <div class="relative w-full">
    <input
      v-model="message"
      type="text"
      placeholder="Message"
      class="placeholder-stone-500 text-stone-300 border border-stone-500 bg-neutral-900 w-full pr-16 pl-4 py-2 rounded-lg focus:outline-none"
      @keydown.enter.prevent="sendMessage"
    />
    <FontAwesomeIcon
      @click="sendMessage"
      :icon="faPaperPlane"
      class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-stone-500 text-white px-4 py-1 rounded-lg hover:bg-stone-600"
    />
  </div>
</template>
