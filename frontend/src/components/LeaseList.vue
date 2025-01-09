<template>
  <div class="h-screen w-screen bg-gray-100 flex flex-col items-center py-6 relative">
    <div class="relative w-5/6 flex flex-wrap items-center space-y-4 md:space-y-0 md:space-x-4">
      <!-- Input box with search icon inside -->
      <div class="flex-grow relative">
        <input
          type="text"
          id="searchInput"
          placeholder="Address, city, ZIP"
          class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg hover:border-stone-500 focus:outline-none focus:border-stone-500"
          @keyup.enter="filterAddress($event.target.value)"
        />
        <i
          class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
        ></i>
      </div>

      <!-- Dropdown Filters
      <div class="flex flex-wrap gap-4">
        <div class="w-32">
          <select
            class="w-full pl-4 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-stone-500 bg-white"
            v-model="filters.gender"
          >
            <option value="">Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="any">Any</option>
          </select>
        </div>

        <div class="w-30">
          <select
            class="w-full pl-4 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-stone-500 bg-white"
            v-model="filters.beds"
          >
            <option value="">Beds</option>
            <option v-for="n in 4" :key="n" :value="n">{{ n }} Beds</option>
            <option value="5">5+ Beds</option>
          </select>
        </div>

  
        <div class="w-30">
          <select
            class="w-full pl-4 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-stone-500 bg-white"
            v-model="filters.baths"
          >
            <option value="">Baths</option>
            <option v-for="n in 4" :key="n" :value="n">{{ n }} Baths</option>
            <option value="5">5+ Baths</option>
          </select>
        </div>

        <div class="w-40">
          <select
            class="w-full pl-4 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-stone-500 bg-white"
            v-model="filters.priceRange"
          >
            <option value="">Price</option>
            <option value="0-500">$0 - $500</option>
            <option value="500-1000">$500 - $1,000</option>
            <option value="1000-1500">$1,000 - $1,500</option>
            <option value="1500-2000">$1,500 - $2,000</option>
            <option value="2000+">$2,000+</option>
          </select>
        </div> 
      </div> -->

      <!-- Clear Filter button -->
      <button
        v-if="filterActive || filterStore.isFiltered"
        class="w-1/5 ml-2 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
        @click="clearInput"
      >
        Clear Filter
      </button>
    </div>

    <div class="w-5/6 h-full mt-4 overflow-y-auto">
      <div v-if="listings.length > 0" class="w-full grid grid-cols-4 gap-4 rounded-lg">
        <div
          v-for="listing in listings"
          :key="listing.subleaseid"
          class="listing-card bg-white shadow-lg hover:shadow-2xl rounded-lg transition-all duration-300 ease-in-out cursor-pointer"
          @click="() => activateSubleaseModal(listing.subleaseid)"
        >
          <img
            :src="
              allLocations.firstPhotos[listing.subleaseid]
                ? allLocations.firstPhotos[listing.subleaseid]
                : housePlaceholder
            "
            alt="Failed to Render Photo"
            class="w-full h-48 rounded-t-lg"
          />
          <div class="p-3">
            <h3
              class="font-bold text-black"
              style="font-family: 'Comic Sans MS', 'Arial', sans-serif"
            >
              ${{ listing.price }}
            </h3>
            <p class="text-gray-600">{{ [listing.street_name, listing.city].join(', ') }}</p>
          </div>
        </div>
      </div>
      <div v-else class="flex justify-center items-center h-48 text-gray-600 font-semibold text-lg">
        No results found.
      </div>
    </div>
  </div>
</template>

<script>
import { getFirstPhoto } from '@/s3client.js'
import { ref, watch } from 'vue'
import housePlaceholder from '@/assets/house-placeholder.jpg'
import { makeAuthenticatedRequest } from '../services/authService.js'
import { useSelectedSubleaseStore } from '@/stores/SelectedSubleaseStore.js'

