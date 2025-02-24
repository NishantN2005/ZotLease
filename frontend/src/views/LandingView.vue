<template>
  <div class="min-h-screen flex flex-col bg-neutral-100">
    <!-- Navbar -->
    <nav class="bg-neutral-100 py-4 shadow-md fixed w-full z-50 font-Sriracha">
      <div class="max-w-7xl mx-auto px-4 flex items-center justify-between">
        <!-- Left spacer (empty) -->
        <div class="flex-1 flex justify-start space-x-6"></div>

        <!-- Brand name in center with logo -->
        <div class="flex-1 text-center">
          <div class="flex items-center justify-center">
            <img src="/favicon.png" alt="ZotLease Icon" class="h-12 w-auto mr-2" />
            <span class="text-3xl font-bold text-neutral-900">ZotLease</span>
          </div>
        </div>

        <!-- Right links -->
        <div class="flex-1 flex justify-end space-x-6">
          <a href="/login" class="text-neutral-900 hover:text-gray-300 text-xl hidden md:inline"
            >Login</a
          >
          <a href="/signup" class="text-neutral-900 hover:text-gray-300 text-xl hidden md:inline"
            >Sign Up</a
          >
          <button
            class="md:hidden text-neutral-900 hover:text-gray-300 text-xl"
            @click="toggleMenu"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16m-7 6h7"
              ></path>
            </svg>
          </button>
        </div>
      </div>
      <div v-if="isMenuOpen" class="md:hidden bg-neutral-100 shadow-md z-50">
        <a href="/login" class="block px-4 py-2 text-neutral-900 hover:text-gray-900">Login</a>
        <a href="/signup" class="block px-4 py-2 text-neutral-900 hover:text-gray-900">Sign Up</a>
      </div>
    </nav>

    <!-- Hero Section - Leaflet Map -->
    <header
      class="z-10 relative flex flex-col items-center justify-center text-center text-neutral-900 overflow-hidden pt-16 bg-black h-[80vh] md:h-[80vh]"
    >
      <div id="map" class="w-full h-full blur-sm"></div>
      <div class="z-50 absolute top-1/4 right-8 text-right">
        <h1 class="text-4xl md:text-6xl font-extrabold mb-4">
          <vue-typewriter-effect
            class="text-4xl font-extrabold text-neutral-900 font-Sriracha"
            :strings="['Need a place this summer?', 'Want to save money?']"
          />
        </h1>
        <p class="text-6xl mt-4 text-neutral-900 font-Sriracha font-64">We make it easy.</p>
      </div>
    </header>

    <!-- How it works Section -->
    <section class="py-20 bg-neutral-100 font-Sriracha">
      <div class="max-w-7xl mx-auto px-6 md:px-12">
        <h2 class="text-3xl md:text-4xl font-bold text-neutral-900 mb-14 text-center">
          How it works
        </h2>
        <div class="flex items-center justify-center w-full text-neutral-900">
          <video controls> 
            <source src="/videos/Demo.mp4" type="video/mp4">
          </video>
        </div>
      </div>
    </section>

    <!-- Subleasing Rules Section -->
    <section class="py-20 bg-neutral-100 font-Sriracha">
      <div class="max-w-7xl mx-auto px-6 md:px-52">
        <h2 class="text-3xl md:text-4xl font-bold text-neutral-900 mb-14 text-center">
          Subleasing Rules from ACC @ UCI
        </h2>
        <div class="text-neutral-900 space-y-4">
          <p>
            ✔️ You must obtain written approval from ACC management before subleasing
            (eviction/legal action possible if skipped)
          </p>
          <ul class="list-disc list-inside space-y-2">
            <li>
              Subtenants must be full-time UC Irvine students (undergrad/grad) - freshmen are
              excluded
            </li>
            <li>Provide proof of enrollment (UCI student ID or class schedule) for subtenants</li>
            <li>Subleases are typically same-gender only (exceptions require ACC approval)</li>
            <li>Maximum sublease duration is one academic term (summer/winter/spring/fall)</li>
            <li>You cannot charge subtenants more than your original rent amount</li>
            <li>Submit sublease applications at least 2 weeks before move-in date</li>
            <li>Required documents: ACC sublease form + Check-in/Check-out authorization form</li>
            <li>Notify all roommates before finalizing any sublease agreement</li>
            <li>Original leaseholder remains responsible for rent and damages</li>
            <li>Key exchanges must be handled by leaseholder after ACC approval</li>
            <li>
              Subtenants must purchase full-quarter parking permits unless included in original
              lease
            </li>
            <li>
              All subtenants must follow UC Irvine's smoke-free policies and sustainability rules
            </li>
            <li>Summer sublets are available through the Anteater Housing Network portal</li>
          </ul>
          <p>
            For more information on subleasing rules and guidelines, please visit the ACC website or
            contact your property manager.
          </p>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-neutral-100 py-8 text-center text-neutral-900 font-Sriracha">
      <p class="text-sm md:text-base opacity-80">© 2024 ZotLease. All rights reserved.</p>
    </footer>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import L from 'leaflet'
import { MAPBOX_ACCESS_TOKEN } from '../../constants.js'
import { API_URL } from '../../constants.js'
import VueTypewriterEffect from 'vue-typewriter-effect'

export default {
  name: 'LandingView',
  components: {
    VueTypewriterEffect,
  },
  setup() {
    const isMenuOpen = ref(false)
    const MAPBOX_TILE_URL = `https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${MAPBOX_ACCESS_TOKEN}`

    const toggleMenu = () => {
      isMenuOpen.value = !isMenuOpen.value
    }
    // 2. Create a custom marker icon
    const createHexMarker = () => {
      return L.divIcon({
        className: 'custom-icon',
        html: `
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="50" viewBox="0 0 24 24" fill="none">
            <!-- Outer Pin Shape -->
            <path 
              d="M12 0C7.03 0 3 4.03 3 9C3 15 12 24 12 24S21 15 21 9C21 4.03 16.97 0 12 0Z" 
              fill=#007BFF 
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
      })
    }
    const addMarkers = (locations, map) => {
      const markersLayer = L.layerGroup().addTo(map)

      locations.forEach((location) => {
        const marker = L.marker([location.latitude, location.longitude], {
          icon: createHexMarker(),
        }).addTo(markersLayer)
      })

      return markersLayer
    }

    onMounted(async () => {
      const map = L.map('map').setView([33.644, -117.826], 15)

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

      console.log(API_URL)
      const locations = await fetch(`${API_URL}sublease/getLandingLocations`, {
        method: 'GET',
      })
        .then((res) => res.json())
        .catch((err) => console.log(err))

      console.log(locations)
      addMarkers(locations, map)
    })

    return {
      isMenuOpen,
      toggleMenu,
    }
  },
}
</script>

<style scoped>
#map {
  height: 100%;
  width: 100%;
}
</style>
