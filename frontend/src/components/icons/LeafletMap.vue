<template>
  <div id="map"></div>
</template>

<script>
import { onMounted, watch, ref } from 'vue';
import 'leaflet/dist/leaflet.css';
import leaf from 'leaflet';

export default {
  name: 'LeafletMap',
  props: {
    latitude: {
      type: Number,
      required: false,
    },
    longitude: {
      type: Number,
      required: false,
    },
    zoom: {
      type: Number,
      default: 15,
    },
  },
  setup(props) {
    const map = ref(null); // Reference to the Leaflet map
    const marker = ref(null); // Reference to the Leaflet marker

    const addMarker = (lat, lng) => {
      // Remove existing marker if any
      if (marker.value) {
        marker.value.remove();
      }
      // Add a new marker
      marker.value = leaf.marker([lat, lng]).addTo(map.value);
    };

    const updateMapView = (lat, lng, zoom) => {
      if (map.value) {
        map.value.setView([lat, lng], zoom);
        addMarker(lat, lng);
      }
    };

    onMounted(() => {
      // Initialize the map
      map.value = leaf.map('map').setView([33.644, -117.826], 15);

      // Add a tile layer (e.g., OpenStreetMap)
      leaf
        .tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        })
        .addTo(map.value);
    });

    // Watch for prop changes and update the map dynamically
    watch(
      () => [props.latitude, props.longitude],
      ([newLat, newLng]) => {
        updateMapView(newLat, newLng, props.zoom);
      }
    );

    return {};
  },
};
</script>

<style>
#map {
  height: 400px;
  width: 100%;
}
</style>
