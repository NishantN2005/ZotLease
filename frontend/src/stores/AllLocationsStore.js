import { defineStore } from 'pinia'

export const useAllLocationsStore = defineStore('allLocationsStore', {
  state: () => ({
    allLocations: [],
    firstPhotos: {},
    totalLocationCount: 0,
  }),
  actions: {
    setAllLocations(locations) {
      this.allLocations = locations
    },
    addNewLocation(location) {
      this.allLocations.push(location)
    },
    clearAllLocations() {
      ;(this.allLocations = []), (this.firstPhotos = {})
    },
    setTotalLocationCount(count) {
      this.totalLocationCount = count
    },
  },
  getters: {},
})
