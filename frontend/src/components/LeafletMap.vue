<template>
  <div id="map" style="height: 400px; width: 100%"></div>
</template>

<script>
import { onMounted, onUnmounted } from 'vue'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

export default {
  name: 'LeafletMap',
  setup() {
    let map = null

    onMounted(() => {
      const mapContainer = document.getElementById('map')
      if (!mapContainer) {
        console.error('Map container not found!')
        return
      }

      map = L.map(mapContainer).setView([33.644, -117.826], 15)

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map)
    })

    onUnmounted(() => {
      if (map) {
        map.remove()
        map = null
      }
    })
  },
}
</script>

<style>
#map {
  height: 400px;
  width: 100%;
}
</style>
