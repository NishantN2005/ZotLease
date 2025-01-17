<template>
    <div class="min-h-screen bg-blue-50 p-6">
      <!-- Profile Header -->
      <div class="bg-blue-800 rounded-lg shadow-md p-6 flex items-center space-x-4 text-white">
        <div class="w-24 h-24 rounded-full bg-blue-700 flex items-center justify-center">
          <i class="fas fa-user text-white text-5xl"></i>
        </div>
        <div>
          <h1 class="text-2xl font-semibold">{{ user.name }}</h1>
          <p class="text-blue-200">{{ user.email }}</p>
        </div>
      </div>
  
      <!-- Active Listings Section -->
      <div class="mt-8">
        <h2 class="text-xl font-semibold text-blue-800">Active Listings</h2>
        <div class="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="listing in user.activeListings"
            :key="listing.id"
            class="bg-white rounded-lg shadow-md p-4 border border-blue-200"
          >
            <h3 class="text-lg font-semibold text-blue-800">{{ listing.title }}</h3>
            <p class="text-blue-700">{{ listing.address }}</p>
            <p class="text-blue-600">Rent: ${{ listing.rent }}/month</p>
            <div class="flex justify-between"> 
            <button
              class="mt-4 text-sm text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
              @click="viewListingDetails(listing.id)"
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
export default {
  name: 'ProfilePage',
  data() {
    return {
      user: {
        name: 'Yoda Obama',
        email: 'YoBama@gmail.com',
        // dummy placeholder values for what active user listings could look like
        activeListings: [
          {
            id: 1,
            title: 'Spacious 2-Bedroom Apartment',
            address: '123 Campus Rd, Irvine, CA',
            rent: 1200,
          },
          {
            id: 2,
            title: 'Cozy Studio Near UCI',
            address: '456 University Blvd, Irvine, CA',
            rent: 950,
          },
        ],
        // dummy placeholder values for what leasing activity could look like
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
            date: 'January 5, 2024'
          }
        ],
      },
    };
  },
  methods: {
    viewListingDetails(listingId) {
      this.$router.push(`/listings/${listingId}`); // dummy route for individual listing
    },
    viewActivityDetails(activityId) {
      console.log(`Viewing details for activity ID: ${activityId}`); // console logging info for clarification 
    },
    removeListing(listingId){
        
        this.user.activeListings = this.user.activeListings.filter( // delete selected listing
            listing => listing.id != listingId
        );
    }
  },
};
</script>
  