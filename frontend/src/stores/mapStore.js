import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useMapStore = defineStore('map', {
  state: () => ({
    mapCenter: { lat: 33.644, lng: -117.826, zoom: 15 },
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
