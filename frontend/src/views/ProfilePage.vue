<template>
  <div class="min-h-screen bg-gray-900 text-gray-200 p-6">
    <!-- Back Button -->
    <button
      class="mb-4 px-4 py-2 bg-uciblue text-white rounded-full hover:bg-uciblue transition duration-300"
      @click="goBack"
    >
      &larr; Back to Dashboard
    </button>

    <!-- Profile Header -->
    <div class="bg-gray-800 rounded-lg shadow-md p-6 flex items-center space-x-4">
      <div class="w-24 h-24 rounded-full bg-uciblue flex items-center justify-center">
        <i class="fas fa-user text-white text-5xl"></i>
      </div>
      <div>
        <h1 class="text-2xl font-semibold text-gray-100">
          {{ userStore.fname }} {{ userStore.lname }}
        </h1>
        <p class="text-gray-400">
          {{ userStore.email }}
        </p>
      </div>
    </div>

    <!-- Active Listings Section -->
    <div class="mt-8">
      <h2 class="text-xl font-semibold text-gray-100">Active Listings</h2>
      <div class="mt-4">
        <div v-if="activeListings.length === 0" class="text-gray-400">
          No active listings available.
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="listing in activeListings"
            :key="listing.subleaseid"
            class="bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700"
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
              <button
                class="text-sm text-white bg-red-700 hover:bg-red-800 px-4 py-2 rounded transition duration-300"
                @click="removeListing(listing)"
              >
                Remove Listing
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Leasing Activity Section -->
    <div class="mt-8">
      <h2 class="text-xl font-semibold text-gray-100">Leasing Activity</h2>
      <div v-if="leaseActivity.length === 0" class="text-gray-400">
        No leasing activity available.
      </div>
      <ul class="mt-4 bg-gray-800 rounded-lg shadow-md divide-y divide-gray-700">
        <li
          v-for="activity in leaseActivity"
          :key="activity.id"
          class="p-4 flex justify-between items-center"
        >
          <div>
            <p class="text-gray-100">{{ activity.activity }}</p>
            <p class="text-sm text-gray-400">{{ formatDate(activity.date) }}</p>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { makeAuthenticatedRequest } from '@/services/authService';
import { useAllLocationsStore } from '@/stores/AllLocationsStore';

export default {
  name: 'ProfilePage',
  setup() {
    const router = useRouter();
    const userStore = useUserStore();
    const activeListings = ref([]);
    const leaseActivity = ref([]);

    // Return to dashboard
    function goBack() {
      router.push('/dashboard');
    }

    const fetchUserLocations = async () => {
      try {
        const response = await makeAuthenticatedRequest(
          'sublease/fromUser',
          { listerid: userStore.userID },
          userStore.routerPass,
          userStore.userToken
        );
        const locations = await response.json();
        if (Array.isArray(locations)) {
          activeListings.value = locations.filter(
            listing => listing.listerid === userStore.userID
          );
        } else {
          console.error('Expected an array but got:', locations);
        }
      } catch (error) {
        console.error('Error fetching all locations:', error);
      }
    };

    const fetchUserActivity = async () => {
      try {
        const resp = await makeAuthenticatedRequest(
          'activity/getActivity',
          { listerid: userStore.userID },
          userStore.routerPass,
          userStore.userToken
        );
        const activity = await resp.json();
        console.log(activity);
        leaseActivity.value = activity;
      } catch (error) {
        console.error('Error fetching user activity:', error);
      }
    };

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    onMounted(() => {
      fetchUserLocations();

      fetchUserActivity();
    });

    console.log(activeListings.value)

    return {
      goBack,
      formatDate,
      userStore,
      activeListings,
      leaseActivity // <-- expose to template
    }
  },
  methods: {
    async removeListing(listingToDelete) {
      // If you want to remove from the store, do it there
      // For example:
      const store = useAllLocationsStore();
      console.log(store.allLocations)
      store.allLocations = store.allLocations.filter(
        listing => listing.id !== listingToDelete.id
      );

      console.log(this.activeListings)
      this.activeListings = this.activeListings.filter(
        listing => listing.id !== listingToDelete.id
      );

      const response = await makeAuthenticatedRequest('sublease/delete', {id:listingToDelete.id}, this.$router, this.userStore.userToken);
      console.log(response);


      // Add activity
      const responseForActivity = await makeAuthenticatedRequest('activity/addActivity', {activity: `🏡 You took down your listing @ ${listingToDelete.street_name}`, listerid: listingToDelete.listerid}, this.$router, this.userStore.userToken);
      const activity = await responseForActivity.json();
      this.leaseActivity.push({activity: `🏡 You took down your listing @ ${listingToDelete.street_name}`, date: activity.date, id: activity.id});
      console.log(responseForActivity);
    },
  },
};
</script>
