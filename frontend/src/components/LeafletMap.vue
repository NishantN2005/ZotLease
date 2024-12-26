<template>
  <div id="map"></div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { makeAuthenticatedRequest } from '../services/authService.js';
import { useSubleaseStore } from '@/stores/subleaseStore';
import {useFilterStore} from '@/stores/filterStore';

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
    userID: {
      type: String,
      required: true,
    },
    turnOnSubleaseModal: {
      type: Function,
      required: true
    },
    // The filter form object, e.g. { gender: 'Male', minPrice: 500, maxPrice: 1200 }
    filterForm: {
      type: Object,
      required: true
    },
  },

  setup(props) {
    // Leaflet map and layer references
    let map = null;
    let markersLayer = null;

    const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
    const MAPBOX_TILE_URL = `https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${MAPBOX_ACCESS_TOKEN}`;

    const subleaseStore = useSubleaseStore();
    const filterStore = useFilterStore();

    // We'll store ALL fetched locations in a ref so we can re-filter them.
    const allLocations = ref([]);

    // 1. Fetch location data from your backend
    const fetchLocations = async () => {
      try {
        const response = await makeAuthenticatedRequest(
          'sublease/retrieve',
          {}, // any payload if needed
          props.routerPass,
          props.userToken
        );
        // Return the parsed JSON array of subleases
        return await response.json();
      } catch (error) {
        console.error('Error fetching location data:', error);
        return [];
      }
    };

    // 2. Create a custom marker icon
    const createHexMarker = (hexColor) => {
      return L.divIcon({
        className: 'custom-icon',
        html: `
          <svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41" fill="none">
            <path fill="${hexColor}" stroke="#000" stroke-width="1" d="M12.5 0C5.596 0 0 5.596 0 12.5 0 22.368 12.5 41 12.5 41S25 22.368 25 12.5C25 5.596 19.404 0 12.5 0Z"/>
          </svg>
        `,
        iconSize: [25, 41],
        iconAnchor: [12.5, 41],
      });
    };

    // 3. Add markers for given locations, respecting the filter store
    const addMarkers = (locations) => {
      locations.forEach((location) => {
        // Check valid lat/lng and if sublease passes the filter
        const passesFilter = !filterStore.isFiltered ||
          filterStore.acceptedSubleases.includes(location.subleaseid);

        if (location.latitude && location.longitude && passesFilter) {
          const isUserLeaser = String(location.listerid).trim() === String(props.userID).trim();
          const markerColor = isUserLeaser ? '#FFD700' : '#007BFF';
          const markerIcon = createHexMarker(markerColor);

          // Add marker to the markersLayer (not directly to the map)
          const marker = L.marker([location.latitude, location.longitude], {
            icon: markerIcon
          }).addTo(markersLayer);

          // Store subleaseID so we can fetch details on click
          marker.subleaseID = location.subleaseid;

          marker.on('click', async () => {
            const subid = marker.subleaseID;
            console.log('Clicked sublease ID:', subid);

            // Make call to retrieve listing information
            let info = await makeAuthenticatedRequest(
              'sublease/selectedInfo',
              { subleaseID: subid },
              props.routerPass,
              props.userToken
            );

            // parse JSON
            const subleaseData = await info.json();

            // set Pinia store state
            subleaseStore.setSelectedSublease(
              subleaseData.subleaseid,
              subleaseData.fname,
              subleaseData.lname,
              subleaseData.listerid,
              subleaseData.price,
              subleaseData.gender,
              subleaseData.roomcount,
              subleaseData.bathroomcount,
              subleaseData.street_name,
              subleaseData.city,
              subleaseData.room,
              subleaseData.postal_code,
              subleaseData.startterm,
              subleaseData.endterm,
              subleaseData.description
            );

            // open your sublease modal
            props.turnOnSubleaseModal();
          });
        }
      });
    };

    // 4. Set up map on mount
    onMounted(async () => {
      const mapContainer = document.getElementById('map');
      if (!mapContainer) {
        console.error('Map container not found!');
        return;
      }

      // Initialize the Leaflet map
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

      // Create a LayerGroup to hold markers
      markersLayer = L.layerGroup().addTo(map);

      // Fetch all locations once
      allLocations.value = await fetchLocations();

      // Add markers for the initial (unfiltered) load
      addMarkers(allLocations.value);

      // 5. Watch filter store changes.
      //    Whenever `acceptedSubleases` changes, re-draw markers.
      watch(
        () => [filterStore.acceptedSubleases, filterStore.isFiltered],
        ([newAcceptedSubleases, newIsFiltered]) => {

          markersLayer.clearLayers();
          addMarkers(allLocations.value);
        }
      );


      // If you also have an `isFiltered` property or other filter props, you can watch them similarly:
      // watch(
      //   () => props.filterStore.isFiltered,
      //   () => {
      //     markersLayer.clearLayers();
      //     addMarkers(allLocations.value);
      //   }
      // );
    });

    // 6. Clean up on unmount
    onUnmounted(() => {
      if (map) {
        map.remove();
        map = null;
      }
    });
  },
};
</script>
