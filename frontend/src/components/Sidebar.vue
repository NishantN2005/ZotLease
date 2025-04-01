<template>
  <!-- Header (replacing vertical sidebar) -->
  <div @mouseenter="secondBarOn" @mouseleave="secondBarOff">
    <header
      class="fixed top-0 left-0 right-0 flex items-center justify-between bg-gray-100 text-[#042553] h-16 z-40 px-4"
    >
      <div class="hidden sm:flex items-center">
        <!-- Hide completely on mobile -->
        <div
          class="flex ml-4 text-2xl font-bold items-center gap-2 font-Sriracha cursor-pointer"
          @click="redirectToLanding"
        >
          <img src="/favicon.png" alt="zotlease logo" class="w-10 h-10" />
          <h2>ZotLease</h2>
        </div>
      </div>

      <!-- Center Section: Navigation Buttons -->
      <!-- <div class="flex items-center space-x-6">
      <button
        @click="toggleFilterModals"
        :class="{ 'bg-stone-500': showFilterModal }"
        class="w-16 h-16 border border-stone-500 rounded-full flex items-center justify-center hover:bg-stone-500"
      >
        <i class="fas fa-filter text-xl"></i>
      </button>
    </div> -->
      <div class="w-full sm:w-1/2 relative">
        <input
          id="gmaps-autocomplete"
          type="text"
          v-model="searchQuery"
          placeholder="Find Leases Near You..."
          class="w-full py-3 pr-12 pl-5 rounded-full border border-gray-300 shadow-md text-black focus:outline-none focus:ring-1 focus:ring-blue-400 placeholder-gray-400 sm:placeholder-opacity-100"
        />
        <!-- Overlay text for mobile -->
        <span
          class="sm:hidden absolute left-5 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400 bg-white w-2/3"
        >
          Search..
        </span>
        <i
          class="fas fa-search absolute right-4 top-1/2 transform -translate-y-1/2 bg-[#042553] text-white p-3 rounded-full cursor-pointer hover:bg-blue-600 transition-all"
        ></i>
      </div>

      <!-- Right Section: Logout or additional actions -->
      <div class="relative flex items-center">
        <!-- Create Subleas Modal Button -->
        <button
          @click="turnOnModal"
          class="h-12 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-200 px-3"
        >
          <span class="w-full h-full flex items-center justify-center">Create Listing</span>
        </button>

        <!-- Messages Button -->
        <button
          @click="toggleMessages"
          :class="{ 'bg-gray-300': messagesOpen }"
          class="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer border-2 border-transparent transition-all duration-200 hover:bg-gray-200 mr-2"
        >
          <i class="fas fa-comments text-xl"></i>
        </button>

        <!-- Profile Modal Trigger Button -->
        <div class="relative">
          <button
            @click="toggleProfileModal"
            class="w-20 h-11 border border-gray-300 rounded-full flex items-center justify-center space-x-2 hover:shadow-md cursor-pointer"
          >
            <svg
              class="w-5 h-5"
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
            <i class="fas fa-user text-xl"></i>
          </button>

          <!-- Profile Modal Dropdown -->
          <transition name="fade">
            <div
              v-if="showProfileModal"
              class="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg z-50 overflow-hidden"
            >
              <!-- Profile Button for Logged-in Users -->
              <button
                v-if="userStore.isLoggedIn"
                @click="redirectToProfile"
                class="w-full px-4 py-2 text-left hover:bg-gray-100 rounded-t-lg focus:outline-none flex items-center"
              >
                <i class="fas fa-user text-md mr-3"></i>
                Profile
              </button>

              <!-- Signup/Login Options for Logged-out Users -->
              <div v-if="!userStore.isLoggedIn">
                <div class="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center">
                  <a href="/signup" class="hover:underline">Signup</a>
                </div>
                <div class="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center">
                  <a href="/login" class="hover:underline">Login</a>
                </div>
              </div>

              <!-- Logout Button for Logged-in Users -->
              <button
                v-if="userStore.isLoggedIn"
                @click="Logout"
                class="w-full px-4 py-2 text-left hover:bg-gray-100 rounded-b-lg focus:outline-none flex items-center"
              >
                <i class="fas fa-sign-out-alt text-md mr-3"></i>
                Logout
              </button>
            </div>
          </transition>
        </div>
      </div>
    </header>

    <transition name="slide-down">
      <div v-show="showSecondBar" class="fixed top-16 left-0 right-0 z-30 bg-gray-100">
        <!-- Separator Line -->
        <div class="border-t border-gray-300"></div>

        <div class="second-bar flex items-center px-4 py-2">
          <!-- Scrollable University Logos -->
          <div class="flex-1 overflow-x-auto whitespace-nowrap scrollbar-hide py-2">
            <div class="inline-flex space-x-4 text-gray-600">
              <img
                src="/ucilogo.png"
                alt="uci logo"
                class="w-10 h-8 sm:w-12 sm:h-10 object-contain cursor-pointer transition-transform duration-200 hover:scale-110"
                @click="zoomToLocation(33.6405, -117.8443)"
              />
              <img
                src="/ucrlogo.png"
                alt="ucr logo"
                class="w-10 h-8 sm:w-12 sm:h-10 object-contain cursor-pointer transition-transform duration-200 hover:scale-110"
                @click="zoomToLocation(33.9737, -117.3281)"
              />
              <img
                src="/uclalogo.png"
                alt="ucla logo"
                class="w-10 h-8 sm:w-12 sm:h-10 object-contain cursor-pointer transition-transform duration-200 hover:scale-110"
                @click="zoomToLocation(34.0689, -118.4452)"
              />
              <img
                src="/ucsdlogo.png"
                alt="ucsd logo"
                class="w-10 h-8 sm:w-12 sm:h-10 object-contain cursor-pointer transition-transform duration-200 hover:scale-110"
                @click="zoomToLocation(32.8801, -117.234)"
              />
              <!-- Add more logos if needed -->
            </div>
          </div>

          <!-- Right: Filter Button -->
          <button
            @click="toggleFilterModals"
            :class="{ 'bg-stone-500': showFilterModal }"
            class="border border-1 border-gray-300 rounded-md flex items-center justify-center text-sm gap-1 mr-2 px-3 py-2 text-[#042553] hover:bg-gray-200"
          >
            <i class="fas fa-filter text-md"></i>Filters
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useChatStore } from '@/stores/chatStore'
import { useUserStore } from '@/stores/userStore'
import { useMapStore } from '@/stores/mapStore.js'
import { MAPBOX_ACCESS_TOKEN } from '../../constants.js'
import Messages from './Messages.vue'

