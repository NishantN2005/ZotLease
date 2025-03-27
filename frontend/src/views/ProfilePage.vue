<template>
  <div class="min-h-screen bg-neutral-100 text-gray-200 p-6 font-Sriracha">
    <!-- Profile Header -->
    <div class="bg-uciblue rounded-lg shadow-md p-6 flex items-center space-x-4">
      <div class="w-24 h-24 rounded-full bg-uciblue border flex items-center justify-center">
        <i class="fas fa-user text-white text-5xl"></i>
      </div>
      <div>
        <h1 class="text-2xl font-semibold text-white">
          {{ userStore.fname }} {{ userStore.lname }}
        </h1>
        <p class="text-white">
          {{ userStore.email }}
        </p>
      </div>
    </div>

    <!-- Active Listings Section -->
    <div class="mt-8">
      <h2 class="text-xl font-semibold text-uciblue">Active Listings</h2>
      <div v-if="isLoading" class="grid grid-cols-1 gap-4 md:grid-cols-2 mt-4">
        <div
          v-for="n in 2"
          :key="'listing-skeleton-' + n"
          class="p-4 rounded-lg bg-uciblue animate-pulse space-y-3"
        >
          <div class="h-4 bg-uciblue rounded w-3/4"></div>
          <div class="h-4 bg-uciblue rounded w-1/2"></div>
          <div class="h-4 bg-uciblue rounded w-full"></div>
        </div>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-if="activeListings.length == 0">
          <h1 class="text-uciblue font-Sriracha">No active listings :(</h1>
        </div>
        <div
          v-for="listing in activeListings"
          :key="listing.subleaseid"
          class="bg-uciblue rounded-lg shadow-md p-6 border border-gray-700"
        >
          <div class="flex items-center justify-between mb-4">
            <div>
              <p class="text-lg font-semibold text-gray-100">{{ listing.street_name }}</p>
              <p class="text-sm text-gray-400">{{ listing.city }}</p>
            </div>
            <div class="text-right">
              <p class="text-lg font-semibold text-gray-100">${{ listing.price }}</p>
              <p class="text-sm text-gray-400">/month</p>
            </div>
          </div>
          <div class="flex items-center justify-between mb-4">
            <div>
              <p class="text-sm text-gray-400">Rooms: {{ listing.roomcount }}</p>
              <p class="text-sm text-gray-400">Bathrooms: {{ listing.bathroomcount }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-400">Start: {{ formatDate(listing.startterm) }}</p>
              <p class="text-sm text-gray-400">End: {{ formatDate(listing.endterm) }}</p>
            </div>
          </div>
          <div class="flex justify-between mt-4">
            <div>
              <button
                class="text-sm text-uciblue bg-white hover:bg-uciblue-dark px-4 py-2 rounded transition duration-300 mr-6"
                @click="() => activateEditSubleaseModal(listing)"
              >
                Edit
              </button>
              <button
                class="text-sm text-white bg-red-700 hover:bg-red-800 px-4 py-2 rounded transition duration-300"
                @click="removeListing(listing)"
              >
                Remove Listing
              </button>
            </div>
            <p v-if="listing.viewcount > 0" class="text-white font-medium flex items-center gap-1">
              🔥 <span>{{ listing.viewcount }}</span>
              {{ listing.viewcount === 1 ? 'view' : 'views' }}
            </p>
          </div>
          <EditSubleaseModal
            v-model:show="editModalOpen"
            :sublease="selectedSublease"
            :router="router"
            :updateListings="updateListings"
          />
        </div>
      </div>
    </div>

    <!-- Leasing Activity Section -->
    <div class="mt-8">
      <h2 class="text-xl font-semibold text-uciblue">Leasing Activity</h2>
      <div v-if="isLoading" class="mt-4 bg-uciblue rounded-lg p-4 animate-pulse space-y-4">
        <div v-for="m in 3" :key="'activity-skeleton-' + m" class="flex items-center space-x-4">
          <div class="rounded-full bg-uciblue h-10 w-10"></div>
          <div class="h-4 bg-uciblue rounded flex-1"></div>
        </div>
      </div>
      <div v-else>
        <div v-if="leaseActivity.length === 0" class="text-gray-400">
          No leasing activity available.
        </div>
        <ul v-else class="mt-4 bg-uciblue rounded-lg shadow-md divide-y divide-gray-700">
          <li v-for="activity in leaseActivity" :key="activity.id" class="text-gray-300">
            <h1 class="pt-2 px-4">
              {{ activity.activity }}
            </h1>
            <p class="px-4 text-neutral-400">{{ formatDate(activity.date) }}</p>
          </li>
        </ul>
      </div>
    </div>

    <!-- Back Button -->
    <button
      class="fixed top-6 right-6 bg-uciblue text-white px-5 py-3 rounded-full hover:bg-uciblue-dark transition duration-300 flex items-center gap-2 cursor-pointer z-50"
      @click="goBack"
    >
      <i class="fas fa-arrow-left"></i>
      <span class="font-medium">Back</span>
    </button>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { makeAuthenticatedRequest } from '@/services/authService'
import { useAllLocationsStore } from '@/stores/AllLocationsStore'
import EditSubleaseModal from '@/components/EditSubleaseModal.vue'

export default {
  name: 'ProfilePage',
  components: { EditSubleaseModal },
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    const activeListings = ref([])
    const leaseActivity = ref([])
    const isLoading = ref(true)
    const editModalOpen = ref(false)
    const selectedSublease = ref({})

    // Return to dashboard
    function goBack() {
      router.push('/dashboard')
    }

    const updateListings = (listing) => {
      const index = activeListings.value.findIndex((l) => l.subleaseid === listing.subleaseid)
      if (index !== -1) {
        activeListings.value[index] = listing
      }
    }

    const activateEditSubleaseModal = (listing) => {
      console.log(listing)
      selectedSublease.value = { ...listing }
      editModalOpen.value = true
    }

    const fetchUserLocations = async () => {
      try {
        const response = await makeAuthenticatedRequest(
          'sublease/fromUser',
          { listerid: userStore.userID },
          userStore.routerPass,
        )
        const locations = await response.json()
        if (Array.isArray(locations)) {
          activeListings.value = locations.filter(
            (listing) => listing.listerid === userStore.userID,
          )
        } else {
          console.error('Expected an array but got:', locations)
        }
      } catch (error) {
        console.error('Error fetching all locations:', error)
      }
    }

    const fetchUserActivity = async () => {
      try {
        const resp = await makeAuthenticatedRequest(
          'activity/getActivity',
          { listerid: userStore.userID },
          userStore.routerPass,
        )
        const activity = await resp.json()
        leaseActivity.value = activity
      } catch (error) {
        console.error('Error fetching user activity:', error)
      }
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    onMounted(async () => {
      await fetchUserLocations()

      await fetchUserActivity()

      isLoading.value = false
    })

    return {
      goBack,
      formatDate,
      activateEditSubleaseModal,
      updateListings,
      userStore,
      activeListings,
      leaseActivity, // <-- expose to template
      isLoading,
      editModalOpen,
      selectedSublease,
      router,
    }
  },
  methods: {
    async removeListing(listingToDelete) {
      // If you want to remove from the store, do it there
      // For example:
      const store = useAllLocationsStore()
      store.allLocations = store.allLocations.filter((listing) => listing.id !== listingToDelete.id)

      this.activeListings = this.activeListings.filter(
        (listing) => listing.id !== listingToDelete.id,
      )

      const response = await makeAuthenticatedRequest(
        'sublease/delete',
        { id: listingToDelete.id },
        this.$router,
      )

      // Add activity
      const responseForActivity = await makeAuthenticatedRequest(
        'activity/addActivity',
        {
          activity: `🏡 You took down your listing @ ${listingToDelete.street_name}`,
          listerid: listingToDelete.listerid,
        },
        this.$router,
      )
      const activity = await responseForActivity.json()
      this.leaseActivity.unshift({
        activity: `🏡 You took down your listing @ ${listingToDelete.street_name}`,
        date: activity.date,
        id: activity.id,
      })
      console.log(responseForActivity)
    },
  },
}
</script>
