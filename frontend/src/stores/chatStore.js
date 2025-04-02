import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'

export const useChatStore = defineStore('chat', {
  state: () => {
    return {
      chatRoomID: null,
      activeChatID: null,
      partnerName: null,
      chatRooms: [],
      onlineChats: [],
    }
  },
  persist: false,
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
    setOnlineChats(val) {
      this.onlineChats = val
    },
    addOnlineChat(val) {
      this.onlineChats.push(val)
    },
    setActiveChatID(val) {
      this.activeChatID = val
    },
  },
  getters: {},
})