export default {
  name: 'leaseList',
  props: {
    allLocations: {
      type: Object,
      required: true,
    },
    filterStore: {
      type: Object,
      required: true,
    },
    turnOnSubleaseModal: {
      type: Function,
      required: true,
    },
    userToken: {
      type: String,
      required: true,
    },
    routerPass: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    console.log('allLocationsStore:', props.allLocations)
    console.log('filterStore:', props.filterStore)
    console.log('lol')
    let listings = ref([...props.allLocations.allLocations])
    const filterActive = ref(false)
    const selectedSubleaseStore = useSelectedSubleaseStore()
    // const filters = ref({
    //   gender: '',
    //   beds: '',
    //   baths: '',
    //   priceRange: '',
    // })

    async function activateSubleaseModal(subid) {
      // Make call to retrieve listing information
      let info = await makeAuthenticatedRequest(
        'sublease/selectedInfo',
        { subleaseID: subid },
        props.routerPass,
        props.userToken,
      )

      // parse JSON
      const subleaseData = await info.json()

      // set Pinia store state
      selectedSubleaseStore.setSelectedSublease(
        subleaseData.subleaseid,
        subleaseData.fname,
        subleaseData.lname,
        subleaseData.listerid,
        subleaseData.price,
        subleaseData.gender,
        subleaseData.roomcount,
        subleaseData.bathroomcount,
        subleaseData.street_name,
        subleaseData.city,
        subleaseData.room,
        subleaseData.postal_code,
        subleaseData.startterm,
        subleaseData.endterm,
        subleaseData.description,
      )

      // open your sublease modal
      props.turnOnSubleaseModal()
    }

    async function fetchPhotos() {
      // not fetching photos for new listings
      const photos = ref({})

      for (const listing of props.allLocations.allLocations) {
        try {
          const key = `${listing.listerid}/${listing.subleaseid}`
          console.log('helo')
          console.log('Fetching photo for key:', key)

          const response = await getFirstPhoto(key)

          // Log the whole response to see what it's returning
          console.log('Response from getFirstPhoto:', response)

          if (response && response.length > 0) {
            console.log('Pushing first photo to photos:', response)
            photos.value[listing.subleaseid] = response
          } else {
            console.log('No response or empty response for key:', key)
          }
        } catch (error) {
          console.error('Error fetching photos for key', listing, ':', error)
        }
      }
      props.allLocations.firstPhotos = photos
      console.log(props.allLocations.firstPhotos)
    }

    function filterAddress(text) {
      const query = String(text || '').toLowerCase()
      console.log(query)
      listings.value = listings.value.filter((listing) =>
        [listing.street_name, listing.city].join(', ').toLowerCase().includes(query),
      )
      console.log(props.allLocations.activeLocations)
      filterActive.value = true
    }

    function clearInput() {
      const input = document.getElementById('searchInput')
      input.value = ''
      listings.value = props.allLocations.allLocations
      filterActive.value = false
      props.filterStore.resetFilter()
      console.log(listings.value, 'why')
    }

    // Fetch photos on component mount

    watch(
      () => props.allLocations.allLocations,
      (newListings) => {
        console.log('ALL LOCATION CHANGE')
        listings.value = newListings
        fetchPhotos()
      },
      { deep: true },
    )

    // bugged for filter after filter

    watch(
      () => props.filterStore.acceptedSubleases,
      (newValue) => {
        console.log(newValue)
        if (newValue.length) {
          console.log('no way')
          filterActive.value = true
          listings.value = listings.value.filter((listing) =>
            props.filterStore.acceptedSubleases.includes(listing.subleaseid),
          )
        } else {
          console.log('lol')
          if (props.filterStore.isFiltered) {
            console.log('324232')
            listings.value = newValue // Clear listings if filter is active
          } else {
            console.log('no way josea')
            listings.value = [...props.allLocations.allLocations] // Reset to all locations if filter is not active
            filterActive.value = false
          }
        }
      },
      { deep: true },
    )
    // watch(
    //   () => filters,
    //   (newFilters) => {
    //     console.log('lol')
    //     listings.value = props.allLocations.allLocations.filter((listing) => {
    //       const matchesGender = !newFilters.gender || listing.gender === newFilters.gender

    //       const matchesRooms = !newFilters.rooms || listing.roomcount === parseInt(newFilters.rooms)

    //       const matchesBath =
    //         !newFilters.baths || listing.bathroomcount === parseInt(newFilters.baths)

    //       const matchesPriceRange = (() => {
    //         if (!newFilters.priceRange) return true
    //         const [min, max] = newFilters.priceRange.split('-').map(Number)
    //         return max ? listing.price >= min && listing.price <= max : listing.price >= min
    //       })()

    //       return matchesGender && matchesRooms && matchesBath && matchesPriceRange
    //     })
    //     console.log(listings.value)
    //   },
    //   { deep: true },
    // )

    return {
      fetchPhotos,
      housePlaceholder,
      filterAddress,
      listings,
      clearInput,
      filterActive,
      activateSubleaseModal,
      // filters,
    }
  },
}
</script>
