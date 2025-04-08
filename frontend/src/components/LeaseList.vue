<template>
  <!-- Outer container is scrollable and referenced via ref -->
  <div
    ref="listContainer"
    class="absolute h-[100dvh] w-full bg-white flex flex-col items-center py-6 pt-28 md:pt-12 overflow-y-auto scrollbar-hide z-100"
  >
    <div class="w-5/6 mt-4">
      <div
        v-if="listings.length > 0"
        :class="[
          'w-full grid gap-6 p-4',
          showSelectedSubleaseModal
            ? 'lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1'
            : 'lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2',
        ]"
      >
        <div
          v-for="listing in listings"
          :key="listing.id"
          class="listing-card bg-transparent rounded-xl cursor-pointer overflow-hidden"
          @click="() => activateSubleaseModal(listing.subleaseid, listing.id, listing.listerid)"
        >
          <!-- Image Section -->
          <div class="relative w-full h-64 overflow-hidden">
            <img
              :src="photos[listing.id] ? photos[listing.id] : housePlaceholder"
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
            <p class="text-md font-medium text-gray-800 truncate">
              {{ [listing.street_name, listing.city].join(', ') }}
            </p>
            <div class="mt-1 flex items-center space-x-2 text-gray-600">
              <i class="fas fa-bed"></i>
              <span>{{ listing.roomcount }} beds</span>
              <i class="fas fa-bath ml-2"></i>
              <span>{{ listing.bathroomcount }} baths</span>
            </div>
          </div>
        </div>
      </div>
      <div
        v-else
        class="fixed inset-0 z-[101] bg-white flex flex-col items-center justify-center text-gray-600 font-semibold text-lg text-center"
      >
        <img src="/favicon.png" alt="zotlease logo" class="w-72 h-72" />
        <p class="mt-4">No results found.</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import housePlaceholder from '@/assets/house-placeholder.jpg'
