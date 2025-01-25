<template>
  <div id="map"></div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { makeAuthenticatedRequest } from '../services/authService.js';
import { useSelectedSubleaseStore } from '@/stores/SelectedSubleaseStore.js';
import {useFilterStore} from '@/stores/filterStore';
import {useAllLocationsStore} from '@/stores/AllLocationsStore';
import {MAPBOX_ACCESS_TOKEN} from '../../constants.js';
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
    }
  },

  setup(props) {
    // Leaflet map and layer references
    let map = null;
    let markersLayer = null;

    const MAPBOX_TILE_URL = `https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${MAPBOX_ACCESS_TOKEN}`;

    const selectedSubleaseStore = useSelectedSubleaseStore();
    const filterStore = useFilterStore();
    const allLocationsStore = useAllLocationsStore();


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
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="50" viewBox="0 0 24 24" fill="none">
            <!-- Outer Pin Shape -->
            <path 
              d="M12 0C7.03 0 3 4.03 3 9C3 15 12 24 12 24S21 15 21 9C21 4.03 16.97 0 12 0Z" 
              fill=${hexColor} 
            />
            <!-- Inner Circle -->
            <circle 
              cx="12" 
              cy="9" 
              r="3" 
              fill="#FFFFFF" 
            />
          </svg>
        `,
        iconSize: [25, 41],
        iconAnchor: [12.5, 41],
      });
    };

    // 3. Add markers for given locations, respecting the filter store
    const addMarkers = (locations) => {
      const addedLeases = new Set();
      locations.forEach((location) => {
        // Check valid lat/lng and if sublease passes the filter
        const passesFilter = !filterStore.isFiltered ||
          filterStore.acceptedSubleases.includes(location.subleaseid);

        if (location.latitude && location.longitude && passesFilter&&!addedLeases.has(location.subleaseid)) {
          addedLeases.add(location.subleaseid);
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
            console.log(info)
            // parse JSON
            const subleaseData = await info.json();
            console.log(subleaseData)
            // set Pinia store state
            /**
             * If it is a new sublease the user clicked on then load data
             */
            if(selectedSubleaseStore.subleaseID!==subleaseData[0].subleaseid){
              selectedSubleaseStore.resetSelectedSublease();
              selectedSubleaseStore.setSelectedSubleaseID(subleaseData[0].subleaseid);
              subleaseData.forEach(subletter=>{
                const {subleaseid, id, ...subletterData} = subletter;
                selectedSubleaseStore.addSubletter(subletterData);
              })
            }

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
      allLocationsStore.setAllLocations(await fetchLocations());

      // Add markers for the initial (unfiltered) load
      addMarkers(allLocationsStore.allLocations);

      // 5. Watch filter store changes.
      //    Whenever `acceptedSubleases` changes, re-draw markers.
      watch(
        () => [filterStore.acceptedSubleases, filterStore.isFiltered],
        ([newAcceptedSubleases, newIsFiltered]) => {

          console.log("inside filter watch right now")
          markersLayer.clearLayers();
          addMarkers(allLocationsStore.allLocations);
        }
      );

      watch(
        ()=>allLocationsStore.allLocations,
        (newLocations)=>{
      
        markersLayer.clearLayers();
        addMarkers(newLocations);
        },
        { deep: true }
      )
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
