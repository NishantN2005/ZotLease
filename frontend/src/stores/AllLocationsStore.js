import { defineStore } from 'pinia'

export const useAllLocationsStore = defineStore('allLocationsStore', {
  state: () => ({
    allLocations: [],
    firstPhotos: {},
  }),
  actions: {
    setAllLocations(locations) {
      this.allLocations = locations
    },
    addNewLocation(location) {
      this.allLocations.push(location)
    },
  },
  getters: {},
})