import { makeAuthenticatedRequest } from '../services/authService.js'
import { getFirstPhoto } from '@/s3client.js'
import { useSelectedSubleaseStore } from '@/stores/SelectedSubleaseStore.js'
import { useUserStore } from '@/stores/userStore.js'
import { useAllLocationsStore } from '@/stores/AllLocationsStore.js'
import { MAPBOX_ACCESS_TOKEN } from '../../constants.js'
import { show } from 'vanilla-cookieconsent'

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
    leaseListFilterText: {
      type: String,
      required: true,
    },
    showSelectedSubleaseModal: {
      type: Boolean,
      required: true,
    },
  },
  setup(props) {
    const allLocations = useAllLocationsStore()
    const selectedSubleaseStore = useSelectedSubleaseStore()
    const userStore = useUserStore()

    // Local reactive variables
    const listings = ref([...allLocations.allLocations]) // local listing array
    const photos = ref({ ...allLocations.firstPhotos })
    const loadingMore = ref(false)
    const page = ref(0)
    const limit = 15
    const listContainer = ref(null)
    // An estimated height (in pixels) per listing card; adjust based on your layout
    const itemHeightEstimate = 300
    const filterActive = ref(false)

    // Paginated API call: fetch listings using limit and offset
    // async function fetchListings(pageNumber) {
    //   const offset = pageNumber * limit
    //   try {
    //     const response = await makeAuthenticatedRequest(
    //       `sublease/list?limit=${limit}&offset=${offset}`,
    //       {},
    //       props.routerPass,
    //     )
    //     return await response.json()
    //   } catch (error) {
    //     console.error('Error fetching listings:', error)
    //     return []
    //   }
    // }

    // Clear store and load initial 15 listings
    // async function loadInitialListings() {
    //   allLocations.clearAllLocations() // Clear previous data from the store
    //   page.value = 0
    //   const data = await fetchListings(page.value)
    //   allLocations.setAllLocations(data)
    //   listings.value = data
    //   fetchPhotos() // Load photos for these listings
    //   props.turnOffLoading() // Hide loading screen
    // }

    // Append the next page of listings as user scrolls down
    // async function loadMoreListings() {
    //   console.log('loading more listings')
    //   if (loadingMore.value) return
    //   loadingMore.value = true
    //   page.value++
    //   const data = await fetchListings(page.value)
    //   if (data.length > 0) {
    //     data.forEach((element, index) => {
    //       allLocations.addNewLocation(element)
    //     })
    //     //allLocations.addListings(data)
    //     listings.value = listings.value.concat(data)
    //     fetchPhotosForListings(data)
    //   }
    //   loadingMore.value = false
    // }

    // Handle scroll events: load more when near bottom
    // function onScroll() {
    //   const container = listContainer.value
    //   if (!container) return

    //   // Load more listings when user scrolls near bottom (e.g., within 100px)
    //   if (container.scrollTop + container.clientHeight >= container.scrollHeight - 100) {
    //     loadMoreListings()
    //   }
    // }

    // Fetch photos for all current listings
    async function fetchPhotos() {
      const photosObj = {}
      try {
        const photoFetchPromises = listings.value.map(async (listing) => {
          try {
            const key = `${listing.listerid}/${listing.subleaseid}`
            const response = await getFirstPhoto(key)
            if (response) {
              photosObj[listing.id] = response
            }
          } catch (error) {
            console.error('Error fetching photo for listing:', listing, error)
          }
        })
        await Promise.all(photoFetchPromises)
        allLocations.firstPhotos = photosObj
        photos.value = photosObj
      } catch (error) {
        console.error('Error fetching photos:', error)
      }
    }

    // Fetch photos for a new batch of listings
    // async function fetchPhotosForListings(newListings) {
    //   const updatedPhotos = { ...photos.value }
    //   try {
    //     const photoFetchPromises = newListings.map(async (listing) => {
    //       try {
    //         const key = `${listing.listerid}/${listing.subleaseid}`
    //         const response = await getFirstPhoto(key)
    //         if (response) {
    //           updatedPhotos[listing.id] = response
    //         }
    //       } catch (error) {
    //         console.error('Error fetching photo for listing:', listing, error)
    //       }
    //     })
    //     await Promise.all(photoFetchPromises)
    //     allLocations.firstPhotos = updatedPhotos
    //     photos.value = updatedPhotos
    //   } catch (error) {
    //     console.error('Error fetching photos for new listings:', error)
    //   }
    // }

    // Activate the modal by fetching selected sublease information
    async function activateSubleaseModal(subid, uniqueid, listerid) {
      const userID = userStore.userID
      let info = await makeAuthenticatedRequest(
        'sublease/selectedInfo',
        { subleaseID: subid, uniqueid: uniqueid, userid: userID },
        props.routerPass,
      )
      const subleaseData = await info.json()
      if (selectedSubleaseStore.subleaseID !== subleaseData[0].subleaseid) {
        selectedSubleaseStore.resetSelectedSublease()

        const selectedListing = listings.value.find((listing) => listing.listerid === listerid)

        selectedSubleaseStore.setSelectedSublease(selectedListing)

        selectedSubleaseStore.setSelectedSubleaseID(subleaseData[0].subleaseid)
        subleaseData.forEach((subletter) => {
          const { subleaseid, id, ...subletterData } = subletter
          selectedSubleaseStore.addSubletter(subletterData)
        })
      }
      console.log(listings.value.length)
      props.turnOnSubleaseModal()
    }

    // Watch for updates to the store and refresh local listings
    watch(
      () => allLocations.allLocations,
      (newListings) => {
        listings.value = [...newListings]
        fetchPhotos()
      },
      { deep: true },
    )

    return {
      listContainer,
      listings,
      photos,
      housePlaceholder,
      activateSubleaseModal,
    }
  },
  // methods: {
  //   onRetrieve(result) {
  //     const res_value = result.detail.features[0].properties.matching_name
  //     const input = document.getElementById('searchInput')
  //     input.value = res_value
  //   },
  // },
}
</script>
