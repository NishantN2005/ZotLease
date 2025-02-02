import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => {
    return {
      userToken: null,
      userID: null,
      fname:null,
      lname:null,
      email:null,
      isLoggedIn: false,
    }
  },
  persist: true,
  actions: {
    setUserToken(val) {
      this.userToken = val;
    },
    setUserID(val) {
      this.userID = val;
    },
    setIsLoggedIn(val) {
      this.isLoggedIn = val;
    },
    setFirstname(val){
      this.fname = val;
    },
    setLastname(val){
      this.lname = val;
    },
    setEmail(val){
      this.email = val;
    }
  },
  getters: {},
})
