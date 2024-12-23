<template>
  <div id="map" style="height: 400px; width: 100%"></div>
</template>

<script>
import { onMounted, onUnmounted } from 'vue';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {makeAuthenticatedRequest} from '../services/authService.js';

export default {
  name: 'LeafletMap',
  props: {
    userToken: {
      type: String,
      required: true,
    },
    routerPass: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    let map = null;

    const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
    const MAPBOX_TILE_URL = `https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${MAPBOX_ACCESS_TOKEN}`;

    // Function to fetch location data from your backend
    const fetchLocations = async () => {
      try {
        const response = await makeAuthenticatedRequest('sublease/retrieve', {}, props.routerPass, props.userToken)
        return await response.json(); // Ensure the response is in JSON format
      } catch (error) {
        console.error('Error fetching location data:', error);
        return [];
      }
    };

    // Function to add markers to the map
    const addMarkers = (locations) => {
      locations.forEach((location) => {
        if (location.latitude && location.longitude) {
          L.marker([location.latitude, location.longitude])
            .addTo(map)
            .bindPopup(`<b>${location.name || 'Unnamed Location'}</b>`);
        }
      });
    };

    onMounted(async () => {
      const mapContainer = document.getElementById('map');
      if (!mapContainer) {
        console.error('Map container not found!');
        return;
      }

      // Initialize the map
      map = L.map(mapContainer).setView([33.644, -117.826], 15);

      // Add the Mapbox tile layer
      L.tileLayer(MAPBOX_TILE_URL, {
        maxZoom: 19,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        attribution:
          'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
          '<a href="https://www.mapbox.com/">Mapbox</a>',
      }).addTo(map);

      // Fetch location data and add markers
      const locations = await fetchLocations();
      addMarkers(locations);
    });

    onUnmounted(() => {
      if (map) {
        map.remove();
        map = null;
      }
    });
  },
};
</script>

<style>
#map {
  height: 400px;
  width: 100%;
}
</style>
