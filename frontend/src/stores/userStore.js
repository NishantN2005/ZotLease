import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => {
    return {
      userToken: null,
      userID: null,
      isLoggedIn: false,
      chatRoomID: null,
      chatRooms: [],
      // display from both based on timestamps (make sure online chats is empty if u refresh or logout)
      offlineChats: [],
      onlineChats: [],
    }
  },
  persist: true,
  actions: {
    setUserToken(val) {
      this.userToken = val
    },
    setUserID(val) {
      this.userID = val
    },
    setIsLoggedIn(val) {
      this.isLoggedIn = val
    },
    setChatRoomID(val) {
      this.chatRoomID = val
    },
    setChatRooms(val) {
      this.chatRooms = val
    },
    addChatRoom(val) {
      // when new chatroom is created while online
      this.chatRooms.push(val)
    },
    setOfflineChats(val) {
      this.offlineChats = val
    },
    addOnlineChats(val) {
      this.onlineChats.push(val)
    },
  },
  getters: {},

  // we should be resetting these after logout and should be resetting online chats after refresh
})
