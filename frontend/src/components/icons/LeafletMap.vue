<template>
  <div id="map"></div>
</template>

<script>
import { onMounted, watch, ref } from 'vue';
import 'leaflet/dist/leaflet.css';
import leaf from 'leaflet';
import { useUserStore } from '@/stores/userStore';

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
    const markers = ref([]); // Reference to the Leaflet marker

    const userStore = useUserStore()

    //Fetch locations from api
    const fetchLocations = async()=>{
      try{
        console.log('hello')
        let response = await fetch('http://localhost:5555/sublease/retrieve',{
          method:'POST',
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${userStore.userToken}`,
          },
        });
        console.log(response)
        return await response.json();
      }catch(err){
        console.log(err);
        return [];
      }}
    // Add markers to the map
    const addMarkers = (locations) => {
      locations.forEach((location) => {
        const marker = leaf
          .marker([location.latitude, location.longitude])
          .addTo(map.value)
          .bindPopup(`<b>maybe more info here</b>`); // Optional: Display name or other info in a popup
        markers.value.push(marker);
      });
    };

    const updateMapView = (lat, lng, zoom) => {
      if (map.value) {
        map.value.setView([lat, lng], zoom);
        addMarker(lat, lng);
      }
    };

    onMounted(async () => {
      // Initialize the map
      map.value = leaf.map('map').setView([33.644, -117.826], 15);

      // Add a tile layer (e.g., OpenStreetMap)
      leaf
        .tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        })
        .addTo(map.value);

      // Fetch locations and add markers
      const locations = await fetchLocations();
      addMarkers(locations);
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
