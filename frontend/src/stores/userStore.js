import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => {
    return {
      userToken: null,
      userID: null,
      isLoggedIn: false,
      chatRoomID: null,
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
  },
  getters: {},
})