export default {
  name: 'Sidebar',
  components: { Messages },
  props: {
    Logout: {
      type: Function,
      required: true,
    },
    turnOnModal: {
      type: Function,
      required: true,
    },
    toggleFilterModal: {
      type: Function,
      required: true,
    },
    router: {
      type: Object,
      required: true,
    },
    mapView: {
      type: Boolean,
      required: true,
    },
    toggleView: {
      type: Function,
      required: true,
    },
    toggleCheckMessage: {
      type: Function,
      required: true,
    },
    toggleMessages: {
      type: Function,
      required: true,
    },
    showFilterModal: {
      type: Boolean,
      required: true,
    },
    messagesOpen: {
      type: Boolean,
      required: true,
    },
    messageRef: {
      type: Object,
      required: true,
    },
    isSidebarOpen: {
      type: Boolean,
      required: true,
    },
    toggleSidebar: {
      type: Object,
      required: true,
    },
    promptSignup: {
      type: Function,
      required: true,
    },
    userStore: {
      type: Object,
      required: true,
    },
    filterOpen: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    Messages,
  },
  methods: {
    redirectToProfile() {
      if (!this.userStore.isLoggedIn) {
        this.promptSignup()
        return
      }
      this.router.push('/profile')
    },
    Logout() {
      this.Logout()
    },
    turnOnModal() {
      this.turnOnModal()
    },
    toggleFilterModals() {
      this.filterOpen = !this.filterOpen
      if (this.filterOpen) {
        this.chatStore.setChatRoomID(null)
        this.chatStore.setActiveChatID(null)
      }
      this.toggleFilterModal()
    },

    toggleDashMessage(chatroomID, partnerName, partnerID) {
      if (!this.userStore.isLoggedIn) {
        this.promptSignup()
        return
      }
      if (!this.messagesOpen) this.toggleMessages()

      if (this.messagesOpen && this.filterOpen) {
        this.toggleFilterModal()
      }

      this.$nextTick(() => {
        if (Object.keys(this.messageRef).length > 0) {
          this.messageRef.selectChat(chatroomID, partnerName, partnerID)
          this.messageRef.updateUnreadCount(chatroomID)
        }
      })
    },
  },

  setup(props) {
    const chatStore = useChatStore()
    const userStore = useUserStore()
    const mapStore = useMapStore()
    const showProfileModal = ref(false)
    const showSecondBar = ref(false)
    const searchQuery = ref('')

    const checkScreenWidth = () => {
      if (window.innerWidth < 640) {
        showSecondBar.value = true
      }
    }

    onMounted(() => {
      checkScreenWidth()
      window.addEventListener('resize', checkScreenWidth)

      const waitForGoogle = () => {
        return new Promise((resolve) => {
          if (window.google) {
            resolve(window.google)
          } else {
            const interval = setInterval(() => {
              if (window.google) {
                clearInterval(interval)
                resolve(window.google)
              }
            }, 100)
          }
        })
      }

      waitForGoogle().then(() => {
        const input = document.getElementById('gmaps-autocomplete')
        if (!input) return

        const autocomplete = new google.maps.places.Autocomplete(input, {})

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace()
          if (place.geometry && place.geometry.location) {
            const lat = place.geometry.location.lat()
            const lng = place.geometry.location.lng()
            mapStore.setMapCenter({ lat, lng, zoom: 13 })
            searchQuery.value = ''
          } else {
            console.error('Place details not available for:', place.name)
          }
        })
      })
    })

    onBeforeUnmount(() => {
      window.removeEventListener('resize', checkScreenWidth)
    })

    const clearSearch = () => {
      searchQuery.value = ''
      const input = document.getElementById('gmaps-autocomplete')
      if (input) {
        input.value = ''
      }
    }

    const redirectToLanding = () => {
      props.router.push('/')
    }

    const secondBarOn = () => {
      if (window.innerWidth >= 640) showSecondBar.value = true
    }
    const secondBarOff = () => {
      if (window.innerWidth >= 640) showSecondBar.value = false
    }

    const redirectToProfile = () => {
      if (!props.userStore.isLoggedIn) {
        props.promptSignup()
        return
      }
      props.router.push('/profile')
    }

    const turnOnModal = () => {
      props.turnOnModal()
    }
    const toggleFilterModals = () => {
      props.toggleFilterModal()
    }
    const toggleMessages = () => {
      props.toggleMessages()
    }
    const toggleView = (param) => {
      props.toggleView(param)
    }
    const Logout = () => {
      props.Logout()
    }
    const toggleProfileModal = () => {
      showProfileModal.value = !showProfileModal.value
    }
    const zoomToLocation = (lat, lng) => {
      mapStore.setMapCenter({ lat, lng, zoom: 14 })
    }

    return {
      redirectToProfile,
      turnOnModal,
      toggleFilterModals,
      toggleMessages,
      toggleView,
      Logout,
      chatStore,
      userStore,
      toggleProfileModal,
      showProfileModal,
      MAPBOX_ACCESS_TOKEN,
      redirectToLanding,
      secondBarOn,
      secondBarOff,
      showSecondBar,
      zoomToLocation,
      searchQuery,
      clearSearch,
    }
  },
}
</script>

<style>
/* Transitions for mobile sidebar and overlay */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.5s ease; /* Only transition transform */
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%); /* Slide up and down */
}

.second-bar {
  height: 4rem; /* Adjust height as needed */
}

/* Ensure this is in a global stylesheet, not scoped */
.pac-container {
  background-color: #fff;
  border-radius: 15px 15px 15px 15px; /* Only round bottom corners */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: none;
  margin-top: 5px;
  font-family: inherit;
  z-index: 1000 !important;
  max-height: 220px;
  overflow-y: auto;
  padding-top: 0;
}

/* Style each result item */
.pac-item {
  padding: 10px 15px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  font-size: 14px;
}

.pac-item:hover {
  background-color: #f5f5f5;
}

/* Style the query and overall look */
.pac-item-query {
  color: #042553;
  font-size: 15px;
}

/* Style the "Powered by Google" text, 
   but note you must not hide or remove it per Google’s guidelines */
.pac-footer {
  font-size: 10px;
  color: #aaa;
  text-align: right;
  padding: 4px 8px;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
