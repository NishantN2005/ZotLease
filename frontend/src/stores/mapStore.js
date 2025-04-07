import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useMapStore = defineStore('map', {
  state: () => ({
    mapCenter: { lat: 35.644, lng: -118.826, zoom: 6 },
    hasLocatedUser: false,
  }),
  actions: {
    setMapCenter({ lat, lng, zoom = 15 }) {
      this.mapCenter = { lat, lng, zoom }
    },
    setHasLocatedUser(val) {
      this.hasLocatedUser = val
    },
  },
  getters: {},
})
