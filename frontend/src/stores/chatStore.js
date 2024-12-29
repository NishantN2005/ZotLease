import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useChatStore = defineStore('chat', {
  state: () => {
    return {
      chatRoomID: null,
      activeChatID: null,
      chatRooms: [], // format is {chatRoomID: [fname, unreadMessages, userID]}
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
    setActiveChatID(val) {
      this.activeChatID = val
    },
  },
  getters: {},
})
