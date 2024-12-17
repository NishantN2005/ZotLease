<template>
  <div id="map" style="height: 400px; width: 100%"></div>
</template>

<script>
import { onMounted } from 'vue'
import 'leaflet/dist/leaflet.css'
import leaf from 'leaflet'

export default {
  name: 'LeafletMap',
  setup() {
    onMounted(() => {
      const map = leaf.map('map').setView([33.644, -117.826], 15)

      // Add a tile layer (e.g., OpenStreetMap)
      leaf
        .tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        })
        .addTo(map)
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
