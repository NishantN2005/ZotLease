import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useChatStore = defineStore('chat', {
  state: () => {
    return {
      chatRoomID: null,
      chatRooms: [],
      onlineChats: [],
    }
  },
  persist: true,
  actions: {
    setChatRoomID(val) {
      this.chatRoomID = val
    },
    setChatRooms(val) {
      this.chatRooms = val
    },
    addChatRoom(val) {
      this.chatRooms.push(val)
    },
    addOnlineChats(val) {
      this.onlineChats.push(val)
    },
    setOnlineChats(val) {
      this.onlineChats = val
    },
  },
  getters: {},
})
