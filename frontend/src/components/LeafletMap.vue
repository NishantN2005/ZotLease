<template>
  <div id="map"></div>
</template>

<script>
import { onMounted, onUnmounted } from 'vue';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { makeAuthenticatedRequest } from '../services/authService.js';
import { useSubleaseStore } from '@/stores/subleaseStore'
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
    turnOnSubleaseModal:{
      type: Function,
      required: true
    }
  },
  setup(props) {
    let map = null

    const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN
    const MAPBOX_TILE_URL = `https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${MAPBOX_ACCESS_TOKEN}`

    const subleaseStore = useSubleaseStore()

    // Function to fetch location data from your backend
    const fetchLocations = async () => {
      try {
        const response = await makeAuthenticatedRequest(
          'sublease/retrieve',
          {},
          props.routerPass,
          props.userToken,
        )
        return await response.json() // Ensure the response is in JSON format
      } catch (error) {
        console.error('Error fetching location data:', error)
        return []
      }
    }

    const createHexMarker = (hexColor) => {
      const customIcon = L.divIcon({
        className: 'custom-icon',
        html: `
          <svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41" fill="none">
            <path fill="${hexColor}" stroke="#000" stroke-width="1" d="M12.5 0C5.596 0 0 5.596 0 12.5 0 22.368 12.5 41 12.5 41S25 22.368 25 12.5C25 5.596 19.404 0 12.5 0Z"/>
          </svg>
        `,
        iconSize: [25, 41],
        iconAnchor: [12.5, 41],
      })
      return customIcon
    }

    const addMarkers = (locations) => {
      locations.forEach((location) => {
        if (location.latitude && location.longitude) {
          const isUserLeaser = String(location.listerid).trim() === String(props.userID).trim()
          console.log(isUserLeaser, location.listerid, props.userID)
          // Use hex color for the current user, default for others
          const markerColor = isUserLeaser ? '#FFD700' : '#007BFF' // Yellow (#FFD700) or default blue (#007BFF)
          const markerIcon = createHexMarker(markerColor)

          const marker = L.marker([location.latitude, location.longitude], { icon: markerIcon }).addTo(map);

          marker.subleaseID = location.subleaseid;

          marker.on('click', async ()=>{
            const subid = marker.subleaseID;
            console.log('id is, ', subid);
            //make call to api to retrieve listing information
            let info = await makeAuthenticatedRequest('sublease/selectedInfo',{subleaseID:subid}, props.routerPass, props.userToken);
            const {subleaseid, fname, lname, listerid, price, gender, roomcount, bathroomcount, street_name, city,room, postal_code, startterm, endterm, description} = await info.json()
            subleaseStore.setSelectedSublease(
              subleaseid,
              fname,
              lname,
              listerid,
              price,
              gender,
              roomcount, 
              bathroomcount,
              street_name,
              city,
              room,
              postal_code,
              startterm,
              endterm,
              description
            )
            props.turnOnSubleaseModal()
          })
        }
      })
    }

    onMounted(async () => {
      const mapContainer = document.getElementById('map')
      if (!mapContainer) {
        console.error('Map container not found!')
        return
      }

      // Initialize the map
      map = L.map(mapContainer).setView([33.644, -117.826], 15)

      // Add the Mapbox tile layer
      L.tileLayer(MAPBOX_TILE_URL, {
        maxZoom: 19,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        attribution:
          'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
          '<a href="https://www.mapbox.com/">Mapbox</a>',
      }).addTo(map)

      // Fetch location data and add markers
      const locations = await fetchLocations()
      addMarkers(locations)
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
