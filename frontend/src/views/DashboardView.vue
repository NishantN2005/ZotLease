<template>
  <div class="dashboard">
    <LoadingScreen v-if="showLoadingScreen" />
    <SocketConnection :router="router" v-show="false" />
    <!-- Sublease Modal -->
    <div
      v-if="createSubleaseModal"
      class="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm"
    >
      <div class="bg-white p-4 shadow-lg rounded-lg max-h-[95vh] flex flex-col md:w-2/5 sm:w-3/4">
        <!-- Title -->
        <h1 class="font-bold flex justify-center items-center text-xl mb-5 font-Sriracha">
          Enter Sublease Information
        </h1>
        <!-- Error Message -->
        <h1 v-if="formError.display" class="flex justify-center text-rose-500 italic mb-4">
          *{{ formError.message }}
        </h1>

        <!-- Scrollable Form Section -->
        <div class="flex-grow overflow-y-auto">
          <CreateSubleaseModal
            :formData="formData"
            :handleFileChange="handleFileChange"
            :filesRef="filesRef"
          />
        </div>

        <!-- Fixed Footer with Buttons -->
        <div class="flex items-center justify-center mt-5 border-t border-gray-200 pt-4">
          <button
            @click="turnOffModal"
            class="mx-10 px-3 py-2 border-2 border-black rounded-md hover:text-neutral-900 hover:bg-neutral-200"
          >
            Cancel
          </button>
          <button
            @click="createListing"
            class="mx-10 px-3 py-2 border-2 border-black rounded-md hover:text-neutral-900 hover:bg-neutral-200"
          >
            Post Sublease
          </button>
        </div>
      </div>
    </div>

    <div class="flex relative w-full h-screen">
      <Sidebar
        ref="sidebarRef"
        :Logout="Logout"
        :turnOnModal="turnOnModal"
        :toggleFilterModal="toggleFilterModal"
        :router="router"
        :mapView="mapView"
        :toggleView="toggleDashView"
        :toggleCheckMessage="toggleCheckMessage"
        :filterOpen="filterOpen"
        :toggleMessages="toggleMessages"
        :showFilterModal="showFilterModal"
        :messagesOpen="messagesOpen"
        :messageRef="messageRef"
        :isSidebarOpen="isSidebarOpen"
        :toggleSidebar="toggleSidebar"
      />
      <!-- Filter Modal-->
      <FilterModal
        :filterform="filterForm"
        :showFilterModal="showFilterModal"
        :routerPass="router"
        :token="userStore.userToken"
        :toggleFilterModal="toggleFilterModal"
        :resetFilters="resetFilters"
      />
      <!-- Messages Modal -->
      <Messages
        ref="messageRef"
        :messagesOpen="messagesOpen"
        :chatStore="chatStore"
        :router="router"
        :userStore="userStore"
        :userToken="userStore.userToken"
        :turnOnSubleaseModal="turnOnSubleaseModal"
        :toggleMessageProfile="toggleMessageProfile"
        :messageProfileActive="messageProfileActive"
        :turnOffMessageProfile="turnOffMessageProfile"
      />

      <!-- The Leaflet map -->
      <LeafletMap
        v-show="mapView && (!chatStore.chatRoomID || !isSmallScreen)"
        class="z-0 w-full h-full"
        :userToken="userStore.userToken"
        :routerPass="router"
        :userID="userStore.userID"
        :turnOnSubleaseModal="turnOnSubleaseModal"
        :filterForm="filterForm"
        :toggleMapCard="toggleMapCard"
        :setEventPos="setEventPos"
      />

      <div
        v-for="listing in filteredListings"
        :key="listing.subleaseid"
        class="absolute listing-card bg-white shadow-lg hover:shadow-2xl rounded-lg transition-all duration-300 ease-in-out cursor-pointer"
        :style="cardPosition"
        @click="
          () => {
            console.log('boo')
            //activateSubleaseModal(listing.subleaseid, listing.id)
          }
        "
      >
        <img
          :src="allLocationsStore.firstPhotos[listing?.subleaseid] || housePlaceholder"
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

      <LeaseList
        v-show="listView && (!chatStore.chatRoomID || !isSmallScreen)"
        :allLocations="allLocationsStore"
        :filterStore="filterStore"
        :turnOnSubleaseModal="turnOnSubleaseModal"
        :userToken="userStore.userToken"
        :routerPass="router"
        :turnOffLoading="turnOffLoading"
      />

      <!-- Selected Sublease modal-->
      <SelectedSubleaseModal
        :showSelectedSubleaseModal="showSelectedSubleaseModal"
        :turnOffSubleaseModal="turnOffSubleaseModal"
        :createChatRoom="createChatRoom"
        :router="router"
        :togglePhotoGallery="togglePhotoGallery"
        :toggleSidebar="toggleSidebar"
      />

      <PhotoGalleryModal v-if="showPhotoGallery" :togglePhotoGallery="togglePhotoGallery" />
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'
import LeafletMap from '../components/LeafletMap.vue'
import LeaseList from '@/components/LeaseList.vue'
import { useUserStore } from '@/stores/userStore'
import { useChatStore } from '@/stores/chatStore'
import { useSelectedSubleaseStore } from '@/stores/SelectedSubleaseStore'
import SocketConnection from '@/components/SocketConnection.vue'
import CreateSubleaseModal from '@/components/CreateSubleaseModal.vue'
import { refreshAccessToken, makeAuthenticatedRequest } from '@/services/authService'
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import FilterModal from '@/components/FilterModal.vue'
import { useFilterStore } from '@/stores/filterStore'
import SelectedSubleaseModal from '@/components/SelectedSubleaseModal.vue'
import { useAllLocationsStore } from '@/stores/AllLocationsStore'
import { uploadPhotos } from '../s3client.js'
import Sidebar from '@/components/Sidebar.vue'
import Messages from '../components/Messages.vue'
import PhotoGalleryModal from '@/components/PhotoGalleryModal.vue'
import LoadingScreen from '@/components/LoadingScreen.vue'
import { useWindowSize } from '@vueuse/core'
import { API_URL } from '../../constants.js'
export default {
  name: 'DashboardView',
  components: {
    LeafletMap,
    SocketConnection,
    CreateSubleaseModal,
    FilterModal,
    SelectedSubleaseModal,
    Sidebar,
    LeaseList,
    Messages,
    PhotoGalleryModal,
    LoadingScreen,
  },
  methods: {},
  setup() {
    onMounted(() => {
      if (userStore.isLoggedIn) {
        turnOnLoading()
        chatStore.onlineChats = []
        sequencialFetch()
      }

      console.log('component unmounted')
      // Detect page refresh or tab close
      window.addEventListener('beforeunload', handleSessionEnd)
    })

    onUnmounted(() => {
      // Cleanup event listener when the component is destroyed
      console.log('Component unmounted')
      window.removeEventListener('beforeunload', handleSessionEnd)
    })

    const { width: windowWidth } = useWindowSize()
    const isSmallScreen = computed(() => windowWidth.value <= 768)
    const router = useRouter()
    const userStore = useUserStore()
    const chatStore = useChatStore()
    const selectedSubleaseStore = useSelectedSubleaseStore()
    const filterStore = useFilterStore()
    const allLocationsStore = useAllLocationsStore()
    const showLoadingScreen = ref(false)
    const isSidebarOpen = ref(false)
    const activeHoverID = ref(null)

    const showSelectedSubleaseModal = ref(false)
    const showPhotoGallery = ref(false)
    const showFilterModal = ref(false)
    const messagesOpen = ref(false)
    const pinHovered = ref(false)
    const messageRef = ref({})
    const filterForm = ref({
      gender: '',
      minPrice: null,
      maxPrice: null,
      roomCount: null,
    })
    const formError = ref({
      message: '',
      display: false,
    })
    const formData = ref({
      street_name: '',
      room: '',
      city: '',
      postal_code: '',
      listerID: userStore.userID,
      price: '',
      gender: '',
      roomCount: '',
      bathroomCount: '',
      startTerm: '',
      endTerm: '',
      description: '',
    })

    const filesRef = ref([])

    const createSubleaseModal = ref(false)

    const messageBar = ref(false)
    const checkMessage = ref(false)
    const sidebarRef = ref(null)
    const mapView = ref(true)
    const listView = ref(false)
    const filterOpen = ref(false)
    const messageProfileActive = ref(false)
    const cardPosition = ref({ top: '0px', left: '0px' })

    const filteredListings = computed(() => {
      console.log('change in active', activeHoverID.value)
      const offset = 10 // offset for positioning the card next to the cursor

      return (
        allLocationsStore.allLocations?.filter((listing) => listing?.id === activeHoverID.value) ||
        []
      )
    })
    watch(filteredListings, (newVal) => {
      console.log('Filtered Listings:', newVal)
    })

    const setEventPos = (e) => {
      const offset = 10
      const mouseX = e.originalEvent.clientX
      const mouseY = e.originalEvent.clientY

      cardPosition.value = {
        top: `${mouseY + offset}px`,
        left: `${mouseX + offset}px`,
      }
    }

    const turnOffModal = () => {
      console.log('modal off')
      createSubleaseModal.value = false
    }
    const turnOnModal = () => {
      console.log('modal on')
      createSubleaseModal.value = true
    }

    const turnOnLoading = () => {
      showLoadingScreen.value = true
    }
    const turnOffLoading = () => {
      showLoadingScreen.value = false
    }

    const sequencialFetch = async () => {
      await fetchChatRooms()
    }
    const toggleDashView = (mapOn = true) => {
      if (mapOn) {
        // turn off list view, turn on mapview
        listView.value = false
        mapView.value = true
      } else {
        // turn off map view turn on list view
        mapView.value = false
        listView.value = true
      }
      turnOffSubleaseModal()
      if (showPhotoGallery.value) showPhotoGallery.value = false
    }

    const togglePhotoGallery = () => {
      showPhotoGallery.value = !showPhotoGallery.value
    }

    const fetchChatRooms = async () => {
      try {
        const response = await makeAuthenticatedRequest(
          'chat/getChatRooms',
          { userID: userStore.userID },
          router,
          userStore.userToken,
        )
        console.log('res', response)
        const result = await response.json()
        console.log(result)
        chatStore.setChatRooms(result.chatRooms)
      } catch (error) {
        console.error('Error fetching chat rooms:', error)
      }
    }

    const toggleMapCard = (uniqueid) => {
      pinHovered.value = !pinHovered.value
      activeHoverID.value = uniqueid
    }

    const findChatRooms = () => {
      console.log(chatStore.chatRooms)
    }

    const toggleCheckMessage = () => {
      checkMessage.value = !checkMessage.value
    }

    // creates chat room whenever user starts chat with new leaser
    async function createChatRoom() {
      if (
        !chatStore.chatRooms.some(
          (chat) => chat.partnerID === selectedSubleaseStore.selectedSublet.listerid,
        )
      ) {
        const userID1 = userStore.userID
        const userID2 = selectedSubleaseStore.selectedSublet.listerid
        const res = await makeAuthenticatedRequest(
          `chat/createRoom`,
          { userID1, userID2 },
          router,
          userStore.userToken,
        )
        const newRes = await res.json()

        const { chatRoomID, partnerID, partnerName } = newRes.newChatRoom

        chatStore.addChatRoom(newRes.newChatRoom)
        sidebarRef.value.toggleDashMessage(chatRoomID, partnerName, partnerID)
      } else {
        const chat = chatStore.chatRooms.find(
          (chat) => chat.partnerID === selectedSubleaseStore.selectedSublet.listerid,
        )
        const { chatRoomID, partnerID, partnerName } = chat
        sidebarRef.value.toggleDashMessage(chatRoomID, partnerName, partnerID)
      }
    }

    // gets chatroom id so u can send it through message posts to categorize
    async function getChatRoomID() {
      let response = await makeAuthenticatedRequest(
        `chat/chatRoomID`,
        {}, // change this to a dictionary
        router,
        userStore.userToken,
      )
      const textRes = await response.json()

      chatStore.setChatRoomID(textRes.chatRoomID)
    }

    async function createListing() {
      try {
        formError.value.display = false

        let response = await makeAuthenticatedRequest(
          `sublease/create`,
          formData.value,
          router,
          userStore.userToken,
        )
        console.log(response)

        if (response.status == 200) {
          //reset state of dashboard
          const markerInfo = await response.json()

          //upload photos to s3
          const success = uploadPhotos(
            `${userStore.userID}/${markerInfo.subleaseid}`,
            filesRef.value,
          )
          //update local map render to include new location
          allLocationsStore.addNewLocation(markerInfo)

          // create activity for this
          const activityResponse = await makeAuthenticatedRequest(
            'activity/addActivity',
            {
              activity: `🥳 You posted your sublease @ ${formData.value.street_name}! People will start looking at it ASAP 👀`,
              listerid: userStore.userID,
            },
            router,
            userStore.userToken,
          )
          console.log(activityResponse)

          createSubleaseModal.value = false
          formData.value = {
            street_name: '',
            room: '',
            city: '',
            postal_code: '',
            listerID: userStore.userID,
            price: '',
            gender: '',
            roomCount: '',
            bathroomCount: '',
            startTerm: '',
            endTerm: '',
            description: '',
          }
        } else if (response.status == 400) {
          //something wrong with form input
          console.log('Form was incorrectly submitted')
          formError.value.display = true
          let resp = await response.json()
          console.log(resp.message)
          if (resp.message == 'Params are incomeplete') {
            //message being set correctly
            formError.value.message = 'Make sure you entered all required information'
          } else if (resp.message == 'Address does not exist') {
            //set message correctly
            formError.value.message = 'Address provided is invalid, make sure it is in California'
          }
        } else if (response.status == 500) {
          alert('Something went bad on our end :(. Our apologies, try again later or report a bug)')
          //reset state of dashboard
          filesRef.value = []
          createSubleaseModal.value = false
          formData.value = {
            street_name: '',
            room: '',
            city: '',
            postal_code: '',
            listerID: userStore.userID,
            price: '',
            gender: '',
            roomCount: '',
            bathroomCount: '',
            startTerm: '',
            endTerm: '',
            description: '',
          }
        }
      } catch (err) {
        console.log('Error creating listing: ', err)
      }
    }
    const Logout = async () => {
      try {
        console.log(userStore.userToken, 'token is here')
        let response = await makeAuthenticatedRequest(
          'auth/logout',
          {},
          router,
          userStore.userToken,
        )
        console.log(response)

        if (response.status == 200) {
          handleSessionEnd()
          userStore.setIsLoggedIn(false)
          userStore.setUserToken(null)
          userStore.setUserID(null)
          chatStore.setChatRoomID(null)
          chatStore.setActiveChatID(null)
          chatStore.setChatRooms([])
          chatStore.setOnlineChats([])
          router.push('/login')
        } else {
          const resp = await response.json()
          console.log(resp.message)
        }
      } catch (err) {
        console.log(err)
      }
    }

    const handleSessionEnd = async (event) => {
      event.preventDefault()
      try {
        console.log('in the end')

        // Send authenticated request to update session
        const response = await makeAuthenticatedRequest(
          'chat/updateUnreadCount',
          { userID: userStore.userID, chatRooms: chatStore.chatRooms },
          router,
          userStore.userToken,
        )

        const data = await response.json()
        console.log(data)
      } catch (error) {
        console.log('Failed to execute unread update:', error)
      }
    }

    const callTestRoute = async () => {
      try {
        let response = await makeAuthenticatedRequest('user/test', {}, router, userStore.userToken)
        console.log(response)
      } catch (error) {
        console.log('Failed to call /test route:', error)
        navigateToLogin()
      }
    }

    const navigateToLogin = () => {
      router.push('/login')
    }

    const turnOffSubleaseModal = () => {
      showSelectedSubleaseModal.value = false
      selectedSubleaseStore.resetSelectedSublease()
    }
    const turnOnSubleaseModal = () => {
      if (showPhotoGallery.value) showPhotoGallery.value = false
      showSelectedSubleaseModal.value = true
    }
    const toggleFilterModal = () => {
      //turn of messages if modal is getting turned on
      if (messagesOpen.value) {
        toggleMessages()
      }
      showFilterModal.value = !showFilterModal.value
      filterOpen.value = !filterOpen.value
      console.log(showFilterModal.value, filterOpen.value)
      filterForm.value = {
        gender: '',
        minPrice: null,
        maxPrice: null,
        roomCount: null,
        startsate: null,
        enddate: null,
      }
      filesRef.value = []
    }

    const toggleMessages = () => {
      //if filter is open, close it
      if (showFilterModal.value) {
        toggleFilterModal()
      }
      messagesOpen.value = !messagesOpen.value
      messageProfileActive.value = false
      toggleCheckMessage()
      chatStore.setChatRoomID(null)
      chatStore.setActiveChatID(null)
    }

    const toggleMessageProfile = () => {
      messageProfileActive.value = !messageProfileActive.value
    }

    const turnOffMessageProfile = () => {
      messageProfileActive.value = false
    }

    const resetFilters = () => {
      filterStore.resetFilter()
      toggleFilterModal()
    }

    const handleFileChange = (event) => {
      const selectedFiles = Array.from(event.target.files || [])

      // Append new files, avoiding duplicates (by name)
      const existingFileNames = filesRef.value.map((file) => file.name)
      selectedFiles.forEach((file) => {
        if (!existingFileNames.includes(file.name)) {
          filesRef.value.push(file)
        }
      })

      console.log('Updated files:', filesRef.value)
    }

    const toggleSidebar = () => {
      isSidebarOpen.value = !isSidebarOpen.value
      if (!isSidebarOpen.value) {
        if (props.messagesOpen) {
          props.toggleMessages()
        }
        if (props.showFilterModal) {
          props.toggleFilterModal()
        }
      }
      console.log('Sidebar open:', isSidebarOpen.value)
    }

    return {
      callTestRoute,
      navigateToLogin,
      Logout,
      turnOnModal,
      turnOffModal,
      createSubleaseModal,
      formData,
      formError,
      createListing,
      createChatRoom,
      getChatRoomID,
      router,
      userStore,
      chatStore,
      showSelectedSubleaseModal,
      turnOffSubleaseModal,
      turnOnSubleaseModal,
      toggleFilterModal,
      showFilterModal,
      filterForm,
      FilterModal,
      filterStore,
      resetFilters,
      allLocationsStore,
      handleFileChange,
      handleSessionEnd,
      filesRef,
      findChatRooms,
      sidebarRef,
      mapView,
      toggleDashView,
      listView,
      toggleCheckMessage,
      checkMessage,
      filterOpen,
      messagesOpen,
      messageRef,
      toggleMessages,
      togglePhotoGallery,
      showPhotoGallery,
      showLoadingScreen,
      turnOffLoading,
      isSmallScreen,
      toggleMessageProfile,
      messageProfileActive,
      turnOffMessageProfile,
      isSidebarOpen,
      toggleSidebar,
      toggleMapCard,
      filteredListings,
      setEventPos,
      cardPosition,
    }
  },
}
</script>
