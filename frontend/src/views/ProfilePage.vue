<template>
  <div class="min-h-screen bg-blue-50 p-6">
    <!-- Back Button -->
    <button
      class="mb-4 px-4 py-2 bg-uciblue text-white rounded-full hover:bg-blue-600"
      @click="goBack"
    >
      &larr;
    </button>

    <!-- Profile Header -->
    <div class="bg-blue-800 rounded-lg shadow-md p-6 flex items-center space-x-4 text-white">
      <div class="w-24 h-24 rounded-full bg-blue-700 flex items-center justify-center">
        <i class="fas fa-user text-white text-5xl"></i>
      </div>
      <div>
        <h1 class="text-2xl font-semibold">
          {{ userStore.fname }} {{ userStore.lname }}
        </h1>
        <p class="text-blue-200">
          {{ userStore.email }}
        </p>
      </div>
    </div>

    <!-- Active Listings Section -->
    <div class="mt-8">
      <h2 class="text-xl font-semibold text-blue-800">Active Listings</h2>
      <div class="mt-4">
        <div v-if="activeListings.length === 0" class="text-gray-600">
          No active listings available.
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Use computed property "activeListings" from the script -->
          <div
            v-for="listing in activeListings"
            :key="listing.subleaseid"
            class="bg-white rounded-lg shadow-md p-4 border border-blue-200"
          >
            <p class="text-blue-700">{{ listing.street_name }}</p>
            <p class="text-blue-600">Rent: ${{ listing.price }}/month</p>
            <div class="flex justify-between">
              <button
                class="mt-4 text-sm text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
                @click="viewListingDetails(listing.subleaseid)"
              >
                View Details
              </button>
              <button
                class="mt-4 text-sm text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
                @click="removeListing(listing.id)"
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
      <h2 class="text-xl font-semibold text-blue-800">Leasing Activity</h2>
      <ul class="mt-4 bg-white rounded-lg shadow-md divide-y divide-blue-200">
        <li
          v-for="activity in user.leasingActivity"
          :key="activity.id"
          class="p-4 flex justify-between items-center"
        >
          <div>
            <p class="text-blue-800">{{ activity.description }}</p>
            <p class="text-sm text-blue-600">{{ activity.date }}</p>
          </div>
          <button
            class="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            @click="viewActivityDetails(activity.id)"
          >
            View Details
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { useAllLocationsStore } from '@/stores/AllLocationsStore';
import {makeAuthenticatedRequest} from '@/services/authService';

export default {
  name: 'ProfilePage',
  setup() {
    const router = useRouter();
    const userStore = useUserStore();
    const locationsStore = useAllLocationsStore();
    let activeListings = ref([]);
    // Return to dashboard
    function goBack() {
      router.push('/dashboard');
    }

    const fetchUserLocations = async () => {
      try {
        const response = await makeAuthenticatedRequest(
          'sublease/fromUser',
          {listerid: userStore.userID}, // any payload if needed
          userStore.routerPass,
          userStore.userToken
        );
        const locations = await response.json();
        activeListings.value = locations;
      } catch (error) {
        console.error('Error fetching all locations:', error);
      }
    };

    onMounted(() => {
      fetchUserLocations();
    });

    console.log(activeListings.value)

    return {
      goBack,
      userStore,
      activeListings, // <-- expose to template
    }
  },
  data() {
    return {
      user: {
        email: 'YoBama@gmail.com',
        // Or remove these placeholders if you want 
        leasingActivity: [
          {
            id: 1,
            description: 'Lease signed for 789 College Ave',
            date: 'December 25, 2024',
          },
          {
            id: 2,
            description: 'New lease posted for 123 Campus Rd',
            date: 'December 20, 2024',
          },
          {
            id: 3,
            description: '7 people recently viewed your listing on 123 Campus Rd',
            date: 'January 5, 2024',
          },
        ],
      },
    };
  },
  methods: {
    viewListingDetails(listingId) {
      this.$router.push(`/listings/${listingId}`);
    },
    viewActivityDetails(activityId) {
      console.log(`Viewing details for activity ID: ${activityId}`);
    },
    async removeListing(id) {
      // If you want to remove from the store, do it there
      // For example:
      const store = useAllLocationsStore();
      console.log(store.allLocations)
      store.allLocations = store.allLocations.filter(
        listing => listing.id !== id
      );

      const response = await makeAuthenticatedRequest('sublease/delete', {id:id}, this.$router, this.userStore.userToken);
      console.log(response);

    },
  },
};
</script>
