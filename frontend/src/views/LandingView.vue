<template>
  <div class="min-h-screen flex flex-col bg-neutral-100">
    <!-- Navbar -->
    <nav class="bg-neutral-100 shadow-md fixed w-full z-50 font-Sriracha">
      <div class="max-w-7xl mx-auto px-4 flex items-center justify-between py-4">
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
        <a
          href="/login"
          class="block px-4 py-2 text-neutral-900 hover:text-gray-900 border-y border-neutral-400"
          >Login</a
        >
        <a
          href="/signup"
          class="block px-4 py-2 text-neutral-900 hover:text-gray-900 border-b border-neutral-400"
          >Sign Up</a
        >
        <a
          href="/dashboard"
          class="block px-4 py-2 text-neutral-900 hover:text-gray-900 border-b border-neutral-400"
          >Preview</a
        >
      </div>
    </nav>

    <!-- Hero Section - Leaflet Map -->
    <header
      class="group z-10 relative flex flex-col items-center justify-center text-center text-neutral-900 overflow-hidden pt-16 bg-black h-[80vh] md:h-[80vh]"
    >
      <div id="map" class="w-full h-full blur-sm"></div>

      <div
        class="z-50 absolute top-2/3 md:top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      >
        <a
          href="/dashboard"
          class="bg-white/60 backdrop-blur-sm px-6 py-3 text-lg font-Sriracha font-bold rounded-lg shadow-lg hover:shadow-xl transition-all hover:bg-white/60 border border-white/60"
        >
          Preview
        </a>
      </div>

      <div class="z-50 absolute top-1/4 right-8 text-right">
        <h1 class="text-4xl md:text-6xl font-extrabold mb-4">
          <vue-typewriter-effect
            class="text-4xl font-extrabold text-neutral-100 font-Sriracha"
            :strings="['Need a place this summer?', 'Want to save money?']"
          />
        </h1>
        <p class="text-6xl mt-4 text-neutral-100 font-Sriracha font-64">We make it easy.</p>
      </div>
    </header>

    <!-- How it works Section -->
    <section class="py-20 bg-neutral-100 font-Sriracha">
      <div class="max-w-7xl mx-auto px-6 md:px-12">
        <h2 class="text-3xl md:text-4xl font-bold text-neutral-900 mb-14 text-center">
          How it works
        </h2>
        <div class="flex items-center justify-center w-full">
          <video
            controls
            class="w-full max-w-5xl h-auto rounded-lg shadow-xl border border-gray-300 bg-black"
          >
            <source src="/videos/Demo2.mp4" type="video/mp4" />
          </video>
        </div>
      </div>
    </section>

    <!-- About Us -->
    <section class="py-20 bg-neutral-100 font-Sriracha">
      <div class="max-w-7xl mx-auto px-6 md:px-52">
        <h1 class="text-3xl md:text-4xl font-bold text-neutral-900 mb-14 text-center">About Us</h1>
        <div class="text-neutral-900 space-y-4">
          <p class="font-semibold text-lg">
            Zotlease is the #1 free subleasing platform for students and interns across California
            and nationwide.
          </p>
          <ul class="list-disc list-inside space-y-2">
            <li>
              <strong>Student-founded sublease solution</strong> - Created by UC Irvine students to
              prevent housing scams and make off-campus living safer
            </li>
            <li>
              <strong>UC-wide housing network</strong> - Specializing in verified sublets for UCI,
              UCLA, UCSD, UC Berkeley, UC Davis, UCSB, and all American campuses
            </li>
            <li>
              <strong>Fast, verified listings</strong> - Post or find UC-approved subleases for
              summer, semester, or academic year housing in minutes
            </li>
            <li>
              <strong>Trusted by students</strong> - Every listing is verified to ensure authentic
              student connections and safe transactions
            </li>
            <li>
              <strong>Perfect for internships</strong> - The easiest way to find short-term housing
              for summer internships near any UC campus
            </li>
            <li>
              <strong>Always free</strong> - Supported by local businesses so students never pay
              fees to sublease or find housing
            </li>
          </ul>
          <p class="mt-6 font-medium">
            Join thousands of UC students who trust Zotlease for safe, affordable subleasing
            solutions at every University of California campus.
          </p>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-neutral-100 py-8 text-center text-neutral-900 font-Sriracha">
      <!-- Copyright Text -->
      <p class="text-sm md:text-base opacity-80 mb-6">© 2024 ZotLease. All rights reserved.</p>

      <!-- Social Media & Email Links -->
      <div class="flex justify-center space-x-8">
        <!-- Instagram -->
        <a href="https://instagram.com/zotlease" target="_blank" class="group">
          <font-awesome-icon
            :icon="['fab', 'instagram']"
            class="text-2xl text-neutral-900 group-hover:text-pink-500 transition duration-300"
          />
        </a>

        <!-- TikTok -->
        <a href="https://www.tiktok.com/@zotlease" target="_blank" class="group">
          <font-awesome-icon
            :icon="['fab', 'tiktok']"
            class="text-2xl text-neutral-900 group-hover:text-black transition duration-300"
          />
        </a>

        <!-- Email -->
        <a href="mailto:zotlease@gmail.com" class="group">
          <font-awesome-icon
            :icon="['fas', 'envelope']"
            class="text-2xl text-neutral-900 group-hover:text-blue-500 transition duration-300"
          />
        </a>
      </div>
    </footer>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import L from 'leaflet'
import { MAPBOX_ACCESS_TOKEN } from '../../constants.js'
import { API_URL } from '../../constants.js'
import VueTypewriterEffect from 'vue-typewriter-effect'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faInstagram, faTiktok } from '@fortawesome/free-brands-svg-icons'
import { faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faInstagram, faTiktok, faEnvelope)

export default {
  name: 'LandingView',
  components: {
    VueTypewriterEffect,
    FontAwesomeIcon,
  },
  setup() {
    const isMenuOpen = ref(false)
    const MAPBOX_TILE_URL = `https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${MAPBOX_ACCESS_TOKEN}`

    const toggleMenu = () => {
      isMenuOpen.value = !isMenuOpen.value
    }
    // 2. Create a custom marker icon
    const createHexMarker = (price) => {
      return L.divIcon({
        className: 'custom-price-icon',
        html: `
          <div class="price-bar inline-flex items-center bg-[#0096FF] rounded-full shadow-md px-2 py-1 transition-transform duration-200 hover:scale-[1.15]">
            <div class="text-md font-semibold text-white">$${price}</div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      })
    }
    const addMarkers = (locations, map) => {
      const markersLayer = L.layerGroup().addTo(map)

      locations.forEach((location) => {
        const marker = L.marker([location.latitude, location.longitude], {
          icon: createHexMarker(location.price),
        }).addTo(markersLayer)
      })

      return markersLayer
    }

    onMounted(async () => {
      const map = L.map('map').setView([33.644, -117.826], 15)

      // Add the Mapbox tile layer
      L.tileLayer(MAPBOX_TILE_URL, {
        maxZoom: 19,
        id: 'mapbox/navigation-night-v1',
        tileSize: 512,
        zoomOffset: -1,
        attribution:
          'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
          '<a href="https://www.mapbox.com/">Mapbox</a>',
      }).addTo(map)

      const locations = await fetch(`${API_URL}sublease/getLandingLocations`, {
        method: 'GET',
      })
        .then((res) => res.json())
        .catch((err) => console.log(err))

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
