<template>
  <div class="h-screen w-screen bg-gray-100 flex flex-col items-center py-6 relative">
    <div class="relative w-5/6">
      <input
        type="text"
        id="searchInput"
        placeholder="Address, city, ZIP"
        class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg hover:border-stone-500 focus:outline-none focus:border-stone-500"
      />
      <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
      <i
        class="fas fa-times absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600"
        @click="clearInput"
      ></i>
    </div>
    <div class="w-5/6 grid grid-cols-3 gap-4">
      <div
        v-for="listing in allLocations.allLocations"
        :key="allLocations.subleaseid"
        class="listing-card"
      >
        <h3 class="bold text-green-700 font-bold">${{ listing.price }}</h3>
        <p class="text-gray-600">{{ [listing.street_name, listing.city].join(', ') }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { getFirstPhoto } from '@/s3client.js'
import { ref, onMounted } from 'vue'
export default {
  name: 'leaseList',
  props: {
    allLocations: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    console.log('lol')
    const photos = ref([])

    async function fetchPhotos() {
      console.log('what')
      // for (const listing of props.allLocations.allLocations) {
      //   try {
      //     const key = `${listing.listerid}/${listing.subleaseid}`
      //     console.log('helo')
      //     console.log('Fetching photo for key:', key)

      //     const response = await getFirstPhoto(key)

      //     // Log the whole response to see what it's returning
      //     console.log('Response from getFirstPhoto:', response)

      //     if (response && response.length > 0) {
      //       console.log('Pushing first photo to photos:', response[0])
      //       photos.value.push(response[0])
      //     } else {
      //       console.log('No response or empty response for key:', key)
      //     }
      //   } catch (error) {
      //     console.error('Error fetching photos for key', listing, ':', error)
      //   }
      // }
    }

    // Fetch photos on component mount
    onMounted(() => {
      console.log('mounted')
      fetchPhotos()
    })

    return {
      photos,
      fetchPhotos,
    }
  },
  methods: {
    clearInput() {
      const input = document.getElementById('searchInput')
      input.value = ''
    },
  },
}
</script>
