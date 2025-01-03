<template>
  <div class="dashboard">
    <SocketConnection :router="router" v-show="false" />
    <!-- Sublease Modal -->
    <div
      v-if="createSubleaseModal"
      class="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm"
    >
      <div class="bg-white p-4 shadow-lg rounded-lg max-h-[95vh] flex flex-col w-2/5">
        <!-- Title -->
        <h1 class="font-bold flex justify-center items-center text-xl mb-5">
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
            class="mx-10 px-3 py-2 border-2 border-black rounded-md hover:text-uciyellow hover:bg-uciblue"
          >
            Cancel
          </button>
          <button
            @click="createListing"
            class="mx-10 px-3 py-2 border-2 border-black rounded-md hover:text-uciyellow hover:bg-uciblue"
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
      />

      <!-- The Leaflet map -->
      <LeafletMap
        v-show="mapView"
        :style="{
          left: showFilterModal
            ? '320px'
            : chatStore.chatRoomID
              ? '510px'
              : checkMessage
                ? '220px'
                : '0',
        }"
        class="z-0 w-full h-full"
        :userToken="userStore.userToken"
        :routerPass="router"
        :userID="userStore.userID"
        :turnOnSubleaseModal="turnOnSubleaseModal"
        :filterForm="filterForm"
      />

      <LeaseList
        v-show="listView"
        :allLocations="allLocationsStore"
        :style="{
          left: showFilterModal
            ? '320px'
            : chatStore.chatRoomID
              ? '510px'
              : checkMessage
                ? '220px'
                : '0',
          width: widthStyle,
        }"
      />

      <!-- Selected Sublease modal-->
      <SelectedSubleaseModal
        :showSelectedSubleaseModal="showSelectedSubleaseModal"
        :selectedSubleaseStore="selectedSubleaseStore"
        :turnOffSubleaseModal="turnOffSubleaseModal"
        :createChatRoom="createChatRoom"
        :router="router"
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
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { API_URL } from '../../constants.js'
import FilterModal from '@/components/FilterModal.vue'
import { useFilterStore } from '@/stores/filterStore'
import SelectedSubleaseModal from '@/components/SelectedSubleaseModal.vue'
import { useAllLocationsStore } from '@/stores/AllLocationsStore'
import { uploadPhotos } from '../s3client.js'
import Sidebar from '@/components/Sidebar.vue'

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
  },
  setup() {
    onMounted(() => {
      if (userStore.isLoggedIn) {
        chatStore.onlineChats = []
        sequencialFetch()
      }

      // Detect page refresh or tab close
      window.addEventListener('beforeunload', handleSessionEnd)
    })

    onUnmounted(() => {
      // Cleanup event listener when the component is destroyed
      window.removeEventListener('beforeunload', handleSessionEnd)
    })

    const router = useRouter()
    const userStore = useUserStore()
    const chatStore = useChatStore()
    const selectedSubleaseStore = useSelectedSubleaseStore()
    const filterStore = useFilterStore()
    const allLocationsStore = useAllLocationsStore()

    const showSelectedSubleaseModal = ref(false)
    const showFilterModal = ref(false)
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
    const filterOpen = ref(false)
    const sidebarRef = ref(null)
    const mapView = ref(true)
    const listView = ref(false)

    const widthStyle = computed(() => {
      let leftPosition = 0

      if (showFilterModal.value) {
        leftPosition = 320
      } else if (chatStore.chatRoomID) {
        leftPosition = 510
      } else if (checkMessage.value) {
        leftPosition = 220
      }

      const screenWidth = window.innerWidth
      const remainingWidth = screenWidth - leftPosition

      const minimumWidth = 300
      const calculatedWidth = remainingWidth > minimumWidth ? remainingWidth : minimumWidth

      return `${calculatedWidth}px`
    })

    const turnOffModal = () => {
      console.log('modal off')
      createSubleaseModal.value = false
    }
    const turnOnModal = () => {
      console.log('modal on')
      createSubleaseModal.value = true
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

    const findChatRooms = () => {
      console.log(chatStore.chatRooms)
    }

    const toggleCheckMessage = () => {
      checkMessage.value = !checkMessage.value
    }

    // creates chat room whenever user starts chat with new leaser
    async function createChatRoom() {
      if (!chatStore.chatRooms.some((chat) => chat.partnerID === selectedSubleaseStore.listerID)) {
        const userID1 = userStore.userID
        const userID2 = selectedSubleaseStore.listerID
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
          (chat) => chat.partnerID === selectedSubleaseStore.listerID,
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
        formError.display = false

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
    }
    const turnOnSubleaseModal = () => {
      showSelectedSubleaseModal.value = true
    }
    const toggleFilterModal = () => {
      showFilterModal.value = !showFilterModal.value
      filterForm.value = {
        gender: '',
        minPrice: null,
        maxPrice: null,
        roomCount: null,
      }
    }

    const toggleMessages = () => {
      messageBar.value = !messageBar.value
      console.log(messageBar.value)
      if (messageBar.value) {
        filterOpen.value = false
      } else {
        chatStore.chatRoomID = null
        chatStore.activeChatID = null
      }
    }

    const resetFilters = () => {
      filterStore.resetFilter()
      toggleFilterModal()
    }

    const handleFileChange = (event) => {
      const selectedFiles = Array.from(event.target.files || [])

      // (Optional) Filter out only PDFs
      const pdfFiles = selectedFiles.filter((file) => file.type === 'image/png')

      // Append new files, avoiding duplicates (by name)
      const existingFileNames = filesRef.value.map((file) => file.name)
      pdfFiles.forEach((file) => {
        if (!existingFileNames.includes(file.name)) {
          filesRef.value.push(file)
        }
      })

      console.log('Updated files:', filesRef.value)
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
      selectedSubleaseStore,
      showSelectedSubleaseModal,
      turnOffSubleaseModal,
      turnOnSubleaseModal,
      toggleFilterModal,
      toggleMessages,
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
      widthStyle,
    }
  },
}
</script>
