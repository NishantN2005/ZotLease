<template>
  <div class="h-[100dvh] w-screen bg-white flex flex-col items-center py-6 relative">
    <div class="relative w-5/6 flex flex-wrap items-center space-y-4 md:space-y-0 md:space-x-4">
      <!-- Input box with search icon inside -->
      <div class="flex-grow relative">
        <mapbox-address-autofill
          :accessToken="MAPBOX_ACCESS_TOKEN"
          :options="{ countries: ['us'] }"
          confirm-on-blur
          confirm-on-browser-autofill
          @retrieve="onRetrieve"
        >
          <!-- Input box with search icon inside -->
          <div class="flex-grow relative">
            <input
              type="text"
              id="searchInput"
              placeholder="Address, city, ZIP"
              class="w-full pl-10 pr-4 py-2 mt-6 md:mt-0 border border-gray-300 rounded-lg hover:border-stone-500 focus:outline-none focus:border-stone-500"
              @input="filterAddress($event.target.value)"
            />
            <i
              class="fas fa-search absolute left-3 top-2/3 md:top-1/2 transform -translate-y-1/2 text-gray-400"
            ></i>
          </div>
        </mapbox-address-autofill>
      </div>
    </div>

    <div class="w-5/6 h-full mt-4 overflow-y-auto scrollbar-hide">
      <div v-if="listings.length > 0" class="w-full grid md:grid-cols-4 sm:grid-cols-2 gap-6 p-4">
        <div
          v-for="listing in listings"
          :key="listing.subleaseid"
          class="listing-card bg-transparent rounded-xl cursor-pointer overflow-hidden"
          @click="() => activateSubleaseModal(listing.subleaseid, listing.id)"
        >
          <!-- Image Section -->
          <div class="relative w-full h-64 overflow-hidden">
            <img
              :src="photos[listing.subleaseid] ? photos[listing.subleaseid] : housePlaceholder"
              alt="Property Image"
              class="w-full h-full object-cover rounded-xl transition-transform duration-300 hover:scale-105"
            />
            <!-- Price Tag Overlay -->
            <div
              class="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm"
            >
              <h3 class="text-sm font-bold text-gray-800">${{ listing.price }}</h3>
            </div>
          </div>

          <!-- Details Section -->
          <div class="mt-3 ml-1">
            <!-- Location -->
            <p class="text-md font-medium text-gray-800 truncate">
              {{ [listing.street_name, listing.city].join(', ') }}
            </p>
            <!-- Additional Details -->
            <div class="mt-1 flex items-center space-x-2 text-gray-600">
              <i class="fas fa-bed"></i>
              <span>{{ listing.roomcount }} beds</span>
              <i class="fas fa-bath ml-2"></i>
              <span>{{ listing.bathroomcount }} baths</span>
            </div>
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
import { MAPBOX_ACCESS_TOKEN } from '../../constants.js'
import { useUserStore } from '@/stores/userStore.js'
import { useAllLocationsStore } from '@/stores/AllLocationsStore.js'

export default {
  name: 'leaseList',
  props: {
    filterStore: {
      type: Object,
      required: true,
    },
    turnOnSubleaseModal: {
      type: Function,
      required: true,
    },
    routerPass: {
      type: Object,
      required: true,
    },
    turnOffLoading: {
      type: Function,
      required: true,
    },
  },
  setup(props) {
    const allLocations = useAllLocationsStore()
    const photos = ref(allLocations.firstPhotos)
    let listings = ref([...allLocations.allLocations])
    const filterActive = ref(false)
    const selectedSubleaseStore = useSelectedSubleaseStore()
    const userStore = useUserStore()
    // const filters = ref({
    //   gender: '',
    //   beds: '',
    //   baths: '',
    //   priceRange: '',
    // })

    watch(
      () => allLocations.firstPhotos,
      (newPhotos) => {
        photos.value = newPhotos
      },
      { immediate: true },
    )

    async function activateSubleaseModal(subid, uniqueid) {
      const userID = userStore.userID
      // Make call to retrieve listing information
      let info = await makeAuthenticatedRequest(
        'sublease/selectedInfo',
        { subleaseID: subid, uniqueid: uniqueid, userid: userID },
        props.routerPass,
      )

      // parse JSON
      const subleaseData = await info.json()

      // set Pinia store state
      if (selectedSubleaseStore.subleaseID !== subleaseData[0].subleaseid) {
        selectedSubleaseStore.resetSelectedSublease()
        selectedSubleaseStore.setSelectedSubleaseID(subleaseData[0].subleaseid)
        subleaseData.forEach((subletter) => {
          const { subleaseid, id, ...subletterData } = subletter
          selectedSubleaseStore.addSubletter(subletterData)
        })
      }

      // open your sublease modal
      props.turnOnSubleaseModal()
    }

    async function fetchPhotos() {
      // Use a reactive object for storing photos
      const photos = ref({})

      try {
        // Create an array of promises for all listings
        const photoFetchPromises = allLocations.allLocations.map(async (listing) => {
          try {
            const key = `${listing.listerid}/${listing.subleaseid}`
            console.log('Fetching photo for key:', key)

            const response = await getFirstPhoto(key)

            if (response) {
              console.log('Adding first photo to photos:', response)
              photos.value[listing.subleaseid] = response
            } else {
              console.log('No photo found for key:', key)
            }
          } catch (error) {
            console.error('Error fetching photo for listing:', listing, error)
          }
        })

        // Wait for all photo-fetching promises to complete
        await Promise.all(photoFetchPromises)

        // Assign the photos to the parent object
        allLocations.firstPhotos = photos
        console.log('photooososss', allLocations.firstPhotos)
        props.turnOffLoading()
      } catch (error) {
        console.error('Error fetching photos:', error)
      }
    }

    function filterAddress(text) {
      const query = String(text || '').toLowerCase()

      if (!query) {
        // Reset listings when input is cleared
        listings.value = allLocations.allLocations
        props.filterStore.resetFilter()
        filterActive.value = false
        return
      }

      listings.value = allLocations.allLocations.filter((listing) =>
        [listing.street_name, listing.city].join(', ').toLowerCase().includes(query),
      )

      filterActive.value = true
    }

    function clearInput() {
      const input = document.getElementById('searchInput')
      input.value = ''
      listings.value = allLocations.allLocations
      filterActive.value = false
      props.filterStore.resetFilter()
      console.log(listings.value, 'why')
    }

    // Fetch photos on component mount

    watch(
      () => allLocations.allLocations,
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
            listings.value = [...allLocations.allLocations] // Reset to all locations if filter is not active
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
    //     listings.value = allLocations.allLocations.filter((listing) => {
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
      MAPBOX_ACCESS_TOKEN,
      photos,
      // filters,
    }
  },
  methods: {
    onRetrieve(result) {
      const res_value = result.detail.features[0].properties.matching_name
      const input = document.getElementById('searchInput')
      input.value = res_value
    },
  },
}
</script>
