import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useSelectedSubleaseStore = defineStore('selectedsublease', {
  state: () => {
    return {
      subleaseID: null,
      subletters: [],
      selectedSublet: null,
      photos: [],
    }
  },
  actions: {
    setSelectedSublease(subletter) {
      this.selectedSublet = subletter
    },
    setPhotos(val) {
      this.photos = val
    },
    addSubletter(subletter) {
      this.subletters.push(subletter)
      if (this.selectedSublet === null) {
        this.selectedSublet = subletter
      }
    },
    setSelectedSubleaseID(subID) {
      this.subleaseID = subID
    },
    resetSelectedSublease() {
      this.subleaseID = null
      this.subletters = []
      this.selectedSublet = null
      this.photos = []
    },
  },
  getters: {},
})
